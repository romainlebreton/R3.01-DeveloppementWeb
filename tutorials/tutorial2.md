---
title: TD2 &ndash; La persistance des données en PHP
subtitle: Base de données, PDO
layout: tutorial
lang: fr
---

<!-- Rajouter quelques question au début du TD pour vérifier la compréhension -->

<!-- Rajouter option pour constructeur en premier avec fetch_class ? -->
<!-- Faire un constructeur à nombre d'arguments variable ...args PHP 5.6 ? -->

<!-- fetchAll(..._CLASS, "nom de la classe") -->

Dans le TD1 vous avez appris à créer des classes et à instancier des objets de
ces classes. Mais, comme vous l'avez constaté, la durée de vie des objets ainsi
créés ne dépassait pas la durée de l'exécution du programme.

Dans ce TD, nous allons apprendre à rendre les objets persistants, en les
sauvegardant dans une base de données. Ainsi, il sera possible de retrouver les
objets d'une visite à l'autre du site web.


## Connexion à la base de données

### Les bases de PhpMyAdmin

<div class="exercise">
1. Connectez vous à votre base de données MySQL, à l'aide de l'interface
   PhpMyAdmin
   [http://webinfo.iutmontp.univ-montp2.fr/my](http://webinfo.iutmontp.univ-montp2.fr/my)
   Le login est votre login IUT et votre mot de passe initial est votre numéro INE.  
   **Si cela ne marche pas**, c'est que vous n'êtes probablement pas inscrit administrativement. Dans ce cas, demandez à votre chargé de TD ou allez voir le service informatique (même bureau que le secrétariat au bâtiment 4).
   

2. Changez votre mot de passe (Page d'accueil > Paramètres généraux > Modifier le mot de passe) et reconnectez-vous.
   Si vous n'arrivez pas à vous
   connecter après avoir changé le mot de passe, essayer avec un autre navigateur
   ou bien videz le cache du navigateur (`Ctrl+F5`).


   **Attention :** N'utilisez pas un de vos mots de passe usuels, car
   nous allons bientôt écrire ce mot de passe dans un fichier qui sera sans
   doute vu par le professeur ou votre voisin.  
   Donc vous avez deux possibilités :

   * (**recommandé**) Créez un mot de passe aléatoire à l'aide de
     [https://www.random.org/passwords/](https://www.random.org/passwords/) par
     exemple. Écrivez dès maintenant ce mot de passe dans un fichier.
   * Ou choisissez quelque chose de simple et de pas secret.

2. Créez une table `utilisateur` (sans majuscule) possédant 3 champs :

   * `loginBaseDeDonnees` de type `VARCHAR` et de longueur maximale 64, défini comme la
     clé primaire (Index : `Primary`)
   * `nomBaseDeDonnees` de type `VARCHAR` est de longueur maximale 64.
   * `prenomBaseDeDonnees` de type `VARCHAR` est de longueur maximale 64.

   **Important :** Pour faciliter la suite du TD, mettez à la création de toutes
     vos tables `InnoDB` comme moteur de stockage, et `utf8_general_ci` comme
     interclassement (c’est l’encodage des données, et donc des accents,
     caractères spéciaux...).

   **Attention** : Les noms des champs sont comme des noms de variables, ils ne
   doivent pas contenir d'accents. Par ailleurs, et contrairement à Oracle,
   MySQL est sensible à la casse (minuscules/majuscules).
   
3. Insérez des données en utilisant l'onglet `Insérer` de PhpMyAdmin.

4. Dans la suite du TD, pensez à systématiquement tester vos requêtes SQL dans
   PhpMyAdmin avant de les inclure dans vos pages PHP.

</div>

### Fichier de configuration en PHP

Pour avoir un code portable, il est préférable de séparer les informations du
serveur du reste du code PHP.

<div class="exercise">

<!-- 1. Commençons par configurer notre éditeur de pages Web. Vous avez le choix : -->

<!--    * soit vous utilisez **NetBeans**. Configurer votre premier projet en suivant -->
<!--      les indications  -->
<!--      [dans les compléments du TD2.]({{site.baseurl}}/assets/tut2-complement.html#créer-un-projet-avec-netbeans) -->
<!--    * soit vous avez déjà un éditeur de pages Web préféré, comme *SublimeText*, -->
<!--      mais il **faut** -->
<!--      * qu'il prenne en charge la coloration syntaxique -->
<!--      * qu'il sache indenter automatiquement votre code -->

1. Créez un fichier `ConfigurationBaseDeDonnees.php`. Ce fichier contiendra une classe
   `ConfigurationBaseDeDonnees` possédant un attribut statique `$configurationBaseDeDonnees` comme suit
   (changez bien sûr les `a_remplir`).
   
   <!-- Sont-ils à l'aise avec les attributs statiques ? -->

   **Notes :**

   * Où doit-on enregistrer une page Web ? (Souvenez-vous du TD précédent)
   * Qu'est-ce qu'un attribut ou une méthode **statique** ? (Cours de Programmation
   Orientée Objet de l'an dernier ; voir aussi [les compléments]({{site.baseurl}}/assets/tut2-complement.html#les-attributs-et-méthodes-static))

   ```php
   <?php
   class ConfigurationBaseDeDonnees {
   
     static private array $configurationBaseDeDonnees = array(
       // Le nom d'hote est webinfo a l'IUT
       // ou localhost sur votre machine
       // 
       // ou webinfo.iutmontp.univ-montp2.fr
       // pour accéder à webinfo depuis l'extérieur
       'nomHote' => 'a_remplir',
       // A l'IUT, vous avez une base de données nommee comme votre login
       // Sur votre machine, vous devrez creer une base de données
       'nomBaseDeDonnees' => 'a_remplir',
       // À l'IUT, le port de MySQL est particulier : 3316
       // Ailleurs, on utilise le port par défaut : 3306
       'port' => 'a_remplir',
       // A l'IUT, c'est votre login
       // Sur votre machine, vous avez surement un compte 'root'
       'login' => 'a_remplir',
       // A l'IUT, c'est le même mdp que PhpMyAdmin
       // Sur votre machine personelle, vous avez creez ce mdp a l'installation
       'motDePasse' => 'a_remplir'
     );
   
     static public function getLogin() : string {
       // L'attribut statique $configurationBaseDeDonnees 
       // s'obtient avec la syntaxe ConfigurationBaseDeDonnees::$configurationBaseDeDonnees 
       // au lieu de $this->configurationBaseDeDonnees pour un attribut non statique
       return ConfigurationBaseDeDonnees::$configurationBaseDeDonnees['login'];
     }
   
   }
   ?>
   ```

2. Pour tester notre classe `ConfigurationBaseDeDonnees`, créons un fichier `testConfigurationBaseDeDonnees.php` que l'on
ouvrira dans le navigateur.

   **Souvenez-vous le TD dernier :** Quelle est la bonne et la mauvaise URL
   pour ouvrir une page PHP ? 
   
   <!-- 
   file:// versus http://
   Toujours passer par le serveur HTTP
   -->
   
   ```php
   <?php
     // On inclut les fichiers de classe PHP pour pouvoir se servir de la classe ConfigurationBaseDeDonnees. 
     // require_once évite que ConfigurationBaseDeDonnees.php soit inclus plusieurs fois, 
     // et donc que la classe ConfigurationBaseDeDonnees soit déclaré plus d'une fois. 
     require_once 'ConfigurationBaseDeDonnees.php';

     // On affiche le login de la base de donnees
     echo ConfigurationBaseDeDonnees::getLogin();
   ?>
   ```

3. Complétez `ConfigurationBaseDeDonnees.php` avec des méthodes statiques `getNomHote()`, `getPort()`,
   `getNomBaseDeDonnees()` et `getPassword()`. Testez ces méthodes dans `testConfigurationBaseDeDonnees.php`.
     

   **Remarque :** Notez qu'en PHP, on appelle une méthode statique à partir du nom de
   la classe comme en Java, mais en utilisant `::` au lieu du `.` en
   Java. Souvenez-vous que les méthodes dynamiques (c'est-à-dire pas `static`)
   s'appellent avec `->` en PHP.

1. Enregistrez votre travail à l'aide de `git add` et `git commit`. Nous
   comptons sur vous pour penser à faire cet enregistrement régulièrement.
</div>

### Initialiser un objet `PDO`

Pour se connecter à une base de données en PHP on utilise une classe fournie
avec PHP qui s'appelle `PDO`
([Php Data Object](http://php.net/manual/fr/book.pdo.php)). Cette classe va nous
fournir de nombreuses méthodes très utiles pour manipuler n'importe quelle base
de donnée.

<div class="exercise">

1. Commençons par établir une connexion à la base de données. Créez un fichier `ConnexionBaseDeDonnees.php`
   déclarant une classe `ConnexionBaseDeDonnees`, qui possédera 
   * un attribut `private PDO $pdo`,
   * un constructeur sans argument qui ne fait rien pour l'instant (à générer avec PhpStorm),
   * un accesseur (getter) `getPdo()` à l'attribut `$pdo` (à générer avec PhpStorm). 

2. Dans le constructeur, nous allons initialiser l'attribut `$pdo` en lui
   assignant un objet `PDO`. Procédons par étapes :
   
   1. Pour créer la connexion à notre base de donnée, il faut utiliser le
   [constructeur de `PDO`](http://php.net/manual/fr/pdo.construct.php) de la
   façon suivante
   
      ```php?start_inline=1
      new PDO("mysql:host=$nomHote;port=$port;dbname=$nomBaseDeDonnees",$login,$motDePasse);
      ```
   
      Stockez ce nouvel objet `PDO` dans l'attribut `$pdo`.

   1. Le code précédent a besoin que les variables `$nomHote`, `$port`,
   `$nomBaseDeDonnees`, `$login` et `$motDePasse` contiennent les chaînes
   de caractères correspondant à l'hôte, au nom, au login et au mot de
   passe de notre base de données. Créez donc ces variables avant le `new PDO` en
   récupérant les informations à l'aide des fonctions de la classe
   `ConfigurationBaseDeDonnees`.
   
   4. Comme notre classe `ConnexionBaseDeDonnees` dépend de `ConfigurationBaseDeDonnees.php`, ajoutez un `require_once 'ConfigurationBaseDeDonnees.php'` 
   au début du fichier.

   6. Testons dès à présent notre nouvelle classe. Créez le fichier
   `testConnexionBaseDeDonnees.php` suivant. Vérifiez que l'exécution de `testConnexionBaseDeDonnees.php` ne donne
   pas de messages d'erreur.

      ```php
      <?php
      require_once "ConnexionBaseDeDonnees.php";

      // On affiche un attribut de PDO pour vérifier  que la connexion est bien établie.
      // Cela renvoie par ex. "webinfo.iutmontp.univ-montp2.fr via TCP/IP"
      // mais surtout pas de message d'erreur
      // SQLSTATE[HY000] [1045] Access denied for user ... (mauvais mot de passe)
      // ou
      // SQLSTATE[HY000] [2002] php_network_getaddresses: getaddrinfo failed (mauvais nom d'hôte)
      $model = new ConnexionBaseDeDonnees();
      echo $model->getPdo()->getAttribute(PDO::ATTR_CONNECTION_STATUS);
      ?>
      ```
</div>

#### Patron de conception *Singleton*

Comme cela n'a pas de sens d'avoir plusieurs connexions à la base de données, nous allons utiliser le patron de conception *Singleton*. Il sert à assurer qu'il n'y ait qu’une et une seule instance possible de la classe `ConnexionBaseDeDonnees` dans l'application (et donc une seule connexion).

Voici le squelette d'un singleton :

```php?start_inline=1
class ConnexionBaseDeDonnees {
    private static $instance = null;

    private PDO $pdo;

    public static function getPdo(): PDO {
        return ConnexionBaseDeDonnees::getInstance()->pdo;
    }

    private function __construct () {
        // Code du constructeur
    }

    // getInstance s'assure que le constructeur ne sera 
    // appelé qu'une seule fois.
    // L'unique instance crée est stockée dans l'attribut $instance
    private static function getInstance() : ConnexionBaseDeDonnees {
        // L'attribut statique $pdo s'obtient avec la syntaxe ConnexionBaseDeDonnees::$pdo 
        // au lieu de $this->pdo pour un attribut non statique
        if (is_null(ConnexionBaseDeDonnees::$instance))
            // Appel du constructeur
            ConnexionBaseDeDonnees::$instance = new ConnexionBaseDeDonnees();
        return ConnexionBaseDeDonnees::$instance;
    }
}
```

**Remarque :** Quand un attribut est statique, il s'accède par une syntaxe
  `NomClasse::$nomVar` comme indiqué précédemment. 

<div class="exercise">

1. Mettez à jour votre classe `ConnexionBaseDeDonnees` pour qu'elle suive le design pattern *Singleton*.
2. Mettez à jour `testConnexionBaseDeDonnees.php` et vérifiez que tout marche bien.
3. Pour que PhpStorm comprenne que `ConnexionBaseDeDonnees::getPdo()` renvoie un objet de la classe `PDO`,
   et qu'il puisse nous proposer l'autocomplétion des méthodes de cette classe, nous devons déclarer
   le type de retour.  
   Si ce n'est pas déjà fait, **déclarez** que l'attribut `$pdo` et la valeur de retour de `ConnexionBaseDeDonnees::getPdo()` sont de type
   `PDO`.  
   **Vérifiez** que l'autocomplétion de PhpStorm s'est améliorée dans `testConnexionBaseDeDonnees.php`.

4. **Déclarez** que l'attribut `$instance` et la valeur de retour de `ConnexionBaseDeDonnees::getInstance()` sont de type
   `ConnexionBaseDeDonnees`.  
   L'IDE indique un problème : L'attribut `$instance` est initialisé à `null`, qui n'est pas de type
   `ConnexionBaseDeDonnees` en PHP (contrairement à Java), mais de type `null`.  
   **Corrigez** ce problème en indiquant le type `?ConnexionBaseDeDonnees` pour l'attribut `$instance`. En effet, `?ConnexionBaseDeDonnees` est un raccourci pour le type `ConnexionBaseDeDonnees|null`, qui veut dire `ConnexionBaseDeDonnees` ou `null`.

</div>

#### Gestion des erreurs 

Nous allons maintenant améliorer la gestion des erreurs de `PDO`.

<div class="exercise">

<!-- 
https://phpdelusions.net/pdo dit d'enlever les try-catch
sauf eventuellement pour le new PDO() dont le message donne les identifiants.

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
   Dans un vrai site web "en production", il faudrait indiquer à l'utilisateur
   qu'il a fait une erreur de saisie ou que le site est actuellement
   indisponible, ceci en fonction du détail de l'exception qui est levée.  
   Il est important que toutes lignes de codes utilisant `PDO` soit dans un `try` -
   `catch` afin de capturer les exceptions. -->

Pour avoir plus de messages d'erreur de `PDO` et qu'il gère mieux l'UTF-8,
**mettez à jour** la connexion dans `ConnexionBaseDeDonnees` en remplaçant `$this->pdo = new PDO(...);` par

```php?start_inline=1
// Connexion à la base de données            
// Le dernier argument sert à ce que toutes les chaines de caractères 
// en entrée et sortie de MySql soit dans le codage UTF-8
$this->pdo = new PDO("mysql:host=$nomHote;port=$port;dbname=$nomBaseDeDonnees", $login, $motDePasse,
                     array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));

// On active le mode d'affichage des erreurs, et le lancement d'exception en cas d'erreur
$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

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
   [méthode `fetch()`](http://php.net/manual/fr/pdostatement.fetch.php)
   de la classe `PDOStatement` s'appelle sur les réponses de requêtes et renvoie
   la réponse de la requête dans un format lisible par PHP. Plus précisément,
   elle renvoie une entrée SQL formatée comme un tableau. Ce tableau est indexé par les noms
   des champs de la table de données, et aussi par les numéros des champs. 
   Les valeurs du tableau sont celles de l'entrée SQL.

### Faire une requête SQL sans paramètres

Commençons par la requête SQL la plus simple, celle qui lit tous les éléments
d'une table (`utilisateur` dans notre exemple) :

```sql
SELECT * FROM utilisateur
```

<!-- 
TODO:
pdoStatement->fetch() donc PDO::FETCH_BOTH par défaut
qui retourne un tableau indexé par les noms de colonnes et aussi par les numéros de colonnes, commençant à l'index 0, comme retournés dans le jeu de résultats
  -->

<div class="exercise">
1. Créez un fichier `lireUtilisateur.php`

2. Incluez le fichier contenant la classe `ConnexionBaseDeDonnees` pour pouvoir se connecter à la
   base de données.
   <!-- require_once "ConnexionBaseDeDonnees.php"; -->
   
3. Appelez la fonction `query` de l'objet `PDO` `ConnexionBaseDeDonnees::getPdo()` en lui donnant
   la requête SQL. Stockez sa réponse dans une variable `$pdoStatement`.

4. Comme expliqué précédemment, pour lire les réponses à des requêtes SQL, vous
   pouvez utiliser

   ```php?start_inline=1
   $utilisateurFormatTableau = $pdoStatement->fetch()
   ```

   qui, dans notre exemple, renvoie un tableau avec 6 cases : 
   * `loginBaseDeDonnees`, `prenomBaseDeDonnees` et `nomBaseDeDonnees` (les champs de la base de données).
   * `0`, `1` et `2` qui correspondent aux champs de la base de données dans l'ordre. Ces cases
   sont donc un peu redondantes.

   Utilisez l’un des affichages de débogage (*e.g.* `var_dump`) pour afficher ce tableau.

1. Créez un `$utilisateur` de classe `Utilisateur` à l'aide de `$utilisateurFormatTableau` 
en appelant le constructeur. Affichez l'utilisateur en utilisant la méthode adéquate de `Utilisateur`. 

1. On souhaite désormais afficher tous les utilisateurs dans la base de données. On pourrait
   faire une boucle `while` sur `fetch` tant qu'on n'a pas parcouru toutes les entrées de la base de données.

   Heureusement, il existe une syntaxe simplifiée qui fait exactement cela :   

   ```php?start_inline=1
   foreach($pdoStatement as $utilisateurFormatTableau){
      // ...
   }
   ```

   **Note :**
   * chaque tour de boucle agit comme si on avait fait un fetch
     ```php?start_inline=1
     $utilisateurFormatTableau = $pdoStatement->fetch()
     ```
   * on peut faire foreach car PDOStatement implémente l'interface Traversable.
   C'est similaire à Java qui permettait la boucle `for(xxx : yyy)` pour les objets
   implémentant l'interface `Iterable`.

   **Utilisez** la boucle `foreach` dans `lireUtilisateur.php` pour afficher tous les utilisateurs.

2. Avez-vous pensé à enregistrer régulièrement votre travail sous Git ?
</div>

<div class="exercise">

Nous allons maintenant isoler le code qui retourne tous les utilisateurs et en faire une méthode de `Utilisateur`.

1. Isolez le code qui construit l'objet `Utilisateur` à partir du tableau donné par `fetch` 
   (*e.g.* `$utilisateurFormatTableau`) dans une méthode
   ```php
   public static function construireDepuisTableauSQL(array $utilisateurFormatTableau) : Utilisateur {
   // ...
   }
   ```
2. Créez une fonction statique
   `getUtilisateurs()` dans la classe `Utilisateur` qui ne prend pas d'arguments et
   renvoie le tableau d'objets de la classe `Utilisateur` correspondant à la base de données.

   **Rappel :** On peut rajouter facilement un élément "à la fin" d'un tableau avec
   ```php?start_inline=1
   $tableau[] = "Nouvelle valeur";
   ```
3. Mettez à jour `lireUtilisateur.php` pour appeler directement `getUtilisateurs()`.

4. Maintenant que vous avez bien compris où les noms de colonnes (`loginBaseDeDonnees`, `prenomBaseDeDonnees`, ...)
   de la table `utilisateur` interviennent dans le tableau `$utilisateurFormatTableau`, nous allons leur redonner
   des noms plus classiques :
   1. Changer les noms des colonnes pour `login`, `prenom` et `nom`.
      Pour ceci, dans PhpMyAdmin, cliquez sur l'onglet "Structure" de la table `utilisateur`, 
      puis "Modifier" sur chaque colonne.
   2. Modifiez le code PHP à l'endroit où interviennent ces noms de colonnes.
       <!-- dans Utilisateur::construireDepuisTableauSQL(array $utilisateurFormatTableau)  -->
      

</div>

### Format de retour de `fetch()`

Rappelons que la
[méthode `fetch($fetchStyle)`](http://php.net/manual/fr/pdostatement.fetch.php)
s'appelle sur les réponses de requêtes et renvoie
la réponse de la requête dans un format lisible par PHP. 
Le choix du format se fait avec la
[variable `$fetchStyle`](http://php.net/manual/fr/pdostatement.fetch.php#refsect1-pdostatement.fetch-parameters). Les formats les plus communs sont :

* `PDO::FETCH_ASSOC` : Chaque entrée SQL est un tableau indexé par les noms
   des champs de la table de la base de données ;

* `PDO::FETCH_NUM` : Chaque entrée SQL est un tableau indexé par le numéro de la colonne 
   commençant à 0 ;

* `PDO::FETCH_BOTH` (valeur par défaut si on ne donne pas d'argument `$fetchStyle`) : 
   combinaison de `PDO::FETCH_ASSOC` et `PDO::FETCH_NUM`.
   Ce format retourne un tableau indexé par les noms de colonnes 
   et aussi par les numéros de colonnes, commençant à l'index 0, comme retournés dans le jeu de résultats

* `PDO::FETCH_OBJ` : Chaque entrée SQL est un objet dont les noms d'attributs
   sont les noms des champs de la table de la base de données ;

* `PDO::FETCH_CLASS` : De même que `PDO::FETCH_OBJ`, chaque entrée SQL est un
   objet dont les noms d'attributs sont les noms des champs de la table de la
   base de données. Cependant, on peut dans ce cas spécifier le nom de la classe des
   objets. Pour ce faire, il faut avoir au préalable déclaré le nom de la
   classe avec la commande suivante :

   ```php?start_inline=1
   $pdoStatement->setFetchMode( PDO::FETCH_CLASS, 'class_name');
   ```

   **Note :** Ce format qui semble très pratique a malheureusement un comportement problématique :
   * il crée d'abord une instance de la classe demandée (sans passer par le constructeur !) ;
   * il écrit les attributs correspondants aux champs de la base de données (même s'ils sont privés ou n'existent pas !) ;
   * **puis** il appelle le constructeur *sans arguments*.

Dans les TDs, nous vous recommandons d'utiliser au choix :
* le format par défaut `PDO::FETCH_BOTH` en appelant `fetch()` sans arguments,
* le format `PDO::FETCH_ASSOC` pour ne pas avoir de cases redondantes (*e.g* `loginBaseDeDonnees` et `0`).  
  Dans ce cas, appelez `$pdoStatement->setFetchMode(PDO::FETCH_ASSOC)` avant d'appeler `fetch()`.

<!-- 
https://phpdelusions.net/pdo
you can change it using PDO::ATTR_DEFAULT_FETCH_MODE configuration option as shown in the connection example. 

Getting data out of statement. fetchColumn()
A neat helper function that returns value of the single field of returned row. Very handy when we are selecting only one field:

-->



<!-- 1. Créez les fonctions statiques `getTrajets()` et `getUtilisateurs()` qui listent
   tous les trajets / utilisateurs. -->


<!-- ## (Optionnel) Pour utiliser une base de données locale

Actuellement, votre code PHP se connecte au serveur MySql de l'IUT. Cela marche très bien tant que vous avez une connexion internet.

Si vous souhaitez utiliser une base de données `MySQL` en local, voici quelques instructions : 
* Dans une installation XAMPP sous Linux, il y a un compte `root` sans mot de passe pour 
  la base de données et PhpMyAdmin. Voici comment configurer le tout : 
  * PhpMyAdmin est accessible à l'adresse [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
    Normalement, il ne nécessite pas de connexion par login / mdp. En effet, vous êtes directement connecté en tant que `root`.  
    Pour avoir la même configuration qu'à l'IUT, vous pouvez créer une base de données portant votre nom qui servira pour les TDs de PHP.
  * Pour se connecter à votre base de données dans PHP :
    * Dans `ConfigurationBaseDeDonnees.php`, l'hôte est `localhost`, la base de données est celle que vous venez de créer. Pour le login, indiquez `root`. Le mot de passe ne sera pas nécessaire.
    * Dans `ConnexionBaseDeDonnees.php`, changer l'appel au constructeur `new PDO(...)` pour donner 
    la valeur `null` à l'argument `password`. Ceci a pour effet de vous connecter sans mot de passe. -->
