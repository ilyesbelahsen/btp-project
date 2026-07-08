# BACKLOG — APPLICATION MOBILE & API BTP

**Généré le :** 2026-07-06
**Basé sur :** `doc.md` (section Mobile) + `copilot-instructions.md`
**Périmètre :** Mobile (React Native / Expo) + API (NestJS) — Desktop exclu

---

## Résumé du document

Le document décrit une application SaaS BTP composée d'un volet Desktop (Patron) et d'un volet Mobile (Ouvrier). La partie Mobile couvre la connexion terrain, le pointage journalier (start/stop), la déclaration des activités, l'ajout de photos et commentaires, ainsi que la consultation de l'historique personnel. L'API NestJS centralise toute la logique métier et assure l'isolation multi-tenant via `companyId`. Le MVP Mobile priorise : login, choix de chantier, et start/stop pointage.

---

## Acteurs identifiés

| Acteur         | Description                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| `OUVRIER`      | Utilise l'app Mobile pour pointer, déclarer ses activités, envoyer des photos    |
| `PATRON`       | Peut consulter via API les pointages soumis par les ouvriers (validation future) |
| `API (NestJS)` | Backend responsable de toute la logique métier, calculs, isolation multi-tenant  |

---

## EPIC 1 — Authentification Mobile

### Business RulesUSS

| ID     | Domaine | Règle                                                                                                                                   | Priorité |
| ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| BR-001 | `auth`  | Un ouvrier s'authentifie avec email + mot de passe ; le JWT retourné contient `userId`, `companyId`, `role`                             | Must     |
| BR-002 | `auth`  | Le JWT doit avoir une durée de validité configurable (ex: 8h terrain) avec refresh token                                                | Must     |
| BR-003 | `auth`  | Un ouvrier ne peut accéder qu'aux ressources de son `companyId`                                                                         | Must     |
| BR-004 | `auth`  | Le mot de passe est hashé avec `bcrypt` côté API avant persistance                                                                      | Must     |
| BR-005 | `auth`  | L'API retourne un message d'erreur générique en cas d'échec (`401`) sans préciser si c'est l'email ou le mot de passe qui est incorrect | Must     |

### Use Cases

| ID     | Acteur  | Titre            | Description                                        | Pré-conditions                                 | Post-conditions                                 |
| ------ | ------- | ---------------- | -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| UC-001 | OUVRIER | Connexion Mobile | L'ouvrier saisit ses identifiants sur l'app mobile | L'ouvrier possède un compte créé par le Patron | JWT stocké localement, redirection vers accueil |
| UC-002 | OUVRIER | Déconnexion      | L'ouvrier se déconnecte manuellement               | JWT présent en session                         | JWT supprimé, retour écran login                |
| UC-003 | API     | Refresh Token    | Renouvellement automatique du JWT expiré           | Refresh token valide                           | Nouveau JWT émis                                |

### User Stories

```
US-001 | [Auth] | En tant qu'ouvrier, je veux me connecter avec mon email et mot de passe
        afin d'accéder à l'application mobile sur le terrain.

Critères d'acceptation :
- [ ] CA1 : Formulaire avec champs email + mot de passe
- [ ] CA2 : En cas de succès → redirection vers l'écran d'accueil
- [ ] CA3 : En cas d'échec → message d'erreur générique affiché
- [ ] CA4 : JWT + refresh token stockés de manière sécurisée (SecureStore Expo)
- [ ] CA5 : Le login est rapide et adapté au terrain (pas de saisie complexe)

Priorité : Must Have | Points : S
Domaine API : auth | Rôle : OUVRIER
```

```
US-002 | [Auth] | En tant qu'ouvrier, je veux rester connecté automatiquement entre les sessions
        afin de ne pas resaisir mes identifiants à chaque ouverture de l'app.

Critères d'acceptation :
- [ ] CA1 : Le refresh token permet de régénérer un JWT sans re-login
- [ ] CA2 : Si le refresh token expire → retour écran login
- [ ] CA3 : L'endpoint POST /auth/refresh accepte le refresh token et retourne un nouveau JWT

Priorité : Must Have | Points : S
Domaine API : auth | Rôle : OUVRIER
```

```
US-003 | [Auth] | En tant qu'ouvrier, je veux pouvoir me déconnecter
        afin de protéger mon compte si je perds mon téléphone.

Critères d'acceptation :
- [ ] CA1 : Bouton de déconnexion accessible depuis le menu
- [ ] CA2 : Suppression du JWT et refresh token du stockage local
- [ ] CA3 : L'API invalide le refresh token côté serveur (blacklist Redis)

Priorité : Should Have | Points : S
Domaine API : auth | Rôle : OUVRIER
```

