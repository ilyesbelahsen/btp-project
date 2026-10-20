# BACKLOG FONCTIONNEL PRIORISÉ — BTP PROJECT

**Généré le :** 23 septembre 2026  
**Basé sur :** `analyse-fonctionnelle-btp.md`, les backlogs Desktop/Mobile existants et l'état fonctionnel observé dans le code.  
**Périmètre :** API NestJS, Desktop Patron/Comptable, Mobile Ouvrier.

## 1. Résumé du besoin

L'application doit permettre à une entreprise du bâtiment de suivre ses chantiers, ses équipes, ses dépenses et ses heures depuis un Desktop Patron/Comptable et une application Mobile Ouvrier. Le MVP actuel couvre la connexion, le pointage start/stop, l'historique, la validation des heures, la création de chantiers et une première lecture budgétaire. La priorité métier est maintenant de rendre les indicateurs fiables : importer le devis de référence, rattacher les heures internes aux tâches et utiliser la même définition du coût réel dans tous les tableaux. Le backlog étend ensuite le produit vers les justificatifs, les documents, l'hors-ligne, l'avancement physique, la sous-traitance, la facturation et la prévention.

## 2. Acteurs

| Acteur                    | Responsabilités                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ADMIN**                 | Administration globale de la plateforme; hors MVP métier courant.                                                                                                    |
| **PATRON**                | Crée et clôture les chantiers, définit les budgets, affecte les ouvriers, suit les coûts, valide les pointages et pilote la rentabilité.                             |
| **COMPTABLE**             | Consulte les heures validées, prépare et exporte la paie, contrôle les dépenses et exploite les données financières selon les droits définis.                        |
| **CONDUCTEUR DE TRAVAUX** | Suit l'avancement, les tâches, les aléas, les documents et les remontées terrain. **[CLARIFICATION NEEDED]** Ce rôle n'existe pas encore dans les rôles applicatifs. |
| **OUVRIER**               | Sélectionne un chantier, pointe, déclare les activités, transmet des commentaires, des photos et des alertes terrain.                                                |
| **SYSTÈME/API**           | Applique les règles métier, le multi-tenant, les calculs financiers, la validation des données et la synchronisation.                                                |

## 3. Légende de priorisation

- **Must Have / P0 :** bloque la fiabilité, la sécurité ou le parcours MVP; aucune mise en production métier sans cela.
- **Should Have / P1 :** forte valeur métier, à livrer après le socle P0.
- **Could Have / P2 :** amélioration utile mais non bloquante.
- **Won't Have v1 :** explicitement hors première version du périmètre.

Statuts de réalisation :

- **À faire :** absent ou non utilisable de bout en bout.
- **Partiel :** une partie existe dans l'API ou l'interface, mais le besoin métier n'est pas couvert.
- **Livré à confirmer :** présent dans le code, à vérifier par recette métier.

## 4. Business Rules

### Authentification, sécurité et multi-tenant

| ID     | Domaine | Règle                                                                                                      | Priorité | Source                       |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| BR-001 | auth    | Toute ressource métier nécessite un JWT valide, sauf les routes publiques explicitement définies.          | Must     | A.4, backlog Mobile          |
| BR-002 | auth    | Le `companyId` est pris du JWT; il n'est jamais fourni ou accepté comme source d'autorité par le frontend. | Must     | Architecture projet          |
| BR-003 | auth    | Toute lecture et écriture est limitée à la société courante.                                               | Must     | A.4, architecture projet     |
| BR-004 | auth    | Les droits sont appliqués par rôle : PATRON, COMPTABLE, OUVRIER et ADMIN.                                  | Must     | A.4, B.2.7                   |
| BR-005 | auth    | Une action refusée retourne une réponse explicite et ne révèle pas de données d'une autre société.         | Must     | Architecture projet          |
| BR-006 | auth    | Les tokens sont renouvelables et révocables; la session expire selon une durée configurée.                 | Should   | Backlog Mobile, état général |

### Chantier, devis et tâches

| ID     | Domaine  | Règle                                                                                                                                            | Priorité | Source                 |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------- |
| BR-007 | chantier | Un chantier possède un nom, une adresse, un client, une catégorie de zone et une période prévisionnelle selon les règles validées par le métier. | Must     | B.2.2                  |
| BR-008 | chantier | Le budget total est égal au budget main-d'œuvre plus le budget matériaux.                                                                        | Must     | US-C004, code existant |
| BR-009 | chantier | Le prix de vente HT est égal au budget total plus la marge.                                                                                      | Must     | US-C002, code existant |
| BR-010 | chantier | Toute importation de devis est contrôlée, prévisualisée et validée avant création ou mise à jour des données.                                    | Must     | A.1, C.1               |
| BR-011 | chantier | Le format Excel accepté, les feuilles, les colonnes, les unités et la règle de marge sont documentés.                                            | Must     | CL-C-001, CL-C-003     |
| BR-012 | chantier | Une tâche comporte au minimum un libellé et, si le budget est suivi, des budgets MO et matériaux.                                                | Must     | Code existant, US-C005 |
| BR-013 | chantier | Une tâche ne peut être supprimée si elle est utilisée par des pointages ou dépenses selon la règle d'historisation validée.                      | Should   | Backlogs existants     |
| BR-014 | chantier | L'avancement d'une tâche et du chantier est exprimé par une méthode validée : pourcentage physique, tâches terminées ou autre indicateur.        | Should   | CL-001, C.3            |

### Dépenses et coûts

