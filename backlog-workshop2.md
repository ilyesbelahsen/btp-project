# BACKLOG WORKSHOP 2 — Fiabilisation des coûts, du pointage et de la paie

**Généré le :** 2 octobre 2026  
**Basé sur :** notes client du workshop dans ce fichier  
**Périmètre :** API NestJS, Desktop Patron/Comptable/Conducteur de travaux, Mobile Ouvrier.

## Résumé du document

Le workshop demande de fiabiliser le calcul économique d'un chantier à partir du budget, du coefficient et de la marge visée. Le bilan doit faire apparaître le prix de vente, les charges fixes, la marge visée et la marge nette calculée sur les coûts réels. Le mobile doit abandonner la saisie d'activités libre et faire remonter toutes les tâches du chantier afin que l'ouvrier affecte un nombre d'heures à chaque tâche après son pointage. Le besoin inclut également une précision homogène en heures/minutes et en montants, des coefficients de majoration par zone, puis une ventilation du temps et des indemnités par ouvrier pour la paie. Enfin, un rôle de conducteur de travaux doit consulter ses chantiers et saisir des dépenses.

## Acteurs identifiés

| Acteur                    | Responsabilités                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PATRON**                | Crée et paramètre les chantiers, consulte le bilan, contrôle les coûts et paramètre les majorations et indemnités.                                          |
| **COMPTABLE**             | Consulte le bilan et les données de paie selon ses droits.                                                                                                  |
| **CONDUCTEUR DE TRAVAUX** | Consulte les chantiers qui lui sont attribués et ajoute des dépenses. **[CLARIFICATION NEEDED]** Ce rôle doit-il être créé comme rôle applicatif distinct ? |
| **OUVRIER**               | Pointe sa journée puis répartit le temps passé entre les tâches du chantier.                                                                                |
| **API / SYSTÈME**         | Calcule les indicateurs, applique les droits, conserve la précision des données et isole les sociétés.                                                      |

## Priorisation

- **Must Have / MVP :** nécessaire pour obtenir des coûts et un pointage exploitables.
- **Should Have :** forte valeur métier, livrable juste après le socle de calcul.
- **Could Have :** amélioration utile mais non bloquante.
- **Won't Have v1 :** explicitement hors périmètre de ce workshop.

## Business Rules

