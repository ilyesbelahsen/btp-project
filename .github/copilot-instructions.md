# Projet : Gestion de Chantier & Pointage des Ouvriers

# Contexte métier

Cette application est une plateforme SaaS permettant aux entreprises du bâtiment de gérer :

- leurs chantiers
- leurs ouvriers
- leurs pointages
- leurs dépenses
- leur rentabilité
- leur paie
- leurs rapports d'activité

L'objectif est de fournir une vision en temps réel de l'activité de l'entreprise tout en réduisant les tâches administratives.

---

# Architecture SaaS

L'application est conçue comme une plateforme SaaS multi-tenant.

Une seule API est partagée par toutes les entreprises.

Une seule base de données PostgreSQL est utilisée.

Une seule application Desktop est distribuée à l'ensemble des clients.

Une seule application Mobile est publiée sur Google Play et Apple App Store.

Chaque entreprise possède ses propres :

- utilisateurs
- chantiers
- dépenses
- pointages
- rapports
- documents

Toutes les données sont isolées via un identifiant d'entreprise.

Nom du concept :

Company

Toutes les données métier doivent être rattachées à une entreprise.

Exemples :

- User
- Chantier
- Pointage
- Dépense
- Rapport
- Document

Le companyId est déterminé automatiquement à partir du JWT.

Le frontend ne doit jamais transmettre manuellement le companyId.

L'API est responsable de l'isolation des données.

Un utilisateur ne doit jamais avoir accès aux données d'une autre entreprise.

---

# Utilisateurs

## Patron

Utilise l'application Desktop pour :

- créer des chantiers
- gérer les ouvriers
- consulter les pointages
- gérer les dépenses
- suivre la rentabilité
- visualiser le dashboard
- générer des rapports

## Comptable

Utilise l'application Desktop pour :

- consulter les heures validées
- préparer les éléments de paie
- gérer les indemnités
- générer des exports comptables
- consulter les rapports financiers

Le comptable ne possède pas de droits d'administration.

## Ouvrier

Utilise l'application Mobile pour :

- se connecter
- sélectionner un chantier
- démarrer sa journée
- terminer sa journée
- déclarer ses activités
- ajouter des commentaires
- envoyer des photos
- consulter son historique

---

# Monorepo

Le projet est organisé sous forme de monorepo PNPM.

Structure :

apps/
├── api
├── desktop
└── mobile

Chaque application doit pouvoir être :

- développée indépendamment
- buildée indépendamment
- déployée indépendamment

Le monorepo sert uniquement à partager du code.

---

# Stack technique

## Desktop

Technologies :

- Electron
- React
- TypeScript
- Vite
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- Shadcn UI

---

## Mobile

Technologies :

- React Native
- Expo
- Expo Router
- TypeScript
- TanStack Query
- Zustand
- React Hook Form
- Zod
- NativeWind

---

## Backend

Technologies :

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- JWT
- Swagger / OpenAPI
- BullMQ
- Docker

---

# Principe fondamental

Toute la logique métier doit être implémentée dans l'API NestJS.

Les applications Desktop et Mobile sont uniquement des clients.

Ne jamais implémenter de logique métier complexe côté React ou React Native.

Exemples :

✅ API

- calcul des heures
- calcul de la paie
- calcul des indemnités
- calcul des marges
- validation des pointages
- génération des rapports

❌ Frontend

- calcul des salaires
- calcul des marges
- validation métier
- règles métier complexes

Le Frontend affiche les données et déclenche des actions.

---

# Architecture Backend

Organisation par domaines métier.

src/

modules/

├── auth
├── company
├── users
├── chantier
├── pointage
├── depense
├── paie
├── rapport
├── document
└── notification

Chaque domaine doit être indépendant.

Structure standard :

module/
├── controller
├── service
├── dto
├── repository
└── model

---

# Rôles

## ADMIN

- gestion globale de la plateforme

## PATRON

- gestion des chantiers
- gestion des ouvriers
- suivi financier
- validation des pointages
- rapports

## COMPTABLE

- paie
- indemnités
- exports comptables
- rapports financiers

## OUVRIER

- pointage
- activités
- photos
- historique

Utiliser JWT et RBAC.

---

# Règles multi-tenant

Toute requête doit être exécutée dans le contexte de l'entreprise courante.

Mauvais :

```ts
prisma.chantier.findMany();
```

Correct :

```ts
prisma.chantier.findMany({
  where: {
    companyId: currentUser.companyId,
  },
});
```

La sécurité multi-tenant doit toujours être appliquée côté API.

Ne jamais faire confiance aux données envoyées par le frontend.

---

# Persistance

## PostgreSQL

Base de données principale.

Prisma est l'ORM officiel du projet.

Ne jamais accéder à Prisma depuis un contrôleur.

Toute logique métier doit passer par un service.

---

# Stockage documentaire

Utiliser un stockage compatible S3.

Exemples :

- OVH Object Storage
- Scaleway Object Storage
- AWS S3

Types de fichiers :

- photos chantier
- rapports PDF
- documents

Ne jamais stocker de fichiers binaires dans PostgreSQL.

---

# Tâches asynchrones

Redis est utilisé pour :

- cache
- sessions
- files de messages

BullMQ est utilisé pour :

- génération PDF
- génération Excel
- exports comptables
- traitement des photos

---

# Frontend

Architecture feature-based obligatoire.

Structure :

src/

├── features
├── pages
├── components
├── services
├── hooks
├── layouts
├── store
├── types
└── utils

---

# Gestion des données

TanStack Query :

- appels API
- cache
- synchronisation serveur

Zustand :

- authentification
- session utilisateur
- préférences utilisateur

Ne jamais utiliser Zustand comme cache API.

---

# Qualité logicielle

Toujours produire :

- TypeScript strict
- code maintenable
- code testé
- code réutilisable

Éviter :

- any
- duplication
- SQL hardcodé
- logique métier dans les composants

Appliquer :

- SOLID
- Clean Architecture
- Clean Code
- DRY
- KISS

---

# Sécurité

Toujours appliquer :

- JWT
- bcrypt
- validation des entrées
- RBAC
- variables d'environnement

Ne jamais exposer :

- secrets
- mots de passe
- clés API

---

# MVP

Phase 1 :

- authentification
- dashboard
- chantier
- pointage
- dépense

Phase 2 :

- comptabilité
- paie
- rapports

Phase 3 :

- photos
- notifications
- GPS
- QR Code
- NFC

Ne jamais implémenter une fonctionnalité d'une phase supérieure si elle n'est pas explicitement demandée.

---

# Génération de code

Lorsque tu génères du code :

1. Respecte l'architecture définie dans ce document.
2. Produis du TypeScript strict.
3. Respecte les conventions NestJS, React et React Native.
4. Génère les DTO, services et tests lorsque c'est pertinent.
5. Réutilise les packages partagés.
6. Préfère la simplicité à la sur-ingénierie.
7. Considère le projet comme prêt pour la production.
8. Priorise toujours le MVP.
9. Applique systématiquement les règles multi-tenant.
10. Ne place jamais de logique métier complexe dans le frontend.
