---
name: desktop
description: "Instructions de développement pour l'application Desktop (Patron / Comptable) — Next.js"
applyTo: "../../apps/web/**"
---

# Desktop App Development Standards

> Stack : Next.js 16, React 19, TypeScript, TanStack Query v5, Zustand v5, React Hook Form, Zod, Tailwind CSS v4, Shadcn UI, Recharts, Lucide React

---

## Principes généraux

### Clean Code

- Privilégier la lisibilité avant toute optimisation prématurée.
- Une fonction ne doit avoir qu'une seule responsabilité.
- Limiter les fonctions à environ 30 lignes.
- Éviter les niveaux d'imbrication supérieurs à 3.
- Utiliser des noms explicites et orientés métier.
- Bannir les noms génériques : `data`, `result`, `tmp`, `value`, `item` — utiliser un nom métier.
- Écrire un code auto-documenté.
- N'ajouter des commentaires que pour expliquer un choix métier ou technique non évident.

### SOLID / DRY / KISS

- Single Responsibility : un composant = une responsabilité.
- Ne jamais dupliquer une logique métier — mutualiser via services, hooks, utilitaires.
- Toujours privilégier la solution la plus simple. Éviter les abstractions prématurées.

---

## TypeScript Standards

### Typage strict

Interdictions absolues :

```ts
any
as any
// @ts-ignore
// @ts-expect-error  (sauf justification explicite)
```

Préférer :

```ts
unknown;
satisfies;
```

### Types vs Interfaces

```ts
// ✅ Préférer type
type Chantier = {
  id: string;
  name: string;
};

// Interface uniquement si extension explicite nécessaire
interface ChantierWithMetrics extends Chantier {
  marge: number;
}
```

### Null Safety

Toujours gérer `null` et `undefined` explicitement.

```ts
// ✅
const name = chantier?.name ?? "—";

// ❌
const name = chantier.name;
```

### Enums

```ts
// ✅ const enum ou union de string literals
type ChantierStatus = "EN_COURS" | "TERMINE" | "EN_PAUSE" | "ANNULE";

// ❌ enum TypeScript classique
enum ChantierStatus {
  EN_COURS,
  TERMINE,
}
```

---

## Architecture

### Structure des dossiers

```
src/
├── app/                    ← App Router Next.js (routes uniquement)
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx      ← layout protégé
│   │   ├── page.tsx        ← dashboard
│   │   ├── chantiers/
│   │   ├── ouvriers/
│   │   ├── pointages/
│   │   └── paie/
│   ├── globals.css
│   └── layout.tsx
├── features/               ← logique métier par domaine
│   ├── chantier/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── pointage/
│   ├── depense/
│   ├── ouvriers/
│   └── paie/
├── components/
│   ├── ui/                 ← Shadcn UI (généré, ne pas modifier)
│   └── shared/             ← composants partagés custom
├── services/
│   └── api.ts              ← client axios avec intercepteurs
├── stores/
│   └── auth.store.ts       ← Zustand (auth uniquement)
├── hooks/                  ← hooks globaux
├── lib/
│   └── utils.ts            ← cn(), helpers
└── types/
    └── api.types.ts
```

### Règle fondamentale : App Router = routes, features/ = logique

Les fichiers dans `app/` ne doivent contenir que :

- La définition de la route
- L'import du composant feature principal
- Les métadonnées (`metadata`, `generateStaticParams`)

```tsx
// ✅ app/(dashboard)/chantiers/page.tsx
import { ChantierListPage } from "@/features/chantier/components/ChantierListPage";

export default function Page() {
  return <ChantierListPage />;
}
```

---

## Server Components vs Client Components

### Règle par défaut

Tout composant est **Server Component** par défaut dans Next.js App Router.

Ajouter `"use client"` uniquement si le composant :

- Utilise `useState`, `useEffect`, `useRef`
- Gère des événements utilisateur (`onClick`, `onChange`)
- Utilise TanStack Query, Zustand, React Hook Form
- Utilise des API browser (`localStorage`, `window`)

```tsx
// ✅ Server Component — pas de "use client"
export async function ChantierCard({ id }: { id: string }) {
  const chantier = await getChantier(id);
  return <div>{chantier.name}</div>;
}

// ✅ Client Component — interactivité requise
"use client";
export function ChantierStatusBadge({ status }: { status: ChantierStatus }) {
  const [hovered, setHovered] = useState(false);
  ...
}
```

### Data fetching

**Server Components** : fetch direct ou appel service côté serveur.

**Client Components** : TanStack Query obligatoire pour tout appel API.

Ne jamais faire de `fetch` dans un `useEffect` côté client — utiliser `useQuery`.

---

## TanStack Query v5

### Configuration

```tsx
// providers/query-provider.tsx
"use client";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys

Centraliser dans un fichier dédié par feature :

```ts
// features/chantier/query-keys.ts
export const chantierKeys = {
  all: ["chantiers"] as const,
  list: () => [...chantierKeys.all, "list"] as const,
  detail: (id: string) => [...chantierKeys.all, "detail", id] as const,
};
```

### Hooks de données

Un hook par query/mutation dans `features/[domain]/hooks/` :

```ts
// features/chantier/hooks/useChantiers.ts
export function useChantiers() {
  return useQuery({
    queryKey: chantierKeys.list(),
    queryFn: chantierService.findAll,
  });
}

export function useCreateChantier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chantierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chantierKeys.list() });
    },
  });
}
```

---

## Formulaires — React Hook Form + Zod

### Pattern standard

```tsx
"use client";
const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  budget: z.number({ invalid_type_error: "Montant invalide" }).positive(),
});

type FormData = z.infer<typeof schema>;