| ID     | Domaine | Règle                                                                                                                                   | Priorité | Source              |
| ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------- |
| BR-015 | depense | Une dépense est rattachée à la société, au chantier et à une tâche lorsque le suivi par tâche est activé.                               | Must     | A.5, code existant  |
| BR-016 | depense | Chaque dépense possède une catégorie dont l'impact budgétaire est défini : matériaux, main-d'œuvre, sous-traitance, transport ou autre. | Must     | B.1 CL-C-004, B.2.3 |
| BR-017 | depense | Le budget MO inclut la main-d'œuvre interne valorisée et la sous-traitance.                                                             | Must     | A.2, US-C004        |
| BR-018 | depense | Une dépense peut porter un fournisseur, un justificatif et un état de contrôle.                                                         | Should   | C.5                 |
| BR-019 | depense | Une dépense rejetée ou corrigée conserve son historique et son motif.                                                                   | Should   | C.5                 |

### Pointage, activités et paie

| ID     | Domaine  | Règle                                                                                                       | Priorité | Source                |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------- | -------- | --------------------- |
| BR-020 | pointage | Un ouvrier ne peut pointer que sur un chantier actif auquel il est affecté.                                 | Must     | B.2.6, backlog Mobile |
| BR-021 | pointage | Un ouvrier ne peut avoir qu'un seul pointage ouvert à la fois selon la règle métier validée.                | Must     | Backlog Mobile        |
| BR-022 | pointage | Les horaires et la durée sont calculés côté API à partir des horodatages serveur.                           | Must     | Code existant         |
| BR-023 | pointage | Le cycle métier est `EN_COURS -> SOUMIS -> VALIDE` ou `REJETE`; un rejet possède un motif.                  | Must     | A.7                   |
| BR-024 | pointage | Un pointage validé est verrouillé; toute réouverture est explicite, autorisée et tracée.                    | Must     | Backlog Desktop       |
| BR-025 | pointage | Chaque activité déclarée est rattachée à une tâche de chantier structurée.                                  | Must     | A.2, C.2              |
| BR-026 | pointage | La somme des heures ventilées par tâche ne dépasse pas les heures du pointage, sauf règle métier explicite. | Must     | C.2                   |
| BR-027 | pointage | Un commentaire terrain est limité, visible par les rôles autorisés et rattaché au pointage.                 | Should   | Code existant, A.6    |
| BR-028 | paie     | Seuls les pointages validés entrent dans une prépaie ou un export.                                          | Must     | Backlog Desktop       |
| BR-029 | paie     | Les corrections de paie avant export sont tracées et validées par un utilisateur autorisé.                  | Should   | B.2.5                 |

### Rapports, documents et terrain

| ID     | Domaine  | Règle                                                                                                                                            | Priorité | Source              |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------- |
| BR-030 | rapport  | Le coût réel chantier comprend les dépenses imputables et les heures validées valorisées.                                                        | Must     | A.3                 |
| BR-031 | rapport  | Le dashboard global et le détail chantier utilisent exactement la même définition de CA, coûts et marge.                                         | Must     | A.3                 |
| BR-032 | rapport  | Le suivi par tâche inclut les dépenses et la main-d'œuvre interne ventilée.                                                                      | Must     | A.2                 |
| BR-033 | document | Les fichiers binaires sont stockés dans un stockage objet; les métadonnées sont rattachées au chantier, à la tâche, au pointage ou à la dépense. | Should   | C.4                 |
| BR-034 | document | Un document est accessible uniquement aux utilisateurs autorisés de la société.                                                                  | Must     | Architecture projet |
| BR-035 | mobile   | Une action terrain effectuée sans réseau est conservée localement, synchronisée une seule fois et rend son état visible.                         | Should   | C.7                 |

## 5. Use Cases

| ID     | Acteur            | Titre                                         | Préconditions                           | Résultat attendu                                                   | Priorité |
| ------ | ----------------- | --------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ | -------- |
| UC-001 | ADMIN/PATRON      | Se connecter et renouveler sa session         | Compte actif                            | Session sécurisée et société déterminée par le JWT                 | Must     |
| UC-002 | ADMIN             | Administrer les permissions                   | Utilisateurs et rôles existants         | Permissions par rôle applicables et testables                      | Must     |
| UC-003 | PATRON            | Créer et paramétrer un chantier               | Utilisateur autorisé                    | Chantier créé avec budget et règles cohérents                      | Must     |
| UC-004 | PATRON            | Importer un devis Excel                       | Chantier créé, modèle validé            | Tâches, budgets, marge et prix de vente contrôlés puis enregistrés | Must     |
| UC-005 | PATRON            | Gérer les tâches                              | Chantier actif                          | Tâches créées, modifiées ou archivées sans casser l'historique     | Must     |
| UC-006 | PATRON            | Affecter un ouvrier                           | Ouvrier de la même société              | Ouvrier autorisé à voir et pointer sur le chantier                 | Must     |
| UC-007 | PATRON            | Enregistrer et contrôler une dépense          | Tâche existante si requise              | Dépense catégorisée, imputée et éventuellement justifiée           | Must     |
| UC-008 | OUVRIER           | Pointer une journée                           | Ouvrier affecté, chantier actif         | Pointage serveur créé puis soumis                                  | Must     |
| UC-009 | OUVRIER           | Déclarer ses tâches et répartir ses heures    | Pointage en cours ou à soumettre        | Activités liées aux tâches du devis                                | Must     |
| UC-010 | PATRON            | Corriger, accepter ou rejeter un pointage     | Pointage soumis                         | Pointage validé ou rejeté avec motif                               | Must     |
| UC-011 | PATRON/COMPTABLE  | Préparer et exporter la paie                  | Pointages validés                       | Prévisualisation contrôlée et export compatible                    | Must     |
| UC-012 | PATRON            | Consulter la rentabilité globale et par tâche | Budgets et coûts disponibles            | Marge cohérente, écarts et alertes fiables                         | Must     |
| UC-013 | PATRON/CONDUCTEUR | Suivre l'avancement physique                  | Tâches et méthode d'avancement définies | Avancement, retards et jalons visibles                             | Should   |
| UC-014 | OUVRIER           | Transmettre une remontée terrain              | Pointage ou chantier accessible         | Commentaire, photo ou signalement transmis et consultable          | Should   |
| UC-015 | PATRON/COMPTABLE  | Contrôler les documents et justificatifs      | Document ou dépense existant            | Pièces classées, sécurisées et retrouvables                        | Should   |
| UC-016 | OUVRIER           | Pointer et synchroniser hors-ligne            | Réseau indisponible                     | Données conservées puis synchronisées sans doublon                 | Should   |
| UC-017 | PATRON            | Gérer les sous-traitants                      | Tiers identifié                         | Contrats, engagements et coûts reliés aux tâches                   | Could    |
| UC-018 | PATRON/COMPTABLE  | Gérer les factures et acomptes client         | Chantier et client définis              | Situations, acomptes et trésorerie suivis                          | Could    |
| UC-019 | PATRON            | Gérer absences, congés et indisponibilités    | Équipe créée                            | Paie et planning expliquent les absences                           | Could    |
| UC-020 | PATRON/CONDUCTEUR | Suivre prévention et sécurité                 | Ouvriers et chantiers actifs            | EPI, habilitations, incidents et accueils tracés                   | Could    |

