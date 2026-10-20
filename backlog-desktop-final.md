# BACKLOG — APPLICATION DESKTOP (PATRON)

Généré le : 2026-08-29
Basé sur : `backlogDesktop.md`

---

## Résumé du document

Le document décrit le backlog de l'application Desktop destinée au **Patron**. Il couvre l'ensemble des fonctionnalités de gestion d'entreprise BTP : authentification, tableau de bord global, création et suivi des chantiers (avec import OCR de tâches), affectation des ouvriers, saisie des dépenses, suivi financier (marge, rentabilité), gestion des pointages remontés depuis l'application mobile, et export comptable CSV/Excel avec calcul des heures majorées par zone.

---

## Acteurs identifiés

| Acteur        | Description                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **PATRON**    | Utilisateur principal de l'application Desktop. Gère chantiers, ouvriers, dépenses et valide les pointages. |
| **COMPTABLE** | Accède aux exports comptables et aux récapitulatifs de paie. Pas de droits d'administration.                |
| **OUVRIER**   | Acteur secondaire — remonte les pointages depuis l'application Mobile, sélectionne ses tâches.              |

---

## Business Rules

### Domaine : `auth`

| ID     | Domaine | Règle                                                                                   | Priorité |
| ------ | ------- | --------------------------------------------------------------------------------------- | -------- |
| BR-001 | auth    | Seul un utilisateur authentifié avec un JWT valide peut accéder à l'application Desktop | Must     |
| BR-002 | auth    | La session expire après inactivité prolongée et nécessite une reconnexion               | Should   |

### Domaine : `company` (multi-tenant)

| ID     | Domaine | Règle                                                                                                        | Priorité |
| ------ | ------- | ------------------------------------------------------------------------------------------------------------ | -------- |
| BR-003 | company | Toutes les données sont strictement isolées par `companyId` extrait du JWT — jamais transmis par le frontend | Must     |
| BR-004 | company | Un utilisateur ne peut pas accéder aux données d'une autre entreprise, même avec un token valide             | Must     |

### Domaine : `chantier`

| ID     | Domaine  | Règle                                                                                                                                              | Priorité |
| ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| BR-005 | chantier | Un chantier doit obligatoirement avoir : nom, adresse, client, prix de vente HT, catégorie de zone (1/2/3/4) et dates de début/fin prévisionnelles | Must     |
| BR-006 | chantier | La catégorie de zone (1 à 4) est définie à la création du chantier et conditionne les calculs d'indemnités                                         | Must     |
| BR-007 | chantier | Les tâches/activités d'un chantier peuvent être importées depuis un devis via scan OCR                                                             | Should   |
| BR-008 | chantier | Chaque tâche importée possède un libellé et un prix vendu HT                                                                                       | Should   |
| BR-009 | chantier | Seules les tâches affectées à un chantier sont visibles par l'ouvrier lors de son pointage mobile                                                  | Must     |
| BR-010 | chantier | Un chantier peut être clôturé manuellement par le patron                                                                                           | Must     |
| BR-011 | chantier | La suppression d'un chantier n'est autorisée que s'il n'a aucun pointage validé associé                                                            | Should   |

### Domaine : `depense`

| ID     | Domaine | Règle                                                                                                      | Priorité |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| BR-012 | depense | Une dépense est obligatoirement rattachée à un chantier et à un `companyId`                                | Must     |
| BR-013 | depense | Les types de dépenses supportés incluent au minimum : Matériaux                                            | Must     |
| BR-014 | depense | [CLARIFICATION NEEDED] D'autres types de dépenses sont-ils prévus (sous-traitance, outillage, transport) ? | Should   |

### Domaine : `pointage`

