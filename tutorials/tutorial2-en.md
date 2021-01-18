---
title: TD2 &ndash;  Data persistence in PHP
subtitle: BDD, PDO
layout: tutorial
---

In TD1, you have learned how to create classes and instantiate objects. But, as
you have seen, the lifespan of created objects did not exceed the execution of
the program (*i.e.* a few *ms*).

In this TD, we are going to learn how to make objects persistent, by saving them
in a database. This way, it will be possible to get your objects back on each
visit of the web site.

**Reminder:** PHP is an interpreted language, the errors are not detected before
execution (no compilation). It is therefore advisable to regularly test each new
part of the code.


## Connection to the database

### The bases of PHPMyAdmin

<div class="exercise-en">
1. Connect to your MySQL database, using the PHPMyAdmin interface
   [http://webinfo.iutmontp.univ-montp2.fr/my](http://webinfo.iutmontp.univ-montp2.fr/my)
   Use your IUT login and your INE number as initial password.  (If you are on
   your computer, find PHPMyAdmin at the address
   [http://localhost/phpmyadmin](http://localhost/phpmyadmin)).

2. Change your password, sign out and sign back in. If you do not manage to
   login after your password change, try with another browser or empty the
   browser cache (`CTRL+F5`).


   **Attention:** Do not use one of your usual passwords. Indeed, we will soon
   write this password in a file which will likely be seen by the professor or
   the student next to you.  
   So you have two possibilities:
   * (**Recommended**) Create a random password using the
   [https://www.random.org/passwords/](https://www.random.org/passwords/) for
   example . Write immediately this password in a file.
   * Or choose something simple and not secret.

2. Create a table `Voiture` with 3 fields:

   * `immatriculation` of type `VARCHAR` and of maximum length 8, defined as the
   primary key (Index: `Primary`)
   * `marque` of type `VARCHAR` of maximum length 25.
   * `couleur` of type `VARCHAR` of maximum length 12.

   **Important:** To avoid later complications, create all your tables with
   parameters `InnoDB` as the storage engine, and `utf8_general_ci` as collation
   (encoding of data: accents, special characters...).

   **Attention**: The field names, as variable names, must not contain
   accents. In addition, and contrary to Oracle, MySQL is case sensitive
   (lowercase/uppercase letters).

3. Insert some data using the `insert` tab of PHPMyAdmin.

4. From now on, test systematically your SQL queries in PHPMyAdmin before
   including them in your PHP pages.

</div>

### PHP configuration file

In order to achieve portability, it is preferable to separate the
server information from the rest of the PHP code.

<div class="exercise-en">

1. Let's start configuring our webpage editor. You have the choice:

   * either you use **NetBeans**. Configure your first project following the
   indications 
   [found in the supplements of the TD2.]({{site.baseurl}}/assets/tut2-complement.html#créer-un-projet-avec-netbeans)
   * either you already have your favorite webpage editor, like *Sublime Text*,
     but it **must**
     * support syntax highlighting
     * be able to automatically indent your code

1. Create a file `Conf.php`. This file will contain a class `Conf` with a static
   attribute `$databases` as follows (change, of course, the `a_remplir`).

   **Notes:**
   * Where should we save a web page? (Remember TD1)
   * What is **static** attribute or method? (Remember last year course of
   object-oriented programming ; see also [the supplements]({{site.baseurl}}/assets/tut2-complement.html#les-attributs-et-méthodes-static))

   ```php
   <?php
   class Conf {
   
     static private $databases = array(
       // Hostname is webinfo at IUT
       // or localhost on your computer
       'hostname' => 'a_remplir',
       // At IUT, you have a database named after your login
       // On your computer, please create a database
       'database' => 'a_remplir',
       // At IUT, it is your classical login
       // On your computer, you should have at least a 'root' account
       'login' => 'a_remplir',
       // At IUT, it is your database password 
	   // (=PHPMyAdmin pwd, INE by defaut)
       // On your computer, you created the pwd during setup
       'password' => 'a_remplir'
     );
   
     static public function getLogin() {
       //in PHP, indices of arrays car be strings (or integers)
       return self::$databases['login'];
     }
   
   }
   ?>
   ```

2. To test our class `Conf`, create a file `testConf.php`. Open it in your
   browser.
   
   **Remember last TD:** What is the good and the bad way to open a PHP webpage
   in your browser?
   
   ```php
   <?php
     // Include PHP files using require_once
     // to avoid multiple inclusions
     require_once 'Conf.php';

     // Display database login
     echo Conf::getLogin();
   ?>
   ```

3. Complete `Conf.php` with static methods `getHostname()`, `getDatabase()` and
   `getPassword()`. Test these methods in `testConf.php`.  
   
   **Note:** In PHP, to call a static method, you first write the class name (as
   Java), then `::` (instead of `.` in Java) followed by the method
   name.  
   **Example:** `Conf::getLogin()`     
   Remember that conventional methods (i.e. not `static`) are called with `->`
   in PHP.

</div>

<div class="exercise-en">

Let's continue with the best practice of saving regularly your work with
Git. Last week, we saw

```shell
# Pour savoir l'état de Git, c-à-d ce qui est enregistré ou non
git status
# Pour sélectionner des fichiers à enregistrer
git add nom_du_fichier
# Pour effectuer l'enregistrement
git commit
```

1. If you didn't do it last week, configure Git and tell it your full name and email.
   
   ```shell
   git config --global user.name "Votre Prénom et Nom"
   git config --global user.email "votre@email"
   ```

   Likely, you can change your default Git text editor with
   
   ```shell
   git config --global core.editor "gedit --new-window -w"
   ```

1. To see the history of your commits, **run**

   ```shell
   git log
   ```
   
   You will see a series of commits, each displayed like this
   
   ```
commit a0cf8dba8cfe5ffb08500cb3a77ec6889a34b37f (HEAD -> master)
Author: Romain Lebreton <romain.lebreton@lirmm.fr>
Date:   Fri Sep 7 17:56:42 2018 +0200

    Mon message de commit
   ```

   The number `a0cf8db...` is the unique identifier of your commit. You can ask
   exit `git log` by typing `q` or ask for help with `h`.
   
1. Save your work with `git add` and `git commit`. From now on, we rely on you to 
   regularly save your work on Git.

</div>


### Initialize a `PDO`  object

To connect to a database in PHP, we will use a class provided by PHP which is
called `PDO` 
([The PHP Data Object](http://php.net/manual/fr/book.pdo.php)). 
This class provides many useful methods to deal with databases.

<div class="exercise-en">

1. Let's establish a connection with the database. Create a file `Model.php`
   declaring a class `Model`. This class will possess
   * an attribute `public static $pdo` <!-- protected -->
   * a method `public static function Init()`.

2. In the `Init` function, we will initialize the `$pdo` attribute and assign it
   a `PDO` object. Let's proceed step by step:
   
   2. To create the connection to our database, you must use the 
      [constructor of `PDO`](http://php.net/manual/fr/pdo.construct.php) in the
      following way
   
      ```php?start_inline=1
      new PDO("mysql:host=$hostname;dbname=$database_name",$login,$password);
      ```
   
      Store this new `PDO` object in the static attribute `self::$pdo`.  
      **Explanation:** Since the variable is static, it is accessed by a syntax
      `ClassName::$var_name` as previously told. The type of the current object is
      obtained with the keyword `self`.

   1. The previous code requires that the variables `$hostname`, `$database_name`,
      `$login` and `$password` contain the strings corresponding to the host name,
      database name, login and password of your database. Please create these
      variables before the `new PDO` by retrieving the information written in
      `Conf.php ` with the help of the methods of the class `Conf`.
   
   4. As our class `Model` depends on `Conf.php`, add a `require_once
      'Conf.php'` at the beginning of the file.
   
   5. Finally, we want `Model` to be initialized just after its
      declaration. Therefore call the static initialization method `Model::Init()`
      at the end of the file.
   
   6. Let's test our new class. Create the file `testModel.php` with the following
      content. Verify that the execution of `testModel.php` does not display any error
      message.

      ```php
      <?php
      require_once "Model.php";
      echo "Connexion réussie !" ;
      ?>
      ```

</div>
<br>
We are now going to improve the error management of `PDO`.

<div class="exercise-en">

2. When an error occurs, `PDO` raises an exception and we should catch it and
   process it. So place your `new PDO(...)` within a try - catch :

   ```php?start_inline=1
   try{
     ... 
   } catch(PDOException $e) {
     echo $e->getMessage(); // affiche un message d'erreur
     die();
   }
   ```

   You will notice that the try - catch syntax of exceptions in PHP is very
   similar to the one of Java.
   
   **Note:** In this example, the error management is very abrupt: indeed,
   `die();` is equivalent to `System.exit(1);` in Java.  
   In a real-world  web site, we should indicate to the user that the site 
   is currently unavailable or something like this.  
   It is important that **every** line of code using `PDO` is included in 
   a `try` - `catch` in order to capture the exceptions.


4. For more error messages of `PDO` and so that it handles better UTF-8,
   **UPDATE** the connection in `Model` with

   ```php?start_inline=1
   // Connection to the database
   // The last argument defines UTF-8 as the encoding of MySQL input and output
   self::$pdo = new PDO("mysql:host=$hostname;dbname=$database_name", $login, $password,
                        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
   
   // Activate the error display option of PDO, 
   // and now PDO will raise an exception in case of problems
   self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   ```


**Question:** Do you understand why it is a better practice to store the
connection to the database (stored in `Model::$pdo`) in a static attribute?

</div>

## Operations on the database

Let's see how `PDO` objects are used to perform SQL queries. We are going to
use two methods provided by `PDO`:

1. The [method `query($sql_request)`](http://php.net/manual/fr/pdo.query.php) of
   the `PDO` class
   * takes as input a SQL query (string)
   * and returns the answer to the request in an internal representation not
   immediately readable
   ([a `PDOStatement` object](http://php.net/manual/fr/class.pdostatement.php)).

2. The [method
`fetchAll($fetch_style)`](http://php.net/manual/fr/pdostatement.fetchall.php) of
the `PDOStatement` class is called on the answers of queries and returns the
answer of the query in a format readable by PHP. More specifically, it returns
an array of SQL records, each record being formatted as an array, or as an
object. The choice of format is done with the 
[variable `$fetch_style`](http://php.net/manual/fr/pdostatement.fetch.php#refsect1-pdostatement.fetch-parameters).
The most common formats are:

   * `PDO::FETCH_ASSOC`: Every SQL record is an array indexed by the field (or
   column) name of the table in the database;
   
   * `PDO::FETCH_OBJ`: Every SQL record is an object whose attribute names are
   the field names of the table in the database;
   
   * `PDO::FETCH_CLASS`: Similarly to `PDO::FETCH_OBJ`, every SQL record is an
   object whose attribute names are the field names of the table in the
   database. However, in this case you can specify the class name of the
   object. To do so, you must have beforehand declared the class name with the
   syntax:

     ```php?start_inline=1
     $pdo_stmt->setFetchMode( PDO::FETCH_CLASS, 'class_name');
     ```

     **Note:** More precisely (and this will be useful later on), `PDO` creates
	 an instance of the requested class, write the corresponding attributes and
	 **then** call the constructor *without arguments*.


### Make a SQL query without parameters

Let's begin with the simplest SQL query, which reads all the elements of a table
(`Voiture` in our example):

```sql
SELECT * FROM voiture
```

<div class="exercise-en">

1. Create a file `lireVoiture.php`

2. Include the file containing the class `Model` to be able to connect to the
   database.

3. Call the `query` method of the `PDO` object `Model::$pdo` with argument the
   previous SQL query. Store its answer in a variable `$rep`.

4. As explained earlier, to read the answers of SQL queries, you can use

   ```php?start_inline=1
   $tab_obj = $rep->fetchAll(PDO::FETCH_OBJ)
   ```

   which returns an array of objects `tab_obj` whose attribute names are the
   field names from the database. Each of the objects `$obj` of `$tab_obj`
   therefore contains three attributes named `immatriculation`, `couleur` and
   `marque` (fields of the database) which are accessible classically by
   `$obj->immatriculation`, ....
   
   **Display all cars** using `fetchAll` and a
   [`foreach` loop](http://php.net/manual/fr/control-structures.foreach.php) 
   to iterate on the table `$tab_obj`.

1. Did you think about saving regularly your work on Git ?

</div>
<br>
This code works but does not create objects of the class `Voiture` on
which we could call methods (for example `afficher`).

<div class="exercise-en">

We are going to update the code of `lireVoiture.php` to 
make use of the function `afficher()` of `Voiture`.

As explained earlier, you can directly get an object of the
class `Voiture` with

```php?start_inline=1
$rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
$tab_voit = $rep->fetchAll();
```

2. In `lireVoiture.php`, include the file of the class `Voiture`;

3. With the option `PDO::FETCH_CLASS`{: #majconst}, `PDO` will create an
   instance of the class `Voiture`, write the corresponding attributes with the
   database record and **then** call the constructor without arguments.  
   **Adapt the former constructor of `Voiture` for that it also accepts a call
   without arguments (in addition to a call with three arguments).**

   ```php?start_inline=1
   // The syntax ... = NULL means that the argument is optional
   // If one optional argument is not supplied, 
   //   it takes its default value, i.e. NULL in our case
   public function __construct($m = NULL, $c = NULL, $i = NULL) {
     if (!is_null($m) && !is_null($c) && !is_null($i)) {
       // If both $m, $c and $i are not NULL, 
	   // then they must have been supplied
	   // so fall back to constructor with 3 arguments
	   $this->marque = $m;
       $this->couleur = $c;
       $this->immatriculation = $i;
     }
   }
   ```

   **Note:** It may be shorter and cleaner to use a constructor
   `__construct($data)` as in 
   [tutorial 1]({{site.baseurl}}/tutorials/tutorial1-en#the-foundations-of-a-carpool-website).

3. You can now call `fetchAll` in `lireVoiture.php` and make
the display using the method `display()`.

   **Note:** The Variable `$tab_voit` contains an array of objects of class
   `Voiture`. To view the cars, it will be necessary to iterate on the table with a
   loop [ foreach The`](http://php.net/manual/fr/control-structures.foreach.php).

</div>
<div class="exercise-en">

We now regroup  the code that returns all the cars into a new method of `Voiture`.

1. Create a static function `getAllVoitures()` of Class `Voiture` that takes no
arguments and returns the array of cars in the database.

2. Update `lireVoiture.php` to directly call this new function.

</div>

### Error management (continued)

In a site in production, for the sake of safety and user friendliness, is not
recommended to directly display an error message. So we will create a variable
to enable or disable the display of error messages.

<div class="exercise-en">

In the `Conf` class, add a static attribute `debug` and its public getter.

```php
<?php
  class Conf{
   ...
   
    // debug is a boolean
    static private $debug = True; 
    
    static public function getDebug() {
    	return self::$debug;
    }
}
?>
```

This way, we can display or not the error messages in `catch`.
   
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
   
Don't forget to save your work on Git, especially at the end of a tutorial.
   
</div>

## Carpool Site

Apply what has been done during this TD to classes `Trajet` and `Utilisateur`
of the previous tutorial (exercise on the carpool website):

1. Change the constructors to accept also zero arguments ;

1. In your PHPMyAdmin, create a table `utilisateur` with the following fields:
   * `login`: VARCHAR 32, primary key
   * `nom`: VARCHAR 32
   * `prenom`: VARCHAR 32
   
   **Important:** Have you remembered to set `InnoDB` and `utf8_general_ci` as
   previously?

1. Insert a few users.

2. Create a table `trajet` with the following fields:
   * `id`: INT, primary key, which is auto-increments (see below)
   * `depart`: VARCHAR 32
   * `arrivee`: VARCHAR 32
   * `date`: DATE
   * `nbplaces`: INT
   * `prix`: INT
   * `conducteur_login`: VARCHAR 32 
   
   **Note:** We want that the primary field `id` increments with each new
   insertion in the table. To do this, select the checkbox `A_I`
   (auto-increment) for the field `id`.


2. Insert a few journeys, make sure not to fill the `id` field, and put in
   `conducteur_login` of the login of valid users (to avoid further
   complications).

1. Create the static methods `getAllTrajets()` and `getAllUtilisateurs()` which
   lists all journeys / users.
