# Suivi budgétaire par chantier et par tâche

## Objectif

Améliorer le suivi financier des chantiers en distinguant clairement les coûts de main-d'œuvre et les coûts de matériaux. Le patron doit pouvoir comparer les budgets prévus avec les dépenses et les pointages réellement enregistrés, au niveau du chantier comme au niveau de chaque tâche.

## 1. Import du devis chiffré

Le devis vendu au client constitue la source de référence pour initialiser le chantier. Il est importé au format Excel afin de récupérer :

- la liste des tâches du chantier ;
- le budget main-d'œuvre de chaque tâche ;
- le budget matériaux de chaque tâche ;
- le budget total du chantier ;
- la marge prévue ;
- le prix de vente HT, calculé selon la règle suivante : **budget total + marge**.

Les données importées doivent pouvoir être contrôlées avant leur enregistrement définitif dans le chantier.

## 2. Budgets séparés

Chaque chantier possède deux enveloppes budgétaires distinctes :

- **budget main-d'œuvre** ;
- **budget matériaux**.

Chaque tâche reprend cette même séparation avec :

- un budget main-d'œuvre ;
- un budget matériaux.

Le budget main-d'œuvre inclut :

- le coût de la main-d'œuvre interne, calculé à partir des pointages ;
- le coût de la sous-traitance.

Cette distinction permet d'identifier rapidement l'origine d'un dépassement et d'améliorer l'estimation des futurs devis.

## 3. Saisie des dépenses manuelles

Lorsqu'une dépense est saisie manuellement, elle doit être rattachée au chantier et à une tâche sélectionnée dans une liste déroulante.

La liste des tâches est alimentée par les tâches importées depuis le devis Excel. Le rattachement à une tâche permet ensuite d'analyser précisément les coûts engagés pour chaque activité.

Chaque dépense est classée selon sa nature :

- **matériaux** ;
- **main-d'œuvre** ;
- **sous-traitance**.

Les dépenses de sous-traitance sont intégrées au suivi du budget main-d'œuvre.

## 4. Suivi du budget et du réel

Pour chaque chantier, l'application compare séparément le budget prévu et le coût réel :

- **main-d'œuvre** : pointages internes valorisés + dépenses de sous-traitance ;
- **matériaux** : dépenses classées comme matériaux.

Le résultat est présenté avec un statut lisible :

- **dans le budget** lorsque le coût réel reste inférieur ou égal au budget prévu ;
- **en dépassement** lorsque le coût réel dépasse le budget prévu.

La même comparaison est disponible pour chaque tâche, afin de visualiser immédiatement :

| Tâche | Budget main-d'œuvre | Réel main-d'œuvre | Budget matériaux | Réel matériaux | Statut |
| --- | ---: | ---: | ---: | ---: | --- |
| Tâche du chantier | Montant prévu | Pointages + sous-traitance | Montant prévu | Dépenses matériaux | Dans le budget / En dépassement |

## 5. Nouvelle lecture des dépenses d'un chantier

La vue des dépenses est organisée par tâche plutôt que comme une liste globale. Pour chaque tâche, l'utilisateur retrouve :

- le budget main-d'œuvre et le montant consommé ;
- le budget matériaux et le montant consommé ;
- le statut de chaque enveloppe ;
- le détail des dépenses rattachées à la tâche.

Cette présentation permet de répondre rapidement aux questions suivantes :

- Quelle tâche est en dépassement ?
- Le dépassement vient-il de la main-d'œuvre ou des matériaux ?
- Quelle part de la main-d'œuvre correspond aux équipes internes et à la sous-traitance ?
- Quels coûts réels ont été enregistrés pour une tâche donnée ?

## Résultat attendu

Le suivi financier offre une vision fiable et exploitable du chantier, depuis l'import du devis jusqu'au contrôle des dépenses réelles. Le patron peut ainsi repérer les écarts au niveau global et par tâche, tandis que les données de dépenses restent suffisamment détaillées pour alimenter les analyses et les futurs devis.