| ID     | Domaine  | Règle                                                                                       | Priorité |
| ------ | -------- | ------------------------------------------------------------------------------------------- | -------- |
| BR-015 | pointage | Un pointage est créé depuis l'application Mobile et remonte vers le Desktop pour validation | Must     |
| BR-016 | pointage | Le patron peut corriger un pointage avant validation                                        | Must     |
| BR-017 | pointage | Un pointage validé ne peut plus être modifié sans dévalidation explicite                    | Should   |
| BR-018 | pointage | Un pointage est lié à un ouvrier, un chantier, et une date                                  | Must     |

### Domaine : `paie`

| ID     | Domaine | Règle                                                                                                            | Priorité |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| BR-019 | paie    | Le calcul des heures majorées est conditionné par la catégorie de zone du chantier                               | Must     |
| BR-020 | paie    | La catégorie de zone peut être récupérée depuis un référentiel externe                                           | Should   |
| BR-021 | paie    | Le nombre d'indemnités est calculé sur la base du nombre de jours effectués dans une zone                        | Must     |
| BR-022 | paie    | L'export CSV contient pour chaque ouvrier : total heures travaillées, total heures majorées, nombre d'indemnités | Must     |
| BR-023 | paie    | L'utilisateur peut modifier certaines données avant de valider l'export final                                    | Should   |

### Domaine : `rapport` / suivi financier

| ID     | Domaine | Règle                                                                               | Priorité |
| ------ | ------- | ----------------------------------------------------------------------------------- | -------- |
| BR-024 | rapport | La marge d'un chantier = Prix de vente HT − (Dépenses + Coût main d'œuvre)          | Must     |
| BR-025 | rapport | Le coût main d'œuvre = Somme(heures validées × taux horaire ouvrier)                | Must     |
| BR-026 | rapport | Le dashboard global agrège les données de tous les chantiers actifs de l'entreprise | Must     |

### Domaine : `users`

| ID     | Domaine | Règle                                                                                                                        | Priorité |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| BR-027 | users   | Un ouvrier possède : nom, prénom, adresse, numéro carte vitale, mutuelle, numéro de téléphone, contact urgence, taux horaire | Must     |
| BR-028 | users   | Le taux horaire est utilisé pour le calcul du coût main d'œuvre et les exports de paie                                       | Must     |

---

## Use Cases