## 6. Backlog priorisé

### EPIC 1 — Sécurité, rôles et périmètre multi-tenant

**Objectif :** rendre l'application exploitable par plusieurs profils sans risque d'accès ou d'action illégitime.

#### US-001 — Appliquer les permissions par rôle

**Constat lié :** A.4, B.2.7  
**En tant que** système, **je veux** contrôler chaque action selon le rôle de l'utilisateur **afin de** garantir la séparation Patron/Comptable/Ouvrier.

**Critères d'acceptation :**

- [ ] CA1 : Les opérations de création, modification, clôture et suppression de chantier sont réservées aux rôles autorisés.
- [ ] CA2 : La correction et la validation d'un pointage sont réservées aux rôles autorisés.
- [ ] CA3 : Le comptable peut accéder uniquement aux écrans et actions définis dans son périmètre.
- [ ] CA4 : Un ouvrier ne peut pas accéder aux données de gestion d'un autre ouvrier ou aux fonctions Desktop métier.
- [ ] CA5 : Une tentative interdite retourne `403` sans modifier de données.
- [ ] CA6 : Des tests couvrent chaque rôle sur les routes sensibles.

**Priorité :** Must Have / P0  
**Points :** L  
**Dépendances :** aucune.

#### US-002 — Garantir l'isolation multi-tenant

**En tant que** entreprise, **je veux** que toutes les données soient filtrées par la société du JWT **afin de** ne jamais exposer les données d'une autre entreprise.

**Critères d'acceptation :**

- [ ] CA1 : Aucun endpoint métier ne prend le `companyId` du body comme autorité.
- [ ] CA2 : Les tests vérifient les lectures, créations, modifications et suppressions inter-sociétés.
- [ ] CA3 : Un identifiant d'une autre société retourne `404` ou `403` selon la convention définie.
- [ ] CA4 : Les documents, tâches, dépenses et pointages suivent la même isolation.

**Priorité :** Must Have / P0  
**Points :** M  
**Dépendances :** aucune.

#### US-003 — Définir le périmètre du rôle Comptable et du Conducteur

**En tant que** responsable produit, **je veux** formaliser les permissions du Comptable et décider du rôle Conducteur **afin de** supprimer les ambiguïtés d'accès.

**Critères d'acceptation :**

- [ ] CA1 : Une matrice rôle/action est validée pour chaque domaine.
- [ ] CA2 : Le rôle Conducteur est créé ou explicitement exclu de la v1.
- [ ] CA3 : Les écrans et routes sont alignés sur cette matrice.
- [ ] CA4 : Les décisions sont ajoutées au backlog et aux critères de recette.

**Priorité :** Must Have / P0  
**Points :** S  
**Dépendances :** US-001.

**Décision v1 et matrice de recette :**

- Le rôle `CONDUCTEUR DE TRAVAUX` est explicitement exclu de la v1. Il n'est
  pas présent dans l'enum Prisma, les JWT, les types frontend ou les routes.
- Le rôle `COMPTABLE` dispose d'un accès en lecture aux chantiers, tâches,
  dépenses, pointages, indicateurs et paie.
- Le rôle `COMPTABLE` ne peut pas gérer les ouvriers, créer ou modifier un
  chantier, modifier ou supprimer une tâche, créer une dépense, corriger ou
  valider un pointage, ni importer un devis.
- Le rôle `PATRON` conserve les droits de gestion métier; `ADMIN` bénéficie de
  la couverture globale prévue par le contrôle RBAC; `OUVRIER` reste limité au
  parcours mobile de pointage.

| Domaine                  | ADMIN            | PATRON           | COMPTABLE           | CONDUCTEUR v1 | OUVRIER                     |
| ------------------------ | ---------------- | ---------------- | ------------------- | ------------- | --------------------------- |
| Dashboard et indicateurs | Lecture          | Lecture          | Lecture             | Exclu         | Exclu Desktop               |
| Chantiers                | Gestion          | Gestion          | Lecture             | Exclu         | Chantiers affectés Mobile   |
| Tâches et devis          | Gestion          | Gestion          | Lecture             | Exclu         | Exclu Desktop               |
| Ouvriers                 | Gestion          | Gestion          | Exclu               | Exclu         | Données personnelles Mobile |
| Dépenses                 | Gestion          | Gestion          | Lecture             | Exclu         | Exclu                       |
| Pointages                | Contrôle         | Contrôle         | Lecture             | Exclu         | Saisie personnelle          |
| Paie                     | Lecture/contrôle | Lecture/contrôle | Préparation/lecture | Exclu         | Exclu                       |

