---
title: TD6 &ndash; Architecture MVC avancée 2/2
subtitle: Vues modulaires, filtrage, formulaires améliorés
layout: tutorial
---

<!-- viewAllVoiture.php => list.php -->
<!-- viewCreateVoiture.php => create.php -->
<!-- error.php => error.php -->
<!-- detail.php => detail.php -->
<!-- ControllerVoiture.php => ControllerVoiture.php -->
<!-- ModelVoiture.php => ModelVoiture.php -->

<!-- Rajouter des fonctions de sécurité/contrôle avec isset($_GET) et les
htmlspecialchars quand on écrit dans du HTML et URLencode quand on écrit dans
une URL -->

<!-- XSS et protection de l'écriture html -->

<!--
Rajouter dispatcher
-->

<!--
Ou est-ce qu'ils codent vraiment utilisateurs et trajets ?
-->

Aujourd'hui nous continuons de développer notre site-école de covoiturage. Au
fur et à mesure que le projet grandit, nous allons bénéficier du modèle MVC qui
va nous faciliter la tâche de conception. En attendant de pouvoir gérer les
sessions d'utilisateur, nous allons développer l'interface "administrateur" du
site.

**old**
La semaine dernière, nous avions un site qui propose une gestion minimale des
voitures (*Create / Read / Update / Delete*). Notre objectif est d'avoir une
interface similaire pour les utilisateurs et les trajets. Dans ce TD, nous
allons dans un premier temps rendre notre MVC de voitures plus générique. Cela
nous permettra de l'adapter plus facilement aux utilisateurs et trajets dans un
second temps.

## CRUD pour les voitures

CRUD est un acronyme pour *Create/Read/Update/Delete*, qui sont les quatre
opérations de base de toute donnée. Nous allons compléter notre site pour qu'il
implémente toutes ces fonctionnalités. Lors du TD précédent, nous avont
implémenté nos premières actions (une action correspond à peu près à une page
Web) :

1. afficher toutes les voitures : action `readAll`
2. afficher les détails d'une voiture : action `read`
3. afficher le formulaire de création d'une voiture : action `create`
3. créer une voiture dans la BDD : action `created`

On veut rajouter un comportement par défaut pour la page d'accueil ; nous allons
faire en sorte qu'un utilisateur qui arrive sur `index.php` voit la même page
que s'il était arrivé sur `index.php?action=readAll`.

#### Action par défaut

<div class="exercise">

1. Si aucun paramètre n'est donné dans l'URL, initialisons la variable `$action`
avec la chaîne de caractères `readAll` dans `routeur.php`.  
Pour tester si un paramètre `action` est donné dans l'URL, utilisez la fonction
`isset($_GET['action'])` qui teste si une variable a été initialisée.

1. Testez votre site en appelant `index.php` sans action.

**Note :** De manière générale, il ne faut jamais lire un `$_GET['action']`
  avant d'avoir vérifié si il était bien défini avec un `isset(...)` sous peine
  d'avoir des erreurs `Undefined index : action ...`.

</div>

Désormais, la page
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php)
doit marcher sans paramètre.

Notez que vous pouvez aussi y accéder avec l'adresse
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `index.php` d'un répertoire
si elles existent.

#### Vérification de l'action

<div class="exercise">

On souhaite que le routeur vérifie que `$action` est le nom d'une méthode de
`ControllerVoiture.php` avant d'appeler cette méthode, et renvoyer vers une page
d'erreur le cas échéant.

**Modifiez** le code du routeur pour implémenter cette fonction.

