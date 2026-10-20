# Analyse fonctionnelle critique — BTP Project

**Date de l'analyse :** 23 septembre 2026  
**Périmètre :** API NestJS, Desktop Patron/Comptable et Mobile Ouvrier  
**Méthode :** comparaison des backlogs, des règles métier, du schéma Prisma et des parcours réellement exposés par les applications.

## État général

Le produit couvre un MVP utilisable pour le pointage quotidien : connexion, sélection d'un chantier affecté, démarrage et fin de journée, historique personnel, consultation Desktop et validation des pointages. Le Desktop couvre également la création de chantiers, l'affectation d'ouvriers, les dépenses rattachées à une tâche, les indicateurs financiers par chantier et le suivi budgétaire par tâche.

Le produit n'est toutefois pas encore exploitable comme outil complet de pilotage BTP. Le devis Excel, qui constitue la source attendue des budgets, n'est pas importable depuis l'interface. Surtout, les heures de main-d'œuvre interne ne sont pas rattachées à une tâche : le suivi « main-d'œuvre par tâche » ne reflète donc actuellement que la sous-traitance. Le dashboard global présente par ailleurs une marge qui n'intègre pas le coût de main-d'œuvre interne.

### Statuts utilisés dans ce rapport

- **Livré :** le parcours est utilisable de bout en bout dans l'interface et l'API.
- **Partiel :** une partie du parcours existe, mais une limite empêche l'usage métier complet.
- **Absent :** la fonction est documentée ou attendue, mais aucun parcours utilisable n'a été trouvé.

## A. Points bloquants

### A.1 Import du devis chiffré Excel absent

- **Rôle impacté :** Patron, conducteur de travaux.
- **Constat :** l'écran `apps/web/src/features/chantier/components/OcrImportPage.tsx` affiche encore « fonctionnalité à venir ». Le hook et l'endpoint de sauvegarde en lot existent côté technique, mais aucun écran ne permet de déposer, mapper, contrôler et confirmer un fichier Excel.
- **Impact terrain :** les budgets par tâche, le budget global et la marge doivent être ressaisis manuellement. Une entreprise qui travaille à partir de ses devis ne peut pas démarrer rapidement le suivi réel et risque des erreurs de transcription.
- **Gravité :** bloquant pour le workflow financier attendu par US-C001 et UC-C001.

### A.2 Le coût de main-d'œuvre interne n'est pas ventilable par tâche

- **Rôles impactés :** Patron, conducteur de travaux, comptable.
- **Constat :** `Pointage.taches` est un tableau de chaînes dans `apps/api/prisma/schema.prisma`; il n'existe pas de relation structurée entre un pointage et une `TacheChantier`. Le service `RapportService.getSuiviTachesChantier` ne compte donc, par tâche, que les dépenses `SOUS_TRAITANCE` pour la main-d'œuvre.
- **Impact terrain :** le tableau vert/rouge par tâche peut afficher une tâche « dans le budget » alors que les heures internes consommées sur cette tâche ne sont pas connues. Il est impossible d'identifier précisément quelle activité dérape et d'utiliser ce retour pour fiabiliser les futurs devis.
- **Gravité :** bloquant pour la promesse centrale de US-C005 et BR-C-012/016.

### A.3 La marge du dashboard global est incomplète

- **Rôle impacté :** Patron.
- **Constat :** dans `apps/api/src/modules/rapport/rapport.service.ts`, `getDashboardStats` calcule la marge globale comme CA moins dépenses et ne valorise pas les heures validées. Le détail chantier, lui, valorise les pointages validés.
- **Impact terrain :** le patron peut voir une marge globale positive alors que la main-d'œuvre interne a déjà consommé une part importante du résultat. Les chiffres du dashboard et ceux du détail chantier peuvent être contradictoires.
- **Gravité :** bloquant pour une décision financière fiable; incohérence avec BR-024/025 et US-002.

### A.4 Absence de contrôle effectif des rôles métier

