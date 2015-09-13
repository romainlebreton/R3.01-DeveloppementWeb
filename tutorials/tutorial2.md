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
comme lors d'une compilation.  Il est donc conseillé de tester régulièrement
chaque nouvelle partie de code.


## Connexion à la base de données

1. Connectez vous à votre base de données MySQL, à l'aide de l'interface PhpMyAdmin
[http://infolimon.iutmontp.univ-montp2.fr/my](http://infolimon.iutmontp.univ-montp2.fr/my)

2. Changez votre mot de passe en quelque chose de simple et pas secret. En
   effet, vous devrez bientôt écrire ce mot de passe en clair dans un fichier.

2. Créez une table `voiture` possédant 3 champs :

   * `immatriculation` de type `VARCHAR` et de longueur maximale 8, défini comme la
     clé primaire
   * `marque` de type `VARCHAR` est de longueur maximale 25.
   * `couleur` de type `VARCHAR` est de longueur maximale 12.
   
   **Attention** : Les noms des champs sont comme des noms de variables,
   ils ne doivent pas contenir d'accents.
   
3. Insérez des données en utilisant l'onglet `insérer` de PhpMyAdmin.

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
       // Sur votre machine, vous avez creez ce mdp a l'installation
       'password' => 'a_remplir'
     );
   
     static public function getLogin() {
       //en PHP l'indice d'un tableau n'est pas forcement un chiffre.
       return self::$databases['login'];  //idem self::$databases[1]; 
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
avec PHP qui s'appelle **PDO** (Php Database Object). Cette classe va nous
fournir de nombreuses méthodes très utiles pour manipuler n'importe quelle base
de donnée.

1. Commençons par établir une connexion à la BDD. Créez un fichier `Model.php`
   contenant une classe `Model`. Ce modèle possèdera 
   * un attribut `protected static $pdo`
   * une fonction `public static function Init()`.

   **Souvenez-vous :** Qu'est-ce qu'un attribut `protected` ? (Cours de
   Programmation Orientée Objet de l'an dernier)

2. Dans la fonction `Init`, nous allons initialiser l'attribut `$pdo` en lui
   assignant un objet **PDO**. Procédons en 4 étapes :
   
   1. Mettez dans les variables `$host`, `$dbname`, `$login` et `$pass` les chaînes
   de caractères correspondant à l'hôte, au nom, au login et au mot de passe de
   notre BDD. Récupérez ces informations à l'aide des fonctions de `Conf.php`.

   2. Pour créer la connexion à notre base de donnée, il faut utiliser le
   constructeur de **PDO** de la façon suivante
   
      ~~~
      new PDO("mysql:host=$host;dbname=$dbname",$login,$pass);
      ~~~
      {:.php}
   
   3. Stockez ce nouvel objet **PDO** dans la variable statique `$pdo`.  
   **Note :** Comme la variable est statique, elle s'accède par une syntaxe
   `Type::$nom_var` comme indiqué précédemment. Le type de l'object courant
   s'obtient avec le mot clé `self`.

   4. Comme notre classe `Model` dépend de `Conf.php`, ajoutez un `require_one
   Conf.php` au début du fichier.  
   Enfin, on souhaite que `Model` soit initialisée juste après sa
   déclaration. Appelez donc l'initialisation statique `Model::Init()` à la fin
   du fichier.

2. Lorsqu'une erreur se produit, PDO n'affiche pas de message d'erreur, à la
place, il lève une exception. Il faut donc la récupérer et la traiter. Placez donc votre `new PDO(...)` au sein d'un try - catch :

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
   echo "Connection réussie !" ;
   ?>
   ~~~



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

<!-- Créer directement un objet de classe Voiture -->

1. Créez un fichier `lireVoiture.php` avec les éléments suivants

i. Récupérons la connection à la BDD de Model.php. Il faut donc faire un
`require_once "Model.php"`.  ii. La fonction `query` de l'objet **PDO**
`Model::$pdo` prend en entrée un chaîne de caractères représentant une requête
SQL et renvoie la réponse de la requête (sous la forme d'un objet **PDO???**).  

Appelez cette fonction et stockez sa réponse dans une variable `$rep`.

Référence : [Documentation de query](http://www.php.net/ ... )

iii. Pour lire les réponses à des requêtes SQL, nous disposons des fonctions `fetch`

Testez le code suivant dans `lireVoiture.php`.

~~~
<?php
  try{
    $pdo = new PDO('mysql:host=serveur_base_donnee;dbname=nom_base_donnee','login', 'password');
    //$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
   }catch(PDOException $e){
      echo $e->getMessage(); // affiche un message d'erreur
      die();
   }

   $sql = 'SELECT * FROM voiture'; // requete SQL

   try{
      $req = $pdo->query($sql); // execute le requete sql
      
      // On teste si le resultat est non vide
      if($req->rowCount() != 0){
        while($data = $req->fetch(PDO::FETCH_OBJ)){
          echo 'immatriculation : '.$data->immatriculation.' ; marque : '.$data->marque.' ; couleur : '.$data->couleur;
        }
      }
   }catch(PDOException $e){
      echo $e->getMessage();
   }
?>
~~~
{:.php}

Ce code fonctionne mais ne crée pas d'objets de la classe voiture sur lesquelles
l'on pourrait appeler des méthodes.

1. Vous allez donc créer une méthode statique (voir la Section \ref{sec:conf}
pour plus de détails sur les méthodes statiques) `getAllVoitures()` dans la
classe `Voiture` qui retourne un tableau contenant toutes les voitures présentes
dans la base.
1. Créer une méthode statique `getVoiture($immatriculation)` qui renvoie
   une voiture suivant le numéro d'immatriculation donné en paramètre.

### Requêtes préparées et insertion d'éléments dans la base

PDO fonctionne uniquement que par l'utilisation de requêtes préparées. Pour
insérer une données dans la base, au lieu d'écrire la requête en utilisant les
variables, on va utiliser des tags.

~~~
<?php
  $req = $pdo->prepare('INSERT INTO voiture (immatriculation, marque, couleur) VALUE
              (:immatriculation, :marque, :couleur)');
?>
~~~
{:.php}

<!--
Faire des bind pour bien expliquer le mécanisme de protection
ie que PDO transforme en un type donné
Où force-t-on que ce sont des données html 'safe'
-->

On exécute le requête en appelant la méthode `execute` de `$req` et en lui
donnant un tableau contenant les données.  Il est important que les clés du
tableau soit les mêmes que les tags utilisés dans la construction de la requête.

Au final, on obtient le code suivant :

~~~
<?php
  try{
    // Preparation de la requete
    $req = $pdo->prepare('INSERT INTO voiture (immatriculation, marque, couleur) VALUES 
         (:immatriculation, :marque, :couleur)');
    
    // Donnees a inserer
    $data = array(
      'immatriculation'    => '256AB34',
      'marque' => 'Renaut',
      'couleur'  => 'Bleu'
      );

    // execution de la requete
    $req->execute($data);

  } catch(PDOException $e){
       echo $e->getMessage();
  }
?>
~~~
{:.php}

L'utilisation des requêtes préparées est importante d'un point de vue sécurité,
on se prévient ainsi des attaques par injections SQL (qui seront abordées plus
tard dans un TD sur la sécurisation des sites).

1. Ajouter une méthode `save()` à la classe  `voiture`
1. Modifier la page  `creerVoiture.php` du TD précédent de sorte qu'elle sauvegarde
l'objet voiture crée.  
1. Testez l'insertion grâce au formulaire du TD n°1. 
1. Vérifiez dans MYSQL que les voitures sont bien sauvegardées. 

### Héritage

Toutes les classes de votre site de covoiturage doivent désormais implémenter la
persistance.  Vous noterez quelles partagent toutes l'accès à une base de
données.  Pour factoriser au maximum notre code, nous allons créer une classe
`Model` qui va gérer la connexion à la base de données.  Toutes les classes
voulant se connecter à la base devront hériter de `Model`.

Exemple d'héritage en PHP : 

~~~
<?php
  class Vehicule {
    private $nbRoue;

    public function getNbRoue(){
      echo $this->nbRoue;
    }
  }

  class Voiture extends Vehicule {

    __construct(){
     //appelle le constructeur de la classe mere	
      parent::__construct();  //equivalent du super() en Java
      $this->nbRoue = 4;
    }
  }

  $v = new Voiture();

 	
  // Affiche le noubre de roue d'une voiture en utilisant la methode de la classe mere.
  public function affiche() {
	  echo $v->getNbRoue().' roues.';
  }
?>
~~~
{:.php}

1. Créer une classe `Model` qui se connecte à la base de données lors de sa
   construction et stocke la connexion dans un attribut publique statique.
   1. Modifier votre code pour que la classe `Voiture` hérite de `Model`.

<!-- Expliquez pourquoi on veut un $pdo statique -->

### Site de covoiturage

Reprendre les classes du TP précédent sur le covoiturage et y ajouter
l'utilisation d'une base de données.

Chaque utilisateur sera identifié par un id, de même pour chaque trajet. Utiliser une table de jonction pour lier les utilisateurs aux trajets.

### Gestion des erreurs

Dans un site en production, pour des raisons de sécurité et de confort
d'utilisation, il déconseillé d'afficher directement un message d'erreur. Pour
cela on va créer une variable pour activer ou désactiver l'affichage des
messages d'erreurs.

<!-- Rajouter
self::$pdo = new PDO("mysql:host=$host;dbname=$dbname", $login, $pass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
// On active le mode d'affichage des erreurs, et le lancement d'exception en cas d'erreur
self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
-->

1. Dans la classe `Conf`, ajouter un attribut  statique `debug` et son getter publique. 

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
