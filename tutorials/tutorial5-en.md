---
title: TD5 &ndash; Advanced MVC pattern 1/2
subtitle: index.php, HTML escaping, modular views, CRUD
layout: tutorial
---

Let's keep developing our carpool website. As our website grows, we will
benefit from the MVC pattern which will make our task easier.

The goal of TDs 5 & 6 is to have a carpool website that enables a simple
management of cars, users and journeys. We will add user sessions management
later, but in the meantime we will develop the admin interface.

You must have completed 
[exercises 1 to 8 of previous tutorial](tutorial4-en.html#view-add-a-car) 
before starting this tutorial, which means that you have already coded 
actions `create` and `created`.

## Warm up

Last week, we began to use the MVC architectural design pattern which separates
the code into three parts:

3. The model (*e.g.* `model/ModelVoiture.php`) is a library of all functions
related to data management, *i.e.* mostly interaction with the database in our
case. This library will be used by the controller.
2. The view (*e.g.* `view/voiture/list.php`) only contains the chunks of code
which generates the HTML webpage. Once again, this is also a toolbox that will
be used by the controller.
1. The controller is the main part of the PHP script which controls everything
   to produce the webpage. In our case, it is made of two parts:

   1. the router (*e.g.* `controller/routeur.php`) is the entry webpage, that is
      the page requested by the client. Therefore, it is **this script** that is
      executed (like the main function in Java). The role of this component is
      to retrieve the action and to call the corresponding function of the
      following controller part.

   1. the `Voiture` part of the controller (*e.g.*
      `controller/ControllerVoiture.php`) is a class whose methods corresponds
      to the different actions. This is the most important part of your PHP
      scripts since it is where your pages are really coded. For example, it is
      the place where you call the model to retrieve or save some information in
      the database, where your process this data, and where you call the views
      to generate the webpage...
	  
<div class="exercise-en">

Draw on paper a diagram that explains how the controller (the router and the
controller Voiture), the model and the view interacts with each other when a
client asks for the action `read`.

</div>

## Change of the home webpage

As reminded just before, the user should request the page
`controller/routeur.php` to access the website. However, the internal
organization of the website should not be visible outside and the URL should be
clean. So we will move the home page to `index.php`.

#### This issue with moving to `index.php`

Until now, `.../controller/routeur.php` was the entry point of our PHP
script. Since `require` has the effect of a copy/paste, all included files were
pasted inside the router. The issue appears when we use relative path: in our
case, all relative paths were relative to `.../controller/routeur.php`. But since
we are going to move the entry point to `.../index.php`, all relative paths will
become relative with respect to a different folder.

#### First solution

To remedy this issue, we will use absolute paths. Let's write the absolute path
of the folder containing our website in `$ROOT_FOLDER`. For instance, on IUT's
computers, it should be something like
   
```php?start_inline=1
$ROOT_FOLDER = "/home/ann2/votre_login/public_html/TD5";
```

and for your Windows computers something like
   
```php?start_inline=1
$ROOT_FOLDER = "C:\\wamp\www\TD5";
```

Then we can use this variable to create absolute path by writing by instance

```php?start_inline=1
require_once "{$ROOT_FOLDER}/config/Conf.php";
```

instead of the relative path

```php?start_inline=1
require_once "./config/Conf.php";
```

<div class="exercise-en">

For the sake of clarity, let's write a function `build_path`
which takes as input an array like `array("config","Conf.php")` and outputs
`"{$ROOT_FOLDER}/config/Conf.php"`.

1. Create a PHP class `File` in the file `lib/File.php`.

1. Copy the following static method `build_path` in the `File` class. Check that
   you understand what it does. Test it on the previous array to see if it
   matches the description:

   ```php?start_inline=1
   public static function build_path($path_array) {
       // $ROOT_FOLDER (sans slash à la fin) vaut
       // "/home/ann2/votre_login/public_html/TD5" à l'IUT 
       $ROOT_FOLDER = "Votre chemin de fichier menant au site Web";
       return $ROOT_FOLDER. '/' . join('/', $path_array);
   }
   ```

   **Note:** [Documentation of the function `join`](http://php.net/manual/fr/function.join.php).
   
1. **Include** `File.php` in `routeur.php`.  
   **Modify** all the `require` of all file to use absolute path using `build_path`.  
   **Test** that your old website `controller/routeur.php?action=readAll` is
   still working.

   **Remark:** We have to make an exception with the `require` of
     `File.php` since `build_path` is not defined until after this inclusion.

3. Let's change the home page to `index.php`. Create such a file in the root
   folder of your website. The job of `index.php` is to include `File.php` and
   `controller/routeur.php`.  
   **Test** that your website still works when a client requests
   `index.php?action=readAll`.

4. Change all URLs in all files (especially in tags `<a>` and `<form>`) so that
   they point to `index.php` instead of `controller/routeur.php`.

</div>

#### A more portable solution

We want our website to be portable, i.e. to work on different systems, different
root folder ... But our variable `$ROOT_FOLDER` and our path are not portable
yet since root folders are completely different (`C:\\wamp\www` on Windows and
`/home/ann2/lebreton/public_html` on Linux) and since directories are separated
by backslash `\` on Windows, whereas Linux and Mac use slash `/`.

Therefore, we will retrieve dynamically the root folder with the code:
   
```php?start_inline=1
// __DIR__ est une constante "magique" de PHP qui contient le chemin du dossier courant
$ROOT_FOLDER = __DIR__;
```

Also, we will use the PHP constant `DIRECTORY_SEPARATOR` which contains the
appropriate directory separator depending on the operating system:

```php?start_inline=1
// DS contient le slash des chemins de fichiers, c'est-à-dire '/' sur Linux et '\' sur Windows
$DS = DIRECTORY_SEPARATOR;
```

**References:**

* [Magin constants in PHP](http://php.net/manual/fr/language.constants.predefined.php)
* [Predefined constants in PHP](http://php.net/manual/fr/dir.constants.php)


<div class="exercise-en">

To apply these two changes, we will have to change the code at two locations:

1. For the `require` of `File.php` in `index.php`.

1. In the function `build_path`.

   **Careful:** If `__DIR\\` is used inside an include, the directory of the
     included file is returned.  Since `File.php` is inside `lib`,
     we should go back to the parent folder using `"/.."`. This gives

   ```php?start_inline=1
   $DS = DIRECTORY_SEPARATOR;
   $ROOT_FOLDER = __DIR__ . $DS . "..";
   ```

**Test** your website.

</div>

## Security of the views

We will learn why we should be careful when the generation of the HTML webpage
writes the content of a PHP variable. The reasons behind this problem are
similar to the issue behind SQL injections.

For example, our view `detail.php` writes

```php?start_inline=1
echo "<p> Voiture $v->getImmatriculation() </p>";
```

What happens if the user has written HTML code in the license plate input field?

<div class="exercise-en">

Create a car with license plate `<h1>Hack` and see how it is displayed by the
`readAll` action. Inspect the corresponding HTML source code to understand what
happened.

</div>

The license plate is understood as HTML code and so it is interpreted as
such. The behavior is undesired and could even be dangerous if the user were to
include some JavaScript (using the `<script>` tag).

#### Escaping HTML code

To avoid this, we have to understand the **HTML special characters**. These
special characters are those which have a special meaning in HTML:

1. the chevrons (or angle brackets) `<` and `>` because they delimit HTML tags;
2. Simple and double quotes `'` and `"` because they delimit attribute values;
3. The ampersand `&` because it is used to escape characters (see below).

But then, how do you write the character `<` in a text? You use a code (named
HTML entity) for it, e.g. `&lt;` for `<`. All these special characters must
replaced by their HTML entity so that they display properly and they don't mess
with the HTML structure. Here is the list of the HTML entities of special
characters:

| `&lt;` | `&gt;` | `&amp;` | `&quot;` | `&apos;` |
|  `<`   |  `>`   |   `&`   |   `"`    |   `'`    |
{: #entities .centered }

<style scoped>
#entities td { padding: 0.5ex 2em }
#entities td:not(:first-child) { border-left: solid thin #aaa }
</style>

**Good news:** PHP can escape characters for you with the function
[`htmlspecialchars`](http://php.net/manual/fr/function.htmlspecialchars.php). For
instance, the code

```php?start_inline=1
echo htmlspecialchars('<a href="test">Test</a>');
```

returns

```text
&lt;a href=&quot;test&quot;&gt;
```

Note that characters have been escaped.

<div class="exercise-en">

1. Change all your views so that every PHP variable used in the HTML generation
   is escaped using `htmlspecialchars`.
2. Check if the car with license plate `<h1>Hack` displays correctly
   now. Inspect the source code to see how it has been escaped.

</div>

#### Escaping URLs

Similarly, some characters in URLs should be escaped in order to avoid changing
the URL structure. For instance, characters `?` and `=` have a special meaning
in URLs since they are part of the query string syntax.

For your information, the list of URL special characters is
`:/?#[]@!$&'()*+,;=`. PHP provides a function
[`rawurlencode`](http://php.net/manual/fr/function.rawurlencode.php) that escape
these characters.


<div class="exercise-en">

1. Car a car with license plate `&immat=h` using the form of action `create` ;

1. Notice that the hypertext link pointing to the detail view is no longer working. Why is that?

   <!-- On change la signification de l'URL et on dit que l'immat est h au lieu
   de &immat=h -->

1. Change the view `list.php` so that it escapes the PHP variable containing the
   license plate in the URL.  
   
   **Attention:** You should not URL encode the variable which already HTML
   encoded the license plate. You should create two variables: one that escapes
   for HTML and one for URL.

1. Test your detail link and check that the issue is fixed.

</div>

**Source:** [RFC 3986 on URI](https://www.ietf.org/rfc/rfc3986.txt)

## Modular views

As of now, certain chunks of code are duplicated at many places. This is a
problem since it impairs the maintenance of the website and its debugging. 

### Share the header and the footer

At the moment, the views are asked to write the whole webpage, from
<code><!DOCTYPE HTML><html>...</code>
until
<code></body></html></code>
. This is an issue since this prevents us
from concatenating two views. More specifically, suppose that we want our
creation view (action `created`) to display a message (e.g. "Your car has been
saved.") followed by the list of all cars. We would like to reuse the view
`list.php`.  But since this view writes the webpage from the beginning to the
end, we cannot insert anything in the middle !

Our solution is to separate our webpages in three parts: the *header*, the
*body* and the *footer* (see the picture below). Note that the *header* and the *footer* are the same on all pages.

<p style="text-align:center">
<img src="{{site.baseurl}}/assets/headerbodyfooter.png" width="95%"
style="vertical-align:top">
</p>

In terms of HTML code, the *header* corresponds to the following part

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des trajets</title>
    </head>
    <body>
        <nav>
            <!-- Le menu de l'en-tête -->
        </nav>
```

the *body* corresponds to

```html?start_inline=1
        <div>
            <h1>Liste des trajets:</h1>
            <ol>
                <li>...</li>
                <li>...</li>
            </ol>
		</div>
```

and the *footer* corresponds to

```html?start_inline=1
    <p>Copyleft Romain Lebreton</p>
  </body>
</html>
```

From now on, all our views will only have the body part. And we will create a
special view (called the generic view) whose role is to load a specific "body"
view inside the common header and footer.

<div class="exercise-en">

1. Create a generic view `TD5/view/view.php` with the following code. To specify
   which "body" view should be included, we will use a variable `$view` (and
   also a variable `$pagetitle` to specify the page title).

   ```php
   <!DOCTYPE html>
   <html>
       <head>
           <meta charset="UTF-8">
           <title><?php echo $pagetitle; ?></title>
       </head>
       <body>
   <?php
   // Si $controleur='voiture' et $view='list',
   // alors $filepath="/chemin_du_site/view/voiture/list.php"
   $filepath = File::build_path(array("view", $controller, "$view.php"));
   require $filepath;
   ?>
       </body>
   </html>
   ```
   
2. In all pre-existing views, delete the *header* and the *footer* parts.

3. Change the action `readAll` to replace the `require` of the view `list.php`
   by a require of the generic view `view.php` and an initialization of its variables

   ```php?start_inline=1
   $controller = 'voiture';
   $view = 'list';
   $pagetitle = 'Liste des voitures';
   ```

4. **Test** the `readAll` action. Display the source code to check if the
   generated HTML is correct.

5. Change the other actions and test them.

</div> 

It is finally time to benefit from our change of organization to add simple
*header* and *footer* parts.

<div class="exercise-en"> 

1. Modify the generic view `view.php` to add a navigation bar `<nav>` with three links pointing to:

   * the car home page  
     `index.php?action=readAll`
   * the future user home page  
     `index.php?action=readAll&controller=utilisateur`
   * the future journey home page  
     `index.php?action=readAll&controller=trajet`

2. Modify the generic view `view.php` to add a simple footer like for instance 

   ```html
   <p style="border: 1px solid black;text-align:right;padding-right:1em;">
     Site de covoiturage de ...
   </p>
   ```

</div> 

### Concatenate views

Our new organization allows us to solve earlier issue of concatenated views.

<div class="exercise-en">

We want to create a view `created.php` which displays 

```html
<p>La voiture a bien été créée !</p>
```

followed by a `require` of `list.php` which will display the list of all cars.

1. Create this view `created.php` to match the above description.

2. Change the  `created` action to call this view.  
   **Attention:** Don't forget to initialize all variables required in the
   views, in particular `$tab_v` which is needed in `list.php`.

</div>
