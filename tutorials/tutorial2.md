---
title: TD2 &ndash; La persistance des données en PHP
subtitle: BDD, PDO
layout: tutorial
---

<!-- Rajouter quelques question au début du TD pour vérifier la compréhension -->

<!-- Rajouter option pour constructeur en premier avec fetch_class ? -->
<!-- Faire un constructeur à nombre d'arguments variable ...args PHP 5.6 ? -->

<!-- fetchAll(..._CLASS, "nom de la classe") -->

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

### Les bases de PHPMyAdmin

<div class="exercise">
1. Connectez vous à votre base de données MySQL, à l'aide de l'interface
PhpMyAdmin
[http://webinfo.iutmontp.univ-montp2.fr/my](http://webinfo.iutmontp.univ-montp2.fr/my)
Le login est votre login IUT et votre mot de passe initial votre numéro INE.  
(Si vous êtes sur votre machine, allez sur votre phpmyadmin à l'adresse
[http://localhost/phpmyadmin](http://localhost/phpmyadmin)).

2. Changez votre mot de passe et reloguez-vous. Si vous n'arrivez pas à vous
   logger après avoir changé le mot de passe, essayer avec un autre navigateur
   ou bien videz le cache du navigateur (`Ctrl+F5`).


   **Attention :** N'utilisez pas un de vos mots de passe usuels car
   nous allons bientôt écrire ce mot de passe dans un fichier qui sera sans
   doute vu par le professeur ou votre voisin.  
   Donc vous avez deux possibilités :

   * (**recommandé**) Créez un mot de passe aléatoire à l'aide de
     [https://www.random.org/passwords/](https://www.random.org/passwords/) par
     exemple. Écrivez dès maintenant ce mot de passe dans un fichier.
   * Ou choisissez quelque chose de simple et de pas secret.

2. Créez une table `voiture` possédant 3 champs :

   * `immatriculation` de type `VARCHAR` et de longueur maximale 8, défini comme la
     clé primaire (Index : `Primary`)
   * `marque` de type `VARCHAR` est de longueur maximale 25.
   * `couleur` de type `VARCHAR` est de longueur maximale 12.

   **Important :** Pour faciliter la suite du TD, mettez à la création de toutes
     vos tables `InnoDB` comme moteur de stockage, et `utf8_general_ci` comme
     interclassement (c’est l’encodage des données, et donc des accents,
     caractères spéciaux...).

   **Attention** : Les noms des champs sont comme des noms de variables, ils ne
   doivent pas contenir d'accents. Par ailleurs, et contrairement à Oracle,
   MySQL est sensible à la casse (minuscules/majuscules).
   
3. Insérez des données en utilisant l'onglet `insérer` de PhpMyAdmin.

4. Dans la suite du TD, pensez à systématiquement tester vos requêtes SQL dans
   PhpMyAdmin avant de les inclure dans vos pages PHP.

</div>

### Fichier de configuration en PHP

Pour avoir un code portable, il est préférable de séparer les informations du
serveur du reste du code PHP.

<div class="exercise">

1. Commençons par configurer notre éditeur de pages Web. Vous avez le choix :

   * soit vous utilisez **NetBeans**. Configurer votre premier projet en suivant
     les indications 
     [dans les compléments du TD2.]({{site.baseurl}}/assets/tut2-complement.html#créer-un-projet-avec-netbeans)
   * soit vous avez déjà un éditeur de pages Web préféré mais il **faut**
     * qu'il prenne en charge la coloration syntaxique
     * qu'il sache indenter automatiquement votre code

1. Créez un fichier `Conf.php`. Ce fichier contiendra une classe
   `Conf` possédant un attribut statique `$databases` comme suit
   (changez bien sûr les `a_remplir`).
   
   <!-- Sont-ils à l'aise avec les attributs statiques ? -->

   **Notes :**

   * Où doit-on enregistrer une page Web ? (Souvenez-vous du TD précédent)
   * Qu'est-ce qu'un attribut ou une méthode **statique** ? (Cours de Programmation
   Orientée Objet de l'an dernier ; voir aussi [les compléments]({{site.baseurl}}/assets/tut2-complement.html#les-attributs-et-méthodes-static))

   ```php
   <?php
   class Conf {
   
     static private $databases = array(
       // Le nom d'hote est webinfo a l'IUT
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
   ```

2. Pour tester notre classe `Conf`, créons un fichier `testConf.php` que l'on
ouvrira dans le navigateur.

   **Souvenez-vous le TD dernier :** Quelle est la bonne et la mauvaise URL
   pour ouvrir une page PHP ? 
   
   <!-- 
   file:// versus http://
   Toujours passer par le serveur HTTP
   -->
   
   ```php
   <?php
     // On inclut les fichiers de classe PHP avec require_once
     // pour éviter qu'ils soient inclus plusieurs fois
     require_once 'Conf.php';

     // On affiche le login de la base de donnees
     echo Conf::getLogin();
   ?>
   ```

3. Complétez `Conf.php` avec des méthodes statiques `getHostname()`,
   `getDatabase()` et `getPassword()`. Testez ces méthodes dans `testConf.php`.
     

**Remarque :** Notez qu'en PHP, on appelle une méthode statique à partir du nom de
la classe comme en Java, mais en utilisant `::` au lieu du `.` en
Java. Souvenez-vous que les méthodes classiques (c'est-à-dire pas `static`)
s'appellent avec `->` en PHP.

</div>

### Initialiser un objet `PDO`

Pour se connecter à une base de données en PHP on utilise une classe fournie
avec PHP qui s'appelle `PDO`
([Php Data Object](http://php.net/manual/fr/book.pdo.php)). Cette classe va nous
fournir de nombreuses méthodes très utiles pour manipuler n'importe quelle base
de donnée.

<div class="exercise">

1. Commençons par établir une connexion à la BDD. Créez un fichier `Model.php`
   déclarant une classe `Model`. Cette classe possédera 
   * un attribut `public static $pdo` <!-- protected -->
   * une fonction `public static function Init()`.

   <!--**Souvenez-vous :** Qu'est-ce qu'un attribut `protected` ? (Cours de
   Programmation Orientée Objet de l'an dernier)-->

2. Dans la fonction `Init`, nous allons initialiser l'attribut `$pdo` en lui
   assignant un objet `PDO`. Procédons en 3 étapes :
   
   2. Pour créer la connexion à notre base de donnée, il faut utiliser le
   [constructeur de `PDO`](http://php.net/manual/fr/pdo.construct.php) de la
   façon suivante
   
      ```php?start_inline=1
      new PDO("mysql:host=$hostname;dbname=$database_name",$login,$password);
      ```
   
      Stockez ce nouvel objet `PDO` dans la variable statique `self::$pdo`.  
      **Explication :** Comme la variable est statique, elle s'accède par une syntaxe
   `Type::$nom_var` comme indiqué précédemment. Le type de l'objet courant
   s'obtient avec le mot clé `self`.

   1. Le code précédent a besoin que les variables `$hostname`,
   `$database_name`, `$login` et `$password` contiennent les chaînes
   de caractères correspondant à l'hôte, au nom, au login et au mot de
   passe de notre BDD. Créez donc ces variables avant le `new PDO` en
   récupérant les informations à l'aide des fonctions de la classe
   `Conf`.
   
   4. Comme notre classe `Model` dépend de `Conf.php`, ajoutez un `require_once
   'Conf.php'` au début du fichier.

   5. Enfin, on souhaite que `Model` soit initialisée juste après sa
   déclaration. Appelez donc l'initialisation statique `Model::Init()` à la fin
   du fichier.
   
   6. Testons dès à présent notre nouvelle classe. Créez le fichier
   `testModel.php` suivant. Vérifiez que l'exécution de `testModel.php` ne donne
   pas de messages d'erreur.

   ```php
   <?php
   require_once "Model.php";
   echo "Connexion réussie !" ;
   ?>
   ```


</div>
<br>
Nous allons maintenant améliorer la gestion des erreurs de `PDO`.


<div class="exercise">

2. Lorsqu'une erreur se produit, `PDO` lève une exception qu'il faut donc
récupérer et traiter. Placez donc votre `new PDO(...)` au sein d'un try - catch
:

   ```php?start_inline=1
   try{
     ... 
   } catch(PDOException $e) {
     echo $e->getMessage(); // affiche un message d'erreur
     die();
   }
   ```
   
   Vous remarquerez que la syntaxe des exceptions en PHP est très semblable à celle
   de Java.
   
   **Remarque :** Dans cet exemple, la gestion est très brutale: En effet,
   l'instruction `die();` équivaut à un système `System.exit(1);` en Java.  
   Dans un vrai site web "en production" il faudrait indiquer à l'utilisateur
   qu'il a fait une erreur de saisie ou que le site est actuellement
   indisponible, ceci en fonction du détail de l'exception qui est levée.  
   Il est important que toutes lignes de codes utilisant `PDO` soit dans un `try` -
   `catch` afin de capturer les exceptions.

4. Pour avoir plus de messages d'erreur de `PDO` et qu'il gère mieux l'UTF-8,
  **mettez à jour** la connexion dans `Model` avec

   ```php?start_inline=1
   // Connexion à la base de données            
   // Le dernier argument sert à ce que toutes les chaines de caractères 
   // en entrée et sortie de MySql soit dans le codage UTF-8
   self::$pdo = new PDO("mysql:host=$hostname;dbname=$database_name", $login, $password,
                        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
   
   // On active le mode d'affichage des erreurs, et le lancement d'exception en cas d'erreur
   self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   ```

**Question :** Avez-vous compris pourquoi il est préférable que la connexion à la BDD
  (stockée dans `Model::$pdo`) soit un attribut statique ?

<!-- Réponse : Pour s'assurer de ne créer la connexion à la BDD qu'une fois. En
effet, un attribut statique est associé à la classe, donc il ne peut y avoir
qu'un Model::$pdo -->

</div>

## Opérations sur la base de données

Voyons maintenant comment les objets `PDO` servent à effectuer des requêtes
SQL. Nous allons nous servir de deux méthodes fournies par `PDO` :

1. La [méthode `query($SQL_request)`](http://php.net/manual/fr/pdo.query.php) de
la classe `PDO`
   * prend en entrée une requête SQL (chaîne de
   caractères)
   * et renvoie la réponse de la requête dans une représentation interne pas
     immédiatement lisible
     ([un objet `PDOStatement`](http://php.net/manual/fr/class.pdostatement.php)).

2. La
   [méthode `fetchAll($fetch_style)`](http://php.net/manual/fr/pdostatement.fetchall.php)   
   de la classe `PDOStatement` s'appelle sur les réponses de requêtes et renvoie
   la réponse de la requête dans un format lisible par PHP. Plus précisément,
   elle renvoie un tableau d'entrée SQL, chaque entrée étant formattée comme un
   tableau ou un objet.  
   
   Le choix du format se fait avec la
   [variable `$fetch_style`](http://php.net/manual/fr/pdostatement.fetch.php#refsect1-pdostatement.fetch-parameters). Les formats les plus communs sont :

   * `PDO::FETCH_ASSOC` : Chaque entrée SQL est un tableau indexé par les noms
     des champs de la table de la BDD ;

   * `PDO::FETCH_OBJ` : Chaque entrée SQL est un objet dont les noms d'attributs
     sont les noms des champs de la table de la BDD ;

   * `PDO::FETCH_CLASS` : De même que `PDO::FETCH_OBJ`, chaque entrée SQL est un
     objet dont les noms d'attributs sont les noms des champs de la table de la
     BDD. Cependant, on peut dans ce cas spécifier le nom de la classe des
     objets. Pour ce faire, il faut avoir au préalable déclaré le nom de la
     classe avec la commmande suivante :

     ```php?start_inline=1
     $pdo_stmt->setFetchMode( PDO::FETCH_CLASS, 'class_name');
     ```

     **Note :** Plus précisément, `PDO` va dans l'ordre créer une instance de la
       classe demandée, écrire les attributs correspondants au champs de la BDD
       **puis** appeler le constructeur *sans arguments*.


### Faire une requête SQL sans paramètres

Commençons par la requête SQL la plus simple, celle qui lit tous les éléments
d'une table (`voiture` dans notre exemple) :

```sql
SELECT * FROM voiture
```

<div class="exercise">

1. Créez un fichier `lireVoiture.php`

2. Incluez le fichier contenant la classe `Model` pour pouvoir se connecter à la
   BDD.
   <!-- require_once "Model.php"; -->
   
3. Appelez la fonction `query` de l'objet `PDO` `Model::$pdo` en lui donnant
   la requête SQL. Stockez sa réponse dans une variable `$rep`.

4. Comme expliqué précédemment, pour lire les réponses à des requêtes SQL, vous
   pouvez utiliser

   ```php?start_inline=1
   $tab_obj = $rep->fetchAll(PDO::FETCH_OBJ)
   ```

   qui renvoie un tableau d'objets `tab_obj` ayant pour attributs les champs de
la BDD.  Chacun des objets `$obj` de `$tab_obj` contient donc trois attributs
`immatriculation`, `couleur` et `marque` (les champs de la BDD) qui sont
accessibles classiquement par `$obj->immatriculation`, ....

   **Utilisez la fonction `fetchAll`** pour afficher toutes les
voitures. Servez-vous d'une boucle
[`foreach`](http://php.net/manual/fr/control-structures.foreach.php) comme au TD
précédent pour itérer sur le tableau `$tab_obj`.

</div>
<br>
Ce code fonctionne mais ne crée pas d'objets de la classe `Voiture` sur
lesquelles l'on pourrait appeler des méthodes (par exemple `afficher`).

<div class="exercise">

Nous allons mettre à jour le code de `lireVoiture.php` pour
faire l'affichage à l'aide de la fonction `afficher()` de `Voiture`.

Comme expliqué précédemment, vous pouvez récupérer directement un objet de la
classe `Voiture` avec

```php?start_inline=1
$rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
$tab_voit = $rep->fetchAll();
```


2. Incluez le fichier de la classe `Voiture` pour pouvoir l'utiliser ;

3. Avec l'option `PDO::FETCH_CLASS`{: #majconst}, `PDO` va créer une instance de la
classe `Voiture`, écrire les attributs correspondants au champs de la BDD
**puis** appeler le constructeur sans arguments.  
**Adaptons donc l'ancien constructeur de `Voiture` pour qu'il accepte aussi un
  appel sans arguments (en plus d'un appel avec trois arguments).**

   ```php?start_inline=1
   // La syntaxe ... = NULL signifie que l'argument est optionel
   // Si un argument optionnel n'est pas fourni,
   //   alors il prend la valeur par défaut, NULL dans notre cas
   public function __construct($m = NULL, $c = NULL, $i = NULL) {
     if (!is_null($m) && !is_null($c) && !is_null($i)) {
	   // Si aucun de $m, $c et $i sont nuls,
	   // c'est forcement qu'on les a fournis
	   // donc on retombe sur le constructeur à 3 arguments
       $this->marque = $m;
       $this->couleur = $c;
       $this->immatriculation = $i;
     }
   }
   ```

3. Vous pouvez maintenant appeler `fetchAll` dans `lireVoiture.php` et faire
   l'affichage à l'aide de la méthode `afficher()`.

   **Note :** La variable `$tab_voit` contient un tableau d'objets de classe
   `Voiture`. Pour afficher les voitures, il faudra itérer sur le tableau avec une
   boucle [`foreach`](http://php.net/manual/fr/control-structures.foreach.php).

</div>
<div class="exercise">

Nous allons maintenant isoler le code qui retourne toutes les voitures et en faire une méthode de `Voiture`.

1. Créez une fonction statique
   `getAllVoitures()` dans la classe `Voiture` qui ne prend pas d'arguments et
   renvoie le tableau des voitures de la BDD.

2. Mettez à jour `lireVoiture.php` pour appeler directement cette nouvelle fonction.

</div>

### Gestion des erreurs (suite)

Dans un site en production, pour des raisons de sécurité et de confort
d'utilisation, il est déconseillé d'afficher directement un message d'erreur. Pour
cela on va créer une variable pour activer ou désactiver l'affichage des
messages d'erreurs.

<div class="exercise">

Dans la classe `Conf`, ajouter un attribut statique `debug` et son getter
publique.

```php
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
```
   
Ainsi on peut modifier les messages d'erreurs dans les `catch`.
   
```php?start_inline=1
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
```
   
</div>

## Site de covoiturage

Appliquez ce que l'on a fait pendant ce TD aux classes `Trajet` et `Utilisateur`
du TP précédent (exercice sur le covoiturage) :

1. Modifiez les constructeurs pour accepter aussi zéro paramètre ;

1. Dans votre PhpMyAdmin, créez une table `utilisateur` avec les champs suivants :
   * `login` : VARCHAR 32, clé primaire
   * `nom` : VARCHAR 32
   * `prenom` : VARCHAR 32

   **Important :** Avez-vous bien pensé à `InnoDB` et `utf8_general_ci` comme précédemment ?

1. Insérez quelques utilisateurs.

2. Créez une table `trajet` avec les champs suivants :
   * `id` : INT, clé primaire, qui s'auto-incrémente (voir en dessous)
   * `depart` : VARCHAR 32
   * `arrivee` : VARCHAR 32
   * `date` : DATE
   * `nbplaces` : INT
   * `prix` : INT
   * `conducteur_login` : VARCHAR 32
   
   **Note :** On souhaite que le champ primaire `id` s'incrémente à chaque
   nouvelle insertion dans la table.  Pour ce faire, sélectionnez cochez la case
   `A_I` (auto-increment) pour le champ `id`.


2. Insérez quelques trajets en prenant soin de ne pas remplir la case `id` (pour
   que l'auto-incrément marche) et en mettant dans `conducteur_login` des login
   d'utilisateurs valides (pour éviter des problèmes par la suite).

1. Créez les fonctions statiques `getAllTrajets()` et `getAllUtilisateurs()` qui listent
   tous les trajets / utilisateurs.
