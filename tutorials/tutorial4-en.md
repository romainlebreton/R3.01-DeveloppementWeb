---
title: TD4 &ndash; MVC pattern
subtitle: Model, View, Controller
layout: tutorial
---

The bigger your website gets, the more difficult it is to organize your
code. The upcoming tutorials will teach you one of the best practices. We call
*architectural design pattern* (patron de conception d'architecture) a set of
best practices to build a nice architecture (organization) for your code.

One of the most famous *design patterns* is named **MVC** (Model - View -
Controller): we will teach you this pattern in this course.

## Presentation of the **MVC** design pattern

The **MVC** pattern is meant to help you to organize your code. Until now, we
coded our webpages in a monolithic way: a lot of webpages were made of one
file, plus most of our webpages were mixing up the access to data (SQL), the
content (HTML) and the general processing (PHP). For the sake of clarity, we
will from now on separate these parts.

The objective of this tutorial is to reorganize the code of TD3 in order to add
some more features more easily. 

Let's see the MVC pattern in action on a concrete example: the webpage
`lireVoiture.php` of TD2:

```php
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des voitures</title>
    </head>
    <body>
        <?php
        require_once 'Voiture.php';
        $tab_v = Voiture::getAllVoitures();
        foreach ($tab_v as $v)
          $v->afficher();
        ?>
    </body>
</html>
```

This webpage was based on the `Voiture` class found in `Voiture.php`:

```php
<?php
require_once "Model.php";

class Voiture {
  private $marque;
  private $couleur;
  private $immatriculation;

  public function __construct($m = NULL, $c = NULL, $i = NULL) { ... }

  public function afficher() { ... }

  public static function getAllVoitures() { ... }

  public static function getVoitureByImmat($immatriculation) { ... }

  public function save() { ... }
}
?>
```

The **MVC** design pattern tells us to separate the code in 3 parts M, V and C,
each part having a very specific role. In our example, the content of
`lireVoiture.php` will be split into the controller
`controller/ControllerVoiture.php`, the model `model/ModelVoiture.php` and the
view `view/voiture/list.php`.

Here is an overview of the directory structure that you are going to use:

<img alt="Structure de nos fichiers"
src="../assets/RepStructure.png" style="margin-left:auto;margin-right:auto;display:block;width:12em;">


### M: The model

The model regroups all the code related to data management, which includes all
interactions with the database. For example, almost all of the `Voiture` class
that you created in previous tutorials contained code related to database
queries (except the function `afficher()`).

<div class="exercise-en">
1. Create directories `config`, `controller`, `model`, `view` and `view/voiture`.
1. Rename the file `Voiture.php` in `ModelVoiture.php`.  
   Rename the class in `ModelVoiture`. Comment temporarily the method `afficher()`.  
   Don't forget to update the references to this class name, especially in the
   `setFetchMode()` which should now create objects of class `ModelVoiture`.
1. Move your files `ModelVoiture.php` and `Model.php` in the directory `model/`.
1. Move `Conf.php` in the directory `config`.
1. Fix the relative path of the inclusions of `Model.php`, especially in `Conf.php`.
</div>

In our case, the new class `ModelVoiture` handles the persistence through the methods:

```php?start_inline=1
 $mv->save();
 $mv2 = ModelVoiture::getVoitureByImmat($immatriculation);
 $arrayVoitures = ModelVoiture::getAllVoitures();
```

**N.B.:** Remember that the last two functions `getVoitureByImmat` and
`getAllVoitures` are `static`. Therefore, they only depend on their class (and
not on their instance of the class). Hence the different syntax
`Class::fonction_statique()` to call them.

### V: the view

In the view part, we regroup every line of code that outputs something to the
HTML page that we are going to send back to the HTTP client. So in practice, the
views are files which contain mostly HTML code, except for `echo` of variables
(variable assignment belongs to the controller) and `for` loops to display
arrays of elements. **Therefore, there should be no processing, no computation
in the view.**

In our example, the view would be the following file `view/voiture/list.php`:

```php
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des voitures</title>
    </head>
    <body>
        <?php
		// Display of the cars stored in $tab_v
        foreach ($tab_v as $v)
            echo '<p> Voiture d\'immatriculation ' . $v->getImmatriculation() . '.</p>';
        ?>
    </body>
</html>
```

<div class="exercise-en">

Create the view `view/voiture/list.php` for the preceding code.

</div>

### C: the controller

The rest of the code goes into the controller. We could say that the controller
is the band leader, and that the views and models are just toolboxes for it. So
the controller contains only PHP code related to the logic of the code. In
practice on a typical webpage, the controller would retrieve the request of the
HTTP client (data sent by GET or POST), use the model to interact with the
database, analyze the answer and call the adequate view to generate the HTML
webpage.

There exists many variants of the **MVC** design pattern:

1. One big controller
1. One controller per model
1. One controller for each action in each model

We choose here to take the second option. So let's create the following
controller `controller/ControllerVoiture.php` for the model `ModelVoiture`:

```php
<?php
require_once ('../model/ModelVoiture.php'); // chargement du modèle
$tab_v = ModelVoiture::getAllVoitures();     //appel au modèle pour gerer la BD
require ('../view/voiture/list.php');  //redirige vers la vue
?>
```


Our controller is many of several parts:

1. Include the model `ModelVoiture`
3. Use the model to ask the database for the list of all cars
4. Use the view `list.php` to generate an HTML webpage which displays the list
   of cars stored in `$tab_v`

<div class="exercise-en">

1. Create the controller `controller/ControllerVoiture.php` with the previous code.
2. Test your webpage by requesting the URL
[.../controller/ControllerVoiture.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD4/controller/ControllerVoiture.php)
3. Spend some time understanding the **MVC** organization of this example.  
   Do you understand how the PHP code executes and in which order it moves through the MVC?  
   Does the new code seems similar to the old webpage `lireVoiture.php`, only
   different in its organization?   
   Talk to your professor if you have any questions.

</div>


**Notes:**

* **Why `../`?** Path is relative to the requested webpage, that is
  `controller/ControllerVoiture.php` in our case.
* Note that it is the controller job to declare and assign a value to `$tab_v`;
  the view should only read this variable to generate the webpage.



### The router: a component inside the controller

Controllers must, in fact, manage many webpages. In our example, it should handle
all pages related to `ModelVoiture`. As a consequence, we regroup the PHP controller code
that generates a webpage inside a function, and we include it inside a controller class.

Here is an example of what our controller `ControllerVoiture.php` will look
like. You can recognize in the method `readAll` the previous code which displays all cars.

```php
<?php
require_once ('../model/ModelVoiture.php'); // chargement du modèle
class ControllerVoiture {
    public static function readAll() {
        $tab_v = ModelVoiture::getAllVoitures();     //appel au modèle pour gerer la BD
        require ('../view/voiture/list.php');  //"redirige" vers la vue
    }
}
?>
```

We call *action* these kind of controller methode; an action corresponds roughly
to a webpage. In our example `ControllerVoiture`, we will soon add the 
actions which correspond to the following pages:

1. display all cars: action `readAll`
2. display the details of one car: action `read`
3. display the car creation form: action `create`
3. create a car in the database and display a confirmation message: action `created`
4. delete a car in the database and display a confirmation message: action `delete`

To recreate the previous webpage, we are still missing a chunk of code which
calls `ControllerVoiture::readAll()`. The *routeur* is that part of the
controller which is supposed to call the action of the controller. An simplified
router would be the following file `controller/routeur.php`:

```php
<?php
require_once 'ControllerVoiture.php';
ControllerVoiture::readAll(); // Appel de la méthode statique $action de ControllerVoiture
?>
```

<div class="exercise-en">
1. Modify the code of `ControllerVoiture.php` and create a file 
   `controller/routeur.php` which matches the code above;
2. Test the new architecture by calling the webpage
[.../controller/routeur.php](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php).
3. Take some time to make sure that you understand the **MVC** organization on this example.  
   Could you tell  in which order the PHP code executes and how it moves  through the MVC?
</div>

#### A more realistic router

We have to take into account that the client should be able to tell which action
it wants to execute. So, when the client will request the `routeur.php` webpage,
it will also send the information that a variable `action` takes the value
`readAll`.  To send this data to the server, the client will write it in the URL
using the *query string* syntax (see [the *query string* section in course
1]({{site.baseurl}}/classes/class1.html#les-query-strings-dans-lurl)).

On the server side, the router must retrieve the action sent and call the
corresponding controller method.

<div class="exercise-en">

1. Which URL should you request to ask for the router webpage while sending that
   `action` has value `readAll`?
1. How do you retrieve in PHP the value assigned to `action` in the URL?  
   Reminder: see [the *query string* section in course 1]({{site.baseurl}}/classes/class1.html#les-query-strings-dans-lurl)
</div>

In order to call the static method of the class `ControllerVoiture` whose name
is stored in the variable `$action`, PHP has the following syntax. Here is the
file `controller/routeur.php` updated:

```php
<?php
require_once 'ControllerVoiture.php';
// On recupère l'action passée dans l'URL
$action = ...; // À remplir, voir Exercice 5.2
// Appel de la méthode statique $action de ControllerVoiture
ControllerVoiture::$action(); 
?>
```

<div class="exercise-en">

1. Modify the code of `controller/routeur.php` to match the above code, and fill
   out yourself its line 4;
1. Test the new organization by calling the webpage
[.../controller/routeur.php](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php) while adding the information that `action` has value `readAll` as seen in Exercise 5.1.
3. Take some time to make sure that you understand the **MVC** organization on this example.  
   Could you tell  in which order the PHP code executes and how it moves  through the MVC?
   
</div>

#### Solutions

Here is how the PHP code executes the router webpage with action `readAll`:

1. The client ask for the URL
[.../controller/routeur.php?action=readAll](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php?action=readAll).
1. The router retrieves the action sent by the user using
   `$action = $_GET['action'];` (so `$action="readAll"`)
2. The router calls the static method `readAll` of `ControllerVoiture.php`;
3. `ControllerVoiture.php` uses the model to get the array of all cars;
4. `ControllerVoiture.php` uses the view to generate the HTML webpage.


## Your turn to code

### Detail view of cars

Since the webpage that lists all cars (action `readAll`) does not show all the
information, we wish to create a webpage that displays the details of one
car. This action needs to know the license plate of the concerned car; use again
the *query string* syntax to give this information in the URL together with the action:
[.../routeur.php?action=read&immat=AAA111BB](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php?action=read&immat=AAA11BB)

<div class="exercise-en"> 

1. Create a view `./view/voiture/detail.php` which displays all the information
   of the object of class `ModelVoiture` stored in the variable `$v`. Use the
   same display as in the previous method `afficher()`.  
   **Note:** The variable `$v` will be initialized later in the controller.

1. Add an action `read` to the controller `ControllerVoiture.php`. This action
   will retrieve the license plate given in the URL, call the method
   `getVoitureByImmat()` of the model, assign to the variable `$v` the concerned
   car and call the previous view.

2. Test this view by calling the router with the adequate parameters in the URL.

3. Add hypertext links `<a>` on the license plates of the view `list.php`
   that points to the detail view of the adequate car.

4. We want to handle unknown license plates: Create a view
   `./view/voiture/error.php` that shows an error message and call this view when
   `getVoitureByImmat()` does not find a car that matches this license plate.

</div>

### View "add a car"

Let's create two actions `create` and `created` (and their corresponding views)
which respectively displays a car creation form and which saves the car in the
database.

<div class="exercise-en">

1. Let's begin with the action `create` which display the form:
   1. Create a view `./view/voiture/create.php` which uses code from 
      `formulaireVoiture.html` of TD1.  
      The processing page of this form will be the router with action `created`.
   1. Add an action `create` to `ControllerVoiture.php` which displays this view.
1. Test your webpage by calling the action `create` of `routeur.php`.

1. Create the action `created` in the controller which will

   1. retrieve the car data from the URL,
   1. create an instance of `ModelVoiture` with previous data,
   2. call the method `save` of the model,
   3. call the method `readAll()` to display the array of all cars.

1. Test the action `created` of `routeur.php` by manually giving a license
   plate, a make and a color in the URL.

1. Test the whole thing, i.e. create the car in the form (action `create`),
   submit the form and it should call the action `created` and show that the car
   has been added.

   **Important** -- Attention to the transmission of `action=created`: You wish
   to send `action=created` as well as the information filled in the form. You
   have got two options:

   1. You can add the information in the URL of the target webpage with

      ```html?start_inline=1
      <form action='routeur.php?action=created' ...>
      ```
      **but** it does **not** work if the method is `GET`.
   2. Or (**advised**) add a hidden input field to your form to send this
      information along with the others:

      ```html?start_inline=1
      <input type='hidden' name='action' value='created'>
      ```

      If you don't know `<input type='hidden'>`, go read
      [its documentation](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input).


</div> 

## And if there is still some time left

<div class="exercise-en">

Draw on paper a diagram that explains how the controller (the router and the
controller `Voiture`), the model and the view interacts with each other when a
client asks for the action `read`.

</div>

<div class="exercise-en">

Let's use `try` / `catch` on SQL queries to handle the error caused by saving an
existing car:

1. Create such an error
1. Use 
   [a debugging display function]({{site.baseurl}}/tutorials/tutorial1-en.html#display-for-debugging)
   to explore the content of the error object `PDOException $e` in `save()` ;
1. Identify the MySQL error code which corresponds to your error. Use if necessary the 
   [MySQL error code webpage](https://dev.mysql.com/doc/refman/5.7/en/error-messages-server.html).
1. If this error happens, make `save()` return `false` instead of crashing.
1. Handle the case when `save()` returns `false` in action `created` to
   display an error message.

</div>

<div class="exercise-en">

Add a feature *"Delete a car"* (action `delete`). Add hypertext links to
delete a car directly from the list of cars (action `readAll`).

</div>