---

## EPIC 2 — Pointage Mobile

### Business Rules

| ID     | Domaine    | Règle                                                                            | Priorité |
| ------ | ---------- | -------------------------------------------------------------------------------- | -------- |
| BR-006 | `pointage` | Un ouvrier ne peut avoir qu'un seul pointage ouvert (sans heure de fin) par jour | Must     |
| BR-007 | `pointage` | L'heure de début et de fin sont enregistrées côté serveur (horodatage UTC)       | Must     |
| BR-008 | `pointage` | Un pointage est obligatoirement rattaché à un `chantier` et à un `companyId`     | Must     |
| BR-009 | `pointage` | L'API calcule la durée totale en minutes à la clôture du pointage                | Must     |
| BR-010 | `pointage` | Un ouvrier ne peut pointer que sur les chantiers qui lui sont affectés           | Must     |
| BR-011 | `pointage` | Un pointage ne peut être modifié que par le `PATRON` après soumission            | Should   |
| BR-012 | `pointage` | Le statut d'un pointage suit : `EN_COURS` → `SOUMIS` → `VALIDE` / `REJETE`       | Must     |

### Use Cases

| ID     | Acteur  | Titre                    | Description                                                                     | Pré-conditions                                       | Post-conditions                                                        |
| ------ | ------- | ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| UC-004 | OUVRIER | Sélectionner un chantier | L'ouvrier choisit son chantier du jour parmi la liste de ses chantiers affectés | Authentifié, chantiers affectés existants            | Chantier sélectionné en session locale                                 |
| UC-005 | OUVRIER | Démarrer sa journée      | L'ouvrier appuie sur "Commencer" pour créer un pointage avec heure de début     | Chantier sélectionné, pas de pointage ouvert ce jour | Pointage créé avec statut `EN_COURS`                                   |
| UC-006 | OUVRIER | Terminer sa journée      | L'ouvrier appuie sur "Terminer" pour clôturer son pointage                      | Pointage `EN_COURS` existant                         | Pointage mis à jour avec heure de fin, durée calculée, statut `SOUMIS` |
| UC-007 | API     | Calcul de durée          | L'API calcule automatiquement la durée en minutes lors de la clôture            | Heure de début et fin présentes                      | Champ `dureeMinutes` renseigné                                         |

### User Stories

```
US-004 | [Pointage] | En tant qu'ouvrier, je veux voir la liste de mes chantiers affectés
        afin de choisir sur lequel je travaille aujourd'hui.

Critères d'acceptation :
- [ ] CA1 : L'API expose GET /chantiers/mes-chantiers → retourne uniquement les chantiers affectés à l'ouvrier courant
- [ ] CA2 : Chaque chantier affiche son nom et son statut
- [ ] CA3 : Seuls les chantiers actifs (ACTIF) sont listés
- [ ] CA4 : Isolation multi-tenant : uniquement les chantiers de la même entreprise (companyId)

Priorité : Must Have | Points : S
Domaine API : chantier | Rôle : OUVRIER
```

```
US-005 | [Pointage] | En tant qu'ouvrier, je veux démarrer ma journée d'un simple bouton
        afin d'enregistrer mon heure d'arrivée sur le chantier.

Critères d'acceptation :
- [ ] CA1 : Un bouton "Commencer" est affiché si aucun pointage n'est en cours ce jour
- [ ] CA2 : L'API crée un pointage via POST /pointages avec heureDebut (serveur UTC), chantierId, companyId
- [ ] CA3 : Si un pointage est déjà en cours → erreur 409 avec message explicite
- [ ] CA4 : Le statut du pointage est EN_COURS après création
- [ ] CA5 : L'interface passe en mode "journée en cours" après confirmation

Priorité : Must Have | Points : M
Domaine API : pointage | Rôle : OUVRIER
```

```
US-006 | [Pointage] | En tant qu'ouvrier, je veux terminer ma journée d'un simple bouton
        afin d'enregistrer mon heure de départ.

Critères d'acceptation :
- [ ] CA1 : Un bouton "Terminer" est affiché quand un pointage est en cours
- [ ] CA2 : L'API met à jour le pointage via PATCH /pointages/:id/terminer avec heureFin (serveur UTC)
- [ ] CA3 : L'API calcule et persiste dureeMinutes = heureFin - heureDebut
- [ ] CA4 : Le statut passe à SOUMIS
- [ ] CA5 : Confirmation visuelle affichée sur mobile (durée travaillée du jour)

Priorité : Must Have | Points : M
Domaine API : pointage | Rôle : OUVRIER
```