**Note :** Vous pouvez récupérer le tableau des méthodes d'une classe avec
[la fonction `get_class_methods()`](http://php.net/manual/fr/function.get-class-methods.php)
et tester si une valeur appartient à un tableau avec
[la fonction `in_array`](http://php.net/manual/fr/function.in-array.php).


</div>

#### Action `delete`

<div class="exercise">

Nous souhaitons rajouter l'action `delete` aux voitures. Pour cela :

1. Écrivez dans le modèle de voiture la fonction `deleteByImmat($immat)` qui prend
   en entrée l'immatriculation à supprimer. Utilisez pour cela les requêtes préparées de
   PDO.
1. Complétez l'action `delete` du contrôleur de voiture pour qu'il supprime
   la voiture dont l'immatriculation est passée en paramètre dans l'URL, initialise les
   variables `$immat` et `$tab_v`, puis qu'il affiche la vue
   `view/voiture/deleted.php` que l'on va créer dans la question suivante.
1. Créez une vue `view/voiture/deleted.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation `$immat` a bien été
   supprimée. Affichez en dessous de ce message la liste des voitures en
   appelant la vue `list.php` (de la même manière que `created.php`).
1. Enrichissez la vue de détail `detail.php` pour ajouter un lien
HTML qui permet de supprimer la voiture dont on affiche les détails.  
   **Aide :** Procédez par étape. Écrivez d'abord un lien 'fixe' dans votre vue.
   Puis la partie qui dépend de la voiture.
   <!-- Erreur tentante : utiliser $ROOT_FOLDER dans les liens. On pourrait leur faire faire
   du $ROOTWEB -->
1. Testez le tout. Quand la fonctionnalité marche, appréciez l'instant.

</div>

<!--

Il semble que l'on puisse coder un $ROOTWEB portable à base de
$_SERVER['HTTP_HOST'] qui donne l'hôte et $_SERVER['REQUEST_URI'] qui donne le
chemin dans le serveur (?)

-->

#### Action `update` et `updated`

<div class="exercise">

Nous souhaitons rajouter l'action `update` aux voitures qui affiche le
formulaire de mise à jour. Pour cela :

1. Complétez la vue `view/voiture/update.php` pour qu'elle affiche un
   formulaire identique à celui de `create.php`, mais qui sera
   pré-rempli par les données de la voiture courante. Toutes les informations
   nécessaires seront une fois de plus passées *via* l'URL.

   **Indice :** L'attribut `value` de la balise `<input>` permet de pré-remplir un
   champ du formulaire.  Notez aussi que l'attribut `readonly` de `<input>`
   permet d'afficher l'immatriculation sans que l'internaute puisse le changer.

   **Rappel -- Attention au mélange de `POST` et `GET` :** Vous souhaitez envoyez
     l'information `action=updated` en plus des informations saisies lors de
     l'envoi du formulaire. Il y a deux possibilités :

      1. Vous pouvez rajouter l'information dans l'URL avec `<form
         ... action='index.php?action=updated'>` **mais** cela ne marche pas si
         la méthode est `GET`.
      2. Ou (conseillé) vous rajoutez un champ caché `<input type='hidden'
         name='action' value='updated'>` à votre formulaire.
  
1. Complétez l'action `update` du contrôleur de voiture pour qu'il affiche le
   formulaire pré-rempli. **Testez** votre action.

1. Enrichissez la vue de détail `detail.php` pour ajouter un lien HTML qui
   permet de mettre à jour la voiture dont on affiche les détails. Ce lien
   pointe donc vers le formulaire de mis-à-jour prérempli.

</div>

<div class="exercise">

Nous souhaitons rajouter l'action `updated` aux voitures qui effectue la mise à
jour dans la BDD. Pour cela :

1. Complétez dans le modèle de voiture la fonction `update($data)`. L'entrée
   `$data` sera un tableau associatif associant aux champs de la table
   `voiture` les valeurs correspondantes à la voiture courante. La fonction
   doit mettre à jour tous les champs de la voiture  dont l'immatriculation  est
   `$data['immat']`.

   **Rappel :**
   
   1. Ce type d'objet `$data` est celui qui est pris en entrée par la
      méthode `execute` de `PDO`,
      [*cf.* le TD3]({{site.baseurl}}/tutorials/tutorial3.html#les-requtes-prpares).   
   2. La bonne façon de développer est de d'abord développer sa requête SQL et de
      la tester dans PHPMyAdmin puis de créer la fonction correspondante.

1. Complétez la vue `view/voiture/updated.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation `$immat` a bien été mis à
   jour. Affichez en dessous de ce message la liste des voitures mise à jour (à
   la manière de `deleted.php` et `created.php`).
   
1. Complétez l'action `updated` du contrôleur de voiture pour qu'il mette à
   jour la voiture dont l'immatriculation passée en paramètre dans l'URL, puis
   qu'il affiche la vue `view/voiture/updated.php` après l'avoir correctement
   initialisée.
   
1. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>


## Dispatcher

Pour l'instant, nous n'avons travaillé que sur le contrôleur *voiture*. Nous
souhaitons maintenant rajouter les contrôleurs *utilisateur* et *trajet*. Pour gérer
tous les contrôleurs à partir de notre page d'accueil unique `index.php`, nous
avons besoin d'un *dispatcher*.

Le *dispatcher* (répartisseur) est une partie du contrôleur dont la fonction est
de charger le bon sous-contrôleur (par ex. *voiture*, *utilisateur* ou
*trajet*). Désormais, nous devons donc spécifier le contrôleur demandé dans le
*query string*. Par exemple, l'ancienne page
`index.php?action=readAll` du contrôleur *voiture* devra s'obtenir avec
`index.php?controller=voiture&action=readAll`.

<div class="exercise">

1. Définissez une variable `$controller` dans `index.php` en récupérant sa
valeur à partir de l'URL, et en mettant le contrôleur *voiture* par défaut.

   **Aide :** Ce bout de code est similaire à celui concernant `$action` dans
  `controlleurVoiture.php`.

2. Rajoutez un `switch` - `case` dans `index.php` pour charger le bon contrôleur
à l'aide d'un `require`.

3. Testez votre code en appelant vos anciennes pages du contrôleur *voiture*.

</div>

Maintenant que notre dispatcher est en place, nous pouvons créer de nouveaux
contrôleurs *utilisateur* et *trajet*.

<div class="exercise">

1. Créez un contrôleur `controller/controllerUtilisateur.php` similaire à celui
des voitures avec uniquement l'action `readAll` pour l'instant.

2. Créez un modèle `model/modelUtilisateur.php` basé sur votre classe
   `Utilisateur` des TDs 2 & 3. Supprimer les fonctions d'affichage pour ne
   laisser que l'interaction avec la BDD. Vérifiez que votre classe correspond
   bien à la table `utilisateur` dans votre BDD.

3. Créez une vue `view/utilisateur/viewAllUtilisateur.php` similaire à celle des
voitures.

4. **Testez** votre action en appelant la bonne URL (voir exercice 1).

</div>

## Vues modulaires

En l'état, certains bouts de code de nos vues se retrouvent dupliqués à de
multiples endroits. Par exemple, l'affichage de la liste des voitures, qui
se trouve dans `viewAllVoiture.php`, se retrouve en partie dans
`viewCreatedVoiture.php`, `viewDeletedVoiture.php` et
`viewUpdatedVoiture.php`.

Les prochaines questions vont vous aider à réorganiser le code pour éviter les
redondances en vue d'améliorer la maintenance du code et son debuggage.

### Mise en commun de l'en-tête et du pied de page

Actuellement, les scripts de vues sont chargées d'écrire l'ensemble de la page
Web, du `<!DOCTYPE HTML><html>...` jusqu'au `</body></html>`. Ceci empéchait de
mettre facilement deux vues bout à bout.

Par exemple, notre vue de création (action `created`) de *voiture* affichait
*"Votre voiture a bien été créée"* puis la liste des voitures. Il semblerait
donc naturel que la vue correspondante écrire le message puis appelle la vue
`viewAllVoiture.php`. Mais comme cette dernière vue écrivait la page HTML du
début à la fin, on ne pouvait rien y rajouter au milieu !

Décomposons nos pages Web en trois parties : le *header* (en-tête), le *body*
(corps) et le *footer* (pied de page). Dans le site final de l'an dernier, on
voit bien la distinction entre les 3 parties. On note aussi que le *header* et le 
*footer* sont communs à toutes nos pages.

<p style="text-align:center">
<img src="{{site.baseurl}}/assets/headerbodyfooter.png" width="95%"
style="vertical-align:top">
</p>

Au niveau du HTML, le *header* correspond à la partie :

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des trajets</title>
    </head>
    <body>
        <nav>
            <ul>
                <li>...</li>
                <li>...</li>
            </ul>
        </nav>
```

le *body* à la partie :

```html?start_inline=1
        <div>
            <h1>Liste des trajets:</h1>
            <ol>
                <li>...</li>
                <li>...</li>
            </ol>
		</div>
```

et le *footer* à la partie :

```html?start_inline=1
    <p>Copyleft Romain Lebreton</p>
  </body>
</html>
```



Nous allons donc changer nos vues pour qu'elles n'écrivent plus que le corps de
la page.

<div class="exercise">

1. Créer une vue générique `TD6/view/view.php` avec le code suivant. La fonction
de `view.php` est de charger une en-tête et un pied de page communs, ainsi que
la bonne vue en fonction de la variable `$view`.

```php
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title><?php echo $pagetitle; ?></title>
    </head>
    <body>
<?php
// Si $controleur='voiture' et $view='All',
// alors $filepath=".../view/voiture/"
//       $filename="viewAllVoiture.php";
// et on charge '.../view/voiture/viewAllVoiture.php'
$filepath = "{$ROOT}{$DS}view{$DS}{$controller}{$DS}";
$filename = "view".ucfirst($view) . ucfirst($controller) . '.php';
require "{$filepath}{$filename}";
?>
    </body>
</html>
```
   
   **Explication:** La fonction `ucfirst` (UpperCase FIRST letter) sert à mettre
   en majuscule la première lettre d'une chaîne de caractère.

2. Dans vos vues existantes, supprimer les parties du code correspondant aux
   *header* et *footer*.

3. Reprendre le contrôleur pour que, par exemple, à la place d'un `require
   './view/voiture/viewAllVoiture.php'`, on utilise `require
   './view/view.php'` en initialisant la variable
   `$view` avec `'All'` et `$pagetitle` avec le titre de page `'Liste des voitures`.

   <!-- 3. Redéfinir le `VIEW_PATH` en début de fichier par `define('VIEW_PATH', ROOT -->
   <!--    . DS . 'view' . DS);` -->
   <!-- Enfin, rajouter un `require VIEW_PATH . "view.php";` à la fin du fichier
   pour -->
   <!-- appeler notre vue générique. -->

4. **Testez** tout votre site.

</div> 

Nous allons bénéficier de notre changement d'organisation pour rajouter un
*header* et un *footer* (minimalistes) à toutes nos pages.

<div class="exercise"> 

1. Modifier la vue `view.php` pour ajouter en en-tête de page une barre de menu,
avec trois liens:

   * un lien vers la page d'accueil des voitures  
     `index.php?controller=voiture&action=readAll`
   * un lien vers la future page d'accueil des utilisateurs  
     `index.php?controller=utilisateur&action=readAll`
   * un lien vers la future page d'accueil des trajets  
   `index.php?controller=trajet&action=readAll`

   <!-- Le lien vers utilisateur doit marcher après la partie sur le dispatcher
   ? -->

2. Modifier la vue `view.php` pour rajouter un footer minimaliste comme par exemple

```html
<p style="border: 1px solid black;text-align:right;padding-right:1em;">
  Site de covoiturage de ...
</p>
```

</div> 

Notre réorganisation nous permet aussi de résoudre le problème soulevé plus tôt
à propos de la vue de création d'une voiture.

<div class="exercise">

Le script `viewAllVoiture.php` sert à écrire la liste des
voitures. Plutôt que d'avoir une copie de ce script dans
`viewCreatedVoiture.php`, `viewDeletedVoiture.php` et
`viewUpdatedVoiture.php`, incluez-le avec un `require`.

**Remarque :** Le fichier `viewDeletedVoiture.php` ne doit plus faire que
deux lignes maintenant.

</div>

### Un seul formulaire pour la création et la mise à jour

<div class="exercise">

Les vues `viewCreateVoiture.php` et `viewUpdateVoiture.php` sont quasiment
identiques : elles affichent le même formulaire, et le ré-remplissent ou
non. Nous allons donc fusionner `viewCreateVoiture.php` et
`viewUpdateVoiture.php` en une unique page.  En pratique,

* on supprime la vue `viewCreateVoiture.php` et on modifie le contrôleur de
sorte que l'action `create` appelle la vue `viewUpdateVoiture.php`.

* **Attention :** quand on arrive sur la vue `viewUpdateVoiture.php` depuis
l'action `create`, les variables `$n`, `$p`, ... ne sont pas renseignées. Penser
à les initialiser à chaîne vide dans le contrôleur.

* le champ `immatriculation` du formulaire doit être `required` si l'action est
`create` ou `readonly` si l'action est `update` (on ne peut pas modifier la clé
primaire
d'un tuple).  
   Utiliser une variable dans le contrôleur pour permettre l'adaptation de la
vue à ces deux actions.

* enfin, le champ `action` du formulaire doit être `save` si l'action est
`create` ou `updated` si l'action est `update`.  Là aussi, utiliser une variable
spécifique.


<!-- Mettre à jour le contrôleur en conséquence.\\ -->
<!-- **Indice :** `<input ... placeholder='Exemple' value='$val'>` affichera
'Exemple' en grisé si `$val` est la chaîne de caractère vide, et pré-remplira
avec la valeur de `$val` autrement. -->

</div> 

## CRUD pour les trajets

L'implémentation du CRUD pour les trajets est un code très similaire à celui
pour les voitures. Nous pourrions donc copier/coller le code des voitures et
changer les (nombreux) endroits nécessaires.

Pour éviter de perdre un temps conséquent à développer le CRUD pour chaque
nouvel objet, nous allons le créer automatiquement autant que possible.

### Création d'un modèle générique

Nous allons déplacer de `ModelVoiture.php` vers le modèle générique `Model.php`
toutes les fonctions qui ne sont pas spécifiques aux voitures.

<div class="exercise">

Commençons par la fonction `selectAll()` de `ModelVoiture.php`. Dans cette
fonction, seul le nom de la table présent dans la requête SQL varie.

1. Déplacez la fonction `selectAll()` de `ModelVoiture.php` vers `Model.php`.
1. Créez dans `ModelVoiture.php` une variable `$table` qui est `protected`
   (accessible uniquement dans la classe courante et ses classes filles) et
   `static` (qui ne dépend que de la classe, pas des objets).
1. Utilisez cette variable dans la fonction `selectAll()` de `Model.php` pour
faire la requête sur la bonne table.  Pour cela, accéder à la variable `$table`
avec `static::$table` dans `Model.php`.

   **Plus d'explications:** La syntaxe `static::$table` est quelque peu
  subtile. Dans notre cas, elle permet que lorsque l'on appelle
  `ModelVoiture::selectAll()`, qui est héritée de `Model::selectAll()`, la
  variable `static::$table` aille chercher `ModelVoiture::$table` et non pas
  `Model::$table`.
1. Testez que votre site marche toujours.

</div>

<div class="exercise">

Passons à la fonction `select()`. Dans cette fonction, le nom de la table et la
condition `WHERE` varie.

1. Déplacez la fonction `select()` de `ModelVoiture.php` vers `Model.php`.
1. Utilisez la variable statique `$table` de `ModelVoiture.php` pour remplacer
   le nom de la table.
1. Créez une variable statique `$primary` dans `ModelVoiture.php` qui contiendra
le nom du champ de la clé primaire.  Utilisez cette variable pour remplacer le
nom de la clé primaire dans `select()`.

</div>

<div class="exercise">

Répétez la question précédente avec la fonction `delete()`.

</div>

<div class="exercise">

Passons à la fonction `update()`. Pour reconstituer la requête 

```sql
UPDATE voiture SET marque=:marque,couleur=:couleur,immatriculation=:immatriculation WHERE id=:id
```

   il est nécessaire de pouvoir lister les champs de la table 'voiture'.  Ces
   champs sont les entrées du tableau `$data` et c'est ainsi que nous allons les
   récupérer.

1. Déplacez la fonction `update()` de `ModelVoiture.php` vers `Model.php`.
1. Remplacer la table et le nom de la clé primaire par les variables adéquates.
1. Nous allons générer la partie `SET` à partir des clés du tableau associatif
   `$data`. Autrement dit, si `$data['un_champ']` existe, nous voulons rajouter
   la condition ``un_champ = :un_champ'` à `SET`.

   **Indice:** Utilisez la boucle `foreach ($tableau as $cle => $valeur)` pour
  récupérer les clés du tableau. Googler aussi la fonction `rtrim` de PHP qui
  pourra vous être utile pour enlever la virgule de trop à la fin de votre
  requête.

</div>

<div class="exercise">

Répétez la question précédente avec la fonction `insert()`.

</div>

### Adaptation du contrôleur

Pour mémoire, dans la variante du MVC que nous avons choisi d'implémenter, il y
a un contrôleur par classe.  Dans cette partie, nous allons nous donc créer un
contrôleur pour la classe 'Trajets'.

**Attention :** NE PAS copier/coller bêtement `ControleurVoiture.php` en
`ControleurTrajet.php`.  Adaptez chacune des actions de `ControleurTrajet.php`
et les tester une à une.
<!-- Couper l'adaptation du contrôleur en petit bouts testables. -->

<div class="exercise"> 

Créer une vue `viewListTrajets`, et gérer l'action `readAll` de
`ControleurTrajet.php`.

</div>

<div class="exercise">

Faire de même pour les autres actions. Nous vous conseillons de faire dans
l'ordre les actions `read`, `delete`, `create`, `update`, `save` et `updated`.

</div>

<!-- Il faut aussi adapter les vues au fur et à mesure. Finalement, il faut
faire quelques remplacements dans VIEW_PATH, ModelVoiture et les vues (comme
viewErrorVoiture) pour simplifier la tâche.  -->
<!-- Modifier le header pour afficher un menu vers les pages d'accueils pour les
voitures et les trajets. -->

<!--

<div class="exercise">

Factoriser le modèle dans `Model.php`. Reste le nom de la table que l'on peut
avoir dans un premier temps comme variable. Dans un deuxième temps, le récupérer
automatiquement à base d'introspection.

</div>

<div class="exercise">

Factoriser le contrôleur en utilisant l'introspection ** ?? get_name

</div>

<div class="exercise">

Adapter les vues

</div>

## Association d'utilisateur et de trajets

<div class="exercise">
Créer table 'passager' ...
</div>

<div class="exercise">
Affiche liste des passagers pour un trajet
</div>

<div class="exercise">
Affiche liste des trajets pour un passager
</div>

-->
