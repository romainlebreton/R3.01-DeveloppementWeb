---
title: TD6 &ndash; Architecture MVC avancée 2/2
subtitle: Vues modulaires, filtrage, formulaires améliorés
layout: tutorial
---

Let’s keep developing our carpool website. As our website grows, we will benefit
from the MVC pattern which will make our task easier.


The goal of TDs 5 & 6 is to have a carpool website that enables a simple
management of cars, users and journeys. We will add user sessions management
later, but in the meantime we will develop the admin interface.

You must have completed fully [the previous tutorial](tutorial5-en.html) before
starting this one.

## CRUD for cars

CRUD is an acronym for *Create/Read/Update/Delete*, which are the four basic
operations on all data. Let's complete our website to implement all these
operations. We already have coded:


1. display all cars: action `readAll`
1. display the details of one car: action `read`
1. display the car creation form: action `create`
1. create a car in the database and display a confirmation message: action `created`


#### Default action

First, we want to define a default action `readAll`. Therefore, if a client
request the webpage `index.php` with no action, he will get the same page as if
he requested `index.php?action=readAll`.


<div class="exercise-en">

1. If no `action` is given in the query string, make the router call the action 
   `readall`.  
   You can use the [function
   `array_key_exists`](https://secure.php.net/manual/en/function.array-key-exists.php)
   to test if the array `$_GET` has a key `action`, which happens if and only if
   the URL contained an action in its query string .
   
1. Test your website `index.php` with no action.

**Note:** In general, you should **never** read a cell of an array (like
  `$_GET`) unless you made sure that the index exists in the array. Otherwise,
  you will have an error message `Undefined index : action ...`.

</div>

From now on, the webpage
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php)
should work with no parameter in the URL. 

Note that you can directly request the URL
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/)
instead of `index.php`: indeed Apache automatically opens the webpages
`index.html` or `index.php` if you request a folder.

#### Action verification

<div class="exercise-en">

We want the router to check that the `action` is a valid method name of
`ControllerVoiture.php` before calling this method. If not, we should redirect
to an error page.

**Modify** the router code to implement this function. If the action does not
exist, call the `error` method of the controller, which you will have to code so
that it displays the view `view/voiture/error.php`.