| ID     | Acteur             | Titre                                | Description courte                                                                              | Pré-conditions                                            | Post-conditions                                    |
| ------ | ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| UC-001 | PATRON             | Connexion                            | Le patron saisit ses identifiants pour accéder à l'application Desktop                          | Aucune                                                    | JWT valide, redirection vers dashboard             |
| UC-002 | PATRON             | Consulter le dashboard global        | Le patron visualise les KPIs globaux de son entreprise                                          | Authentifié                                               | Affichage des indicateurs consolidés               |
| UC-003 | PATRON             | Consulter la synthèse par chantier   | Le patron voit rapidement la santé de chaque chantier                                           | Authentifié, chantiers existants                          | Affichage budget/dépenses/marge par chantier       |
| UC-004 | PATRON             | Créer un chantier                    | Le patron saisit les informations d'un nouveau chantier                                         | Authentifié                                               | Chantier créé et rattaché à l'entreprise           |
| UC-005 | PATRON             | Importer des tâches via OCR          | Le patron scanne un devis pour extraire automatiquement les tâches facturées                    | Chantier créé                                             | Tâches importées et associées au chantier          |
| UC-006 | PATRON             | Gérer les tâches d'un chantier       | Le patron ajoute, modifie ou supprime des tâches d'un chantier                                  | Chantier existant                                         | Tâches mises à jour                                |
| UC-007 | PATRON             | Affecter des ouvriers à un chantier  | Le patron associe des ouvriers à un chantier                                                    | Chantier existant, ouvriers existants                     | Ouvriers affectés, tâches disponibles pour eux     |
| UC-008 | PATRON             | Ajouter une dépense                  | Le patron saisit une dépense liée à un chantier                                                 | Chantier actif                                            | Dépense enregistrée, calculs financiers mis à jour |
| UC-009 | PATRON             | Terminer un chantier                 | Le patron clôture un chantier                                                                   | Chantier actif                                            | Statut chantier = TERMINÉ                          |
| UC-010 | PATRON             | Modifier / Supprimer un chantier     | Le patron modifie ou supprime un chantier existant                                              | Chantier existant sans pointage validé (pour suppression) | Chantier mis à jour ou supprimé                    |
| UC-011 | PATRON             | Consulter les indicateurs financiers | Le patron voit le coût total, la marge et la rentabilité d'un chantier                          | Chantier avec dépenses/pointages                          | Affichage des calculs automatiques                 |
| UC-012 | PATRON             | Consulter la liste des ouvriers      | Le patron voit tous ses employés avec leurs informations                                        | Authentifié                                               | Liste des ouvriers affichée                        |
| UC-013 | PATRON             | Consulter la fiche d'un ouvrier      | Le patron voit le détail d'un ouvrier (heures, historique, chantiers)                           | Ouvrier existant                                          | Fiche ouvrier affichée                             |
| UC-014 | PATRON             | Consulter les pointages              | Le patron voit les pointages remontés depuis l'application Mobile                               | Pointages existants                                       | Liste des pointages affichée                       |
| UC-015 | PATRON             | Corriger un pointage                 | Le patron modifie un pointage erroné avant validation                                           | Pointage non validé                                       | Pointage corrigé                                   |
| UC-016 | PATRON             | Valider les pointages                | Le patron approuve officiellement les heures d'un ou plusieurs ouvriers                         | Pointages existants                                       | Pointages validés, verrouillés pour l'export       |
| UC-017 | PATRON / COMPTABLE | Préparer l'export comptable          | L'utilisateur prévisualise les données de paie, les ajuste si besoin, puis exporte en CSV/Excel | Pointages validés                                         | Fichier CSV/Excel téléchargé                       |

---

## EPIC 1 — Authentification & Accès

### User Stories

---

**US-001** | `auth`

> En tant que **PATRON**, je veux me connecter à l'application Desktop avec mon email et mon mot de passe afin d'accéder à mon espace de gestion d'entreprise.

**Critères d'acceptation :**

- [ ] CA1 : Un formulaire de connexion avec champs email et mot de passe est affiché au démarrage
- [ ] CA2 : En cas d'identifiants valides, un JWT est stocké localement et l'utilisateur est redirigé vers le dashboard
- [ ] CA3 : En cas d'identifiants invalides, un message d'erreur explicite est affiché sans détailler la cause (sécurité)
- [ ] CA4 : Après plusieurs tentatives échouées, un délai de protection est appliqué
- [ ] CA5 : Le mot de passe n'est jamais transmis en clair ni stocké localement

**Priorité :** Must Have | **Points :** S | **UC liés :** UC-001 | **BR liées :** BR-001, BR-002, BR-003

---

## EPIC 2 — Dashboard Global

### User Stories

---

**US-002** | `rapport`

> En tant que **PATRON**, je veux voir un tableau de bord global de mon entreprise afin d'avoir une vision instantanée de l'activité.

**Critères d'acceptation :**

- [ ] CA1 : Affichage du nombre de chantiers actifs
- [ ] CA2 : Affichage du CA total (somme des prix de vente HT des chantiers actifs)
- [ ] CA3 : Affichage des dépenses totales (toutes dépenses confondues, tous chantiers actifs)
- [ ] CA4 : Affichage de la marge globale (CA − coût total)
- [ ] CA5 : Les données sont filtrées par `companyId` et ne concernent que l'entreprise courante

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-002 | **BR liées :** BR-003, BR-024, BR-026

---

**US-003** | `rapport`

> En tant que **PATRON**, je veux voir une synthèse rapide de chaque chantier afin de détecter immédiatement les chantiers en dérive financière.

**Critères d'acceptation :**