Cette matrice constitue la référence des tests de routes API et de la garde
de navigation Desktop. Les contrôles frontend restent ergonomiques; l'API
reste l'autorité de sécurité.

### EPIC 2 — Référentiel chantier et import du devis

**Objectif :** supprimer la ressaisie du devis et établir la référence budgétaire du chantier.

#### US-004 — Valider le format de devis Excel

**Constat lié :** A.1, CL-C-001, CL-C-003  
**En tant que** patron, **je veux** disposer d'un modèle Excel documenté **afin de** garantir que chaque devis importé est interprété correctement.

**Critères d'acceptation :**

- [ ] CA1 : Les feuilles obligatoires et facultatives sont définies.
- [ ] CA2 : Les colonnes libellé, budget MO, budget matériaux, prix vendu et synthèse sont définies.
- [ ] CA3 : Les unités, formats monétaires, séparateurs et arrondis sont définis.
- [ ] CA4 : La règle de provenance de la marge est tranchée : importée ou saisie/ajustée.
- [ ] CA5 : Au moins un fichier valide et plusieurs fichiers invalides servent de jeux de recette.

**Priorité :** Must Have / P0  
**Points :** M  
**Dépendances :** US-003.

#### US-005 — Importer et prévisualiser un devis Excel

**Constat lié :** A.1, A.5, C.1  
**En tant que** patron, **je veux** importer un devis Excel et contrôler son interprétation **afin de** créer les tâches et budgets sans ressaisie.

**Critères d'acceptation :**

- [ ] CA1 : Un fichier `.xlsx` peut être sélectionné depuis la fiche d'un chantier.
- [ ] CA2 : Le système détecte les colonnes manquantes, les montants invalides et les lignes ambiguës.
- [ ] CA3 : Un aperçu affiche les tâches, budgets MO, budgets matériaux, prix vendu, budget total et marge.
- [ ] CA4 : Le patron peut corriger les valeurs avant confirmation.
- [ ] CA5 : Aucune donnée persistante n'est créée avant la confirmation.
- [ ] CA6 : La confirmation crée ou met à jour les tâches dans la société courante uniquement.
- [ ] CA7 : Le résultat indique les lignes ignorées et la raison.

**Priorité :** Must Have / P0  
**Points :** XL  
**Dépendances :** US-004, US-001, US-002.

#### US-006 — Décider et gérer l'import OCR alternatif

**Constat lié :** CL-C-002  
**En tant que** patron, **je veux** savoir si un devis PDF/image peut être importé en complément de l'Excel **afin de** disposer d'un parcours adapté à mes documents réels.

**Critères d'acceptation :**

- [ ] CA1 : La décision « conserver, remplacer ou reporter l'OCR » est validée.
- [ ] CA2 : Si conservé, le résultat OCR suit le même aperçu et la même validation que l'Excel.
- [ ] CA3 : Les valeurs incertaines sont signalées et jamais enregistrées silencieusement.

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-005.

#### US-007 — Gérer les tâches et budgets avec historique

**En tant que** patron, **je veux** modifier ou archiver une tâche sans casser les données historiques **afin de** maintenir le devis opérationnel pendant le chantier.

**Critères d'acceptation :**

- [ ] CA1 : Une tâche peut être modifiée tant que le chantier et son état le permettent.
- [ ] CA2 : Une tâche utilisée par une dépense ou un pointage ne peut pas être supprimée physiquement sans confirmation métier.
- [ ] CA3 : Une tâche archivée reste lisible dans les historiques.
- [ ] CA4 : Les budgets MO et matériaux sont recalculés ou contrôlés selon la règle définie.

**Priorité :** Must Have / P0  
**Points :** M  
**Dépendances :** US-005.

### EPIC 3 — Dépenses, justificatifs et imputations

**Objectif :** enregistrer des coûts fiables et exploitables par chantier, tâche et nature.

#### US-008 — Stabiliser les catégories de dépenses

**Constat lié :** B.1 CL-C-004, B.2.3  
**En tant que** patron et comptable, **je veux** une nomenclature de dépenses non ambiguë **afin de** classer chaque coût dans le bon budget.

**Critères d'acceptation :**

- [ ] CA1 : La décision sur `TRANSPORT` et `AUTRE` est validée.
- [ ] CA2 : Chaque catégorie est liée à un budget ou explicitement exclue des indicateurs.
- [ ] CA3 : Les anciennes dépenses restent interprétables après évolution de la nomenclature.
- [ ] CA4 : Les libellés affichés sont compréhensibles par un utilisateur BTP.

**Priorité :** Must Have / P0  
**Points :** S  
**Dépendances :** US-003.

#### US-009 — Saisir une dépense correctement imputée

**En tant que** patron, **je veux** saisir une dépense avec sa catégorie, son chantier et sa tâche **afin de** connaître le coût réel au bon endroit.

**Critères d'acceptation :**

- [ ] CA1 : La tâche proposée appartient au chantier courant et à la société courante.
- [ ] CA2 : La catégorie, le montant, la date et la description sont contrôlés.
- [ ] CA3 : Le comportement sans tâche est explicite : blocage, catégorie transversale ou tâche « non affectée » validée par le métier.
- [ ] CA4 : La dépense met à jour les indicateurs concernés.
- [ ] CA5 : Une erreur de sauvegarde ne crée pas de doublon.

**Priorité :** Must Have / P0  
**Points :** M  
**Dépendances :** US-007, US-008.

