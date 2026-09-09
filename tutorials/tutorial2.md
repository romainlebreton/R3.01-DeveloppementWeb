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

Dans le TD1, vous avez appris à créer des classes et à instancier des objets de
ces classes. Mais, comme vous l'avez constaté, la durée de vie des objets ainsi
créés ne dépassait pas la durée de l'exécution du programme.

Dans ce TD, nous allons apprendre à rendre les objets persistants, en les
sauvegardant dans une base de données. Ainsi, il sera possible de retrouver les
objets d'une visite à l'autre du site web.
À la fin, vous saurez accéder aux
bases de données en PHP grâce à PDO (PHP Data Objects), ouvrir une connexion à une base de
données, lire des lignes et construire des objets PHP à partir de ces
données.

## Connexion à la base de données

### Les bases de PhpMyAdmin

<div class="exercise">
1. Connectez-vous à votre base de données MySQL, à l'aide de l'interface
   PhpMyAdmin
   [http://webinfo.iutmontp.univ-montp2.fr/my](http://webinfo.iutmontp.univ-montp2.fr/my).
   Le login est votre login IUT et votre mot de passe initial est votre numéro INE (avec les lettres en majuscule).  
   **Si cela ne marche pas**, c'est que vous n'êtes probablement pas inscrit administrativement. Dans ce cas, demandez à votre chargé de TD ou allez voir le service informatique (bâtiment K, premier étage).
   

2. Changez votre mot de passe (Page d'accueil > Paramètres généraux > Modifier le mot de passe) et reconnectez-vous.
   Si vous n'arrivez pas à vous
   connecter après avoir changé le mot de passe, essayez avec un autre navigateur
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

   * `loginBaseDeDonnees` de type `VARCHAR` et de **taille** 64 (il s'agit de la longueur 
      maximale), défini comme la clé primaire (champ **Index** puis sélectionner `Primary` et 
      valider la boîte de dialogue qui s'ouvre).
   * `nomBaseDeDonnees` de type `VARCHAR` et de taille 64.
   * `prenomBaseDeDonnees` de type `VARCHAR` et de taille 64.

   **Important :** Pour faciliter la suite du TD, mettez à la création de toutes
     vos tables `InnoDB` comme moteur de stockage, et `utf8_general_ci` comme
     **interclassement** (c’est l’encodage des données, et donc des accents,
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
serveur du reste du code PHP. Nous en profitons aussi pour éviter une mauvaise pratique
courante : écrire un mot de passe en clair dans un fichier versionné par Git. Les
informations de connexion seront donc placées dans un fichier à part, explicitement
exclu du suivi de version.

<div class="exercise">

<!-- 1. Commençons par configurer notre éditeur de pages Web. Vous avez le choix : -->

<!--    * soit vous utilisez **NetBeans**. Configurer votre premier projet en suivant -->
<!--      les indications  -->
<!--      [dans les compléments du TD2.]({{site.baseurl}}/assets/tut2-complement.html#créer-un-projet-avec-netbeans) -->
<!--    * soit vous avez déjà un éditeur de pages Web préféré, comme *SublimeText*, -->
<!--      mais il **faut** -->
<!--      * qu'il prenne en charge la coloration syntaxique -->
<!--      * qu'il sache indenter automatiquement votre code -->

1. Commencez par créer un dossier `tds-php/TD2` dans l'explorateur de fichier, puis ouvrez ce dossier dans PHPStorm.

2. Créez un fichier `ConfigurationBaseDeDonnees.ini`. Un fichier `.ini` est un simple fichier texte
   contenant des paires `cle = valeur`, une par ligne, que PHP sait lire nativement.

   Voici à quoi correspondent les clés à renseigner :

   * `nomHote` : adresse du serveur qui héberge la base de données. Quand on crée une base de données en local, il s'agit 
   généralement de `localhost`, mais dans notre cas, on souhaite utiliser le serveur de base de données mis à disposition à l'IUT 
   (auquel vous venez de vous connecter), donc `webinfo.iutmontp.univ-montp2.fr`.

   * `nomBaseDeDonnees` : le nom de la base de données à laquelle on souhaite accéder. Quand on crée une base de données en local,
   c'est le développeur qui choisit son nom. Comme nous utilisons le serveur de bases de données de l'IUT, 
   une base de données vous est attribuée (vous ne pouvez pas en créer vous-même). **Cette base de données est nommée comme votre login**
   (celui que vous avez utilisé pour vous connecter à phpMyAdmin).

   * `port` : numéro de port correspondant au service de base de données sur le serveur. Par défaut pour une base de données `MySQL`, ce port est 3306, mais sur le serveur de l'IUT, le port à utiliser est `3316`. 

   * `login` : afin d'accéder au système de gestion de bases de données (SGBD), il faut généralement un compte. Quand on crée une base de données en local, on crée aussi des utilisateurs, ou on peut aussi utiliser un compte administrateur par défaut nommé root. 
   **Sur le serveur de l'IUT, il faut utiliser votre login** (celui que vous avez utilisé pour vous connecter à phpMyAdmin).

   * `motDePasse` : le mot de passe du compte de l'utilisateur. À l'IUT, il s'agit du mot de passe que vous avez utilisé pour vous connecter
   à phpMyAdmin plus tôt.

   Voici le squelette du fichier `ConfigurationBaseDeDonnees.ini`, à compléter avec vos propres informations :

   ```ini
   nomHote = a_remplir
   nomBaseDeDonnees = a_remplir
   port = a_remplir
   login = a_remplir
   motDePasse = a_remplir
   ```

   **Remarque :** Certains caractères ont un sens spécial dans un fichier `.ini` et peuvent, s'ils ne sont
   pas protégés, tronquer votre mot de passe, le transformer silencieusement, voire faire
   échouer la lecture de **tout** le fichier : `;` (démarre un commentaire), `=` (sépare la clé
   de la valeur), ainsi que `$`, `?`, `{`, `}`, `|`, `&`, `~`, `!`, `(`, `)`, `^` (interprétés comme des
   opérateurs ou utilisés pour l'interpolation de variables). Un mot de passe qui serait
   exactement l'un des mots `null`, `yes`, `no`, `true`, `false`, `on`, `off`, `none` (mots réservés)
   serait lui aussi silencieusement remplacé par une autre valeur.

   Pour éviter tous ces problèmes, **entourez systématiquement votre mot de passe (et plus
   généralement toute valeur) de guillemets doubles** dans le fichier `.ini` :

   ```ini
   motDePasse = "mon mot de passe;secret"
   ```

   Si le mot de passe contient lui-même un guillemet double ou une barre oblique inverse,
   faites-les précéder d'une barre oblique inverse : `\"` pour `"` et `\\` pour `\`.

   

3. Ce fichier contient désormais votre mot de passe en clair : il ne doit **jamais** être
   versionné avec Git. Créez, à la racine de votre dépôt `tds-php`, un fichier `.gitignore`
   (ou complétez-le, s'il existe déjà) en y ajoutant la ligne :

   ```
   ConfigurationBaseDeDonnees.ini
   ```

   Cette ligne indique à Git d'ignorer tout fichier nommé `ConfigurationBaseDeDonnees.ini`,
   quel que soit le dossier du dépôt où il se trouve. Ainsi, même avec `git add .`, ce fichier
   ne sera jamais ajouté au suivi de version.

   **Vérifiez** avec `git status` que `ConfigurationBaseDeDonnees.ini` n'apparaît pas parmi les
   fichiers proposés au commit.

4. Enregistrez votre travail à l'aide de `git add` et `git commit`. Nous
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

   1. Récupérez le contenu du fichier `ConfigurationBaseDeDonnees.ini` grâce à la fonction
   [`parse_ini_file`](http://php.net/manual/fr/function.parse-ini-file.php), qui renvoie un
   tableau associatif indexé par les clés du fichier `.ini` :

      ```php?start_inline=1
      $configurationBaseDeDonnees = parse_ini_file('ConfigurationBaseDeDonnees.ini', false, INI_SCANNER_RAW);
      ```

      Le troisième argument `INI_SCANNER_RAW` indique à `parse_ini_file` de lire les valeurs
      telles quelles, sans interpréter les caractères spéciaux vus précédemment (opérateurs,
      interpolation, mots réservés). C'est le mode recommandé pour lire un fichier de
      configuration contenant des informations sensibles comme un mot de passe.  
      **Remarque :** même avec `INI_SCANNER_RAW`, un point-virgule `;` non protégé démarre
      toujours un commentaire : continuez donc à entourer vos valeurs de guillemets doubles
      dès qu'elles contiennent des caractères spéciaux.

      Créez ensuite les variables `$nomHote`, `$port`, `$nomBaseDeDonnees`, `$login` et
      `$motDePasse` en lisant les entrées correspondantes du tableau `$configurationBaseDeDonnees`
      (par exemple `$configurationBaseDeDonnees['nomHote']`).

   2. Pour créer la connexion à notre base de données, il faut utiliser le
   [constructeur de `PDO`](http://php.net/manual/fr/pdo.construct.php) de la
   façon suivante
   
      ```php?start_inline=1
      new PDO("mysql:host=$nomHote;port=$port;dbname=$nomBaseDeDonnees", $login, $motDePasse);
      ```
   
      Stockez ce nouvel objet `PDO` dans l'attribut `$pdo` de l'objet.

   3. Testons dès à présent notre nouvelle classe. Créez le fichier
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
    // L'unique instance créée est stockée dans l'attribut $instance
    private static function getInstance() : ConnexionBaseDeDonnees {
        // L'attribut statique $instance s'obtient avec la syntaxe ConnexionBaseDeDonnees::$instance 
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
<!-- 3. Pour que PhpStorm comprenne que `ConnexionBaseDeDonnees::getPdo()` renvoie un objet de la classe `PDO`,
   et qu'il puisse nous proposer l'autocomplétion des méthodes de cette classe, nous devons déclarer
   le type de retour.  
   Si ce n'est pas déjà fait, **déclarez** que l'attribut `$pdo` et la valeur de retour de `ConnexionBaseDeDonnees::getPdo()` sont de type
   `PDO`.  
   **Vérifiez** que l'autocomplétion de PhpStorm s'est améliorée dans `testConnexionBaseDeDonnees.php`.
-->
3. **Déclarez** que l'attribut `$instance` est de type `ConnexionBaseDeDonnees`.  
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
   Il est important que toutes lignes de codes utilisant `PDO` soient dans un `try` -
   `catch` afin de capturer les exceptions. -->

Pour avoir plus de messages d'erreur de `PDO` et qu'il gère mieux l'UTF-8,
**mettez à jour** la connexion dans `ConnexionBaseDeDonnees` en remplaçant `$this->pdo = new PDO(...);` par

```php?start_inline=1
// Connexion à la base de données            
// Le dernier argument sert à ce que toutes les chaines de caractères 
// en entrée et sortie de MySQL soient dans l'encodage UTF-8
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
   elle renvoie **une entrée SQL** (une ligne de la réponse) formatée comme un tableau.
   Ce tableau est indexé par les noms des champs de la table de données, et aussi par les numéros des champs. 
   Les valeurs du tableau sont celles de l'entrée SQL. Si la requête renvoie plusieurs lignes (plusieurs entrées),
   il faut exécuter `fetch` autant de fois que nécessaire pour traiter chaque entrée. On peut aussi passer par une 
   boucle `foreach` comme nous le verrons bientôt.

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

1. Créez un fichier `lireUtilisateurs.php`.

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

   qui, dans notre exemple, renvoie un tableau avec 6 entrées : 
   * `loginBaseDeDonnees`, `prenomBaseDeDonnees` et `nomBaseDeDonnees` (les champs de la base de données).
   * `0`, `1` et `2` qui correspondent aux champs de la base de données dans l'ordre. Ces entrées
   sont donc un peu redondantes.

   Utilisez l’un des affichages de débogage (par exemple `var_dump`) pour afficher ce tableau.

5. Créez un `$utilisateur` de classe `Utilisateur` à l'aide de
   `$utilisateurFormatTableau` en appelant le constructeur. Affichez
   l'utilisateur en utilisant la méthode adéquate de `Utilisateur`. Copiez le
   fichier `tds-php/TD1/Utilisateur.php` dans `tds-php/TD2` pour pouvoir
   utiliser la classe `Utilisateur` dans le TD2.

6. On souhaite désormais afficher tous les utilisateurs dans la base de données. On pourrait
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

   **Utilisez** la boucle `foreach` dans `lireUtilisateurs.php` pour afficher tous les utilisateurs.

7. Si ce n'est pas déjà fait, reprenez votre code pour inclure une structure HTML classique (`<html>`,`<head>`,`<body>` ...)
et présenter plus proprement les utilisateurs (vous pouvez vous inspirer de ce que vous aviez fait lors du TD1).

8. Avez-vous pensé à enregistrer régulièrement votre travail sous Git ?
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
   `recupererUtilisateurs()` dans la classe `Utilisateur` qui ne prend pas d'arguments et
   renvoie le tableau d'objets de la classe `Utilisateur` correspondant à la base de données.
   Le type de retour de cette fonction est `array`.

   **Rappel :** On peut rajouter facilement un élément "à la fin" d'un tableau avec
   ```php?start_inline=1
   $tableau[] = "Nouvelle valeur";
   ```
3. Mettez à jour `lireUtilisateurs.php` pour appeler directement `recupererUtilisateurs()`.

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
* le format `PDO::FETCH_ASSOC` pour ne pas avoir d'entrées redondantes (*e.g* `loginBaseDeDonnees` et `0`).  
  Dans ce cas, appelez `$pdoStatement->setFetchMode(PDO::FETCH_ASSOC)` avant d'appeler `fetch()`.

<!-- 
https://phpdelusions.net/pdo
you can change it using PDO::ATTR_DEFAULT_FETCH_MODE configuration option as shown in the connection example. 

Getting data out of statement. fetchColumn()
A neat helper function that returns value of the single field of returned row. Very handy when we are selecting only one field:

-->



<!-- 1. Créez les fonctions statiques `recupererTrajets()` et `recupererUtilisateurs()` qui listent
   tous les trajets / utilisateurs. -->


<!-- ## (Optionnel) Pour utiliser une base de données locale

Actuellement, votre code PHP se connecte au serveur MySQL de l'IUT. Cela marche très bien tant que vous avez une connexion internet. Cependant, une base de données `MySQL` en local vous permettrait d'être `root`, de créer plusieurs bases de données dessus (une par projet ou SAE)...

Si vous souhaitez utiliser une base de données `MySQL` en local, voici quelques instructions :  -->

## Remarques finales

#### Identifiants exposés

Le mot de passe de connexion à la base de données est une information sensible. S'il est écrit
en clair dans un fichier versionné par Git, et que ce dépôt est un jour partagé ou rendu public,
votre mot de passe (et potentiellement l'accès à toute la base de données) se retrouve exposé à
n'importe qui. Il ne faut donc **jamais committer un vrai mot de passe** dans un dépôt Git, même
privé.

C'est pourquoi, dans ce TD, nous avons isolé les informations sensibles (hôte, login, mot de
passe...) dans un fichier de configuration dédié, `ConfigurationBaseDeDonnees.ini`, explicitement
ignoré par Git via `.gitignore`. Une autre approche courante, que vous pourrez rencontrer dans
d'autres projets, consiste à fournir ces informations via des variables d'environnement lues au
moment de l'exécution.

#### PhpMyAdmin

Il faut distinguer trois choses : la base de données, le serveur MySQL, et phpMyAdmin. La base de données est l'endroit où les informations sont réellement stockées : tables, colonnes et enregistrements. Le serveur MySQL est le logiciel qui gère cette base de données, reçoit les requêtes SQL et les exécute. phpMyAdmin est seulement une interface web d'administration qui permet d'interagir plus facilement avec MySQL, par exemple pour visualiser les tables, créer des données ou exécuter des requêtes, mais il ne remplace ni la base de données ni le serveur lui-même.