```
US-007 | [Pointage] | En tant qu'ouvrier, je veux confirmer mon pointage avant envoi
        afin de vérifier les informations saisies.

Critères d'acceptation :
- [ ] CA1 : Un écran récapitulatif s'affiche avant soumission (chantier, heures, durée)
- [ ] CA2 : L'ouvrier peut annuler ou confirmer
- [ ] CA3 : La confirmation déclenche le PATCH /terminer
- [ ] CA4 : Un message de succès est affiché après soumission

Priorité : Should Have | Points : S
Domaine API : pointage | Rôle : OUVRIER
```

```
US-008 | [Pointage - Phase 3] | En tant qu'ouvrier, je veux pointer via QR Code ou GPS
        afin de sécuriser et automatiser ma présence sur le chantier.

Critères d'acceptation :
- [ ] CA1 : Chaque chantier dispose d'un QR Code généré par l'API
- [ ] CA2 : Le scan QR Code pré-sélectionne le chantier automatiquement
- [ ] CA3 : La position GPS est capturée et envoyée avec le pointage [CLARIFICATION NEEDED : périmètre de géofencing ?]
- [ ] CA4 : L'API valide la cohérence GPS vs adresse chantier (optionnel)

Priorité : Could Have | Points : XL
Domaine API : pointage | Rôle : OUVRIER
```

---

## EPIC 3 — Saisie d'Activité

### Business Rules

| ID     | Domaine    | Règle                                                                                                                 | Priorité |
| ------ | ---------- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| BR-013 | `pointage` | Les tâches sont rattachées à un pointage existant (`pointageId`)                                                      | Must     |
| BR-014 | `pointage` | Les types de tâches sont paramétrables par l'entreprise \[CLARIFICATION NEEDED : table de référentiel ou enum fixe ?] | Should   |
| BR-015 | `document` | Les photos envoyées sont stockées dans S3, jamais en base PostgreSQL                                                  | Must     |
| BR-016 | `document` | L'API retourne une URL signée S3 pour accès aux photos                                                                | Should   |
| BR-017 | `pointage` | Un commentaire est une chaîne de caractères libre (max 500 chars)                                                     | Must     |

### Use Cases

| ID     | Acteur  | Titre                  | Description                                                         | Pré-conditions              | Post-conditions                             |
| ------ | ------- | ---------------------- | ------------------------------------------------------------------- | --------------------------- | ------------------------------------------- |
| UC-008 | OUVRIER | Déclarer des tâches    | L'ouvrier sélectionne les types de travaux réalisés dans la journée | Pointage en cours ou soumis | Tâches persistées et rattachées au pointage |
| UC-009 | OUVRIER | Ajouter un commentaire | L'ouvrier saisit un texte libre pour décrire sa journée             | Pointage existant           | Commentaire sauvegardé sur le pointage      |
| UC-010 | OUVRIER | Envoyer des photos     | L'ouvrier prend ou sélectionne des photos depuis son mobile         | Pointage existant           | Photos uploadées en S3, URLs persistées     |

### User Stories

```
US-009 | [Activité] | En tant qu'ouvrier, je veux déclarer les types de travaux réalisés
        afin de renseigner mon activité journalière sur le chantier.

Critères d'acceptation :
- [ ] CA1 : Liste de types de tâches affichée (ex: Coffrage, Maçonnerie, Finition, etc.)
- [ ] CA2 : Sélection multiple possible
- [ ] CA3 : L'API expose POST /pointages/:id/taches avec le tableau de tâches sélectionnées
- [ ] CA4 : Les tâches sont rattachées au companyId implicitement via le pointage

Priorité : Should Have | Points : M
Domaine API : pointage | Rôle : OUVRIER
```

```
US-010 | [Activité] | En tant qu'ouvrier, je veux ajouter un commentaire à mon pointage
        afin de transmettre des informations à mon patron.

Critères d'acceptation :
- [ ] CA1 : Champ texte libre (max 500 caractères)
- [ ] CA2 : L'API accepte PATCH /pointages/:id avec le champ commentaire
- [ ] CA3 : Le commentaire est visible par le PATRON dans le dashboard Desktop

Priorité : Should Have | Points : S
Domaine API : pointage | Rôle : OUVRIER
```