| ID     | Domaine    | Règle                                                                                                                                                                                                                                                      | Priorité |
| ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| BR-001 | `chantier` | Lors de la création d'un chantier, le patron renseigne les paramètres nécessaires au calcul : budget, coefficient et prix de vente ou marge selon la formule validée.                                                                                      | Must     |
| BR-002 | `chantier` | La marge visée est déduite des valeurs saisies et affichée avant validation du chantier.                                                                                                                                                                   | Must     |
| BR-003 | `chantier` | La formule de référence doit être unique et exécutée côté API. **[CLARIFICATION NEEDED]** Confirmer si la formule est `budget x coefficient + marge = prix de vente`, ou si le prix de vente est saisi et la marge calculée par différence.                | Must     |
| BR-004 | `rapport`  | Le bilan affiche au minimum le prix de vente, la charge fixe liée au coefficient, la marge visée, le budget main-d'oeuvre, le budget matériaux, le coût réel et la marge nette.                                                                            | Must     |
| BR-005 | `rapport`  | La marge nette est calculée à partir du prix de vente et du coût réel, jamais à partir d'une valeur saisie par le frontend. **[CLARIFICATION NEEDED]** Confirmer si la règle est `prix de vente x coefficient - coût réel` ou `prix de vente - coût réel`. | Must     |
| BR-006 | `rapport`  | La charge fixe dépend du coefficient du chantier selon une table ou une règle paramétrable validée par le métier. **[CLARIFICATION NEEDED]** Préciser la formule et la source de cette charge.                                                             | Must     |
| BR-007 | `auth`     | Toute donnée créée ou consultée est limitée à la société issue du JWT ; le frontend ne transmet jamais le `companyId` comme autorité.                                                                                                                      | Must     |
| BR-008 | `auth`     | Le patron, le comptable, le conducteur et l'ouvrier n'accèdent qu'aux actions autorisées par leur rôle.                                                                                                                                                    | Must     |
| BR-009 | `chantier` | Le conducteur ne voit que les chantiers qui lui sont attribués ou rendus accessibles par le patron.                                                                                                                                                        | Must     |
| BR-010 | `depense`  | Le conducteur peut créer une dépense uniquement sur un chantier auquel il a accès.                                                                                                                                                                         | Must     |
| BR-011 | `pointage` | Le mobile affiche toutes les tâches actives du chantier sélectionné et ne propose pas de saisie d'activité libre.                                                                                                                                          | Must     |
| BR-012 | `pointage` | Après le pointage, l'ouvrier associe un nombre d'heures à une ou plusieurs tâches du chantier.                                                                                                                                                             | Must     |
| BR-013 | `pointage` | La somme des heures affectées aux tâches doit respecter la durée pointée, selon la règle d'arrondi et de dépassement validée par le métier.                                                                                                                | Must     |
| BR-014 | `pointage` | Les durées sont stockées et affichées en heures et minutes, sans précision limitée au dixième d'heure.                                                                                                                                                     | Must     |
| BR-015 | `pointage` | Un pointage soumis ou validé reste traçable ; les corrections sont réalisées par une action autorisée côté API.                                                                                                                                            | Must     |
| BR-016 | `rapport`  | Le coût réel d'une tâche est calculé côté API à partir des heures validées qui lui sont affectées et du taux horaire applicable.                                                                                                                           | Must     |
| BR-017 | `rapport`  | Les montants budgétaires, les prix de vente et les coûts sont conservés avec une précision suffisante pour éviter les arrondis au dixième.                                                                                                                 | Must     |
| BR-018 | `zone`     | Le pourcentage de majoration est paramétrable par zone et versionné ou historisé lorsque cela est nécessaire pour préserver les anciens calculs.                                                                                                           | Should   |
| BR-019 | `paie`     | Le coût de main-d'oeuvre majoré est calculé selon `heures validées x taux horaire x coefficient de majoration`.                                                                                                                                            | Must     |
| BR-020 | `paie`     | La paie permet de connaître le temps validé par ouvrier et par zone sur une période.                                                                                                                                                                       | Must     |
| BR-021 | `paie`     | Les indemnités disponibles sont paramétrables avec leur libellé, leur montant ou règle et leurs conditions d'application.                                                                                                                                  | Should   |
| BR-022 | `paie`     | L'API permet d'associer X indemnités à un ouvrier donné pour une période ou un élément de paie.                                                                                                                                                            | Should   |
| BR-023 | `paie`     | Seules les heures validées entrent dans les calculs de coût réel et de paie.                                                                                                                                                                               | Must     |

## Use Cases

| ID     | Acteur           | Titre                                             | Description                                                                           | Préconditions                                  | Postconditions                                                 | Priorité |
| ------ | ---------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- | -------- |
| UC-001 | PATRON           | Créer un chantier avec ses paramètres économiques | Saisir budget, coefficient, prix de vente ou marge puis visualiser la valeur déduite. | Utilisateur autorisé                           | Chantier créé avec paramètres cohérents et calculés par l'API. | Must     |
| UC-002 | PATRON/COMPTABLE | Consulter le bilan économique                     | Lire prix de vente, charge fixe, budgets, coûts réels, marge visée et marge nette.    | Chantier avec données financières              | Bilan affiché avec les mêmes calculs que l'API.                | Must     |
| UC-003 | CONDUCTEUR       | Consulter ses chantiers                           | Afficher les chantiers accessibles au conducteur.                                     | Rôle et affectation configurés                 | Liste filtrée par société et affectation.                      | Must     |
| UC-004 | CONDUCTEUR       | Ajouter une dépense sur un chantier               | Enregistrer une dépense depuis un chantier autorisé.                                  | Chantier accessible                            | Dépense enregistrée et imputée au bon chantier.                | Must     |
| UC-005 | OUVRIER          | Voir les tâches d'un chantier sur mobile          | Charger les tâches actives du chantier sélectionné.                                   | Ouvrier affecté, chantier actif                | Toutes les tâches disponibles sont affichées.                  | Must     |
| UC-006 | OUVRIER          | Répartir ses heures par tâche                     | Après le pointage, choisir les tâches et saisir les heures passées.                   | Pointage existant, tâches disponibles          | Répartition soumise et exploitable par le Desktop.             | Must     |
| UC-007 | PATRON           | Contrôler les heures et le coût réel par tâche    | Consulter les heures validées et le coût calculé pour chaque tâche.                   | Pointages validés et taux horaires disponibles | Coût réel par tâche et par chantier affiché.                   | Must     |
| UC-008 | PATRON           | Paramétrer les majorations par zone               | Créer ou modifier le pourcentage de majoration d'une zone.                            | Utilisateur habilité                           | Paramètre disponible pour les futurs calculs.                  | Must     |
| UC-009 | PATRON/COMPTABLE | Consulter le coût de main-d'oeuvre majoré         | Voir le calcul détaillé des heures, taux et coefficient de zone.                      | Heures validées et zone connue                 | Coût MO majoré affiché dans le bilan.                          | Must     |
| UC-010 | COMPTABLE        | Consulter le temps par ouvrier et par zone        | Filtrer les heures validées par période, ouvrier et zone.                             | Données de pointage validées                   | Synthèse exploitable pour la paie.                             | Must     |
| UC-011 | PATRON/COMPTABLE | Paramétrer les indemnités                         | Définir les indemnités et leur montant ou règle.                                      | Utilisateur habilité                           | Catalogue d'indemnités disponible.                             | Should   |
| UC-012 | PATRON/COMPTABLE | Affecter des indemnités à un ouvrier              | Ajouter une ou plusieurs indemnités à un ouvrier dans l'API.                          | Ouvrier et indemnité existants                 | Élément d'indemnité rattaché et traçable.                      | Should   |