#### US-010 — Ajouter un justificatif et un fournisseur

**Constat lié :** C.4, C.5  
**En tant que** patron, **je veux** rattacher un ticket ou une facture à une dépense **afin de** pouvoir la contrôler et la retrouver.

**Critères d'acceptation :**

- [ ] CA1 : Une dépense peut être associée à un fournisseur et à une pièce jointe.
- [ ] CA2 : Le fichier est stocké dans le stockage documentaire prévu et non en base relationnelle.
- [ ] CA3 : Les métadonnées indiquent le chantier, la tâche, la société et l'auteur.
- [ ] CA4 : Les rôles autorisés peuvent consulter ou télécharger la pièce.
- [ ] CA5 : Les formats et tailles acceptés sont contrôlés.

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-001, US-002, US-009, US-015.

#### US-011 — Contrôler et historiser une dépense

**En tant que** comptable, **je veux** contrôler, accepter ou rejeter une dépense **afin de** séparer une dépense saisie d'un coût définitivement retenu.

**Critères d'acceptation :**

- [ ] CA1 : Les états de dépense sont définis et affichés.
- [ ] CA2 : Un rejet impose un motif.
- [ ] CA3 : Toute correction conserve l'auteur et la date.
- [ ] CA4 : Les indicateurs distinguent les dépenses saisies et les dépenses retenues selon la règle validée.

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-003, US-010.

### EPIC 4 — Pointage et ventilation des activités

**Objectif :** transformer le pointage en donnée fiable de production et de coût par tâche.

#### US-012 — Sécuriser le pointage sur chantier affecté

**Constat lié :** B.2.6  
**En tant que** ouvrier, **je veux** ne voir et ne sélectionner que les chantiers où je suis affecté **afin de** éviter les erreurs de pointage.

**Critères d'acceptation :**

- [ ] CA1 : La liste mobile ne contient que les chantiers actifs affectés.
- [ ] CA2 : L'API refuse un démarrage sur un chantier non affecté, même si le chantier appartient à la société.
- [ ] CA3 : Le message d'erreur permet de comprendre l'action attendue sans révéler de données indues.
- [ ] CA4 : Les tests couvrent un ouvrier affecté, non affecté et d'une autre société.

**Priorité :** Must Have / P0  
**Points :** S  
**Dépendances :** US-001, US-002.

#### US-013 — Formaliser le cycle de soumission et rejet

**Constat lié :** A.7  
**En tant que** patron, **je veux** distinguer un pointage terminé, soumis, validé ou rejeté **afin de** sécuriser la paie.

**Critères d'acceptation :**

- [ ] CA1 : Les statuts cibles sont validés avec le métier et le schéma est cohérent.
- [ ] CA2 : L'ouvrier confirme l'envoi de son pointage.
- [ ] CA3 : Le patron peut accepter ou rejeter un pointage non validé.
- [ ] CA4 : Un rejet exige un motif visible par l'ouvrier.
- [ ] CA5 : L'ouvrier peut corriger et resoumettre un pointage rejeté.
- [ ] CA6 : Seul un pointage validé entre dans la paie.

**Priorité :** Must Have / P0  
**Points :** L  
**Dépendances :** US-001, US-012.

#### US-014 — Relier les activités aux tâches du devis

**Constat lié :** A.2, C.2  
**En tant que** ouvrier, **je veux** sélectionner les tâches réellement exécutées **afin de** permettre le calcul du coût par tâche.

**Critères d'acceptation :**

- [ ] CA1 : Le mobile propose les tâches actives du chantier sélectionné, et non une liste globale de libellés libres.
- [ ] CA2 : Chaque activité enregistrée référence une `TacheChantier` identifiable.
- [ ] CA3 : La règle de saisie est définie : durée par tâche, pourcentage de répartition ou saisie validée par le patron.
- [ ] CA4 : La somme des répartitions est contrôlée par rapport à la durée du pointage.
- [ ] CA5 : Le patron peut corriger la ventilation avant validation.
- [ ] CA6 : Les anciens pointages restent consultables après migration.

**Priorité :** Must Have / P0  
**Points :** XL  
**Dépendances :** US-005, US-013.

#### US-015 — Saisir un commentaire terrain depuis le mobile

**Constat lié :** A.6  
**En tant que** ouvrier, **je veux** ajouter un commentaire à ma journée **afin de** signaler un problème, un retard ou une information utile.

**Critères d'acceptation :**

- [ ] CA1 : Le champ est accessible pendant ou à la fin du pointage.
- [ ] CA2 : La longueur maximale et les caractères acceptés sont contrôlés.
- [ ] CA3 : Le commentaire est enregistré sur le pointage courant.
- [ ] CA4 : Le patron et les rôles autorisés le voient dans le Desktop.
- [ ] CA5 : Le commentaire est inclus dans le workflow de rejet/resoumission si nécessaire.

**Priorité :** Should Have / P1  
**Points :** S  
**Dépendances :** US-013.

### EPIC 5 — Indicateurs financiers cohérents

**Objectif :** fournir au patron des chiffres de marge fiables au niveau global, chantier et tâche.

#### US-016 — Aligner la marge globale et la marge chantier

**Constat lié :** A.3  
**En tant que** patron, **je veux** que le dashboard global utilise la même définition du coût réel que le détail chantier **afin de** prendre des décisions sur des chiffres cohérents.

**Critères d'acceptation :**

- [ ] CA1 : Les heures validées sont valorisées avec le taux horaire applicable.
- [ ] CA2 : Les dépenses incluses dans le coût sont définies et identiques entre les vues.
- [ ] CA3 : La marge globale est la somme ou le recalcul cohérent des chantiers actifs.
- [ ] CA4 : Un test compare dashboard global et agrégation des détails sur un jeu de données connu.
- [ ] CA5 : Les montants n'intègrent pas les pointages non validés.