- **Rôles impactés :** Comptable, Patron, Ouvrier; risque transversal de sécurité et de gouvernance.
- **Constat :** les contrôleurs métier utilisent `JwtAuthGuard`, mais aucune utilisation de `@Roles()` ou de `RolesGuard` n'a été trouvée. Les routes de création/modification de chantier, de gestion des ouvriers et de correction/validation des pointages ne distinguent pas explicitement Patron, Comptable et Ouvrier.
- **Impact terrain :** un compte comptable ou ouvrier authentifié peut potentiellement appeler des opérations réservées au patron si l'API n'applique pas un contrôle supplémentaire ailleurs. La séparation « consultation/paie » du comptable n'est pas garantie par le parcours métier.
- **Gravité :** bloquant avant une utilisation multi-utilisateur en production.

### A.5 La saisie d'une dépense est inutilisable sans tâche préalable

- **Rôle impacté :** Patron.
- **Constat :** le rattachement à une tâche est obligatoire dans `CreateDepenseDto` et l'interface désactive l'enregistrement si le chantier n'a aucune tâche. Comme l'import Excel est absent, chaque tâche doit être créée manuellement avant de pouvoir enregistrer une dépense.
- **Impact terrain :** une dépense reçue rapidement sur chantier ne peut pas être enregistrée dans le flux naturel si le devis n'a pas été ressaisi. Cela crée un risque de retard ou de saisies hors outil.
- **Gravité :** bloquant opérationnel dépendant de A.1; contournement possible par création manuelle des tâches.

### A.6 Les fonctions terrain attendues pour documenter un chantier sont absentes

- **Rôle impacté :** Ouvrier et conducteur de travaux.
- **Constat :** aucun parcours fonctionnel d'envoi de photos, de consultation de photos ou de stockage documentaire chantier n'a été trouvé dans `apps/mobile` et `apps/api`. Le commentaire est supporté par l'API, mais aucun champ de saisie n'est présent dans l'écran de pointage mobile observé.
- **Impact terrain :** les réserves, problèmes, preuves d'avancement et informations urgentes restent hors de l'application. Le patron ne reçoit pas une remontée complète de la journée.
- **Gravité :** bloquant pour les usages de suivi terrain avancé; non bloquant pour le MVP start/stop.

### A.7 Les statuts de pointage livrés sont plus simples que le workflow documenté

- **Rôles impactés :** Ouvrier, Patron, Comptable.
- **Constat :** le schéma utilise `EN_COURS`, `TERMINE` et `VALIDE`. Le backlog mobile prévoit aussi `SOUMIS` et `REJETE`, ainsi qu'une confirmation avant envoi. Dans l'application mobile, la fin de journée termine directement le pointage; le rejet n'est pas un parcours identifié.
- **Impact terrain :** le comptable ou le patron ne disposent pas d'un cycle explicite « soumis / rejeté / à corriger ». La distinction entre une journée terminée par l'ouvrier et une journée effectivement soumise à validation est faible.
- **Gravité :** risque de procédure et d'audit, surtout lorsque le volume de pointages augmente.

## B. Points flous ou non tranchés

### B.1 Clarifications déjà présentes dans les backlogs

| Référence              | Question non tranchée                                                                                  | Conséquence métier                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| CL-C-001 / US-C001     | Quelle structure exacte du fichier Excel : feuilles, colonnes, lignes de synthèse, unités et formats ? | Impossible de garantir un import fiable et de définir le contrôle attendu par le client.               |
| CL-C-002 / US-C001     | L'ancien OCR image/PDF est-il conservé en complément de l'Excel ou abandonné ?                         | Le parcours d'acquisition du devis n'est pas défini pour les entreprises qui n'ont pas d'Excel propre. |
| CL-C-003 / US-C002     | La marge est-elle importée du devis ou saisie/ajustée par le patron ?                                  | La responsabilité du prix de vente et la traçabilité des ajustements restent ambiguës.                 |
| CL-C-004 / US-C003     | Le type `TRANSPORT` est-il conservé, fusionné ou supprimé ?                                            | Les anciennes dépenses et les règles de classement peuvent devenir incohérentes.                       |
| CL-001 / US-003        | Quel indicateur d'avancement : tâches terminées, heures consommées ou avancement physique ?            | Le dashboard ne peut pas représenter correctement la santé opérationnelle d'un chantier.               |
| CL-003 / US-019        | Quel logiciel comptable cible et quel format d'import exact ?                                          | Un fichier CSV techniquement exporté peut rester inutilisable par le cabinet comptable.                |
| Mobile CLARIFICATION 1 | Les types de travaux sont-ils fixes ou configurables par entreprise ?                                  | Le mobile expose actuellement une liste de types prédéfinis, sans personnalisation par société.        |
| Mobile CLARIFICATION 2 | Quels filtres l'historique doit-il accepter ?                                                          | La recherche d'une journée ou d'un chantier peut être insuffisante en cas de volume élevé.             |
| Mobile CLARIFICATION 3 | Limite de nombre, taille et conservation des photos ?                                                  | Le besoin de preuve chantier ne peut pas être cadré ni budgété.                                        |
| Mobile CLARIFICATION 4 | Le GPS sert-il de preuve, de géofencing bloquant ou seulement d'information ?                          | Les attentes sociales, juridiques et opérationnelles peuvent diverger fortement.                       |