- [ ] CA1 : Chaque chantier est affiché avec son nom, son statut et sa catégorie de zone
- [ ] CA2 : Affichage du budget (prix de vente HT) vs dépenses réelles
- [ ] CA3 : Affichage de la marge calculée automatiquement
- [ ] CA4 : Un indicateur visuel (couleur/icône) signale les chantiers dont la marge est négative ou sous un seuil critique
- [ ] CA5 : [CLARIFICATION NEEDED] Quel indicateur d'avancement est attendu (% tâches complétées, % heures consommées) ?

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-003 | **BR liées :** BR-024, BR-025, BR-026

---

## EPIC 3 — Gestion des Chantiers

### User Stories

---

**US-004** | `chantier`

> En tant que **PATRON**, je veux créer un nouveau chantier en saisissant toutes ses informations afin de démarrer le suivi opérationnel et financier.

**Critères d'acceptation :**

- [ ] CA1 : Le formulaire contient les champs obligatoires : nom, adresse, client, prix de vente HT, catégorie de zone (1/2/3/4), date de début, date de fin prévisionnelle
- [ ] CA2 : La catégorie de zone est sélectionnable parmi les valeurs 1, 2, 3, 4
- [ ] CA3 : La validation empêche la soumission si un champ obligatoire est manquant
- [ ] CA4 : Le chantier créé est automatiquement rattaché au `companyId` de l'utilisateur connecté
- [ ] CA5 : Le chantier apparaît immédiatement dans la liste et le dashboard

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-004 | **BR liées :** BR-003, BR-005, BR-006

---

**US-005** | `chantier`

> En tant que **PATRON**, je veux importer les tâches d'un chantier depuis un devis via scan OCR afin d'éviter la ressaisie manuelle et de préparer les activités disponibles pour mes ouvriers.

**Critères d'acceptation :**

- [ ] CA1 : L'interface propose d'uploader une image ou un PDF d'un devis
- [ ] CA2 : L'OCR extrait automatiquement les lignes de tâches avec libellé et prix vendu HT
- [ ] CA3 : Le résultat OCR est présenté à l'utilisateur pour validation/correction avant import
- [ ] CA4 : Les tâches validées sont enregistrées et associées au chantier
- [ ] CA5 : Ces tâches sont ensuite disponibles pour sélection par l'ouvrier dans l'application Mobile

**Priorité :** Should Have | **Points :** XL | **UC liés :** UC-005 | **BR liées :** BR-007, BR-008, BR-009

---

**US-006** | `chantier`

> En tant que **PATRON**, je veux gérer manuellement les tâches d'un chantier (ajout, modification, suppression) afin de les maintenir à jour sans passer par l'OCR.

**Critères d'acceptation :**

- [ ] CA1 : Il est possible d'ajouter une tâche manuellement avec un libellé et un prix vendu HT
- [ ] CA2 : Il est possible de modifier le libellé et le prix d'une tâche existante
- [ ] CA3 : Il est possible de supprimer une tâche non encore utilisée dans un pointage
- [ ] CA4 : La liste des tâches est visible et éditable depuis la fiche chantier

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-006 | **BR liées :** BR-008, BR-009

---

**US-007** | `chantier`

> En tant que **PATRON**, je veux affecter des ouvriers à un chantier afin qu'ils puissent le sélectionner et y effectuer leur pointage depuis le mobile.

**Critères d'acceptation :**

- [ ] CA1 : Depuis la fiche chantier, il est possible de sélectionner un ou plusieurs ouvriers parmi la liste de l'entreprise
- [ ] CA2 : Seuls les chantiers auxquels un ouvrier est affecté lui sont proposés dans l'application Mobile
- [ ] CA3 : Il est possible de retirer un ouvrier d'un chantier (si aucun pointage en cours)
- [ ] CA4 : L'affectation est enregistrée dans le contexte de l'entreprise (`companyId`)

**Priorité :** Must Have | **Points :** S | **UC liés :** UC-007 | **BR liées :** BR-009, BR-015