**Priorité :** Must Have / P0  
**Points :** M  
**Dépendances :** US-013, US-008.

#### US-017 — Suivre le budget réel par nature et par tâche

**Constat lié :** A.2, C.2  
**En tant que** patron, **je veux** voir le budget, le réel, l'écart et le statut MO/matériaux par tâche **afin de** détecter la dérive exacte.

**Critères d'acceptation :**

- [ ] CA1 : Le réel MO par tâche inclut les heures internes ventilées et la sous-traitance.
- [ ] CA2 : Le réel matériaux inclut les dépenses imputées selon la nomenclature validée.
- [ ] CA3 : Chaque nature affiche budget, réel, écart et statut dans le budget/en dépassement.
- [ ] CA4 : Le tri par dépassement est stable et compréhensible.
- [ ] CA5 : Une tâche sans budget est signalée comme « budget non défini », pas automatiquement comme « dans le budget ».
- [ ] CA6 : Les chiffres sont calculés côté API.

**Priorité :** Must Have / P0  
**Points :** L  
**Dépendances :** US-008, US-014.

#### US-018 — Afficher les alertes de données incomplètes

**En tant que** patron, **je veux** être alerté lorsqu'une donnée empêche un indicateur fiable **afin de** corriger la source plutôt que d'interpréter un chiffre trompeur.

**Critères d'acceptation :**

- [ ] CA1 : Les chantiers sans budget ou marge sont signalés.
- [ ] CA2 : Les ouvriers sans taux horaire sont signalés avant la paie.
- [ ] CA3 : Les tâches sans budget sont signalées dans le suivi.
- [ ] CA4 : Chaque alerte indique l'action corrective attendue.
- [ ] CA5 : Une donnée manquante n'est pas silencieusement remplacée par zéro lorsque cela fausse la décision.

**Priorité :** Should Have / P1  
**Points :** M  
**Dépendances :** US-016, US-017.

### EPIC 6 — Paie et export contrôlables

**Objectif :** produire un export exploitable par le comptable, avec corrections traçables.

#### US-019 — Valider et tracer les corrections de paie

**Constat lié :** B.2.5  
**En tant que** comptable, **je veux** corriger les valeurs de paie et valider ces corrections **afin de** conserver une trace fiable avant export.

**Critères d'acceptation :**

- [ ] CA1 : Les valeurs calculées et les valeurs corrigées sont distinguées.
- [ ] CA2 : L'auteur, la date et le motif d'une correction sont conservés.
- [ ] CA3 : Seuls les rôles autorisés peuvent valider une correction.
- [ ] CA4 : L'export utilise la version validée et affiche son état.
- [ ] CA5 : Une correction ne modifie pas rétroactivement les pointages sources.

**Priorité :** Should Have / P1  
**Points :** M  
**Dépendances :** US-001, US-003.

#### US-020 — Valider le format d'export comptable cible

**Constat lié :** CL-003  
**En tant que** comptable, **je veux** un format validé avec le logiciel cible **afin de** charger le fichier sans retraitement manuel.

**Critères d'acceptation :**

- [ ] CA1 : Le logiciel comptable cible est identifié.
- [ ] CA2 : Séparateur, encodage, en-têtes, formats de dates et montants sont documentés.
- [ ] CA3 : Un fichier d'essai est accepté par le logiciel cible ou validé par le cabinet.
- [ ] CA4 : Les exports CSV et Excel utilisent les mêmes données validées.

**Priorité :** Must Have / P0  
**Points :** M  
**Dépendances :** US-019.

### EPIC 7 — Avancement et pilotage opérationnel

**Objectif :** compléter la lecture financière par une lecture de production et de délai.

#### US-021 — Suivre l'avancement physique par tâche

**Constat lié :** CL-001, C.3  
**En tant que** conducteur de travaux, **je veux** renseigner l'avancement physique de chaque tâche **afin de** comparer la production réalisée au budget consommé.

**Critères d'acceptation :**

- [ ] CA1 : La méthode d'avancement est choisie et documentée.
- [ ] CA2 : Chaque tâche possède un avancement dans une plage contrôlée.
- [ ] CA3 : L'avancement est historisé avec auteur et date.
- [ ] CA4 : Le chantier affiche l'avancement consolidé selon une règle connue.
- [ ] CA5 : Le tableau signale les situations « coût consommé supérieur à avancement ».

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-007, US-017.

#### US-022 — Gérer les jalons, retards et dates révisées

**En tant que** conducteur de travaux, **je veux** suivre les jalons et les retards **afin de** prévenir les dérives de planning.

**Critères d'acceptation :**

- [ ] CA1 : Une tâche ou un chantier peut avoir une date cible et un état de jalon.
- [ ] CA2 : Un retard est identifié selon une règle métier explicite.
- [ ] CA3 : Une date révisée conserve la date initiale et son motif.
- [ ] CA4 : Les retards importants sont visibles dans le dashboard.

**Priorité :** Should Have / P1  
**Points :** M  
**Dépendances :** US-021.

### EPIC 8 — Documents, photos et remontées terrain

**Objectif :** transformer le mobile en outil de remontée opérationnelle et de preuve chantier.

#### US-023 — Envoyer des photos et signalements depuis le mobile

**Constat lié :** A.6, C.4  
**En tant que** ouvrier, **je veux** envoyer une photo avec un commentaire depuis un pointage **afin de** documenter le travail ou un problème.

**Critères d'acceptation :**

