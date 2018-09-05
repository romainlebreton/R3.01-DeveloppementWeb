---
title: TD1 &ndash; Introduction to PHP
subtitle: Hello World, objects and forms
layout: tutorial
---


## Methodology

A few instructions which will save you a lot of time in Web development:

1. PHP is a programming language, so please use a development environment. You
   do not code in Java with the Notepad, and it is the same for PHP. We will
   therefore code in PHP using NetBeans starting from TD2 (except if you already
   have your favorite editor).

   **Exceptionally** for this TD, use a basic text editor as *gedit* or
   *notepad++*. In doing so, we will not have the impression that a big machinery
   such as NetBeans is hiding too many things.

2. **Never** copy your files in several places.
3. Please **do not** print this TD.

## Open your own webpages

We have seen during the [course 1]({{site.baseurl}}/classes/class1.html) that
[the World Wide Web is based on a HTTP client / server
model]({{site.baseurl}}/classes/class1.html#le-fonctionnement-du-world-wide-web).
Let us put all this into practice!

### A basic HTML webpage

<div class="exercise-en">

1. Create a webpage **page1.html** with the following content and save it in the
   directory **public_html** of your personal folder.

   ```html
   <!DOCTYPE html>
   <html>
       <head>
           <title> Insert a title here </title>
       </head>
   
       <body>
           Having problems with accents à é è ?
           <!-- this is a comment -->
       </body>
   </html>
   ```

1. Open this page directly in the browser by double-clicking on it in your file
   manager.  Note the URL of the file:
   [file://path_of_my_account/public_html/page1.html](file://path_of_my_account/public_html/page1.html).

	**What does the file manager do when you double-click?**  
	**What is the meaning of *file* at the beginning of the URL?**  
	**Is this HTML webpage displayed correctly?**  
	**Is there any HTTP communication between a server and a client?**

	* **Reminder: a problem with accents?**
	  In the HTML header, you must add the following line to specify
	  the encoding
   
     ```html
     <meta charset="utf-8" />
     ```
	 Of course, your files need to be written using the same specified
	 encoding. UTF-8 is most of the time the default encoding, but text editors 
	 usually let you choose the encoding when you first save your file.

2. **[Do you remember]({{site.baseurl}}/classes/class1.html#test-de-la-page-sur-un-serveur-http)
   the procedure to have your webpage served on the IUT's HTTP server
   (at the URL
   [http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page1.html](http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page1.html))
   ?**

   **Answer:**
   <span style="color:#FCFCFC">
   Webpages must be stored in the folder **public_html** of your  personal
   directory.
   </span>

   **Let's open** `page1.html` using the browser by typing the URL in the
   address bar.

   **Is this HTML webpage displayed correctly?**  
   **Is there any HTTP communication between a server and a client?**

   <br>
   **Help: a problem of permissions?**  
   To be able to serve your pages, the HTTP server (Apache) of the IUT must have
   the permission to read the Web pages (`r--`) and to enter the folders leading
   to the Web page (`--x`). During this course, we will use the [ACL permission
   mechanism](https://wiki.archlinux.org/index.php/Access_Control_Lists) which
   is more flexible than the traditional UNIX file permissions system. To give
   permissions to the `www-data` user (Apache), use the command `setfacl` in a
   Linux terminal:

   * `setfacl -m u:www-data:--x name_of_directory` for each directory leading 
     to your Web page.

   * Then `setfacl -m u:www-data:r-- name_of_the_webpage`

   **Note:** The ACL allows to have specific permissions to multiple users and
   multiple groups when the classical UNIX permissions are limited to the user
   and the group which own the file. To read the permissions ACL on a file or
   folder, we write `getfacl name_of_file`.

</div>

### Our first PHP page

<div class="exercise-en">

4. Create a page `echo.php` with the following content. To prevent your
**public_html** folder to become a garbage dump of webpages, please create
directories for the courses and TDS. We therefore advise you to save `echo.php`
in `.../public_html/PHP/TD1/echo.php`.

   ```php
   <!DOCTYPE html>
   <html>
       <head>
           <meta charset="utf-8" />
           <title> My first PHP </title>
       </head>
   
       <body>
           Here is the output of the PHP script : 
           <?php
             // This is a one line PHP comment
             /* This other way to write comments can 
			 go on many lines */
           
             // Let's assign the string "hello" to the variable 'texte'
             // Variable names start with $ in PHP
             $texte = "hello world !";

             // Let's write the value of variable '$texte'
             echo $texte;
           ?>
       </body>
   </html> 
   ```
   
5. Open this page directly in the browser using a drag-and-drop from your file
   manager or, equivalently, with a URL in `file://` as
   [file://path_of_my_account/public_html/PHP/TD1/echo.php](file:///home/ann2/my_login/public_html/PHP/TD1/echo.php).

   **What happens when you open a PHP file directly in the browser?**  
   **Why is that ?**  
   *I hope it reminds you of the [course 1]({{site.baseurl}}/classes/class1.html#le-langage-de-cration-de-page-web--php)?*

6. Open this page in the browser in another tab using the HTTP server of the
   IUT:
   [http://webinfo.iutmontp.univ-montp2.fr/~my_login/PHP/TD1/echo.php](http://webinfo.iutmontp.univ-montp2.fr/~my_login/PHP/TD1/echo.php)
   
   **What happens when you request a PHP file from an HTTP server?**  
   **Look at the sources of the Web page (right click, source code or `Ctrl-U`)
   to see what has really generated by PHP**.  
   *Please do not hesitate to reread the appropriate part of the [course 1]({{site.baseurl}}/classes/class1.html#mcanisme-de-gnration-des-pages-dynamiques-22).*

</div>

### Your first Git repository

As mentioned earlier, we will introduce you to the Git version control system
during this course. Let's start by creating a *Git repository*, that is a folder
where the chronology of your modifications is stored.

<div class="exercise-en">

1. To transform your PHP folder into a Git repo once and for all, **run the
   shell command** `git init` in your PHP folder.
   
1. Everytime you want to learn more about the status of your Git repo, you
   should run `git status`. **Do it now**.
   
   You should see a message containing 
   
      ```
    Fichiers non suivis:
      (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
    
      TD1/
    ```

   Git is telling us that we are not recording the modifications in the folder
   `TD1` for the moment.
   
1. **Run** the command `git add TD1` to keep track of the modifications of all
   the files inside the folder `TD1`.
   
1. **Run** again `git status` to see the following message change
	
   ```
    Modifications qui seront validées :
      (utilisez "git rm --cached <fichier>..." pour désindexer)
    
    	nouveau fichier : TD1/echo.php
    ```
	
1. Git has noticed the modifications in the file `TD1/echo.php` but they are not
   recorded yet. To do this, **run** `git commit` and write a short commit
   message (before the lines with `#`) that describes your modifications. This
   commit message will be very useful later to know where you are in your files.
   
1. One last execution of `git status` will tell you that everything is up to date.

</div>

## The basics of PHP

### Differences with Java

2. All PHP code must be between an opening tag `<?php` and a closing tag `?>`
2. Variables are preceded by a `$`
1. No typing of variables (no `int a;`)

### Strings

There are several different syntaxes for strings in PHP; their behaviors depend
on the delimiters you use :

1. Strings delimited by ***double quotes* `"`** can contain:
   * variables (which will be replaced by their value),
   * line breaks,
   * special characters (tab `\t`, line break `\n`).
   * the protected characters are `"`, `$` and `\` which must be escaped with a
     backslash `\` like this: `\"`, `\$` and `\\`;

	**Example:**

   ```php?start_inline=1
   $prenom="Helmut";
   echo "Hi $prenom,\n how's it going ?";
   ```
  
   gives
   
   ```text
   Hi Helmut,
   how's it going ?
   ```
  
   **Tip:** In case of problems with variable replacement, add braces around the
   variable to replace. This also works well for the arrays `"{$tab[0]}"`, the
   attributes `"{$object->attribute}"` and functions 
   `"{$object->function()}"`.

2. Strings delimited by ***simple quote* `'`** are kept intact (no replacement,
   special characters, ...). The  protected characters are `'` and `\`, which must
   be escaped with a backslash like this : `\'` and `\\`;
   
   **Example:**

   ```php?start_inline=1
   $prenom="Helmut";
   echo 'Hi $prenom,\n how\'s it going ?';
   ```
  
   gives
   
   ```text
   Hi $prenom,\n how's it going ?
   ```
   
3. The concatenation of strings is done with the dot operator `.`  
   **Example:**

   ```php?start_inline=1
   $texte = "hello" . 'World !';
   ```

**Documentation:**
[Strings on PHP.net](https://secure.php.net/manual/en/language.types.string.php)

### The `echo` *here document*

There is an `echo` syntax very practical for multiple lines input

```php?start_inline=1
$firstname="Helmut";
echo <<< EOT
Text to display
on several lines
with special characters \t \n
and replacement of variables $firstname
The following characters are working: " ' $ / \ ;
EOT;
```

This syntax is entitled `heredoc` and allows you to display multiple lines
with the same characteristics as the strings between *double quote*.  Note that
the end of the syntax must appear **at the beginning of a new line** (no spaces
before), with only a semicolon, and **no space at the end**!

For example, the PHP code previous generates

```text
Text to display
on several lines
with special characters

and replacement of variables Helmut
The following characters are working: " ' $ / \ ;
```

**Documentation:**
[heredoc syntax on PHP.net](http://php.net/manual/en/language.types.string.php#language.types.string.syntax.heredoc)

### Display for debugging

The functions `print_r` and `var_dump` will display information about a variable
(including for tables or objects) and are very useful for debugging.  
The difference is that `print_r` is more readable because `var_dump` displays
more things (types).

### Require

PHP has two ways to include a file: `require` and `require_once`. The only
difference is that if the same file has been previously included, `require_once`
will not include it a second time.  This is particularly useful to include a
file containing a class declaration because this ensures that the class will not
be declared twice (which would raise an error).

Note that `include` and `include_once` also exist : they have the same effect
but they only emit a warning if the file is not found (instead of an error).


### Associative arrays

The arrays in PHP can be indexed by integers but also by strings:

* To create an empty array, use the syntax

  ```php?start_inline=1
  $my_array = array();
  ```

* We can create an array one value at a time:

  ```php?start_inline=1
  $coordinates['firstname'] = 'François';
  $coordinates['name'] = 'Dupont';
  ```
  

* You can also initialize an array like this

  ```php?start_inline=1
  $coordinates = array (
    'firstname' => 'François',
    'name'      => 'Dupont' );
  ```

  **Note:** In the association `'firstname' => 'François'`, `'firstname'` is
  called the **key** (or **index**) and `'François'` is the **value**.


* Note the existence of 
  [`foreach` loops](http://php.net/manual/en/control-structures.foreach.php)   
  to browse the key/value pairs of arrays.

  ```php?start_inline=1
  foreach ($my_array as $key => $value){
      //commands
  }
  ```
  
  This syntax will loop through the associations of the array. For each
  association, the key of the association will be written in the variable `$key`
  and the value in `$value` and then execute the commands.  
  **Note:** The loop `foreach` is essential to browse the keys and values of an
  array indexed by strings. Of course, there also exists a classic `for` loop
  for arrays indexed by integers

   ```php?start_inline=1
   for ($i = 0; $i < count($my_array); $i++) {
     echo $my_array[$i];
   }
   ```

* We can append an element to the end of an array with

  ```php?start_inline=1
  $my_array[] = "New Value";
  ```

**Source:** [Arrays on Php.net](http://php.net/manual/en/language.types.array.php)

<!-- ### Les structures de contrôle -->

<!-- Syntaxe alternative -->
<!-- http://php.net/manual/fr/control-structures.alternative-syntax.php -->

### Exercises : let's apply what we have learned

<div class="exercise-en">

1. In your file `echo.php`, create three variables `$marque`, `$couleur` and
   `$immatriculation` containing strings of your choice;

2. Create the PHP command that writes in your file the following HTML code
   (replacing of course the make of the car by the content of the variable
   `$marque` ...):

   ```html
   <p> Car 256AB34 of make Renault (color blue) </p>
   ```

3. Do the same thing now but with an associative array `car`:

   * Create an array `$car` containing three keys `"marque"`, `"couleur"` and
   `"immatriculation"` and the values of your choice;
	 
   * use the one of the debugging display function (*e.g.* `var_dump`) to check
   that your array is correctly filled;
   
   * Display the content of the array `car` using the same HTML format

   ```html
   <p> Car 256AB34 of make Renault (color blue) </p>
   ```

4. Now we want to display a list of cars:

   * Create a list (an array indexed by integers) `$cars` containing a few
     "car-array";

   * use the one of debugging display function (*e.g.* `var_dump`) to check that
   your array is correctly filled;

   * Change your PHP code to display a proper HTML title "List of cars:"
   followed by an HTML list (`<ul>`) containing the information of the cars.

   * Add a default case that displays "There is no car." if the list is empty.  
   (Find by yourself on the Internet a PHP function which tests if an array is
   empty).

5. Save your work using Git:

   1. Run `git status` to know the status of your Git repo.
   
   1. Run `git add TD1/echo.php` to tell Git to save the changes in `echo.php`
      in the next commit.
	  
   1. Run `git commit` to validate the recording of the changes, and write a
      small meaningful commit message that describes your changes (e.g. *"TD1
      Ex4 Display variables"*).
	  
   1. Finish with a `git status` to check that everything is alright.

**Note:** Want to change the text editor that opens when you write commit
messages ? To use SublimeText, run the following command:


```shell
git config --global core.editor "subl -n -w"
```


</div>

## Object-oriented programming in PHP

PHP was initially designed as a scripting language but has become an
object-oriented programming language since its version 5 (nowadays, you are
using version 7). Rather than using an array, let's create a class for our cars.

### An example of PHP class

<div class="exercise-en">

1. Create a file **Voiture.php** with the following content

   ```php
   <?php
   class Voiture {
   
     private $marque;
     private $couleur;
     private $immatriculation;
      
     // a getter
     public function getMarque() {
          return $this->marque;  
     }
     
     // a setter 
     public function setMarque($marque2) {
          $this->marque = $marque2;
     }
      
     // a constructor
     public function __construct($m, $c, $i)  {
      $this->marque = $m;
      $this->couleur = $c;
      $this->immatriculation = $i;
     } 
           
     // a display method
     public function afficher() {
       // À compléter dans le prochain exercice
     }
   }
   ?>
   ```

2. Note the **differences with Java**:

   * To access an attribute or a method of an object, it uses the `->`
   instead of the `.`
   * The constructor does not have the name of the class, but is called
   `__construct()`. And we can have at most one constructor, but it is possible
   to call it with fewer parameters.

3. Create *getter* and *setter* functions for `$couleur` and `$immatriculation`;

3. The interest of a *setter* is in particular to check verify what will be
   written in the attribute.  
   **Limit** the license numbers to 8 characters by modifying the corresponding *setter* function
   ([PHP Documentation : strlen](Http://php.net/manual/en/function.strlen.php)).

4. Fill in `afficher()` so that this function will display the information of
   the current car (look at the code to the constructor of the class `Voiture`:
   as in Java, you can use the keyword `this` but followed by `->`);

5. Test that your class is correct: The page generated from `Voiture.php` by the
    server `webinfo` must not display any error.  
	**Request** your page to `webinfo`
    [http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/Voiture.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/Voiture.php)
	
6. Save your work with `git add filename` and `git commit`. Use as always `git
   status` to know where you are at.

</div>

### Use of the class `Voiture`

<div class="exercise-en">

1. Create a file `testVoiture.php` containing the classic HTML structure
   (`<html>`,`<head>`,`<body>` ...)

2. Let's  create `Voiture` objects and display them in the `<body>` tag:

   * Include `Voiture.php` with the help of `require_once` as seen previously;

   * initialize a variable `$car1` of the class `Voiture` with the same syntax
   as Java;

   * Display this car with the help of its method `display()`.

3. Test your page on `webinfo`:
   [http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/testVoiture.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/testVoiture.php)

4. Get yourself used to save regularly your changes with Git. You can also run
   `git log` to see all your past saves.

</div>

## Interaction with a form

<div class="exercise-en">

1. Create a file `formulaireVoiture.html` with the classical HTML structure
   and, in the body, insert the following form:

   ```html
   <form method="get" action="creerVoiture.php">
     <fieldset>
       <legend>My form:</legend>
       <p>
         <label for="immat_id">License number</label> :
         <input type="text" placeholder="Ex : 256AB34" name="immatriculation" id="immat_id" required/>
       </p>
       <p>
         <input type="submit" value="Submit" />
       </p>
     </fieldset> 
   </form>
   ```

2. Remember (or reread the [course 1]({{site.baseurl}}/classes/class1.html)) the
   meaning of the attributes `action` of `<form>` and `name` of `<input>`.

   **Additional reminders:**

   * The attribute `for` of `<label>` must contain the identifier of an
   `<input>` ; then a click on the text of the `<label>` brings you directly in
   this field.

   * The attribute `placeholder` of `<input>` is used to write a default value
     to help the user.

3. Create `<input>` fields in the form where the user will input the make and
   color of the car.

4. Remember (or reread [course 1]({{site.baseurl}}/classes/class1.html)) what is
   the effect of clicking on the button **"Submit"**.  
   Check by clicking on this button.

   **How are transmitted the information?**  
   **What is the name of the part of the URL containing the information?**


</div>
<div class="exercise-en">

5. Create a file `creerVoiture.php`:

   1. Reread the 
   [course 1]({{Site.baseurl}}/classes/class1.html) 
   if necessary to know how to retrieve the information sent by the form.
   1. Verify that `creerVoiture.php` receives information from the *query
   string*. To do this, verify that the array `$_GET` is not empty.
   1. Restarting from the code of `testVoiture.php`, make `creerVoiture.php`
   display all the information of the car sent by the form.
   1. Of course, **test your page** by requesting it to `webinfo`.

6. In order to avoid the form data to appear in the URL, edit the form for that
   it uses the POST method:

   ```html
   <form method="post" action="creerVoiture.php">
   ```
   
   and, in `creerVoiture.php`, update the recovery of the form data.

7. 1. Remember (or reread
   [course 1]({{site.baseurl}}/classes/class1.html))
   where the information is sent by a form using the POST method;
   1. Change `creerVoiture.php` to retrieve the information sent by the form;
   1. Try to
   [**see the information sent by the form**]({{site.baseurl}}/classes/class1.html#coutons-le-rseau)
   with the help of the development tools (`F12` then Network Tab).
   
8. Have you thought about saving your modifications with Git ? It could be
   useful next week to know where you were at the end of this tutorial.

</div>

## The foundations of a carpool website

You are going to program the classes of a carpool website ; here is the
description of a minimalist version:

* **Utilisateur :** A user has attributes `(login, nom, prenom)`
* **Trajet :** An carpool ad includes:
1. A unique identifier `id`,
1. the details of the journey (a starting point `depart` and a point of arrival
`arrivee`),
1. specific details to the ad such as a departure date `date`,
1. a number of available places `nbplaces`,
1. a price `prix`,
1. and the login of the driver `conducteur_login`,

**Tip:** To avoid typing 7 *getters*, 7 *setters* and a constructor
with 7 arguments for `Trajet`, we will code:

1. *generic getters* `get($attribute_name)` that return the valuer of the
   attribute named `$attribute_name`. Use the following syntax to access the
    attribute named `$attribute_name` of the object `$object`:

   ```php?start_inline=1
   $object->$attribute_name
   ```
1. *generic setters* `set($attribute_name, $value)`;
1. a constructor `__construct($data)` which takes an array whose indices
   correspond to attributes of the class.

## Install an Apache server at home

We advise you to install Apache + PHP + MYSQL + PhpMyAdmin on your own computer,
this will be very useful what will happen next and in particular for the
project.

**Setup:**

* on Linux: two possibilities

  * XAMP  
    [https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-environnement-de-travail#/id/r-4443743](https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-environnement-de-travail#/id/r-4443743)
    <!-- MariaDb (Open Source fork of MySQL) -->
  * LAMP  
    [https://doc.ubuntu-fr.org/lamp](https://doc.ubuntu-fr.org/lamp)  
	Verify that you install also `phpmyadmin` and that you enable the
	Apache module `userdir` to be able to put your webpages in `public_html`.

* on Mac OS X (MAMP) :  
  [https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-environnement-de-travail#/id/r-4443692](https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-environnement-de-travail#/id/r-4443692)
  
* on Windows (WAMP) :  
  [https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-environnement-de-travail#/id/r-4443661](https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-environnement-de-travail#/id/r-4443661)
  

**Attention**, change the `php.ini` to put `display_errors = On` and
`error_reporting = E_ALL`, to have the error messages displayed. Indeed, the
default configuration of the server is the production mode (`display_errors =
off`). You must restart Apache for the changes to be taken into account.