### B.2 Ambiguïtés révélées par la confrontation au code

1. **« Prix de vente HT » et « budget » ne sont plus le même concept.** Le code calcule `prixVenteHT = budget + marge`, tandis que plusieurs formulations historiques du backlog parlent encore de budget comme du prix de vente. Le vocabulaire des écrans et des exports doit être stabilisé pour éviter une mauvaise lecture par le patron.
2. **Client et date de fin ne sont pas alignés avec les règles initiales.** Le schéma rend `Chantier.client` optionnel et `endDate` nullable, alors que BR-005 les présentait comme obligatoires. Il faut décider si un chantier peut être créé sans client ou sans date prévisionnelle.
3. **Le coût total et le suivi par nature ne couvrent pas exactement les mêmes catégories.** Le détail financier compte toutes les dépenses dans `coutDepenses`, alors que le suivi par nature classe surtout `MATERIEL` et `SOUS_TRAITANCE`; `MAIN_OEUVRE`, `TRANSPORT` et `AUTRE` nécessitent une règle explicite de rattachement budgétaire.
4. **La « mise à jour en temps réel » signifie actuellement invalidation et rechargement côté client.** Il n'y a pas de notification métier ni de flux temps réel identifié. Il faut préciser si une actualisation à l'ouverture suffit ou si le patron doit être alerté sans action.
5. **Les corrections de paie sont locales à la prévisualisation.** Les heures majorées et indemnités modifiées dans `PaiePreviewPage` servent à l'export, mais aucun enregistrement de validation ou d'audit de ces ajustements n'a été identifié.
6. **La séparation des chantiers affectés n'est pas complète dans le service de pointage.** `findAssignedByUser` filtre bien les chantiers affectés, mais `startPointage` vérifie surtout l'appartenance à l'entreprise et l'existence du chantier. La règle métier « un ouvrier ne peut pointer que sur un chantier qui lui est affecté » doit être confirmée et garantie de manière observable.
7. **Le rôle comptable est défini dans les données et le seed, mais son périmètre fonctionnel n'est pas matérialisé par des droits API ou des écrans dédiés.** Il faut trancher entre un comptable lecteur/exporteur et un comptable autorisé à corriger certaines données.

### B.3 État par domaine

| Domaine          | Livré                                                                                           | Partiel ou absent                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Authentification | Login, refresh, logout, cookies Desktop et SecureStore mobile                                   | Politique d'expiration/inactivité et droits par rôle à valider en usage réel      |
| Chantiers        | Création, modification des chantiers en cours, clôture, suppression sous condition, affectation | Import Excel/OCR, historique des changements, avancement physique                 |
| Tâches           | Création, modification, suppression, budgets MO/matériaux                                       | Provenance devis, relation structurée avec les heures internes                    |
| Dépenses         | Catégories saisissables et lien tâche/chantier                                                  | Règles pour transport/autre, justificatifs et validation                          |
| Pointage         | Start/stop serveur, commentaire API, historique mobile, correction et validation Desktop        | Confirmation soumission, rejet, affectation du temps à une tâche, mode hors-ligne |
| Paie             | Prévisualisation par période, heures majorées, indemnités, CSV et Excel                         | Paramétrage des règles, validation/audit des overrides, logiciel cible            |
| Documents        | Aucun parcours constaté                                                                         | Photos, plans, devis, factures, attestations et pièces justificatives             |

## C. Fonctionnalités manquantes à forte valeur métier

Les propositions suivantes sont absentes ou insuffisamment matérialisées dans le périmètre observé. Elles répondent à des situations de chantier concrètes.