- [ ] CA1 : La photo peut venir de la caméra ou de la galerie selon les permissions accordées.
- [ ] CA2 : La photo est rattachée au chantier, au pointage et éventuellement à la tâche.
- [ ] CA3 : Le commentaire et la date d'envoi sont conservés.
- [ ] CA4 : L'ouvrier voit l'état envoyé/en attente/échec.
- [ ] CA5 : Le patron peut consulter la photo depuis le Desktop.
- [ ] CA6 : Le nombre, la taille et la conservation sont conformes aux règles validées.

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-001, US-002, US-015.

#### US-024 — Centraliser les documents du chantier

**En tant que** patron, **je veux** classer les plans, devis, avenants, DICT, attestations et comptes rendus **afin de** retrouver les pièces utiles au bon moment.

**Critères d'acceptation :**

- [ ] CA1 : Un document est rattaché à un chantier et peut être rattaché à une tâche.
- [ ] CA2 : Les types de documents et les droits de consultation sont définis.
- [ ] CA3 : Les versions et dates de dépôt sont visibles.
- [ ] CA4 : Un document supprimé ou remplacé laisse une trace conforme à la politique d'audit.
- [ ] CA5 : Les accès respectent la société et le rôle.

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-001, US-002.

#### US-025 — Ajouter une gestion hors-ligne mobile

**Constat lié :** C.7  
**En tant que** ouvrier, **je veux** continuer à pointer sans réseau **afin de** ne pas perdre ma journée de travail sur un chantier isolé.

**Critères d'acceptation :**

- [ ] CA1 : Le mobile indique clairement le mode hors-ligne.
- [ ] CA2 : Les actions autorisées hors-ligne sont définies.
- [ ] CA3 : Les données sont chiffrées ou protégées dans le stockage local.
- [ ] CA4 : La synchronisation reprend automatiquement ou sur action explicite.
- [ ] CA5 : Les doublons et conflits sont détectés et traités.
- [ ] CA6 : L'état de synchronisation est visible par l'ouvrier et le patron lorsque pertinent.

**Priorité :** Should Have / P1  
**Points :** XL  
**Dépendances :** US-013, US-023.

### EPIC 9 — Alertes, absences et capacité

#### US-026 — Notifier les événements nécessitant une action

**En tant que** patron, **je veux** recevoir des alertes sur les pointages à valider, dépassements et anomalies **afin de** réagir avant que le problème ne coûte davantage.

**Critères d'acceptation :**

- [ ] CA1 : Les événements déclencheurs sont listés et priorisés.
- [ ] CA2 : Une alerte indique le chantier, la tâche, la nature du problème et l'action attendue.
- [ ] CA3 : Une alerte peut être marquée comme traitée.
- [ ] CA4 : Les alertes respectent les rôles et la société.
- [ ] CA5 : Les seuils de dépassement sont configurables ou documentés.

**Priorité :** Should Have / P1  
**Points :** L  
**Dépendances :** US-017, US-021.

#### US-027 — Gérer les absences et congés

**En tant que** patron ou comptable, **je veux** enregistrer les congés, arrêts et absences **afin de** distinguer une absence justifiée d'un pointage oublié.

**Critères d'acceptation :**

- [ ] CA1 : Les types d'absence et leurs justificatifs sont définis.
- [ ] CA2 : Une absence est rattachée à un ouvrier et à une période.
- [ ] CA3 : Les absences sont visibles dans la préparation de paie.
- [ ] CA4 : Une absence ne crée pas de faux pointage et peut expliquer une alerte.

**Priorité :** Could Have / P2  
**Points :** L  
**Dépendances :** US-019.

### EPIC 10 — Sous-traitance, facturation et prévention

#### US-028 — Gérer les sous-traitants comme des tiers

**Constat lié :** C.6  
**En tant que** patron, **je veux** gérer les sous-traitants, contrats et engagements **afin de** piloter précisément la sous-traitance par tâche.

**Critères d'acceptation :**

- [ ] CA1 : Un sous-traitant possède une fiche et des pièces administratives selon le périmètre validé.
- [ ] CA2 : Un contrat ou bon de commande peut être associé à un chantier et à des tâches.
- [ ] CA3 : Les montants engagés, facturés et payés sont distingués.
- [ ] CA4 : Les coûts alimentent le budget MO selon la règle BR-017.

**Priorité :** Could Have / P2  
**Points :** XL  
**Dépendances :** US-010, US-017, US-024.

#### US-029 — Suivre les acomptes et situations client

**En tant que** patron ou comptable, **je veux** suivre les situations, acomptes et factures client **afin de** relier la rentabilité à la trésorerie réellement encaissée.

**Critères d'acceptation :**

- [ ] CA1 : Le client et les conditions de facturation sont définis.
- [ ] CA2 : Une situation peut être rattachée à l'avancement validé.
- [ ] CA3 : Les acomptes émis, reçus et restant dus sont visibles.
- [ ] CA4 : La marge théorique est distinguée de la trésorerie encaissée.

**Priorité :** Could Have / P2  
**Points :** XL  
**Dépendances :** US-021, US-024.

#### US-030 — Suivre la sécurité et les EPI

**En tant que** conducteur de travaux, **je veux** tracer les EPI, habilitations, accueils sécurité et incidents **afin de** réduire les risques sur les chantiers.

**Critères d'acceptation :**

- [ ] CA1 : Les habilitations et dates d'expiration sont associées aux ouvriers.
- [ ] CA2 : Les accueils sécurité et EPI remis sont traçables.
- [ ] CA3 : Un incident peut être déclaré, documenté et suivi jusqu'à clôture.
- [ ] CA4 : Les droits d'accès aux données sensibles sont contrôlés.

**Priorité :** Could Have / P2  
**Points :** L  
**Dépendances :** US-001, US-024.

