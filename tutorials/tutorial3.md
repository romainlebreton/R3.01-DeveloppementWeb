---
title: TD3 &ndash; Fin TD2 et association de classes
subtitle: SQL JOIN
layout: tutorial
---

Dans ce TD, nous allons reprendre et finir le TD précédent sur l'enregistrement
des données dans une BDD en utilisant la classe `PDO` de PHP. Nous reprenons à
partir du concept très important de requêtes préparées. Puis nous coderons des
associations entre plusieurs tables de la BDD.

**Attention :** Il est nécessaire d'avoir fini
  [la section 2.1 du TD précédent](tutorial2.html#consulter-la-base-de-donnes),
  qui vous faisait coder votre première requête `SELECT * FROM voiture`, pour
  attaquer ce TD.

## Requêtes préparées

<!--et insertion d'éléments dans la base-->

<!--
Intervention sur les injections SQL avec un exemple simple
-->

Imaginez que nous avons une fonction `getVoiture($immatriculation)` codée comme
suit

~~~
function getVoitureByImmat($immat) {
    $sql = "SELECT * from voiture WHERE immatriculation='$immat'"; 
    $rep = Model::$pdo->query($sql);
    $rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
    return $rep->fetch();
}
~~~
{:.php}

Cette fonction marche mais pose un gros problèmes de sécurité ; elle est
vulnérable à ce que l'on appelle les *injections SQL*. 
<!--
Faire une démo d'injection SQL
L'utilisateur pourrait rentrer dans `$immatriculation` quelque chose d'autre
-->
Pour éviter ceci, PDO fonctionne uniquement par des requêtes préparées. Voici
comment elles fonctionnent :

* On met un *tag* `:nom_var` en lieu de la valeur à remplacer
* On doit préparer la requête
* La requête préparée attend alors des valeurs et d'être exécutée
* On peut alors récupérer les résultats comme précédemment

~~~
function getVoitureByImmat($immat) {
  $sql = "SELECT * from voiture WHERE immatriculation=:nom_var";
  $req_prep = Model::$pdo->prepare($sql);
  $values = array(
     "nom_var" => $immat  
   );
  $req_prep->execute($values);

  $req_prep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
  // Vérifier si $req_prep->rowCount() != 0
  return $req_prep->fetch();
}
~~~
{:.php}

**Remarque :** Il existe une autre solution pour associer une à une les valeurs
aux variables d'une requête préparée avec la fonction
[`bindParam`](http://php.net/manual/fr/pdostatement.bindparam.php) de la classe
PDO. Cependant nous vous conseillons d'utiliser systématiquement la syntaxe avec
un tableau `execute($values)`.

<div class="exercise">
1. Copiez la fonction précédente dans `Voiture.php` et testez-là dans
`lireVoiture.php`.

2. Créez une fonction `insertVoiture()` dans la classe `Voiture` qui insère la
voiture courante dans la BDD. On vous rappelle la syntaxe SQL d'une insertion :

   ~~~
   INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)
   ~~~
   {:.sql}

3. Modifier la page  `creerVoiture.php` du TD précédent de sorte qu'elle sauvegarde
l'objet `Voiture` créé.
4. Testez l'insertion grâce au formulaire `formulaireVoiture.html` du TD n°1. 
5. Vérifiez dans PhpMyAdmin que les voitures sont bien sauvegardées.

**N'oubliez-pas** de protéger tout votre code contenant du PDO
  (`getAllVoitures`, ...)  avec des try - catch comme dans `Model`. En effet,
  chaque ligne de code liée à PDO est susceptible de lancer une exception,
  qu'il nous faut capturer et traiter (rôle du `catch`).

</div>

## Création des tables de notre site de covoiturage

Reprennons les classes du TP précédent sur le covoiturage pour y ajouter la
gestion de la persistance.


<div class="exercise">
1. Dans votre PhpMyAdmin, créez une table `utilisateur` avec les champs suivants :

   * `login` : VARCHAR 32, clé primaire
   * `nom` : VARCHAR 32
   * `prenom` : VARCHAR 32

1. Insérez quelques utilisateurs.

2. Créez une table `trajet` avec les champs suivants :

   * `id` : VARCHAR 32, clé primaire
   * `depart` : VARCHAR 32
   * `arrivee` : VARCHAR 32
   * `date` : DATE
   * `nbplaces` : INT
   * `prix` : INT
   * `conducteur` : VARCHAR 32

   **Note :** On souhaite que le champ primaire `id` s'incrémente à chaque nouvelle
   insertion dans la table.  Pour ce faire, sélectionnez pour le champ `id` la
   valeur par défaut `NULL` et cochez la case `A_I` (auto-increment).

2. Insérez quelques trajets en prenant soin de ne pas remplis la case `id` (pour
   que l'auto-incrément marche) et en mettant dans conducteur des login
   d'utilisateurs valides (pour éviter des problèmes par la suite).

## Premier lien entre `utilisateur` et `trajet`

On souhaite que le champ `trajet.conducteur` corresponde à tout moment à un
login de conducteur `utilisateur.login`. Vous souvenez-vous quelle est la
fonctionnalité des bases de données qui permet ceci ?

**Réponse:** <span style="color:#FCFCFC">Il faut utiliser des clés
  étrangères.</span>

<div class="exercise">

Voici les étapes pour faire ce lien :

1. À l'aide de l'interface de PhpMyAdmin, faites de `trajet.conducteur` un
**index**.

**Aide:** Dans l'onglet `Structure` de la table `trajet`, cliquez sur l'icône de
  l'action `index` en face du champ `conducteur`.


**Plus de détails:** Dire que le champ `conducteur` est un **index** revient à
dire à MySql que l'on veut trouver rapidement les lignes qui ont un `conducteur`
donné. Du coup, MySql va construire une structure de donnée pour permettre cette
recherche rapide.  Une **clé étrangère** est nécessairement un **index** car on
a besoin de ce genre de recherches pour tester rapidement la contrainte de clé
étrangère.


2. Rajoutez la contrainte de **clé étrangère** entre `trajet.conducteur` et
   `utilisateur.login`. Pour ceci, allez dans l'onglet `Structure` de la table
   `trajet` et cliquez sur `Gestion des relations` pour accéder à la
   gestion des clés étrangères.  

Nous allons utiliser le comportement `ON DELETE CASCADE` pour qu'une association
soit supprimé si la clé étrangère est supprimée, et le comportement `ON UPDATE
CASCADE` pour qu'une association soit mise à jour si la clé étrangère est mise à
jour.

**Attention :** Pour supporter les clés étrangères, il faut que le moteur de
stockage de toutes vos tables impliqués soit `InnoDB` . Vous pouvez choisir ce
paramètre à la création de la table ou le changer après coup dans l'onglet
`Opérations`.



</div>

<!--
<div class="exercise">
À l'aide de l'interface de PhpMyAdmin, faites de `trajet_id` et `login` des **index**. 

**Aide:** Dans l'onglet `Structure` de la table passager, cliquer sur l'icône de l'action `index` en face des champs `trajet_id` et `utilisateur_login`.


**Plus de détails:** Dire que le champ `trajet_id` est un **index** revient à dire à MySql que l'on veut trouver rapidement les lignes qui ont un `trajet_id` donné. Du coup, MySql va construire une structure de donnée pour permettre cette recherche rapide.
Une **clé étrangère** est nécessairement un **index** car on a besoin de ce genre de recherches pour tester rapidement la contrainte de clé étrangère.
</div>
-->

<!--
Plutôt que le texte: "Reprendre les classes du TP précédent sur le covoiturage et y ajouter l'utilisation d'une base de données. Chaque utilisateur sera identifié par un id, de même pour chaque trajet."

-> Il faudrait donner soit le diagramme de classe, soit mieux entités/associations de trajet (annonce), voiture et utilisateur. 
-->


## Association entre utilisateurs et trajets

### Dans la base de donnée

Vous avez couvert dans le cours "Analyse, Conception et Développements
d'Applications" les diagrammes de classes. Ce type de diagramme est utile pour
penser la base de donnée d'une application web.

<!-- ![Diagramme entité association](/images/logo.png) --> 

<div class="exercise">
En fonction de votre multiplicité, comment implémenteriez-vous l'association entre utilisateurs et trajets dans la base de donnée?
</div>

#### Notre solution

La relation conducteur est de multiplicité bornée, il suffit de rajouter un
champ `conducteur_login` dans la table `Trajet`.

Dans la suite de ce TD, nous allons nous intéresser à l'association `passager`
entre utilisateurs et trajets de multiplicités non bornées. C'est-à-dire qu'on
ne va pas limiter le nombre d'utilisateurs d'un trajet et inversement.

<div class="exercise">
Comment implémente-t-on cette association avec des bases de données ?
</div>

**Réponse:** <span style="color:#FCFCFC">On utilise une table de jointure.</span>


Nous choisissons donc de créer une table `passager` qui contiendra deux champs :

* l'identifiant INT `trajet_id` d'un trajet et
* l'identifiant VARCHAR(32) `utilisateur_login` d'un utilisateur.

Pour inscrire un utilisateur à un trajet, il suffit d'écrire la ligne correspondante dans la table `passager` avec leur `utilisateur_login` et leur `trajet_id`.

<div class="exercise">
Quelle est la clé primaire de cette table ? 
</div>

**Réponse:** <span style="color:#FCFCFC">Le couple
  (trajet_id,utilisateur_login). Si vous choissisez trajet_id seul comme clé
  primaire, un trajet aura au plus un passager, et si vous choississez
  utilisateur_login, chaque utilisateur ne pourra être passager que sur un
  unique trajet.</span>

L'interclassement général de votre table sera toujours `utf8_general_ci` (c'est l'encodage des données, et donc des accents, caractères spéciaux ...).

<div class="exercise">
On souhaite que le champ `passager.trajet_id` corresponde à tout moment à un identifiant de trajet `trajet.id`. Quelle est la fonctionnalité des bases de données qui permet ceci ?
</div>

**Réponse:** <span style="color:#FCFCFC">Il faut utiliser des clés étrangères.</span>

<div class="exercise"> 
Créer la table `passager` en utilisant l'interface de PhpMyAdmin. 

**Attention :** 
Pour supporter les clés étrangères, il faut que le moteur de stockage de toutes vos tables impliqués soit `InnoDB` . Vous pouvez choisir ce paramètre à la création de la table ou le changer après coup dans l'onglet `Opérations`.
</div>

<div class="exercise">
Rajoutez la contrainte de **clé étrangère** entre `passager.trajet_id` et
`trajet.id`, puis entre `passager.utilisateur_login` et `utilisateur.login`.
Nous allons utiliser le comportement `ON DELETE CASCADE` pour qu'une association
soit supprimé si la clé étrangère est supprimée, et le comportement `ON UPDATE
CASCADE` pour qu'une association soit mise à jour si la clé étrangère est mise à
jour.

**Aide:** Dans l'onglet `Structure` de la table `passager`, il faut cliquer sur `Gestion des relations` pour accéder à la gestion des clés étrangères.
</div>

<div class="exercise">
À l'aide de l'interface de PhpMyAdmin, insérer quelques associations pour que la table `passager` ne soit pas vide.
</div>

### Au niveau du PHP

#### Liste des utilisateurs d'un trajet et inversement

Nous allons maintenant pouvoir compléter le code PHP de notre site pour gérer l'association. Commençons par rajouter des fonctions à nos modèles 'Utilisateur' et 'Trajet'.

Avant toute chose, vous souvenez-vous comment faire une jointure en SQL ? Si vous n'êtes pas tout à fait au point sur les différents `JOIN` de SQL, vous pouvez vous rafraîchir la mémoire en lisant 
[http://www.w3schools.com/sql/sql_join.asp](http://www.w3schools.com/sql/sql_join.asp).

<div class="exercise">
Créer une `public static function findUtilisateurs($data)` dans `ModelTrajet.php` qui prendra en entrée un tableau associatif `$data` avec un champ `$data['id']`. Cette fonction devra retourner la liste des utilisateurs inscrit aux trajet d'identifiant `$data['id']` en faisant la requête adéquate.

**Indice :** Utiliser une requête à base d'`INNER JOIN`. Une bonne stratégie pour développer la bonne requête est d'essayer des requêtes dans l'onglet SQL de PhpMyAdmin jusqu'à tenir la bonne.
</div>

<div class="exercise">
De la même manière, créer une `public static function findTrajets($data)` dans `ModelUtilisateur.php` qui prendra en entrée un tableau associatif `$data` avec un champ `$data['login']`.
</div>

Nous allons maintenant compléter la vue et le contrôleur de notre site. Comme nous avons déjà fait ensemble ce type exact d'exercice, nous allons juste vous donner le résultat voulu et vous laisser vous débrouiller pour y parvenir.

<div class="exercise">
Nous souhaitons avoir un lien `Liste des trajets` dans la vue de détail (action `read`) d'un utilisateur. Ce lien amènera vers une nouvelle vue associée à l'action `readAllTrajets` qui listera les trajets de l'utilisateur. La vue associée ressemblera à la vue de listage des trajets classique (vue `List`) mais avec un titre `Liste des trajets de l'utilisateur ... :` au lieu de `Liste des trajets :`.
</div>

<div class="exercise">
Faire la même chose mais avec la liste des utilisateurs d'un trajet.
</div>

#### Désinscrire un utilisateur d'un trajet et inversement

Rajoutons une dernière fonctionnalité : dans la vue qui liste les trajets d'un utilisateur, nous voudrions avoir un lien 'Désinscrire' qui enlèverait l'utilisateur courant du trajet sélectionné.

<div class="exercise">
Créer une `public static function deleteUtilisateur($data)` dans `ModelTrajet.php` qui prendra en entrée un tableau associatif `$data` avec deux champs `$data['trajet_id']` et `$data['utilisateur_login']`. Cette fonction devra désinscrire l'utilisateur `utilisateur_login` du trajet `trajet_id`.
</div>

Comme précédemment, nous allons vous donner le 'cahier des charges' de la fonctionnalité 'Désinscription' et nous vous laissons le soin de l'implémenter.

<div class="exercise">
Nous désirons avoir un lien 'Désinscription' dans la vue de liste des trajets d'un utilisateur (action `readAllTrajets`). Ce lien mènera vers une nouvelle vue associée à l'action `deleteUtilisateur` qui écrira `L'utilisateur .. a été désinscrit du trajet n°..` puis réaffichera la liste mise à jour des utilisateurs du trajet.
</div>

<div class="exercise">
Faire de même pour désinscrire un trajet d'un utilisateur.

**Amélioration possible :** En fait, les fonctions `deleteUtilisateur($data)` de `ModelTrajet.php` et `deleteTrajet($data)` de `ModelUtilisateur.php` sont identique. On peut donc faire une unique fonction `deletePassager($data)`  dans `Model.php`. Ainsi `ModelUtilisateur` et `ModelUtilisateur` hériteront de cette fonction.
</div>

### Et si le temps le permet

Voici une liste d'idée pour compléter notre site :

1. Notre liste des trajets d'un utilisateur est incomplète : il manque les trajets dont il est conducteur (et non passager). La page qui liste les trajets d'un utilisateur pourrait donner les deux listes comme conducteur et comme passager.
1. Similairement, nous avons oublié le conducteur de la liste des passagers d'un trajet. Le rajouter avec un statut à part.
1. Vous pouvez aussi éventuellement mettre en place des `trigger` dans votre SQL pour gérer le nombre de passager par véhicule, le fait qu'un passager ne soit pas inscrit deux fois à un trajet ...

## Gestion des erreurs

2. Dans un site en production, pour des raisons de sécurité et de confort
d'utilisation, il est déconseillé d'afficher directement un message d'erreur. Pour
cela on va créer une variable pour activer ou désactiver l'affichage des
messages d'erreurs.

   Dans la classe `Conf`, ajouter un attribut  statique `debug` et son getter publique. 

   ~~~
   <?php
     class Conf{
      ...
      
       // la variable debug est un boolean
       static private $debug = True; 
       
       static public function getDebug() {
       	return self::$debug;
       }
   }
   ?>
   ~~~
   {:.php}
   
   Ainsi on peut modifier les messages d'erreurs dans les `catch`.
   
   ~~~
   try {
     ...
   } catch (PDOException $e) {
     if (Conf::getDebug()) {
       echo $e->getMessage(); // affiche un message d'erreur
     } else {
       echo 'Une erreur est survenue <a href=""> retour a la page d\'accueil </a>';
     }
     die();
   }
   ~~~
   {:.php}