## EPIC 1 — Paramétrage économique du chantier

### US-001 — Créer un chantier avec budget, coefficient et marge

**Domaine :** `chantier`  
**Rôle :** PATRON  
**Priorité :** Must Have  
**Points :** L

En tant que patron, je veux saisir les paramètres économiques d'un chantier afin d'obtenir automatiquement la marge visée et un prix de vente cohérent.

**Critères d'acceptation :**

- [ ] CA1 : Le formulaire permet de saisir les valeurs prévues par la formule validée : budget, coefficient et prix de vente ou marge.
- [ ] CA2 : L'API calcule la valeur déduite et retourne le détail du calcul.
- [ ] CA3 : Les montants sont validés, positifs et suffisamment précis pour les besoins comptables.
- [ ] CA4 : Le chantier n'est enregistré que si les paramètres sont cohérents.
- [ ] CA5 : Le `companyId` est déterminé par le JWT.

**Dépendance :** décision métier sur BR-003.

### US-002 — Afficher le bilan économique complet

**Domaine :** `rapport`  
**Rôle :** PATRON, COMPTABLE  
**Priorité :** Must Have  
**Points :** L

En tant que patron ou comptable, je veux voir les indicateurs économiques d'un chantier afin d'évaluer sa rentabilité.

**Critères d'acceptation :**

- [ ] CA1 : Le bilan affiche prix de vente, charge fixe, marge visée, budget main-d'oeuvre et budget matériaux.
- [ ] CA2 : Le bilan affiche les coûts réels et la marge nette.
- [ ] CA3 : Chaque indicateur indique son unité et sa période ou son périmètre.
- [ ] CA4 : Les valeurs affichées proviennent d'un endpoint de calcul côté API.
- [ ] CA5 : Le patron et le comptable voient uniquement les chantiers de leur société.

**Dépendance :** décision métier sur BR-005 et BR-006.

### US-003 — Calculer le coût réel par tâche

**Domaine :** `rapport`, `pointage`  
**Rôle :** PATRON  
**Priorité :** Must Have  
**Points :** L

En tant que patron, je veux connaître le coût réel de chaque tâche afin de comparer le réalisé au budget.

**Critères d'acceptation :**

- [ ] CA1 : Les heures validées sont regroupées par tâche.
- [ ] CA2 : Le coût est calculé avec le taux horaire applicable.
- [ ] CA3 : Les dépenses déjà rattachées au chantier ou à la tâche restent distinguées de la main-d'oeuvre interne.
- [ ] CA4 : Une heure non validée n'est pas incluse dans le coût réel.
- [ ] CA5 : Le total des tâches est cohérent avec le total du chantier.

## EPIC 2 — Rôle conducteur de travaux

### US-004 — Consulter les chantiers du conducteur

**Domaine :** `auth`, `chantier`  
**Rôle :** CONDUCTEUR DE TRAVAUX  
**Priorité :** Must Have  
**Points :** M

En tant que conducteur de travaux, je veux voir les chantiers qui me sont attribués afin de suivre leur activité.

**Critères d'acceptation :**

- [ ] CA1 : Le rôle est reconnu par l'API et protégé par RBAC.
- [ ] CA2 : La liste ne contient que les chantiers de la société et les chantiers attribués ou autorisés.
- [ ] CA3 : Le conducteur ne peut pas administrer les paramètres réservés au patron.

**Dépendance :** clarification de l'existence et des droits du rôle.

### US-005 — Ajouter une dépense comme conducteur

**Domaine :** `depense`  
**Rôle :** CONDUCTEUR DE TRAVAUX  
**Priorité :** Must Have  
**Points :** M

