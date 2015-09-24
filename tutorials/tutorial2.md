---
title: TD2 &ndash; La persistance des données en PHP
subtitle: BDD, PDO
layout: tutorial
---


Dans le TD1 vous avez appris à créer des classes et à instancier des objets de
ces classes.  Mais, comme vous l'avez constaté, la durée de vie des objets ainsi
créés ne dépassait pas la durée de l'exécution du programme (soit quelques *ms*).

Dans ce TD, nous allons apprendre à rendre les objets persistants, en les
sauvegardant dans une base de données. Ainsi il sera possible de retrouver les
objets d'une visite à l'autre du site web.

**Rappel :** PHP est un langage interprété, les erreurs ne sont pas détectées
avant exécution comme lors d'une compilation.  Il est donc conseillé de tester 
régulièrement chaque nouvelle partie de code.


## Connexion à la base de données

1. Connectez vous à votre base de données MySQL, à l'aide de l'interface PhpMyAdmin
[http://infolimon.iutmontp.univ-montp2.fr/my](http://infolimon.iutmontp.univ-montp2.fr/my)
Le login est votre login IUT et votre mot de passe initial votre numéro  INE.  
(Si vous êtes sur votre machine, allez sur votre phpmyadmin à l'adresse
[http://localhost/phpmyadmin](http://localhost/phpmyadmin)).

2. Changez votre mot de passe en quelque chose de simple et pas secret. En
   effet, vous devrez bientôt écrire ce mot de passe en clair dans un fichier.
   Si vous n'arrivez pas à vous logger après avoir changé le mot de passe, essayer avec 
   un autre navigateur ou bien videz le cache du navigateur. 

2. Créez une table `voiture` possédant 3 champs :

   * `immatriculation` de type `VARCHAR` et de longueur maximale 8, défini comme la
     clé primaire
   * `marque` de type `VARCHAR` est de longueur maximale 25.
   * `couleur` de type `VARCHAR` est de longueur maximale 12.
   
   **Attention** : Les noms des champs sont comme des noms de variables,
   ils ne doivent pas contenir d'accents. Par ailleurs, et contrairement à Oracle, MySQL est sensible à la casse (minuscules/majuscules). 
   
3. Insérez des données en utilisant l'onglet `insérer` de PhpMyAdmin.

4. Dans la suite du TD, pensez à systématiquement tester vos requêtes SQL dans PhpMyAdmin avant de les inclure dans vos pages PHP. 

### Configuration

Pour avoir un code portable, il est préférable de ne pas utiliser les
informations du serveur directement dans le code.

1. Commencez par créer un fichier `Conf.php`. Ce fichier contiendra une classe
   `Conf` possédant un  attribut statique `$databases` comme suit.
   
   <!-- Sont-ils à l'aise avec les attributs statiques ? -->

   **Notes :**

   * Où doit-on enregistrer un page Web ? (Souvenez-vous du TD précédent)
   * À moins que vous n'ayez déjà un éditeur de pages Web (qui gère au moins
   l'indentation), utilisez NetBeans. Vous trouverez les indications de bases
   sur NetBeans [dans cette note.]({{site.baseurl}}/assets/TutoNetBeans.html)
   * Qu'est-ce qu'un attribut ou une méthode **statique** ? (Cours de Programmation
   Orientée Objet de l'an dernier)

   ~~~
   <?php
   class Conf {
   
     static private $databases = array(
       // Le nom d'hote est infolimon a l'IUT
       // ou localhost sur votre machine
       'hostname' => 'a_remplir',
       // A l'IUT, vous avez une BDD nommee comme votre login
       // Sur votre machine, vous devrez creer une BDD
       'database' => 'a_remplir',
       // A l'IUT, c'est votre login
       // Sur votre machine, vous avez surement un compte 'root'
       'login' => 'a_remplir',
       // A l'IUT, c'est votre mdp (INE par defaut)
       // Sur votre machine personelle, vous avez creez ce mdp a l'installation
       'password' => 'a_remplir'
     );
   
     static public function getLogin() {
       //en PHP l'indice d'un tableau n'est pas forcement un chiffre.
       return self::$databases['login'];
     }
   
   }
   ?>
   ~~~
   {:.php}

2. Pour tester notre classe `Conf`, créons un fichier `testConf.php` que l'on
ouvrira dans le navigateur.

   **Souvenez-vous le TD dernier :** Quelle est la bonne et la mauvaise URL
   pour ouvrir une page PHP ? 
   
   ~~~
   <?php
     require 'Conf.php';     //equivalent du import en Java

     // On affiche le login de la base de donnees
     echo Conf::getLogin();
   ?>
   ~~~
   {:.php}

3. Complétez `Conf.php` avec des méthodes statiques `getHostname()`,
   `getDatabase()` et `getPassword()`. Testez ces méthodes dans `testConf.php`.
     

**Remarque :** Notez qu'en PHP, on appelle une méthode statique à partir du nom de
la classe comme en Java, mais en utilisant `::` au lieu du `.` en
Java. Souvenez-vous que les méthodes classiques (c'est-à-dire pas `static`)
s'appellent avec `->` en PHP.


### L'objet **PDO**

En PHP pour se connecter à une base de données on utilise une classe fournie
avec PHP qui s'appelle **PDO**
([Php Data Object](http://php.net/manual/fr/book.pdo.php)). Cette classe va nous
fournir de nombreuses méthodes très utiles pour manipuler n'importe quelle base
de donnée.

1. Commençons par établir une connexion à la BDD. Créez un fichier `Model.php`
   contenant une classe `Model`. Ce modèle possédera 
   * un attribut `public static $pdo` <!-- protected -->
   * une fonction `public static function Init()`.

   <!--**Souvenez-vous :** Qu'est-ce qu'un attribut `protected` ? (Cours de
   Programmation Orientée Objet de l'an dernier)-->

2. Dans la fonction `Init`, nous allons initialiser l'attribut `$pdo` en lui
   assignant un objet **PDO**. Procédons en 3 étapes :
   
   1. Mettez dans les variables `$host`, `$dbname`, `$login` et `$pass` les chaînes
   de caractères correspondant à l'hôte, au nom, au login et au mot de passe de
   notre BDD. Récupérez ces informations à l'aide des fonctions de la classe `Conf`.

   2. Pour créer la connexion à notre base de donnée, il faut utiliser le
   constructeur de **PDO** de la façon suivante
   
      ~~~
      new PDO("mysql:host=$host;dbname=$dbname",$login,$pass);
      ~~~
      {:.php}
   
      Stockez ce nouvel objet **PDO** dans la variable statique `self::$pdo`.  
      **Note :** Comme la variable est statique, elle s'accède par une syntaxe
   `Type::$nom_var` comme indiqué précédemment. Le type de l'objet courant
   s'obtient avec le mot clé `self`.

   4. Comme notre classe `Model` dépend de `Conf.php`, ajoutez un `require_once
   'Conf.php'` au début du fichier.  
   Enfin, on souhaite que `Model` soit initialisée juste après sa
   déclaration. Appelez donc l'initialisation statique `Model::Init()` à la fin
   du fichier.

2. Lorsqu'une erreur se produit, PDO n'affiche pas de message d'erreur. À la
place, il lève une exception qu'il faut donc récupérer et traiter. Placez donc
votre `new PDO(...)` au sein d'un try - catch :

   ~~~
   try{
     ... 
   } catch(PDOException $e) {
     echo $e->getMessage(); // affiche un message d'erreur
     die();
   }
   ~~~
   {:.php}
   
   Vous remarquerez que la syntaxe des exceptions en PHP est très semblable à celle
   de Java.

3. Testons dès à présent notre nouvelle classe. Créez le fichier `testModel.php`
   suivant. Vérifiez que vous obtenez bien le message lorsque vous ouvrez ce
   fichier dans le navigateur.

   ~~~
   <?php
   require_once "Model.php";
   echo "Connexion réussie !" ;
   ?>
   ~~~

4. Pour avoir plus de messages d'erreur de PDO et qu'il gère mieux l'UTF-8,
  **mettez à jour** la connexion dans `Model` avec

   ~~~
   // Connexion à la base de données            
   // Le dernier argument sert à ce que toutes les chaines de caractères 
   // en entrée et sortie de MySql soit dans le codage UTF-8
   self::$pdo = new PDO("mysql:host=$host;dbname=$dbname", $login, $pass,
                        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
   
   // On active le mode d'affichage des erreurs, et le lancement d'exception en cas d'erreur
   self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   ~~~
   {:.php}

**Remarque :** Dans cet exemple, la gestion est très brutale: En effet,
l'instruction `die();` équivaut à un système `System.exit(-1);` en Java.  
Dans un vrai site web "en production" il faudrait indiquer à l'utilisateur qu'il
a fait une erreur de saisie ou que le site est actuellement indisponible, ceci
en fonction du détail de l'exception qui est levée.  
Il est important que tout bout de codes utilisant PDO soit dans un `try` -
`catch` afin de capturer les exceptions.

**Question :** Avez-vous compris pourquoi on souhaite que la connexion à la BDD
  (stockée dans `Model::$pdo`) soit un attribut statique ?

## Opérations sur la base de données

Voyons maintenant comment les objets **PDO** servent à effectuer des requêtes SQL.

### Consulter la base de données

Commençons par la requête SQL la plus simple, celle qui lit tous les éléments
d'une table (`voiture` dans notre exemple) :

~~~
SELECT * FROM voiture
~~~
{:.sql}


1. Créez un fichier `lireVoiture.php` avec les éléments suivants

   i. Récupérons la connexion à la BDD de Model.php. Il faut donc faire un
   `require_once "Model.php"`.
   
   ii. La [fonction `query`](http://php.net/manual/fr/pdo.query.php) de l'objet
   **PDO** `Model::$pdo` prend en entrée un chaîne de caractères représentant
   une requête SQL et renvoie la réponse de la requête (sous la forme
   [d'un objet PDOStatement](http://php.net/manual/fr/class.pdostatement.php)).   
   Appelez cette fonction et stockez sa réponse dans une variable `$rep`.
   
   iii. Pour lire les réponses à des requêtes SQL, vous pouvez utiliser

   ~~~
   $tab_obj = $rep->fetchAll(PDO::FETCH_OBJ)
   ~~~
   {:.php}

   qui renvoie un tableau d'objets `tab_obj` ayant pour attributs les champs de
   la BDD.  Chacun des objets `$obj` de `$tab_obj` contient donc trois attributs
   `immatriculation`, `couleur` et `marque` (les champs de la BDD) qui sont
   accessibles classiquement par `$obj->immatriculation`, .... Utilisez une
   boucle [`foreach`](http://php.net/manual/fr/control-structures.foreach.php)
   comme au TD précédent pour itérer sur le tableau `$tab_obj`.

Utilisez cette fonction pour écrire une boucle qui affiche tous les champs de
   toutes les entrées de la table voiture.

2. Ce code fonctionne mais ne crée pas d'objets de la classe `Voiture` sur
lesquelles l'on pourrait appeler des méthodes (par exemple `afficher`).  Mettez
à jour le code de `lireVoiture.php` pour utiliser le code précédent et faire
l'affichage à l'aide de la fonction `afficher()` de `Voiture` en lisant bien les
trois points suivants :



   1. Voici comment récupérer directement un objet de la classe `Voiture`.

      ~~~
      $rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
      $tab_voit = $rep->fetchAll();
      ~~~
      {:.php}

      **Note :** La variable `$tab_voit` contient un tableau de `Voiture`. Pour afficher les
     voitures, il faudra itérer sur le tableau avec une boucle
     [`foreach`](http://php.net/manual/fr/control-structures.foreach.php).

   2. Pensez à importer la classe `Voiture` à l'aide de l'appel `require_once
      'Voiture.php';`

   3. Avec l'option `PDO::FETCH_CLASS`, PDO va créer une instance de la
   classe `Voiture`, écrire les attributs correspondants au champs de la BDD
   **puis** appeler le constructeur sans arguments.  
   **Adaptons donc l'ancien constructeur de `Voiture` pour qu'il accepte aucun
     argument et trois arguments.**

      ~~~
      public function __construct($m = NULL, $c = NULL, $i = NULL) {
        if (!is_null($m) && !is_null($c) && !is_null($i)) {
          $this->marque = $m;
          $this->couleur = $c;
          $this->immatriculation = $i;
        }
        $this->options = array();
      }
      ~~~
      {:.php}



3. Nous allons réorganiser ce code. Créez une fonction statique
   `getAllVoitures()` dans la classe `Voiture` qui ne prend pas d'arguments et
   renvoie le tableau des voitures de la BDD. Mettez à jour `lireVoiture.php`.

### Requêtes préparées
<!--et insertion d'éléments dans la base-->

<!--
Intervention sur les injections SQL avec un exemple simple
-->

Imaginez que nous avons une fonction `getVoiture($immatriculation)` codé comme
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

Remarque, il existe uen autre solution pour associer une à une les valeurs aux variables d'une requête
préparée avec la fonction [`bindParam`](http://php.net/manual/fr/pdostatement.bindparam.php) de le la classe
PDO, nous vous conseillons d'utiliser systématiquement un tableau. 

1. Copiez la fonction précédente dans `Voiture.php` et testez-là dans
`lireVoiture.php`.

2. Créez une fonction `insertVoiture()` dans la classe `Voiture` qui insère la
voiture courante dans la BDD. On vous rappelle la syntaxe SQL d'une insertion :

   ~~~
   INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)
   ~~~
   {:.sql}

   **Astuce :** Plutôt que de faire un `bindParam` par valeurs, vous pouvez créer
   un tableau contenant toutes les valeurs et le donner à la fonction `execute()`. Remarquez que les indices du tableau doivent correspondre aux noms des *tags*.
   
   ~~~
   $sql = "SELECT * from voiture WHERE immatriculation=:immat AND
                                       couleur=:couleur AND
                                       marque=:marque";
   $req_prep = Model::$pdo->prepare($sql);
   $values = array(
     "immat" => "aze13be",
     "couleur" => "bleu",
     "marque" => "Tesla"
   );
   $req_prep->execute($values);
   ~~~
   {:.php}


3. Modifier la page  `creerVoiture.php` du TD précédent de sorte qu'elle sauvegarde
l'objet `Voiture` créé.
4. Testez l'insertion grâce au formulaire du TD n°1. 
5. Vérifiez dans MYSQL que les voitures sont bien sauvegardées.

**N'oubliez-pas** de protéger tout votre code avec PDO (`getAllVoitures`, ...)
  avec des try - catch comme dans `Model`. 

### Gestion des erreurs



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

### Site de covoiturage

Reprendre les classes du TP précédent sur le covoiturage et y ajouter
la gestiond e la persistance.


<!-- Utiliser une table de jonction pour lier les utilisateurs aux trajets. -->

## Association entre utilisateurs et trajets

### Dans la base de donnée



Vous avez couvert dans le cours "Analyse, Conception et Développements
d'Applications" les diagrammes de classes. Ce type de diagramme est utile pour
penser la base de donnée d'une application web.

![Diagramme entité association](/images/logo.png)

<div class="exercise">
En fonction de votre multiplicité, comment implémenteriez-vous les deux associations entre utilisateurs et trajets dans la base de donnée ?
</div>

#### Notre solution
La relation conducteur est de multiplicité bornée, il suffit de rajouter un champs `conducteur_login` dans la table `Trajet`.

Dans la suite de ce TD, nous allons nous interesser à l'association `passager` entre utilisateurs et trajets de multiplicités non bornées. C'est-à-dire qu'on ne va pas limiter le nombre d'utilisateurs d'un trajet et inversement.

<div class="exercise">
Comment implémente-t-on cette association avec des bases de données ?
</div>

**Réponse:** <span style="color:#EEE">On utilise une table de jointure.</span>


Nous choisissons donc de créer une table `passager` qui contiendra deux champs :

* l'identifiant INT `trajet_id` d'un trajet et
* l'identifiant VARCHAR(32) `utilisateur_login` d'un utilisateur.

Pour inscrire un utilisateur à un trajet, il suffit d'écrire la ligne correspondante dans la table `passager` avec leur `utilisateur_login` et leur `trajet_id`.

<div class="exercise">
Quelle est la clé primaire de cette table ? 
</div>

**Réponse:** <span style="color:#EEE">Le couple `(trajet_id,utilisateur_login)`. Si vous choissisez `trajet_id` seul comme clé primaire, un trajet aura au plus un passager, et si vous choississez `utilisateur_login`, chaque utilisateur ne pourra être passager que sur un unique trajet.</span>

L'interclassement général de votre table sera toujours `utf8_general_ci` (c'est l'encodage des données, et donc des accents, caractères spéciaux ...).

<div class="exercise">
On souhaite que le champ `passager.trajet_id` corresponde à tout moment à un identifiant de trajet `trajet.id`. Quelle est la fonctionnalité des bases de données qui permet ceci ?
</div>

**Réponse:** <span style="color:#EEE">Il faut utiliser des clés étrangères.</span>

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