export function CreateChantierForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useCreateChantier();

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>...</form>
  );
}
```

### Règles formulaires

- Schema Zod dans le même fichier ou `features/[domain]/schemas.ts`
- Messages d'erreur en français
- Ne jamais `disabled` un formulaire entier — désactiver uniquement le bouton submit pendant `isPending`
- Validation côté client via Zod, validation métier côté API

---

## Shadcn UI

### Règles d'utilisation

- Utiliser les composants Shadcn UI (`Button`, `Input`, `Card`, `Table`, `Dialog`, etc.) en priorité
- Ne pas modifier les fichiers dans `src/components/ui/` générés par Shadcn
- Étendre via `className` et `cva` variants

```tsx
// ✅ Extension via className
<Button variant="destructive" size="sm" className="w-full">
  Supprimer
</Button>

// ❌ Ne pas ré-implémenter un composant Shadcn existant
```

### Fusion de classes

Toujours utiliser `cn()` :

```tsx
import { cn } from "@/lib/utils";

<div
  className={cn("rounded-md p-4", isActive && "bg-primary/10", className)}
/>;
```

---

## Zustand — État client

Zustand est réservé à l'état **global non-serveur** :

✅ Autorisé :

- Session utilisateur (JWT, user info)
- Préférences UI (sidebar collapsed, thème)

❌ Interdit :

- Cache de données API → TanStack Query
- État de formulaire → React Hook Form
- État local d'un composant → `useState`

```ts
// stores/auth.store.ts
type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({ ... }),
    { name: "btp-auth" },
  ),
);
```

---

## Client API

### Axios avec intercepteurs JWT

```ts
// services/api.ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Services par domaine

```ts
// features/chantier/services/chantier.service.ts
export const chantierService = {
  findAll: async (): Promise<Chantier[]> => {
    const { data } = await api.get("/chantiers");
    return ChantierListSchema.parse(data);
  },
  create: async (dto: CreateChantierDto): Promise<Chantier> => {
    const { data } = await api.post("/chantiers", dto);
    return ChantierSchema.parse(data);
  },
};
```

Toujours valider les réponses API avec Zod. Ne jamais faire confiance au typage implicite d'Axios.

---

## Sécurité & Multi-tenant

### Règles fondamentales

- Le `companyId` est **toujours extrait du JWT côté API** — jamais transmis par le frontend
- Ne jamais stocker de données sensibles dans `localStorage` (utiliser `httpOnly` cookies ou mémoire)
- Valider les inputs utilisateur avec Zod avant tout envoi API
- Protéger toutes les routes non-auth avec un middleware ou un layout guard

### Route protection — Middleware Next.js

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### RBAC

Toujours vérifier le rôle avant d'afficher des actions sensibles :

```tsx
const { user } = useAuthStore();
const isPatron = user?.role === "PATRON";

{
  isPatron && <Button>Valider les pointages</Button>;
}
```

---

## Composants — Conventions

### Naming

- Composants : PascalCase → `ChantierCard`, `PointageTable`
- Hooks : camelCase préfixé `use` → `useChantiers`, `useCreateChantier`
- Services : camelCase suffixé `Service` → `chantierService`
- Types : PascalCase → `Chantier`, `CreateChantierDto`

### Props

```tsx
// ✅ Type explicite, pas d'interface pour les props simples
type ChantierCardProps = {
  chantier: Chantier;
  onEdit?: (id: string) => void;
};

// ❌ Pas de props génériques non typées
type Props = {
  data: any;
  onClick: Function;
};
```

### Composants de page (features)

Structure standard d'une page feature :

```tsx
// features/chantier/components/ChantierListPage.tsx
"use client";

export function ChantierListPage() {
  const { data: chantiers, isLoading } = useChantiers();

  if (isLoading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader title="Chantiers" action={<CreateChantierButton />} />
      <ChantierTable chantiers={chantiers ?? []} />
    </div>
  );
}
```

---

## Data Visualization — Recharts

- Utiliser Recharts pour tous les graphiques (dashboard, rentabilité, suivi financier)
- Wraper dans un composant `"use client"` dédié
- Toujours définir une `height` explicite sur les conteneurs Recharts
- Utiliser les couleurs de la charte (`hsl(var(--primary))` ou tokens Tailwind)

```tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function MargeChart({ data }: { data: ChantierMarge[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="marge" fill="hsl(var(--primary))" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

## Gestion des erreurs

### Boundaries

Toujours envelopper les sections critiques avec un `ErrorBoundary` :

```tsx
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<ErrorFallback />}>
  <ChantierListPage />
</ErrorBoundary>;
```

### Erreurs API

```ts
// ✅ Gérer les erreurs dans onError des mutations
useMutation({
  mutationFn: chantierService.create,
  onError: (error: ApiError) => {
    toast.error(error.response?.data?.message ?? "Une erreur est survenue");
  },
});
```

---

## Performance

- Préférer les Server Components pour le rendu initial — réduire le bundle JS client
- `"use client"` le plus bas possible dans l'arbre de composants
- Utiliser `next/image` pour toutes les images
- Utiliser `loading.tsx` pour le skeleton de chaque route
- Utiliser `React.memo` uniquement si profiling confirme un problème

---

## Interdictions

Ne jamais :

- Appeler l'API directement dans un composant (`fetch` dans `useEffect`)
- Mettre du `any` dans le code produit
- Stocker le `companyId` dans le state client ou le transmettre dans une requête
- Implémenter de la logique métier complexe côté frontend (calculs de marge, de paie, etc.)
- Modifier les fichiers générés par Shadcn dans `src/components/ui/`
- Utiliser `router.push` pour naviguer après une mutation sans invalider le cache TanStack Query