```
US-011 | [Activité - Phase 3] | En tant qu'ouvrier, je veux envoyer des photos du chantier
        afin de documenter visuellement mon travail.

Critères d'acceptation :
- [ ] CA1 : Sélection depuis galerie ou prise de vue caméra (Expo ImagePicker)
- [ ] CA2 : Upload via POST /documents/upload → l'API retourne l'URL S3
- [ ] CA3 : Les photos sont rattachées au pointage (pointageId, chantierId, companyId)
- [ ] CA4 : Max 5 photos par pointage [CLARIFICATION NEEDED]
- [ ] CA5 : Affichage des vignettes après upload confirmé

Priorité : Could Have | Points : L
Domaine API : document | Rôle : OUVRIER
```

---

## EPIC 4 — Historique Personnel

### Business Rules

| ID     | Domaine    | Règle                                                                             | Priorité |
| ------ | ---------- | --------------------------------------------------------------------------------- | -------- |
| BR-018 | `pointage` | Un ouvrier ne peut consulter que ses propres pointages (`userId` \= contexte JWT) | Must     |
| BR-019 | `pointage` | L'historique est paginé côté API (pas de fetch illimité)                          | Should   |
| BR-020 | `pointage` | Les heures totales sont calculées côté API, jamais côté mobile                    | Must     |

### Use Cases

| ID     | Acteur  | Titre                    | Description                                                   | Pré-conditions      | Post-conditions           |
| ------ | ------- | ------------------------ | ------------------------------------------------------------- | ------------------- | ------------------------- |
| UC-011 | OUVRIER | Consulter son historique | L'ouvrier visualise ses pointages passés avec dates et durées | Authentifié         | Liste paginée affichée    |
| UC-012 | OUVRIER | Voir ses heures totales  | L'ouvrier consulte le cumul de ses heures (semaine/mois)      | Pointages existants | Totaux calculés par l'API |

### User Stories

```
US-012 | [Historique] | En tant qu'ouvrier, je veux voir mes pointages passés
        afin de vérifier mon historique de présence.

Critères d'acceptation :
- [ ] CA1 : L'API expose GET /pointages/mon-historique avec pagination (page, limit)
- [ ] CA2 : Chaque entrée affiche : date, chantier, heure début, heure fin, durée
- [ ] CA3 : Les pointages sont triés par date décroissante
- [ ] CA4 : Filtre par mois possible [CLARIFICATION NEEDED : filtres requis ?]
- [ ] CA5 : Isolation : seuls les pointages de l'ouvrier courant sont retournés

Priorité : Should Have | Points : M
Domaine API : pointage | Rôle : OUVRIER
```

```
US-013 | [Historique] | En tant qu'ouvrier, je veux voir mon total d'heures travaillées
        afin de suivre mon activité mensuelle.

Critères d'acceptation :
- [ ] CA1 : L'API expose GET /pointages/mes-stats?mois=YYYY-MM
- [ ] CA2 : Retourne : totalHeures (en décimal), totalJours, dernierPointage
- [ ] CA3 : Calcul effectué exclusivement côté API (pas dans le composant React Native)
- [ ] CA4 : Affiché en haut de l'écran historique sous forme de résumé

Priorité : Should Have | Points : S
Domaine API : pointage | Rôle : OUVRIER
```

---

## EPIC 5 — Contrats API (endpoints transverses)

### Business Rules

| ID     | Domaine | Règle                                                                        | Priorité |
| ------ | ------- | ---------------------------------------------------------------------------- | -------- |
| BR-021 | `api`   | Tous les endpoints sont protégés par JWT Guard sauf `POST /auth/login`       | Must     |
| BR-022 | `api`   | Le `companyId` est extrait du JWT, jamais accepté dans le body de la requête | Must     |
| BR-023 | `api`   | Les DTOs NestJS valident toutes les entrées avec `class-validator`           | Must     |
| BR-024 | `api`   | L'API retourne des erreurs structurées (`statusCode`, `message`, `error`)    | Must     |
| BR-025 | `api`   | Swagger/OpenAPI est activé et documenté pour tous les endpoints mobiles      | Should   |
| BR-026 | `api`   | Le RBAC est appliqué sur chaque route avec `@Roles()` decorator              | Must     |

### User Stories