---

**US-008** | `depense`

> En tant que **PATRON**, je veux saisir une dépense sur un chantier afin de suivre les coûts réels et calculer la marge.

**Critères d'acceptation :**

- [ ] CA1 : Le formulaire contient : type de dépense (Matériaux), montant HT, date, description optionnelle
- [ ] CA2 : La dépense est obligatoirement associée à un chantier existant
- [ ] CA3 : La dépense est automatiquement rattachée au `companyId` courant
- [ ] CA4 : Le total des dépenses et la marge du chantier sont recalculés immédiatement après saisie
- [ ] CA5 : [CLARIFICATION NEEDED] D'autres types de dépenses sont-ils prévus (sous-traitance, outillage, transport) ?

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-008 | **BR liées :** BR-012, BR-013, BR-024

---

**US-009** | `chantier`

> En tant que **PATRON**, je veux terminer un chantier afin de le clôturer et de figer son bilan financier.

**Critères d'acceptation :**

- [ ] CA1 : Un bouton "Terminer le chantier" est disponible sur la fiche chantier actif
- [ ] CA2 : Une confirmation est demandée avant clôture
- [ ] CA3 : Le statut passe à TERMINÉ et le chantier n'est plus modifiable
- [ ] CA4 : Le chantier terminé reste consultable mais n'apparaît plus dans les chantiers actifs du dashboard

**Priorité :** Must Have | **Points :** S | **UC liés :** UC-009 | **BR liées :** BR-010

---

**US-010** | `chantier`

> En tant que **PATRON**, je veux modifier ou supprimer un chantier afin de corriger les informations ou nettoyer les chantiers créés par erreur.

**Critères d'acceptation :**

- [ ] CA1 : Tous les champs du chantier sont modifiables tant qu'il est au statut ACTIF
- [ ] CA2 : La suppression est bloquée si des pointages validés sont associés au chantier
- [ ] CA3 : Un message d'avertissement clair est affiché avant suppression
- [ ] CA4 : La suppression retire également les tâches et dépenses associées (soft delete recommandé)

**Priorité :** Must Have | **Points :** S | **UC liés :** UC-010 | **BR liées :** BR-011

---

## EPIC 4 — Suivi Financier

### User Stories

---

**US-011** | `rapport`

> En tant que **PATRON**, je veux consulter les indicateurs financiers automatiques d'un chantier afin d'évaluer sa rentabilité en temps réel.

**Critères d'acceptation :**

- [ ] CA1 : Affichage du coût total = dépenses + (heures validées × taux horaire)
- [ ] CA2 : Affichage de la marge = prix de vente HT − coût total
- [ ] CA3 : Affichage du taux de rentabilité = (marge / prix de vente HT) × 100
- [ ] CA4 : Les calculs sont effectués côté API, jamais côté frontend
- [ ] CA5 : Les données sont mises à jour en temps réel à chaque nouvelle dépense ou pointage validé

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-011 | **BR liées :** BR-024, BR-025

---

## EPIC 5 — Gestion des Ouvriers

### User Stories

---

**US-012** | `users`

> En tant que **PATRON**, je veux consulter la liste de tous mes ouvriers afin d'avoir une vision complète de mon équipe.

**Critères d'acceptation :**

