---
name: mobile
description: "Refactoring des instructions pour l'application mobile"
applyTo: "../../apps/mobile/**"
---

# Mobile App Development Standards

> Stack : React Native, Expo, Expo Router, TypeScript, React Query, Zustand, React Hook Form, Zod, NativeWind

## General Principles

### Clean Code

- Privilégier la lisibilité avant toute optimisation prématurée.
- Une fonction ne doit avoir qu'une seule responsabilité.
- Limiter les fonctions à environ 30 lignes.
- Éviter les niveaux d'imbrication supérieurs à 3.
- Utiliser des noms explicites et orientés métier.
- Bannir les noms génériques comme `data`, `result`, `tmp`, `value` lorsqu'un nom métier peut être utilisé.
- Écrire un code auto-documenté.
- N'ajouter des commentaires que pour expliquer un choix métier ou technique complexe.

### SOLID

Respecter systématiquement :

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

### DRY

- Ne jamais dupliquer une logique métier.
- Mutualiser via :
  - services
  - hooks
  - composants réutilisables
  - utilitaires

### KISS

- Toujours privilégier la solution la plus simple.
- Éviter les abstractions prématurées.

---

# TypeScript Standards

## Typage

Interdictions :

```ts
any;
```

```ts
as any;
```

```ts
@ts-ignore;
```

Préférer :

```ts
unknown;
```

```ts
satisfies;
```

### Types

Préférer :

```ts
type User = {
  id: string;
  email: string;
};
```

Utiliser `interface` uniquement lorsqu'une extension explicite est nécessaire.

### Null Safety

Toujours gérer :

```ts
null;
```

```ts
undefined;
```

Préférer :

```ts
user?.email;
```

plutôt que :

```ts
user.email;
```

sans vérification préalable.

### Enums

Éviter :

```ts
enum UserRole {}
```

Préférer :

```ts
export const USER_ROLES = ["ADMIN", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];
```

---

# Architecture Projet

## Structure

```txt
src/
├── app/
│
├── components/
│   ├── ui/
│   ├── forms/
│   └── business/
│
├── hooks/
│
├── api/
│
├── services/
│
├── stores/
│
├── schemas/
│
├── types/
│
├── constants/
│
├── utils/
│
└── assets/
```

---

# Expo Router

## Routing

Structure recommandée :

```txt
app/
├── _layout.tsx
├── index.tsx
├── login.tsx
├── profile/
│   └── [id].tsx
```

### Règles

- Utiliser Expo Router comme unique système de navigation.
- Centraliser les layouts.
- Éviter les navigations impératives lorsqu'une navigation déclarative est possible.
- Éviter les arborescences profondes inutiles.

---

# Écrans (Screens)

## Responsabilités

Les écrans présents dans `app/` doivent uniquement :

- récupérer la navigation
- appeler des hooks métier
- assembler les composants

### Interdiction

Aucune logique métier directement dans les écrans.

❌

```tsx
const users = await axios.get(...);
```

❌

```tsx
const filteredUsers = data.filter(...);
```

✅

```tsx
const { users } = useUsers();
```

---

# Composants

## UI Components

Les composants UI sont purement visuels.

Exemples :

```tsx
<Button />
<Input />
<Card />
<Badge />
```

Ils ne doivent pas :

- appeler d'API
- utiliser React Query
- contenir de logique métier

## Business Components

Les composants métier peuvent :

- utiliser des hooks
- combiner plusieurs composants UI
- manipuler des données

## Taille

Maximum recommandé :

```txt
200 lignes
```

Au-delà :

- découper le composant
- extraire des sous-composants
- créer des hooks dédiés

---

# React Query

## Obligatoire

Toutes les communications serveur passent par React Query.

### Interdiction

❌

```tsx
useEffect(() => {
  axios.get(...);
}, []);
```

### Obligatoire

✅

```tsx
useQuery({
  queryKey: queryKeys.users(),
  queryFn: userService.findAll,
});
```

---

## Query Keys

Centraliser :

```ts
export const queryKeys = {
  users: ["users"],
  user: (id: string) => ["users", id],
};
```

---

## Mutations

Utiliser systématiquement :

```ts
useMutation();
```

pour :

- création
- modification
- suppression

---

# API Layer

## Axios

Créer une unique instance Axios.

```txt
src/api/axios.ts
```

```ts
export const api = axios.create({
  baseURL: Config.API_URL,
});
```

### Responsabilités

- interceptors
- auth
- gestion erreurs techniques

---

# Services

Organisation :