## 7. Matrice de traçabilité

| Constat du rapport                                         | User stories principales               |
| ---------------------------------------------------------- | -------------------------------------- |
| A.1 Import Excel absent                                    | US-004, US-005, US-006                 |
| A.2 MO interne non ventilée par tâche                      | US-014, US-017                         |
| A.3 Marge globale incomplète                               | US-016                                 |
| A.4 Rôles non contrôlés                                    | US-001, US-002, US-003                 |
| A.5 Dépense dépendante d'une tâche                         | US-007, US-009                         |
| A.6 Documents, photos et commentaires terrain incomplets   | US-015, US-023, US-024                 |
| A.7 Workflow pointage incomplet                            | US-013                                 |
| B.1 Clarifications Excel, OCR, marge, catégories et export | US-003, US-004, US-006, US-008, US-020 |
| B.2 Cohérence budget/prix, avancement et audit             | US-016, US-018, US-019, US-021         |
| C.1 à C.2 Import et ventilation du temps                   | US-005, US-014                         |
| C.3 Avancement physique                                    | US-021, US-022                         |
| C.4 à C.5 Documents et justificatifs                       | US-010, US-011, US-023, US-024         |
| C.6 Sous-traitants                                         | US-028                                 |
| C.7 Hors-ligne                                             | US-025                                 |
| C.8 Alertes                                                | US-026                                 |
| C.9 Absences                                               | US-027                                 |
| C.10 Sécurité/EPI                                          | US-030                                 |

## 8. Roadmap suggérée

### Sprint 0 — Décisions métier et recette de sécurité

**Objectif :** lever les ambiguïtés qui pourraient invalider l'implémentation.

- [ ] US-003 — Matrice des rôles et décision sur le rôle Conducteur
- [ ] US-004 — Format Excel et règle de marge
- [ ] US-006 — Décision OCR
- [ ] US-008 — Nomenclature des dépenses
- [ ] US-020 — Logiciel comptable cible
- [ ] Définir la méthode d'avancement physique
- [ ] Définir le workflow pointage cible et les règles de rétrocompatibilité

### Sprint 1 — Sécurité et cohérence financière critique

**Objectif :** empêcher les accès indus et corriger les chiffres de pilotage.

- [ ] US-001 — Permissions par rôle
- [ ] US-002 — Isolation multi-tenant
- [ ] US-012 — Pointage uniquement sur chantier affecté
- [ ] US-016 — Marge globale cohérente
- [ ] US-018 — Alertes de données incomplètes

### Sprint 2 — Devis et tâches

**Objectif :** créer la référence budgétaire sans ressaisie.

- [ ] US-005 — Import et prévisualisation Excel
- [ ] US-007 — Tâches et budgets avec historique
- [ ] Rejouer la recette de création de chantier, import et calcul prix de vente

### Sprint 3 — Dépenses et justificatifs

**Objectif :** rendre les coûts traçables et correctement imputés.

- [ ] US-009 — Saisie dépense chantier/tâche
- [ ] US-010 — Justificatif et fournisseur
- [ ] US-011 — Contrôle et historique des dépenses

### Sprint 4 — Pointage par tâche et suivi budgétaire

**Objectif :** rendre le rouge/vert par tâche économiquement fiable.

- [ ] US-013 — Cycle soumis/validé/rejeté
- [ ] US-014 — Ventilation des heures par tâche
- [ ] US-015 — Commentaire terrain accessible
- [ ] US-017 — Suivi budget/réel par tâche

### Sprint 5 — Paie et avancement

**Objectif :** fiabiliser la paie et compléter le pilotage opérationnel.

- [ ] US-019 — Corrections de paie tracées
- [ ] US-021 — Avancement physique par tâche
- [ ] US-022 — Jalons et retards
- [ ] US-026 — Alertes nécessitant une action

### Sprint 6 — Documents et continuité terrain

**Objectif :** couvrir les preuves chantier et le réseau instable.

- [ ] US-023 — Photos et signalements mobiles
- [ ] US-024 — Documents chantier
- [ ] US-025 — Mode hors-ligne et synchronisation

### Sprint 7+ — Extensions métier

- [ ] US-027 — Absences et congés
- [ ] US-028 — Sous-traitants et contrats
- [ ] US-029 — Factures, acomptes et trésorerie
- [ ] US-030 — Sécurité, EPI et incidents

## 9. Récapitulatif

| Métrique             |                                              Valeur |
| -------------------- | --------------------------------------------------: |
| Total Business Rules |                                                  35 |
| Total Use Cases      |                                                  20 |
| Total User Stories   |                                                  30 |
| Must Have / P0       |                                                  14 |
| Should Have / P1     |                                                  12 |
| Could Have / P2      |                                                   4 |
| Won't Have v1        | 0 explicite; à décider après validation de capacité |
| Sprints proposés     |                             7 + sprint d'extensions |

## 10. Critères de sortie MVP métier

Le MVP ne sera considéré comme prêt pour une recette métier complète que lorsque :

- [ ] les rôles et permissions sont validés et testés;
- [ ] l'isolation multi-tenant est vérifiée sur tous les domaines;
- [ ] le devis de référence peut être importé, contrôlé et confirmé;
- [ ] les heures internes sont ventilables par tâche;
- [ ] le cycle de pointage soumis/validé/rejeté est clair;
- [ ] la marge globale et les marges chantier utilisent le même coût réel;
- [ ] le budget par tâche ne présente pas de statut trompeur lorsqu'il est incomplet;
- [ ] l'export comptable est validé sur le logiciel cible;
- [ ] une recette mobile couvre réseau disponible, réseau instable et reprise;
- [ ] les données sensibles et documents sont accessibles selon les droits métier.
