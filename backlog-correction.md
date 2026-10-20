# BACKLOG CORRECTION — APPLICATION DESKTOP (suite Workshop Client)

Généré le : 2026-09-23
Basé sur : `backlog-desktop-final.md` (existant) + `correction.md` (notes workshop client)

---

## Résumé de l'analyse

Le backlog existant (`backlog-desktop-final.md`) modélise la gestion financière d'un chantier de façon **globale** : un chantier a un prix de vente HT unique, une marge globale (`prix de vente − dépenses − main d'œuvre`), et des tâches réduites à un simple libellé + prix vendu HT (BR-005 à BR-009, BR-024/025). Les dépenses ne connaissent qu'un seul type minimal (« Matériaux », BR-013, avec `CL-002` resté sans réponse), et ne sont jamais rattachées à une tâche précise.

Les notes du workshop client (`correction.md`) demandent une **granularité par tâche** et une **distinction stricte entre budget main d'œuvre et budget matériaux**, à la fois au niveau du chantier et de chaque tâche, avec import de ces budgets depuis le **devis chiffré client au format Excel** (et non plus uniquement via scan OCR). Elles introduisent aussi un 3ᵉ type de dépense — la **sous-traitance** — rattaché au budget main d'œuvre, et exigent que chaque dépense manuelle soit liée à une tâche pour permettre une analyse fine « vert / rouge » par tâche et par nature de coût.

Il ne s'agit donc pas de nouvelles fonctionnalités isolées mais d'une **refonte du modèle budgétaire et des dépenses** qui impacte les EPIC 3 (Chantiers), EPIC 4 (Suivi Financier) et les US-005, US-008, US-011 existantes.

Vérification technique (`apps/api/prisma/schema.prisma`) :

- `Chantier.budget` est aujourd'hui un champ unique (pas de séparation main d'œuvre / matériaux).
- `DepenseCategorie` contient déjà `MATERIEL`, `MAIN_OEUVRE`, `TRANSPORT`, `AUTRE` — **il manque `SOUS_TRAITANCE`**, et le backlog fonctionnel (BR-013) n'exposait que « Matériaux » côté UI.
- `TacheChantier` n'a que `libelle` + `prixVenduHT` — **aucun champ budget main d'œuvre / budget matériaux**.
- `Depense` n'a **aucun lien vers `TacheChantier`** (`tacheId` absent).

---

## Acteurs identifiés

| Acteur        | Description                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| **PATRON**    | Définit les budgets par tâche, saisit/valide les dépenses, suit la rentabilité par tâche et par nature de coût. |
| **COMPTABLE** | Consulte le suivi budgétaire pour la préparation des exports (impact indirect, pas de nouvelle règle).          |

---

## Tableau de correspondance — Note workshop → Élément backlog impacté

| # Note (`correction.md`)                                                                          | Élément existant impacté            | Nature du changement                       |
| ------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| Différencier dépense main d'œuvre / matériaux                                                     | BR-013, US-008 (`depense`)          | **Modifié** (résout CL-002)                |
| Ajouter budget main d'œuvre / budget matériaux + indicateur rouge/vert par comparaison au factuel | BR-024, US-011 (`rapport`)          | **Modifié** + **Nouveau** indicateur       |
| Budget par tâche (main d'œuvre + matériaux) importé depuis devis Excel chiffré/vendu              | BR-007, BR-008, US-005 (`chantier`) | **Modifié** (format OCR → Excel structuré) |
| Budget total du chantier récupéré depuis l'Excel                                                  | BR-005, US-004 (`chantier`)         | **Modifié**                                |
| Prix de vente = budget + marge                                                                    | BR-005, BR-024                      | **Modifié** (formule inversée)             |
| Dépense manuelle : tâche en liste déroulante (issue de l'import)                                  | US-008 (`depense`)                  | **Modifié**                                |
| Types de dépense : Matériaux / Main d'œuvre / Sous-traitance                                      | BR-013, `DepenseCategorie` (schema) | **Nouveau** (ajout `SOUS_TRAITANCE`)       |
| Budget main d'œuvre = interne + sous-traitance                                                    | BR-024, BR-025                      | **Nouveau** (règle de calcul)              |
| Vue dépenses par chantier réorganisée par tâche (budget/dépense MO et Matériaux)                  | US-011, US-015 (vue chantier)       | **Nouveau** écran                          |

---

## Business Rules — Corrections & Ajouts

### Domaine : `chantier`

| ID       | Règle                                                                                                                                                  | Statut  | Remplace | Priorité |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- | -------- |
| BR-C-001 | Un chantier possède désormais un **budget main d'œuvre** et un **budget matériaux** distincts, en plus du budget total                                 | Modifie | BR-005   | Must     |
| BR-C-002 | Le budget total, le budget main d'œuvre et le budget matériaux d'un chantier sont importés depuis le devis chiffré vendu au client (fichier Excel)     | Modifie | BR-005   | Must     |
| BR-C-003 | Le prix de vente HT d'un chantier = budget total + marge (la marge devient une donnée saisie/importée, le prix de vente n'est plus saisi manuellement) | Modifie | BR-005   | Must     |
| BR-C-004 | `[CLARIFICATION NEEDED]` La marge est-elle importée depuis l'Excel (ligne dédiée) ou saisie manuellement par le patron après import ?                  | Nouveau | —        | Must     |

### Domaine : `chantier` (tâches)

| ID       | Règle                                                                                                                                                    | Statut  | Remplace       | Priorité |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------- | -------- |
| BR-C-005 | Chaque tâche d'un chantier possède un **budget main d'œuvre** et un **budget matériaux**, en plus de son libellé et de son prix de vente HT              | Modifie | BR-008         | Must     |
| BR-C-006 | Les tâches et leurs budgets sont importés depuis le **devis chiffré client au format Excel** (remplace ou complète l'import OCR image/PDF)               | Modifie | BR-007         | Must     |
| BR-C-007 | `[CLARIFICATION NEEDED]` L'import OCR (scan photo/PDF, US-005 existante) est-il abandonné au profit exclusif de l'import Excel, ou les deux coexistent ? | Nouveau | —              | Must     |
| BR-C-008 | Le résultat de l'import Excel (tâches + budgets) est présenté pour validation/correction avant enregistrement, comme pour l'OCR                          | Nouveau | BR-007 (étend) | Should   |

### Domaine : `depense`

| ID       | Règle                                                                                                                                              | Statut  | Remplace | Priorité |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | -------- |
| BR-C-009 | Une dépense est typée parmi trois catégories : **Matériaux**, **Main d'œuvre**, **Sous-traitance**                                                 | Modifie | BR-013   | Must     |
| BR-C-010 | Une dépense manuelle doit obligatoirement être rattachée à une **tâche** du chantier (sélection en liste déroulante), en plus du chantier lui-même | Modifie | US-008   | Must     |
| BR-C-011 | La liste déroulante des tâches proposée lors de la saisie d'une dépense est alimentée par les tâches importées (Excel) du chantier concerné        | Nouveau | —        | Must     |
| BR-C-012 | Le budget « main d'œuvre » (chantier et tâche) agrège à la fois la main d'œuvre interne (pointages valorisés) et la sous-traitance                 | Nouveau | BR-025   | Must     |

### Domaine : `rapport` / suivi financier

| ID       | Règle                                                                                                                                                                  | Statut  | Remplace | Priorité |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | -------- |
| BR-C-013 | Pour chaque chantier, un indicateur distinct compare le **budget main d'œuvre** au **coût réel main d'œuvre** (pointages internes valorisés + dépenses sous-traitance) | Nouveau | BR-024   | Must     |
| BR-C-014 | Pour chaque chantier, un indicateur distinct compare le **budget matériaux** au **coût réel matériaux** (somme des dépenses de type Matériaux)                         | Nouveau | BR-024   | Must     |
| BR-C-015 | Chaque indicateur (main d'œuvre / matériaux) affiche un statut **« dans le budget » (vert)** ou **« en dépassement » (rouge)** selon le dépassement du budget associé  | Nouveau | —        | Must     |
| BR-C-016 | Le même principe de comparaison budget vs réel (main d'œuvre / matériaux) est décliné **par tâche**, pas uniquement au niveau global du chantier                       | Nouveau | BR-011   | Must     |
| BR-C-017 | Tous les calculs de comparaison budget/réel sont effectués côté API, jamais côté frontend                                                                              | Nouveau | BR-024   | Must     |

---

## Use Cases — Corrections & Ajouts

| ID      | Acteur | Titre                                              | Description courte                                                                                         | Pré-conditions                        | Post-conditions                                         | Remplace / étend |
| ------- | ------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------- | ---------------- |
| UC-C001 | PATRON | Importer un devis chiffré Excel                    | Le patron importe le fichier Excel du devis vendu au client pour créer les tâches et leurs budgets         | Chantier créé                         | Tâches + budgets (MO/Matériaux) + budget total importés | UC-005 (US-005)  |
| UC-C002 | PATRON | Ajouter une dépense typée et rattachée à une tâche | Le patron saisit une dépense en choisissant son type (Matériaux/MO/Sous-traitance) et la tâche concernée   | Chantier avec tâches importées        | Dépense enregistrée et rattachée à la tâche             | UC-008 (US-008)  |
| UC-C003 | PATRON | Consulter le suivi budgétaire global d'un chantier | Le patron voit, pour un chantier, le budget vs réel séparément pour main d'œuvre et matériaux (rouge/vert) | Chantier avec budgets définis         | Affichage des deux indicateurs de dépassement           | UC-011 (US-011)  |
| UC-C004 | PATRON | Consulter le suivi budgétaire par tâche            | Le patron voit, pour chaque tâche d'un chantier, le budget vs réel main d'œuvre et matériaux               | Tâches avec budgets et dépenses liées | Tableau détaillé par tâche (vert/rouge)                 | Nouveau          |

---

## EPIC A — Refonte des Budgets (Chantier & Tâches)

### User Stories

---

**US-C001** | `chantier` — _Modifie US-004, US-005_

> En tant que **PATRON**, je veux importer le devis chiffré (au format Excel) vendu au client afin de créer automatiquement les tâches du chantier avec leur budget main d'œuvre et leur budget matériaux, sans ressaisie manuelle.

**Critères d'acceptation :**

- [ ] CA1 : L'interface propose d'uploader un fichier Excel (.xlsx) correspondant au devis chiffré
- [ ] CA2 : Chaque ligne du fichier est mappée à une tâche : libellé, budget main d'œuvre, budget matériaux, prix vendu HT
- [ ] CA3 : Le budget total du chantier et la marge globale sont également extraits du fichier (ligne de synthèse)
- [ ] CA4 : Le résultat de l'import est présenté pour validation/correction avant enregistrement définitif
- [ ] CA5 : `[CLARIFICATION NEEDED]` Le format de fichier Excel attendu (structure des colonnes) doit être fourni/validé par le client
- [ ] CA6 : `[CLARIFICATION NEEDED]` L'import OCR existant (US-005) est-il conservé comme méthode alternative, ou remplacé ?

**Priorité :** Must Have | **Points :** XL | **UC liés :** UC-C001 | **BR liées :** BR-C-002, BR-C-005, BR-C-006, BR-C-007, BR-C-008

---

**US-C002** | `chantier` — _Modifie US-004_

> En tant que **PATRON**, je veux que le prix de vente du chantier soit calculé automatiquement à partir du budget total et de la marge afin de garantir la cohérence financière dès la création.

**Critères d'acceptation :**

- [ ] CA1 : Le budget total (main d'œuvre + matériaux) et la marge sont renseignés (import Excel ou saisie manuelle)
- [ ] CA2 : Le prix de vente HT est calculé automatiquement : `prix de vente = budget total + marge`
- [ ] CA3 : Le prix de vente n'est plus un champ librement saisi à la création du chantier
- [ ] CA4 : Le calcul est effectué côté API
- [ ] CA5 : `[CLARIFICATION NEEDED]` La marge est-elle une valeur importée du devis ou saisie/ajustée manuellement par le patron ?

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-C001 | **BR liées :** BR-C-003, BR-C-004

---

## EPIC B — Refonte des Dépenses

### User Stories

---

**US-C003** | `depense` — _Modifie US-008_

> En tant que **PATRON**, je veux saisir une dépense en précisant son type (Matériaux, Main d'œuvre, Sous-traitance) et la tâche concernée afin de suivre précisément où j'engage mes coûts réels.

**Critères d'acceptation :**

- [ ] CA1 : Le formulaire de dépense propose un sélecteur de type : Matériaux / Main d'œuvre / Sous-traitance
- [ ] CA2 : Le formulaire propose une liste déroulante des tâches du chantier (issues de l'import Excel) pour rattacher la dépense
- [ ] CA3 : La sélection d'une tâche est obligatoire pour toute dépense manuelle
- [ ] CA4 : La dépense reste rattachée au chantier et au `companyId` comme précédemment
- [ ] CA5 : Après saisie, le suivi budgétaire de la tâche concernée (US-C005) est recalculé immédiatement

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-C002 | **BR liées :** BR-C-009, BR-C-010, BR-C-011

---

## EPIC C — Suivi Budgétaire Rouge/Vert (Chantier & Tâche)

### User Stories

---

**US-C004** | `rapport` — _Modifie US-011_

> En tant que **PATRON**, je veux voir, pour un chantier, deux indicateurs distincts (main d'œuvre et matériaux) comparant le budget prévu au coût réel afin de savoir immédiatement sur quelle nature de coût je dérape.

**Critères d'acceptation :**

- [ ] CA1 : Affichage du budget main d'œuvre vs coût réel main d'œuvre (pointages internes valorisés + dépenses sous-traitance)
- [ ] CA2 : Affichage du budget matériaux vs coût réel matériaux (somme des dépenses de type Matériaux)
- [ ] CA3 : Chaque indicateur affiche un statut visuel vert (dans le budget) ou rouge (dépassement)
- [ ] CA4 : Les indicateurs se mettent à jour en temps réel à chaque nouvelle dépense ou pointage validé
- [ ] CA5 : Les calculs sont effectués côté API

**Priorité :** Must Have | **Points :** L | **UC liés :** UC-C003 | **BR liées :** BR-C-012, BR-C-013, BR-C-014, BR-C-015, BR-C-017

---

**US-C005** | `rapport` — _Nouveau_

> En tant que **PATRON**, je veux consulter un tableau détaillé par tâche affichant le budget et le réel (main d'œuvre et matériaux) afin d'identifier précisément les tâches en dérive et d'affiner mes futurs devis.

**Critères d'acceptation :**

- [ ] CA1 : Pour chaque tâche du chantier, affichage de : budget main d'œuvre, dépense réelle main d'œuvre, budget matériaux, dépense réelle matériaux
- [ ] CA2 : Un indicateur vert/rouge est affiché par tâche et par nature de coût (main d'œuvre / matériaux)
- [ ] CA3 : Le tableau est trié par défaut par ordre décroissant de dépassement
- [ ] CA4 : Le tableau remplace/complète la vue actuelle des dépenses par chantier (moins claire) mentionnée dans les retours client
- [ ] CA5 : Les données sont filtrées par `companyId`

**Priorité :** Must Have | **Points :** L | **UC liés :** UC-C004 | **BR liées :** BR-C-016, BR-C-017

---

## Roadmap suggérée

### Sprint C1 — Fondations modèle budgétaire (Semaines 1-2)

- [ ] US-C001 — Import du devis chiffré Excel (tâches + budgets MO/Matériaux)
- [ ] US-C002 — Calcul automatique du prix de vente (budget + marge)

### Sprint C2 — Dépenses typées et rattachées (Semaines 3-4)

- [ ] US-C003 — Dépense typée (Matériaux/MO/Sous-traitance) + rattachement tâche

### Sprint C3 — Suivi budgétaire rouge/vert (Semaines 5-6)

- [ ] US-C004 — Indicateurs budget vs réel par chantier (MO / Matériaux)
- [ ] US-C005 — Tableau de suivi budgétaire détaillé par tâche

---

## Impact technique (à valider avec l'équipe API)

| Modèle Prisma      | Changement nécessaire                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `Chantier`         | Ajout `budgetMainOeuvre Float?`, `budgetMateriaux Float?`, `marge Float?` (le champ `budget` existant devient le budget total) |
| `TacheChantier`    | Ajout `budgetMainOeuvre Float?`, `budgetMateriaux Float?`                                                                      |
| `Depense`          | Ajout `tacheId String?` (relation vers `TacheChantier`)                                                                        |
| `DepenseCategorie` | Ajout de la valeur `SOUS_TRAITANCE` à l'enum existant (`MATERIEL`, `MAIN_OEUVRE`, `TRANSPORT`, `AUTRE`)                        |

---

## Points de clarification en suspens

| ID       | US concernée | Question                                                                                                              |
| -------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| CL-C-001 | US-C001      | Quelle est la structure exacte attendue du fichier Excel du devis (colonnes, feuille de synthèse) ?                   |
| CL-C-002 | US-C001      | L'import OCR existant (US-005) est-il conservé en parallèle de l'import Excel, ou remplacé définitivement ?           |
| CL-C-003 | US-C002      | La marge du chantier est-elle importée depuis l'Excel ou saisie/ajustée manuellement par le patron ?                  |
| CL-C-004 | US-C003      | Le champ `TRANSPORT` déjà présent dans `DepenseCategorie` est-il conservé, fusionné avec un autre type, ou supprimé ? |

---

## Récapitulatif

| Métrique                          | Valeur |
| --------------------------------- | ------ |
| Total User Stories (correction)   | 5      |
| Total Use Cases (correction)      | 4      |
| Total Business Rules (correction) | 17     |
| Must Have                         | 15     |
| Should Have                       | 1      |
| Nouvelles clarifications          | 4      |
| Epics                             | 3      |