En tant que conducteur de travaux, je veux ajouter une dépense sur un chantier accessible afin de faire remonter les coûts du terrain.

**Critères d'acceptation :**

- [ ] CA1 : Le chantier est sélectionné parmi les chantiers accessibles.
- [ ] CA2 : La dépense est contrôlée et rattachée à la société par l'API.
- [ ] CA3 : Le conducteur ne peut ni consulter ni modifier les dépenses d'une autre société.
- [ ] CA4 : Les règles de validation de dépense existantes restent applicables.

## EPIC 3 — Pointage mobile par tâche

### US-006 — Remplacer les activités par les tâches du chantier

**Domaine :** `pointage`, `chantier`  
**Rôle :** OUVRIER  
**Priorité :** Must Have  
**Points :** M

En tant qu'ouvrier, je veux retrouver toutes les tâches du chantier sur mobile afin de choisir précisément où j'ai travaillé.

**Critères d'acceptation :**

- [ ] CA1 : Les activités libres ne sont plus proposées dans le parcours cible.
- [ ] CA2 : Les tâches actives du chantier sont chargées depuis l'API.
- [ ] CA3 : Une tâche d'un autre chantier ne peut pas être sélectionnée.
- [ ] CA4 : Une tâche archivée ou inactive n'est pas proposée pour un nouveau pointage.

### US-007 — Affecter les heures pointées aux tâches

**Domaine :** `pointage`  
**Rôle :** OUVRIER  
**Priorité :** Must Have  
**Points :** L

En tant qu'ouvrier, je veux indiquer le nombre d'heures passées sur chaque tâche afin que le coût réel soit calculé par tâche.

**Critères d'acceptation :**

- [ ] CA1 : Après le pointage, l'ouvrier peut sélectionner une ou plusieurs tâches.
- [ ] CA2 : La saisie utilise une valeur en heures/minutes et non une valeur décimale au dixième.
- [ ] CA3 : Le système contrôle la somme des durées et signale tout dépassement ou reliquat.
- [ ] CA4 : La répartition est soumise avec le pointage et visible côté Desktop.
- [ ] CA5 : L'API refuse une tâche inconnue, inactive ou étrangère à la société.

### US-008 — Uniformiser la précision des temps et montants

**Domaine :** `pointage`, `rapport`  
**Rôle :** PATRON, COMPTABLE, OUVRIER  
**Priorité :** Must Have  
**Points :** XL

En tant qu'utilisateur, je veux une précision homogène en heures/minutes et en montants afin d'éviter les écarts de calcul.

**Critères d'acceptation :**

- [ ] CA1 : Les durées sont stockées dans une unité non ambiguë et affichées en heures et minutes.
- [ ] CA2 : Les prix, budgets et coûts ne sont pas tronqués au dixième.
- [ ] CA3 : Les mêmes règles d'arrondi sont utilisées par l'API, le Desktop et le Mobile.
- [ ] CA4 : Les totaux restent cohérents après plusieurs ventilations et recalculs.
- [ ] CA5 : Des tests couvrent les minutes, les valeurs décimales monétaires et les cas limites.

## EPIC 4 — Majorations par zone et coût de main-d'oeuvre

### US-009 — Paramétrer le coefficient de majoration d'une zone

**Domaine :** `zone`, `paie`  
**Rôle :** PATRON  
**Priorité :** Must Have  
**Points :** M

En tant que patron, je veux renseigner le pourcentage de majoration de chaque zone afin que les coûts de main-d'oeuvre reflètent les conditions applicables.

**Critères d'acceptation :**

- [ ] CA1 : Une zone peut recevoir un pourcentage de majoration valide.
- [ ] CA2 : La valeur est contrôlée et ne peut pas être négative ou incohérente.
- [ ] CA3 : Une modification n'altère pas silencieusement les périodes déjà calculées.
- [ ] CA4 : La configuration est isolée par société si elle est spécifique à l'entreprise.

### US-010 — Calculer le coût de main-d'oeuvre majoré

**Domaine :** `rapport`, `paie`  
**Rôle :** PATRON, COMPTABLE  
**Priorité :** Must Have  
**Points :** L

En tant que patron ou comptable, je veux voir le coût de main-d'oeuvre majoré afin d'obtenir un bilan réaliste.

**Critères d'acceptation :**