- [ ] CA1 : La liste affiche pour chaque ouvrier : nom, prénom, numéro de téléphone
- [ ] CA2 : Un moteur de recherche par nom/prénom est disponible
- [ ] CA3 : La liste est filtrée par `companyId` (uniquement les ouvriers de l'entreprise courante)
- [ ] CA4 : Un bouton permet d'accéder à la fiche détaillée de chaque ouvrier

**Priorité :** Must Have | **Points :** S | **UC liés :** UC-012 | **BR liées :** BR-003, BR-027

---

**US-013** | `users`

> En tant que **PATRON**, je veux créer la fiche d'un ouvrier avec toutes ses informations administratives afin de pouvoir le suivre et calculer sa paie.

**Critères d'acceptation :**

- [ ] CA1 : Le formulaire contient : nom, prénom, adresse, numéro de carte vitale, mutuelle, numéro de téléphone, contact d'urgence, taux horaire
- [ ] CA2 : Le taux horaire est obligatoire pour le calcul du coût main d'œuvre
- [ ] CA3 : Les données sensibles (carte vitale) sont stockées de façon sécurisée
- [ ] CA4 : L'ouvrier créé est rattaché au `companyId` de l'entreprise

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-012 | **BR liées :** BR-027, BR-028

---

**US-014** | `users`

> En tant que **PATRON**, je veux consulter la fiche détaillée d'un ouvrier afin de voir son historique d'heures et ses chantiers.

**Critères d'acceptation :**

- [ ] CA1 : Affichage des informations administratives complètes de l'ouvrier
- [ ] CA2 : Affichage du total des heures travaillées (sur une période sélectionnable)
- [ ] CA3 : Affichage de l'historique des pointages par date et chantier
- [ ] CA4 : Affichage des chantiers sur lesquels l'ouvrier a été affecté

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-013 | **BR liées :** BR-027, BR-028

---

## EPIC 6 — Gestion des Heures & Pointages

### User Stories

---

**US-015** | `pointage`

> En tant que **PATRON**, je veux consulter tous les pointages remontés depuis l'application Mobile afin de suivre la présence de mes ouvriers sur les chantiers.

**Critères d'acceptation :**

- [ ] CA1 : La liste des pointages est affichée avec : ouvrier, chantier, date, heure de début, heure de fin, tâches déclarées, statut (en attente / validé / corrigé)
- [ ] CA2 : Des filtres sont disponibles : par ouvrier, par chantier, par date, par statut
- [ ] CA3 : Les pointages sont triés par date décroissante par défaut
- [ ] CA4 : Seuls les pointages de l'entreprise courante sont affichés (`companyId`)

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-014 | **BR liées :** BR-015, BR-018, BR-003

---

**US-016** | `pointage`

> En tant que **PATRON**, je veux corriger un pointage erroné afin de m'assurer que les heures enregistrées reflètent la réalité avant validation.

**Critères d'acceptation :**

- [ ] CA1 : Il est possible de modifier l'heure de début et de fin d'un pointage non validé
- [ ] CA2 : Il est possible de modifier les tâches déclarées
- [ ] CA3 : Toute modification est tracée (date de correction, auteur)
- [ ] CA4 : Un pointage validé ne peut pas être modifié sans dévalidation préalable

**Priorité :** Must Have | **Points :** S | **UC liés :** UC-015 | **BR liées :** BR-016, BR-017

---

**US-017** | `pointage`

> En tant que **PATRON**, je veux valider les pointages de mes ouvriers afin de confirmer officiellement les heures travaillées et les rendre disponibles pour l'export comptable.

**Critères d'acceptation :**

- [ ] CA1 : Il est possible de valider un pointage individuellement ou en masse (sélection multiple)
- [ ] CA2 : Un pointage validé passe au statut VALIDÉ et devient verrouillé
- [ ] CA3 : Une notification ou confirmation visuelle est affichée après validation
- [ ] CA4 : Seuls les pointages validés sont inclus dans les exports de paie

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-016 | **BR liées :** BR-015, BR-017, BR-022

---

## EPIC 7 — Comptabilité & Paie

### User Stories

---

**US-018** | `paie`

> En tant que **PATRON** ou **COMPTABLE**, je veux prévisualiser les données de paie avant export afin de vérifier et ajuster les informations pour produire un fichier CSV propre.

**Critères d'acceptation :**

- [ ] CA1 : Un tableau récapitulatif affiche pour chaque ouvrier : nom, total heures travaillées, total heures majorées, nombre d'indemnités, chantier(s) concerné(s)
- [ ] CA2 : La période de l'export est sélectionnable (semaine, mois, période personnalisée)
- [ ] CA3 : Il est possible de modifier certaines valeurs dans le tableau avant export (ex : correction manuelle d'une indemnité)
- [ ] CA4 : Les heures majorées sont calculées selon la catégorie de zone du chantier (récupérée depuis le référentiel externe si nécessaire)
- [ ] CA5 : Le nombre d'indemnités est calculé sur la base du nombre de jours effectués dans une zone

**Priorité :** Must Have | **Points :** L | **UC liés :** UC-017 | **BR liées :** BR-019, BR-020, BR-021, BR-022, BR-023

---

**US-019** | `paie`

> En tant que **PATRON** ou **COMPTABLE**, je veux exporter les données de paie en CSV et/ou Excel afin de les importer dans mon logiciel de comptabilité.

**Critères d'acceptation :**

- [ ] CA1 : L'export CSV contient pour chaque ouvrier : nom, prénom, total heures travaillées, total heures majorées, nombre d'indemnités
- [ ] CA2 : L'export Excel reprend les mêmes données avec une mise en forme lisible
- [ ] CA3 : Le format du CSV respecte un format normalisé (séparateur, encodage UTF-8, en-têtes)
- [ ] CA4 : Le fichier exporté est téléchargeable directement depuis l'interface Desktop
- [ ] CA5 : [CLARIFICATION NEEDED] Quel logiciel comptable cible doit être compatible avec ce format CSV ?

**Priorité :** Must Have | **Points :** M | **UC liés :** UC-017 | **BR liées :** BR-022, BR-023

---

## Roadmap suggérée

### Sprint 1 — MVP Core (Semaines 1-2)

- [ ] US-001 — Connexion utilisateur
- [ ] US-004 — Créer un chantier
- [ ] US-007 — Affecter des ouvriers à un chantier
- [ ] US-008 — Ajouter une dépense
- [ ] US-012 — Liste des ouvriers
- [ ] US-013 — Créer la fiche ouvrier

### Sprint 2 — Suivi opérationnel (Semaines 3-4)

- [ ] US-002 — Dashboard global
- [ ] US-003 — Synthèse par chantier
- [ ] US-011 — Indicateurs financiers automatiques
- [ ] US-015 — Consulter les pointages
- [ ] US-017 — Valider les pointages
- [ ] US-010 — Modifier / Supprimer un chantier

### Sprint 3 — Gestion avancée (Semaines 5-6)

- [ ] US-006 — Gestion manuelle des tâches
- [ ] US-009 — Terminer un chantier
- [ ] US-014 — Fiche détaillée ouvrier
- [ ] US-016 — Corriger un pointage
- [ ] US-018 — Prévisualisation paie
- [ ] US-019 — Export CSV / Excel

### Sprint 4 — Fonctionnalités avancées (Semaines 7-8)

- [ ] US-005 — Import OCR depuis devis

---

## Points de clarification en suspens

| ID     | US concernée | Question                                                                                                   |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------- |
| CL-001 | US-003       | Quel indicateur d'avancement est attendu pour un chantier (% tâches complétées, % heures consommées) ?     |
| CL-002 | US-008       | Quels autres types de dépenses sont prévus en dehors de Matériaux (sous-traitance, outillage, transport) ? |
| CL-003 | US-019       | Quel logiciel comptable cible doit être compatible avec le format CSV d'export ?                           |
| CL-004 | EPIC 4       | Y a-t-il une notion de budget main d'œuvre prévisionnel distinct du prix de vente HT ?                     |

---

## Récapitulatif

| Métrique                | Valeur |
| ----------------------- | ------ |
| Total User Stories      | 19     |
| Total Use Cases         | 17     |
| Total Business Rules    | 28     |
| Must Have               | 15     |
| Should Have             | 4      |
| Could Have              | 0      |
| Points de clarification | 4      |
| Epics                   | 7      |