**Note :** You can get an array containing the methods of a specific class with
[the function `get_class_methods()`](http://php.net/manual/en/function.get-class-methods.php)
and test if a value belongs to an array with 
[the function `in_array`](http://php.net/manual/en/function.in-array.php).

</div>

#### Action `delete`

You may have already coded this action at the end of tutorial 4. If so, please
redo it quickly so that the name of the methods match the ones of the following
exercise.

<div class="exercise-en">

We want to add a `delete` action to cars. To do this:

1. Add a method `deleteByImmat($immat)` inside `ModelVoiture` which takes as
   input the license plate to delete. Don't forget to use PDO prepared
   statements.
1. Create and fill an action `delete` in the car controller so that 

   1. it deletes the car whose license plate is given in the URL,   
   1. it initializes two variables `immat` and `tab_v`,    
   1. it displays the view `view/voiture/deleted.php` (see next question) using
   the mechanism of generic views seen during last tutorial. So you will need to
   initialize variables `view`, `controller` and `pagetitle` before calling the
   generic view `view.php.`

1. Create a view `view/voiture/deleted.php` to display a confirmation message
   that the car of license place `immat` has been deleted. This message will be
   followed by the list of cars given by the view `list.php` (similarly to
   `created.php`).

1. Complete the detail view `detail.php` to add an hypertext link which deletes
   the current car.  
   **Help:** Proceed step by step. First create a link that works for one car,
   then create the dynamic link which depend on the current car.
   
1. Test it all. When it works, enjoy.

</div>

#### Action `update` and `updated`

<div class="exercise-en">

Let's add a `update` action that displays a form to update the car
information. To do this:

1. Create a view `view/voiture/update.php` to display a form similar to the one
   of `create.php`, except that all the input fields will be pre-filled. The
   license plate of the car which we want to update will be sent via the URL;
   the other information will be retrieved from the database. This form will
   point to the action `updated` which will process the data (see next
   question). Please read the following note before starting:
   
   1. The attribute `value` of the tag `<input>` can be used to pre-fill a
      field. Note that the attribute `readonly` will help you to display the
      license plate without allowing the client to modify it.
   
   1. You should use the model's method `getVoitureByImmat` to retrieve the
      object `Voiture` given a license plate. The view will use this object to
      pre-fill the input fields.
	  
   1. Don't forget to escape your PHP variables before writing them in the HTML
      or in URLs.
   
   1. **Reminder -- Beware when mixing `POST` and `GET` :** You wish to send
      `action=updated` as well as the information filled in the form. You have got
      two options:

      1. You can add the information in the URL of the target webpage with

         ```html?start_inline=1
         <form action='routeur.php?action=updated' ...>
         ```
         **but** it does **not** work if the method is `GET`.
      2. Or (**advised**) add a hidden input field to your form to send this
         information along with the others:

         ```html?start_inline=1
         <input type='hidden' name='action' value='updated'>
         ```

         If you don't know `<input type='hidden'>`, go read 
		 [its documentation](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input).

1. Complete the `update` action in the car controller to display the pre-filled
   form. **Test** your action.

1. Enhance the detail view `detail.php` with a hypertext link to the update page
   of the current car.
   
</div>

<div class="exercise-en">

Let's add an `updated` action which updates the database. To do that:

1. Create a method `update($data)` in the car model. The `data` input will be an
   associative array containing all the car information. In practice, the
   parameter `data` will correspond to the input of the function
   `execute($data)` in your prepared statement
   ([see tutorial 3]({{site.baseurl}}/tutorials/tutorial3-en.html#prepared-statements)).

   **Reminder:** It is a best practice to first develop your SQL query in
   PHPMyAdmin because integrating it in your model.

1. Fill the view `view/voiture/updated.php` to display a message confirming the
   update followed by the list of cars (in the same way than `deleted.php` and
   `created.php`).

1. Complete the action `updated` of the car controller so that it updates the
   car whose license plate is given in the URL, and display the view
   `view/voiture/updated.php` after having properly initialized it.
   
1.  Test it all. When it works, enjoy the moment.

</div>


## Many controllers

Now that our website offers the minimal car management functions (*Create / Read
/ Update / Delete*), our goal is to add similar operations for journeys and users. A
significant part of the future journey MVC is identical to the car
MVC. Therefore, we will start by making our car MVC more generic, which will
later facilitate the coding of others MVC.

### In the router

To be able to handle more controllers, our homepage `index.php` needs to know
which controller is used. So we will specify the controller in the *query
string*. For instance, we will now have to request the webpage
`index.php?controller=voiture&action=readAll` to get the action `readAll` of the
car controller.

<div class="exercise-en">

1. Create a variable `controller` in `routeur.php` which retrieves the
   information from the URL, with a default value `voiture` if no controller is
   given in the URL.

2. Create the controller name variable from the variable `controller`. For
   instance, when `$controller="voiture"`, we should create a variable
   `controller_class` with the value `"ControllerVoiture"`.

   **Help:** The 
   [`ucfirst` function](http://php.net/manual/en/function.ucfirst.php) 
   (UpperCase FIRST letter) will capitalize the first letter of a string.

3. Check that the `controller_class` exists with the help of the [`class_exists`
   function](http://php.net/manual/en/function.class-exists.php); if so, call 
   its method `action`. Otherwise, call the `error` action.
   
3. Test you code by calling different actions of the car controller.

</div>

### Beginning of a new controller

Let's start with the action `readAll` of the `Utilisateur` MVC.

<div class="exercise-en">

1. Create a controller `controller/ControllerUtilisateur.php` similar to the car
   controller. For now, you should only have a `readAll` action and a `require`
   of the model before the class definition.
   
   **Hint:** You can easily replace all the strings `voiture` into `utilisateur`
     with `Ctrl+H` on Netbeans. You may want to check the box "Preserve the
     case" to keep uppercase and lowercase letters.
	 
<!-- 1. Quelles différences notez-vous entre le code de `ControllerUtilisateur.php` et -->
<!--    celui de `ControllerVoiture.php` -->

1. Include the class `ControllerUtilisateur.php` in `routeur.php` so you can use
   it there.

2. Create a model `model/ModelUtilisateur.php` based on your class `Utilisateur`
   from TDs 2 & 3. This model should only contain some *getter*, some *setter*,
   the constructor and the function `getAllUtilisateurs` for now.

<!-- 1. Quelles différences notez-vous entre le code de `ModelUtilisateur.php` et -->
<!--    celui de `ModelVoiture.php` -->

3. Create a view `view/utilisateur/list.php` similar to those of cars (no links
   for now).

4. **Test** you action `readAll` of controller `Utilisateur`.

</div>

## Generic model and controller

As you may have noticed, the code for CRUD of users and journeys will be very
similar to the one of cars. Instead of copy/pasting the code and replacing
`voiture` by `utilisateur` everywhere, we will create a generic code.

### Creation of a generic model

Let's move all the functions of `ModelVoiture.php` which are not specific to
cars into a generic model `Model.php`.

<div class="exercise-en">

Let's start with `getAllVoitures()` of `ModelVoiture.php`. As you may have
noticed, the only difference between `getAllVoitures()` and
`getAllUtilisateurs()` is the name of the database table and the name of
`FETCH_CLASS` class. Let's proceed as follows:

1. Move `getAllVoitures()` from `ModelVoiture.php` to
   `Model.php` and rename it `selectAll()`.

1. Make the class `ModelVoiture` inherit from `Model` (keyword `extends`
   as in Java).  
   Create in `ModelVoiture.php` a variable `object` that is `protected` (only
   accessible by the current class and its inherited classes), `static` (only
   depend on the class, not on the instance `$this`) with value `voiture`.

1. Repeat the process for `ModelUtilisateur`.

1. Let's code `selectAll()`. The idea is that this function will be inherited by
   `ModelVoiture` and `ModelUtilisateur`. So when you call
   `ModelVoiture::selectAll()`, we want to generic function to use the variable
   `$object='voiture'` of `ModelVoiture` to call the good database table
   `voiture` and the adequate `FETCH_CLASS` class `ModelVoiture`. And when we
   will call `ModelUtilisateur::selectAll()`, because the variable `$object` is
   equal to `'utilisateur'`, we will call also the good table and fetch
   class. Let's do it:

   1. create a variable `table_name` in `selectAll()` qui retrieves the name of
      the object with `static::$object`;
   
      **More explanations:** The syntax `static::$object` is 
	  [somewhat subtle](http://php.net/manual/en/language.oop5.late-static-bindings.php).
      For example, if we call it in the context of `ModelVoiture::selectAll()`
      which inherits from `Model::selectAll()`, `static::$object` will point to 
      `ModelVoiture::$object` instead of `Model::$object`. The syntax 
	  `self::$object` would have done the opposite.
   
   1. Create a variable `class_name` in `selectAll()` which will create the
      class name `ModelVoiture` using `$object='voiture'` (use again
      [`ucfirst()`](http://php.net/manual/en/function.ucfirst.php)).

   1. Use both these variables to call the good table and fetch class in
      `selectAll()`.


1. It remains to call `ModelVoiture::selectAll()` instead of
   `getAllVoitures()` and the same for users.

1. Test that you website still works.

</div>

### Action `read`

Our proposition of code refactoring for the actions `read` is the following:

* create a generic function `select($primary_value)` in `Model.php` which will
  search in the database the field with primary key value is
  `primary_value`. What's new is that this function needs to know the name of
  the primary key; so we will add an attribute `primary` to our classes
  `ModelVoiture` and `ModelUtilisateur`.
  
* replace all the `$controller='voiture'` in the actions (used in the generic
  view) by an `object` attribute of `ControllerVoiture.php` called in the
  generic view.

<div class="exercise-en">

Let's begin with `select($primary_value)`. In this function, the table name and
the condition `WHERE` varies.

1. Move the function `getVoitureByImmat($immat)` in `ModelVoiture.php` to
   `Model.php` and rename it `select($primary_value)`.

1. Create in `ModelVoiture.php` a variable

   ```php?start_inline=1
   protected static $primary='immatriculation'
   ```

   and do the same in `ModelUtilisateur.php`.

1. Let's code `select($primary_value)` :

   1. create variables `table_name` and `class_name` as previously.
   
   1. create a variable `primary_key` which retrieves the value of
      `static::$primary`
   
   1. Use all these variables to call the adequate table, primary key name and
      fetch class name in `select($primary_value)`.

1. It remains to call the new method `ModelVoiture::select($immat)` in the
   action `read()` of `ControllerVoiture`.
   
1. Test that you website still works.

</div>

<div class="exercise-en">

Create an attribute `protected static $object` in your controllers. Instead of
initializing variables `controller` in the actions, call this attribute `$object`
in the generic view.

</div>

<div class="exercise-en">

It remains to create the action `read()` in `ControllerUtilisateur`, its
associated view `detail.php` and to add the corresponding links in `list.php`.

</div>


### Action `delete`

Nothing fundamentally new.

<div class="exercise-en">

We let you adapt the function `delete($primary)` of `Model.php`, the action
`delete` of `ControllerUtilisateur` and its associated view `delete.php`, and
don't forget to add the links in `list.php`.

**Reminder:** Use the *Replace* feature of NetBeans to be more efficient.

</div>

### Action `create` and `update`

The views `create.php` and `update.php` also almost the same: they display the
same form, except that one pre-fill it. So we should merge these two views in one.

<div class="exercise-en">

1. Delete the view `create.php` and modify the controller so that the action
   `create` calls `update.php`.

   **Attention:** When we use `update.php` in action `create`, we should
   initialize the variables of license plate, color and make (with an empty
   string).

1. the field `immatriculation` of the form should be:

   * `required` if the action is `create` or
   * `readonly` if the action is `update` (can't modify the primary key of a
     database entry).

   Use a variable in the controller to implement this behavior.

1. at last, the field `action` of the form should be `save` if the action is
   `create` or `updated` is the action is `update`. 

1. Test your new merged view.

1. Let's anticipate what's coming: please create an input field `controller` in
   the form with the value `voiture` retrieved from the `static::$object` of the
   controller.

</div>

<div class="exercise-en">

We let you adapt the actions `create` and `update` of `ControllerUtilisateur`,
their associated view `update.php` and add links in `detail.php` to update
users..

</div>

### Action `created` et `updated`

For these last actions, we have a little bit of additional work to create the
corresponding function in the generic model.

<div class="exercise-en">

A generic function `update($data)` should create automatically the SQL prepared
statement

```sql
UPDATE voiture SET marque=:marque,couleur=:couleur,immatriculation=:immatriculation WHERE id=:id
```

To do so, we need to have the list of the fields of the table `voiture`; we can
get them from the array `data` since they are its keys.

1. Move `update()` from `ModelVoiture.php` to `Model.php`.
1. Replace the table name and primary key name.
1. Generate the `SET` part from the list of keys of `data`. To put it
   differently, if the array `data` has a key `un_champ`, we should append
   `un_champ=:un_champ` to the `SET` part.

   **Hint:** The function `rtrim` can be useful to remove the superfluous comma
   at the end.

</div>

<div class="exercise-en">

Repeat last question with the function `save()` in different models.

</div>

## Controller trajet

Adapt every actions of `ControllerTrajet.php` and test them one at a time.
We advise you to proceed in the following order : `read`, `delete`,
`create`, `update`, `save` and `updated`.

You can also add actions to display the list of passengers of a journey, and
conversely the list of journeys of a passenger (using the join table `passager`,
see the end of TD3).