```
US-014 | [API] | En tant que développeur mobile, je veux une API documentée via Swagger
        afin d'intégrer les endpoints sans ambiguïté.

Critères d'acceptation :
- [ ] CA1 : Swagger activé sur /api/docs
- [ ] CA2 : Chaque endpoint mobile est documenté (description, body, réponses, erreurs)
- [ ] CA3 : Les DTOs sont annotés avec @ApiProperty()

Priorité : Should Have | Points : S
Domaine API : api | Rôle : Développeur
```

```
US-015 | [API - Sécurité] | En tant que système, je veux que chaque requête valide le JWT
        afin de garantir l'isolation des données entre entreprises.

Critères d'acceptation :
- [ ] CA1 : JwtAuthGuard appliqué globalement sauf routes publiques
- [ ] CA2 : RolesGuard appliqué sur chaque endpoint sensible
- [ ] CA3 : Tentative d'accès à des données d'un autre companyId → 403 Forbidden
- [ ] CA4 : Token invalide ou expiré → 401 Unauthorized

Priorité : Must Have | Points : M
Domaine API : auth | Rôle : Système
```

---

## Cross-Référence US ↔ BR ↔ UC

> Utilisé par l'IA lors du développement : pour chaque US demandée, l'ensemble des règles métier (BR) et cas d'usage (UC) associés est automatiquement pris en compte.

### Matrice US → BR + UC

| US     | Titre court                      | Epic       | BRs liés                                                       | UCs liés       |
| ------ | -------------------------------- | ---------- | -------------------------------------------------------------- | -------------- |
| US-001 | Connexion Mobile                 | Auth       | BR-001, BR-004, BR-005, BR-021, BR-022, BR-023, BR-024, BR-026 | UC-001         |
| US-002 | Session persistante (refresh)    | Auth       | BR-002, BR-021, BR-023, BR-024                                 | UC-003         |
| US-003 | Déconnexion sécurisée            | Auth       | BR-021, BR-022                                                 | UC-002         |
| US-004 | Liste chantiers affectés         | Pointage   | BR-003, BR-010, BR-021, BR-022, BR-026                         | UC-004         |
| US-005 | Démarrer la journée              | Pointage   | BR-006, BR-007, BR-008, BR-012, BR-021, BR-022, BR-023, BR-026 | UC-005         |
| US-006 | Terminer la journée              | Pointage   | BR-007, BR-009, BR-012, BR-021, BR-022, BR-026                 | UC-006, UC-007 |
| US-007 | Confirmation avant envoi         | Pointage   | BR-012, BR-021                                                 | UC-006         |
| US-008 | Pointage GPS / QR Code (Phase 3) | Pointage   | BR-007, BR-008, BR-012, BR-021, BR-022                         | —              |
| US-009 | Déclarer types de travaux        | Activité   | BR-013, BR-014, BR-021, BR-022, BR-023, BR-026                 | UC-008         |
| US-010 | Ajouter commentaire              | Activité   | BR-017, BR-021, BR-022, BR-023                                 | UC-009         |
| US-011 | Envoyer photos (Phase 3)         | Activité   | BR-015, BR-016, BR-021, BR-022, BR-026                         | UC-010         |
| US-012 | Historique des pointages         | Historique | BR-018, BR-019, BR-021, BR-022, BR-026                         | UC-011         |
| US-013 | Total heures mensuel             | Historique | BR-018, BR-020, BR-021, BR-022                                 | UC-012         |
| US-014 | Documentation Swagger            | API        | BR-023, BR-025                                                 | —              |
| US-015 | Sécurité JWT + RBAC              | API        | BR-003, BR-021, BR-022, BR-024, BR-026                         | —              |

---

### Matrice BR → USs impactées