### C.1 Import de devis contrôlé et normalisé

**Besoin :** le devis est le point de départ du budget et des tâches. Il faut un import Excel avec modèle de colonnes, aperçu des lignes, erreurs explicites, validation et possibilité de corriger avant création. Une alternative OCR peut rester utile pour les devis reçus en PDF ou photo.

**Valeur :** évite la ressaisie, fiabilise le prix de vente et rend possible le suivi par tâche dès le premier jour.

### C.2 Ventilation du temps interne par tâche

**Besoin :** l'ouvrier doit sélectionner les tâches réelles du chantier, idéalement avec une répartition des heures lorsque plusieurs activités sont réalisées dans la journée. Le patron doit pouvoir corriger cette ventilation avant validation.

**Valeur :** rend le rouge/vert par tâche économiquement crédible et permet de comparer le devis aux heures réellement consommées.

### C.3 Avancement physique du chantier

**Besoin :** le budget et les dépenses ne disent pas si le chantier est en avance ou en retard. Il faut un avancement par tâche, un pourcentage validé par le conducteur de travaux, des jalons et éventuellement une date prévisionnelle révisée.

**Valeur :** détecte un chantier qui consomme peu de budget mais prend du retard, ou qui dépense vite sans production équivalente.

### C.4 Gestion documentaire et preuves chantier

**Besoin :** centraliser plans, devis, avenants, DICT, attestations, comptes rendus, photos avant/après et justificatifs de dépenses, avec rattachement au chantier ou à la tâche.

**Valeur :** limite les pertes de documents, accélère les échanges avec le client et fournit des preuves en cas de réserve ou de litige.

### C.5 Dépenses avec justificatif et workflow de validation

**Besoin :** une dépense devrait pouvoir porter un ticket ou une facture, un fournisseur, une date d'échéance et un état « saisie / contrôlée / rejetée ». Le patron ou le comptable doit pouvoir distinguer une dépense engagée d'une dépense définitivement comptabilisée.

**Valeur :** réduit les erreurs de marge et prépare réellement l'export comptable; le simple montant manuel ne suffit pas pour une gestion d'entreprise.

### C.6 Gestion des sous-traitants comme tiers

**Besoin :** la sous-traitance ne devrait pas être uniquement une catégorie de dépense. Il faut au minimum un tiers, un contrat ou bon de commande, les tâches concernées, les montants engagés et les pièces administratives.

**Valeur :** sécurise le suivi des coûts et des obligations administratives, particulièrement lorsque plusieurs sous-traitants interviennent sur une même tâche.

### C.7 Mode hors-ligne mobile et reprise fiable

**Besoin :** sur certains chantiers, le réseau est absent ou instable. Le mobile doit pouvoir enregistrer localement un début/une fin et les remontées, afficher clairement « en attente d'envoi », puis synchroniser sans doublon.

**Valeur :** évite les pointages perdus ou les manipulations de secours, avec un impact direct sur la paie.

### C.8 Alertes opérationnelles et notifications

**Besoin :** prévenir le patron d'un pointage terminé à valider, d'un dépassement budgétaire, d'une absence de pointage ou d'une tâche proche de sa date cible.

**Valeur :** transforme le tableau de bord en outil d'action; le patron n'a pas à ouvrir chaque chantier pour découvrir un problème.

### C.9 Absences, congés et indisponibilités

**Besoin :** gérer congés, arrêts, absences et remplacements pour expliquer l'absence d'un pointage et fiabiliser la préparation de paie.

**Valeur :** évite de confondre absence planifiée et oubli de pointage et donne une vision réaliste de la capacité des équipes.

### C.10 Sécurité et prévention chantier

**Besoin :** suivre EPI, accueils sécurité, habilitations, incidents et observations, éventuellement avec une checklist quotidienne.

**Valeur :** répond à une obligation opérationnelle forte du BTP et rend les remontées terrain utiles au-delà des heures travaillées.

## D. Priorisation

### Quick wins