```txt
services/
├── auth.service.ts
├── user.service.ts
├── mission.service.ts
```

Exemple :

```ts
export const userService = {
  findAll,
  findById,
  update,
};
```

### Interdiction

❌

```tsx
axios.get(...)
```

directement dans un composant ou un hook.

---

# Gestion d'État

## Zustand

Utiliser Zustand uniquement pour :

- utilisateur connecté
- authentification
- préférences
- configuration globale

### Ne jamais stocker

- résultats de requêtes
- listes métier
- données React Query

---

## Store

Structure :

```ts
type AuthStore = {
  token: string | null;
  setToken: (token: string | null) => void;
};
```

Toujours séparer :

- état
- actions

---

# Formulaires

## React Hook Form

Tous les formulaires doivent utiliser :

```ts
react - hook - form;
```

---

# Validation

## Zod

Toutes les validations passent par Zod.

### Exemple

```ts
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
```

### Intégration

```ts
const form = useForm({
  resolver: zodResolver(LoginSchema),
});
```

---

# Validation des Réponses API

Ne jamais faire :

```ts
return response.data as User;
```

Toujours faire :

```ts
return UserSchema.parse(response.data);
```

---

# Styling

## NativeWind

Utiliser exclusivement :

```tsx
className = "";
```

### Éviter

```tsx
StyleSheet.create(...)
```

sauf contrainte de performance validée.

---

## Espacement

Utiliser une échelle cohérente :

```txt
p-1
p-2
p-4
p-6
p-8
```

---

## Couleurs

Centraliser dans :

```txt
constants/theme.ts
```

### Interdiction

```tsx
text - [#AABBCC];
```

directement dans les composants.

---

# Gestion des Erreurs

Créer une hiérarchie d'erreurs applicatives.

Exemple :

```ts
AppError;
ValidationError;
UnauthorizedError;
NotFoundError;
```

---

## Logging

Ne jamais laisser :

```ts
console.log();
```

```ts
console.error();
```

dans le code de production.

Préférer :

```ts
logger.error(...)
```

---

# Sécurité

## Tokens

Ne jamais stocker :

```ts
JWT;
```

dans AsyncStorage.

Toujours utiliser :

```ts
expo - secure - store;
```

---

## Variables d'Environnement

Ne jamais exposer :

```ts
process.env;
```

dans les composants.

Accéder aux variables via :

```ts
constants / config.ts;
```

---

# Performance

## Re-render

Éviter les re-renders inutiles.

### Préférer

```ts
useMemo;
```

uniquement lorsque nécessaire.

### Préférer

```ts
useCallback;
```

uniquement lorsqu'un bénéfice est démontré.

---

## Lists

Toujours utiliser :

```tsx
FlatList;
```

pour les listes.

Éviter :

```tsx
ScrollView;
```

pour des centaines d'éléments.

---

# Tests

Tester en priorité :

1. Services
2. Hooks métier
3. Stores Zustand
4. Utilitaires
5. Composants

---

## Ce qui doit être testé

- cas nominal
- erreurs serveur
- erreurs validation
- valeurs nulles
- valeurs limites

---

# Conventions de Nommage

## Composants

```txt
UserCard.tsx
LoginForm.tsx
MissionItem.tsx
```

## Hooks

```txt
useAuth.ts
useUsers.ts
useProfile.ts
```

## Services

```txt
user.service.ts
auth.service.ts
```

## Schemas

```txt
user.schema.ts
login.schema.ts
```

## Types

```txt
user.type.ts
auth.type.ts
```

---

# Imports

Ordre obligatoire :

```ts
// React

// Bibliothèques externes

// API

// Services

// Hooks

// Stores

// Components

// Types

// Utils

// Styles
```

---

# Accessibilité

Tous les composants interactifs doivent :

- avoir un rôle explicite
- être utilisables au clavier
- supporter les lecteurs d'écran
- posséder un label accessible

Exemple :

```tsx
<Button accessibilityLabel="Se connecter" />
```

---

# Definition of Done

Une fonctionnalité n'est terminée que si :

- Le typage TypeScript est strict.
- Aucun `any` n'est utilisé.
- Les schémas Zod existent.
- Les appels API sont dans des services.
- Les requêtes utilisent React Query.
- Les états globaux utilisent Zustand.
- Les composants sont découplés.
- Les erreurs sont gérées.
- Les tests critiques existent.
- Le code est lisible et maintenable.
- Aucun warning TypeScript ou ESLint n'est présent.
- Le code est prêt pour la production.