- [ ] CA1 : Le calcul applique `heures validées x taux horaire x coefficient de majoration`.
- [ ] CA2 : Le coefficient appliqué est visible dans le détail du calcul.
- [ ] CA3 : Les heures non validées sont exclues.
- [ ] CA4 : Le coût est ventilable par chantier, tâche et zone lorsque les données existent.
- [ ] CA5 : Le résultat est produit par l'API et utilisé par le bilan.

## EPIC 5 — Préparation de paie par ouvrier

### US-011 — Consulter le temps par ouvrier et par zone

**Domaine :** `paie`  
**Rôle :** COMPTABLE, PATRON  
**Priorité :** Must Have  
**Points :** L

En tant que comptable, je veux connaître le temps validé de chaque ouvrier par zone afin de calculer son coût réel.

**Critères d'acceptation :**

- [ ] CA1 : La synthèse est filtrable par période, ouvrier, chantier et zone.
- [ ] CA2 : Seules les heures validées sont totalisées.
- [ ] CA3 : Les heures sont affichées en heures et minutes.
- [ ] CA4 : Le taux et la majoration utilisés sont identifiables.
- [ ] CA5 : Les données restent limitées à la société courante.

### US-012 — Paramétrer et affecter les indemnités

**Domaine :** `paie`  
**Rôle :** PATRON, COMPTABLE  
**Priorité :** Should Have  
**Points :** L

En tant que comptable, je veux paramétrer des indemnités et en affecter plusieurs à un ouvrier afin de préparer correctement sa paie.

**Critères d'acceptation :**

- [ ] CA1 : Une indemnité possède un libellé et un montant ou une règle de calcul.
- [ ] CA2 : Les indemnités disponibles peuvent être gérées dans un espace paramétrable.
- [ ] CA3 : L'API permet d'ajouter X indemnités à un ouvrier pour la période concernée.
- [ ] CA4 : Une indemnité affectée est traçable, modifiable selon les droits et incluse une seule fois dans le calcul.
- [ ] CA5 : Les règles d'assiette, de période et de cumul sont documentées ou marquées `[CLARIFICATION NEEDED]` avant développement.

## Roadmap suggérée

### Sprint 1 — Socle des calculs et précision (MVP)

- [ ] US-001 — Créer un chantier avec budget, coefficient et marge
- [ ] US-008 — Uniformiser la précision des temps et montants
- [ ] Décider les formules BR-003, BR-005 et BR-006
- [ ] Mettre à jour les contrats API et les tests de calcul

### Sprint 2 — Pointage mobile par tâche (MVP)

- [ ] US-006 — Remplacer les activités par les tâches du chantier
- [ ] US-007 — Affecter les heures pointées aux tâches
- [ ] US-003 — Calculer le coût réel par tâche
- [ ] US-002 — Afficher le bilan économique complet

### Sprint 3 — Conducteur et majorations

- [ ] US-004 — Consulter les chantiers du conducteur
- [ ] US-005 — Ajouter une dépense comme conducteur
- [ ] US-009 — Paramétrer le coefficient de majoration d'une zone
- [ ] US-010 — Calculer le coût de main-d'oeuvre majoré

### Sprint 4 — Paie et indemnités

- [ ] US-011 — Consulter le temps par ouvrier et par zone
- [ ] US-012 — Paramétrer et affecter les indemnités

## Clarifications nécessaires avant développement

1. **Formule commerciale :** quelles sont exactement les entrées obligatoires à la création du chantier : budget + coefficient + prix de vente, ou budget + coefficient + marge ?
2. **Sens du coefficient :** le coefficient s'applique-t-il au budget pour produire le prix de vente, à la marge, ou aux charges fixes ?
3. **Marge nette :** confirmer la formule finale entre `prix de vente - coût réel` et `prix de vente x coefficient - coût réel`.
4. **Charge fixe :** préciser sa formule, son taux, son niveau de configuration et son inclusion dans le coût réel.
5. **Conducteur :** confirmer le nom du rôle, ses droits exacts et son mode d'affectation aux chantiers.
6. **Heures par tâche :** confirmer si la somme doit être exactement égale au pointage ou si un reliquat est autorisé.
7. **Zone :** préciser si un chantier possède une zone unique, si une tâche peut changer de zone et quelle zone prévaut pour la paie.
8. **Indemnités :** préciser le montant, l'unité, la période, les conditions d'attribution et les règles de cumul.

## Récapitulatif

| Métrique      |                          Valeur |
| ------------- | ------------------------------: |
| Total US      |                              12 |
| Total UC      |                              12 |
| Total BR      |                              23 |
| Must Have     |                           11 US |
| Should Have   |                            2 US |
| Could Have    |                            0 US |
| Won't Have v1 | 0 élément explicitement demandé |