| BR     | Domaine  | Règle (résumé)                                      | USs concernées                                                 |
| ------ | -------- | --------------------------------------------------- | -------------------------------------------------------------- |
| BR-001 | auth     | Email + password → JWT avec userId, companyId, role | US-001                                                         |
| BR-002 | auth     | JWT durée configurable + refresh token              | US-002                                                         |
| BR-003 | auth     | Accès limité au companyId de l'ouvrier              | US-004, US-015                                                 |
| BR-004 | auth     | bcrypt pour les mots de passe                       | US-001                                                         |
| BR-005 | auth     | Erreur 401 générique (pas de divulgation)           | US-001                                                         |
| BR-006 | pointage | Un seul pointage ouvert par jour                    | US-005                                                         |
| BR-007 | pointage | Horodatage UTC côté serveur                         | US-005, US-006, US-008                                         |
| BR-008 | pointage | Pointage rattaché à chantierId + companyId          | US-005, US-008                                                 |
| BR-009 | pointage | Calcul durée en minutes à la clôture                | US-006                                                         |
| BR-010 | pointage | Ouvrier ne pointe que sur chantiers affectés        | US-004                                                         |
| BR-011 | pointage | Modification uniquement par PATRON                  | —                                                              |
| BR-012 | pointage | Cycle statut : EN_COURS → SOUMIS → VALIDE/REJETE    | US-005, US-006, US-007, US-008                                 |
| BR-013 | pointage | Tâches rattachées à un pointageId                   | US-009                                                         |
| BR-014 | pointage | Types de tâches paramétrables                       | US-009                                                         |
| BR-015 | document | Photos stockées en S3 (jamais PostgreSQL)           | US-011                                                         |
| BR-016 | document | URL signée S3 pour accès photos                     | US-011                                                         |
| BR-017 | pointage | Commentaire texte libre (max 500 chars)             | US-010                                                         |
| BR-018 | pointage | Ouvrier consulte uniquement ses propres pointages   | US-012, US-013                                                 |
| BR-019 | pointage | Historique paginé côté API                          | US-012                                                         |
| BR-020 | pointage | Calcul heures totales côté API uniquement           | US-013                                                         |
| BR-021 | api      | JWT Guard sur tous les endpoints sauf /auth/login   | US-001 à US-015                                                |
| BR-022 | api      | companyId extrait du JWT, jamais du body            | US-003 à US-015                                                |
| BR-023 | api      | DTOs validés avec class-validator                   | US-001, US-002, US-005, US-009, US-010, US-014                 |
| BR-024 | api      | Erreurs structurées (statusCode, message, error)    | US-001, US-002, US-015                                         |
| BR-025 | api      | Swagger/OpenAPI activé et documenté                 | US-014                                                         |
| BR-026 | api      | RBAC avec @Roles() sur chaque route                 | US-001, US-004, US-005, US-006, US-009, US-011, US-012, US-015 |

---

## Roadmap suggérée

### Sprint 1 — MVP Core (Semaines 1-2)

_Objectif : L'ouvrier peut se connecter et pointer_

- [ ] US-001 — Connexion Mobile (login JWT)
- [ ] US-002 — Persistance session (refresh token)
- [ ] US-004 — Liste des chantiers affectés
- [ ] US-005 — Démarrer la journée (start pointage)
- [ ] US-006 — Terminer la journée (stop pointage)
- [ ] US-015 — Sécurité JWT + RBAC API

### Sprint 2 — Consolidation (Semaines 3-4)

_Objectif : Enrichir le pointage, historique basique_

- [ ] US-007 — Confirmation avant envoi du pointage
- [ ] US-010 — Ajouter un commentaire au pointage
- [ ] US-012 — Historique des pointages
- [ ] US-013 — Cumul d'heures mensuel
- [ ] US-003 — Déconnexion sécurisée
- [ ] US-014 — Documentation Swagger

### Sprint 3 — Activités & UX (Semaines 5-6)

_Objectif : Déclaration des tâches, qualité terrain_

- [ ] US-009 — Déclaration des types de travaux
- [ ] BR-014 — Référentiel de tâches configurables

### Sprint 4 — Phase 3 (à planifier)

_Objectif : Fonctionnalités avancées terrain_

- [ ] US-008 — Pointage GPS / QR Code
- [ ] US-011 — Upload photos chantier

---

## Récapitulatif

| Métrique              | Valeur                                     |
| --------------------- | ------------------------------------------ |
| Total US              | 15                                         |
| Total UC              | 12                                         |
| Total BR              | 26                                         |
| Must Have             | 9                                          |
| Should Have           | 5                                          |
| Could Have            | 2                                          |
| Domaines API couverts | `auth`, `pointage`, `chantier`, `document` |
| Rôle principal        | `OUVRIER`                                  |

---

## Points nécessitant clarification

| #               | Question                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| CLARIFICATION 1 | Les types de tâches (Coffrage, Maçonnerie…) sont-ils un référentiel fixe (enum) ou configurables par entreprise dans la BDD ? |
| CLARIFICATION 2 | L'historique des pointages mobile doit-il permettre des filtres (par chantier, par date) ou uniquement un tri chronologique ? |
| CLARIFICATION 3 | Quel est le nombre maximum de photos par pointage ? Y a-t-il une limite de taille par photo ?                                 |
| CLARIFICATION 4 | Le pointage GPS doit-il valider la présence (géofencing) ou seulement enregistrer la position à titre indicatif ?             |