1. **Corriger la marge du dashboard global** pour intégrer les pointages validés valorisés, avec la même définition que le détail chantier.
2. **Afficher clairement les catégories de dépenses non couvertes** et décider du sort de `TRANSPORT` et `AUTRE`; empêcher les classifications qui ne peuvent pas être rattachées à un budget.
3. **Ajouter dans le mobile un champ commentaire réellement accessible** et une confirmation explicite de soumission, puis afficher le commentaire au patron.
4. **Afficher les alertes de données incomplètes** : chantier sans budget, ouvrier sans taux horaire, tâche sans budget, dépense sans justificatif.
5. **Formaliser les droits Patron/Comptable/Ouvrier dans l'API** et vérifier chaque parcours avec un compte de rôle différent.
6. **Ajouter un état de validation paie et la trace des corrections manuelles** avant export.

### Structurant

1. **Livrer l'import Excel de devis** avec format validé, aperçu, mapping, erreurs et confirmation; décider en parallèle du maintien de l'OCR.
2. **Faire évoluer le modèle de pointage pour lier une activité à une `TacheChantier`**, avec une règle de saisie des heures par tâche ou une ventilation contrôlable par le patron.
3. **Revoir le workflow de pointage** vers un cycle explicite `EN_COURS -> SOUMIS -> VALIDE/REJETE`, incluant motif de rejet et nouvelle soumission.
4. **Construire un vrai référentiel financier** : fournisseurs, justificatifs, engagement, validation et règles de classement des dépenses.
5. **Ajouter l'avancement physique et les jalons** au niveau chantier et tâche.
6. **Mettre en place le socle documentaire S3** avec permissions, rattachements métier et accès depuis Desktop/Mobile.
7. **Ajouter la synchronisation hors-ligne mobile** avec journal local, reprise et résolution des doublons.

### Vision long terme

1. **Pilotage prévisionnel** : reste à faire, coût à terminaison, prévision de marge finale et scénarios de retard.
2. **Gestion complète des sous-traitants et contrats** avec suivi des engagements, situations et pièces administratives.
3. **Facturation client, acomptes, situations de travaux et trésorerie**, pour couvrir le cycle financier au-delà de la marge théorique.
4. **Planification des équipes, congés, matériel et outillage**, afin de relier capacité disponible, ressources et planning chantier.
5. **Prévention et conformité** : EPI, habilitations, accueils sécurité, incidents et audits.
6. **Notifications multicanal et indicateurs prédictifs**, une fois les données de production suffisamment fiables.

## Tableau récapitulatif final

| Constat                                            | Rôle impacté                             | Priorité          |
| -------------------------------------------------- | ---------------------------------------- | ----------------- |
| Import du devis Excel absent de l'interface        | Patron, conducteur de travaux            | Structurant       |
| Heures internes non ventilées par tâche            | Patron, conducteur de travaux, comptable | Structurant       |
| Marge du dashboard global hors coût MO interne     | Patron                                   | Quick win         |
| Droits métier non appliqués explicitement par rôle | Tous les rôles                           | Quick win         |
| Dépense impossible sans tâche préexistante         | Patron                                   | Structurant       |
| Workflow pointage sans rejet/soumission explicite  | Ouvrier, Patron, Comptable               | Structurant       |
| Photos, documents et justificatifs absents         | Ouvrier, conducteur, Patron              | Structurant       |
| Mode hors-ligne mobile absent                      | Ouvrier                                  | Structurant       |
| Avancement physique non défini et non suivi        | Patron, conducteur de travaux            | Structurant       |
| Catégories `TRANSPORT`/`AUTRE` non arbitrées       | Patron, comptable                        | Quick win         |
| Ajustements de paie non persistés ni audités       | Comptable, Patron                        | Quick win         |
| Gestion des sous-traitants comme tiers absente     | Patron, comptable                        | Vision long terme |
| Facturation, acomptes et trésorerie absents        | Patron, comptable                        | Vision long terme |
| Absences et congés absents                         | Patron, comptable, ouvriers              | Vision long terme |
| EPI, sécurité et incidents absents                 | Ouvrier, conducteur, Patron              | Vision long terme |

## Conclusion de recette métier

Le produit peut servir de base de MVP pour enregistrer et valider des journées de travail, mais il ne doit pas encore être présenté comme un outil complet de rentabilité par tâche. La priorité de mise en production métier est de fiabiliser trois conditions : importer le devis de référence, rattacher le temps interne aux tâches et aligner tous les indicateurs financiers sur une même définition du coût réel. Ensuite seulement, les documents, l'hors-ligne, les alertes et le suivi d'avancement donneront à l'application la robustesse attendue sur un chantier réel.
