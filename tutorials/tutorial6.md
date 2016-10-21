---
title: TD6 &ndash; Architecture MVC avancée 2/2
subtitle: Vues modulaires, filtrage, formulaires améliorés
layout: tutorial
---

<!-- viewAllVoiture.php => list.php -->
<!-- create.php => create.php -->
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

Le but des TDs 5 & 6 est donc d'avoir un site qui propose une gestion minimale
des voitures, utilisateurs et trajets proposés en covoiturage. En attendant de
pouvoir gérer les sessions d'utilisateur, nous allons développer l'interface
"administrateur" du site.

Ce TD présuppose que vous avez fini [le TD précédent](tutorial5.html).

## CRUD pour les voitures

CRUD est un acronyme pour *Create/Read/Update/Delete*, qui sont les quatre
opérations de base de toute donnée. Nous allons compléter notre site pour qu'il
implémente toutes ces fonctionnalités. Lors des TDs précédents, nous avons
implémenté nos premières actions :

1. afficher toutes les voitures : action `readAll`
2. afficher les détails d'une voiture : action `read`
3. afficher le formulaire de création d'une voiture : action `create`
3. créer une voiture dans la BDD : action `created`

On veut rajouter un comportement par défaut pour la page d'accueil ; nous allons
faire en sorte qu'un utilisateur qui arrive sur `index.php` voit la même page
que s'il était arrivé sur `index.php?action=readAll`.

#### Action par défaut

<div class="exercise">

1. Si aucun paramètre n'est donné dans l'URL, initialisons la variable `action`
   avec la chaîne de caractères `readAll` dans `routeur.php`.  
   Utilisez la fonction `isset($_GET['action'])` qui teste si la variable
   `$_GET['action']` a été initialisée, ce qui est le cas si et seulement si une
   variable `action` a été donnée dans l'URL.

1. Testez votre site en appelant `index.php` sans action.

**Note :** De manière générale, il ne faut jamais lire un `$_GET['action']`
  avant d'avoir vérifié si il était bien défini avec un `isset(...)` sous peine
  d'avoir des erreurs `Undefined index : action ...`.

</div>

Désormais, la page
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php)
doit marcher sans paramètre.

**Note :** que vous pouvez aussi y accéder avec l'adresse
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `index.php` d'un répertoire
si elles existent.

#### Vérification de l'action

<div class="exercise">

On souhaite que le routeur vérifie que `action` est le nom d'une méthode de
`ControllerVoiture.php` avant d'appeler cette méthode, et renvoyer vers une page
d'erreur le cas échéant.

**Modifiez** le code du routeur pour implémenter cette fonction.  Si l'action
n'existe pas, appelez la méthode `error` du contrôleur, que vous devez créer
pour qu'elle affiche la vue d'erreur `view/voiture/error.php`.

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
1. Complétez l'action `delete` du contrôleur de voiture pour que

   1. il supprime la voiture dont l'immatriculation est passée en paramètre dans
      l'URL,   
   1. il initialise les variables `immat` et `tab_v`,    
   1. il affiche la vue `view/voiture/deleted.php` (cf. question suivante) en
      utilisant le mécanisme de vue générique. Il faudra donc initialiser les
      variables `view`, `controller` et `pagetitle` avant d'appeler la vue
      générique.

1. Créez une vue `view/voiture/deleted.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation `immat` a bien été
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

1. Complétez la vue `view/voiture/update.php` pour qu'elle affiche un formulaire
   identique à celui de `create.php`, mais qui sera pré-rempli par les données
   de la voiture courante. Nous ne passerons que l'immatriculation de la voiture
   *via* l'URL ; les autres informations seront récupérées dans la BDD. Voici
   quelques points à prendre en compte avant de se lancer :

   1. L'attribut `value` de la balise `<input>` permet de pré-remplir un
   champ du formulaire.  Notez aussi que l'attribut `readonly` de `<input>`
   permet d'afficher l'immatriculation sans que l'internaute puisse le changer.

   1. On pourra se servir dans le contrôleur de `getVoitureByImmat` pour
      récupérer l'objet voiture de la bonne immatriculation. La vue devra alors
      compléter le formulaire avec les attributs de cet objet.

   1. Pensez bien à échapper vos variables PHP avant de les écrire dans l'HTML
     et dans les URLs.

   1. **Rappel -- Attention au mélange de `POST` et `GET` :** Vous souhaitez envoyez
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
   `data` sera un tableau associatif associant aux champs de la table
   `voiture` les valeurs correspondantes à la voiture courante. La fonction
   doit mettre à jour tous les champs de la voiture  dont l'immatriculation  est
   `$data['immat']`.

   **Rappel :**
   
   1. Ce type d'objet `data` est celui qui est pris en entrée par la
      méthode `execute` de `PDO`,
      [*cf.* le TD3]({{site.baseurl}}/tutorials/tutorial3.html#les-requtes-prpares).   
   2. Une bonne pratique consiste à d'abord développer sa requête SQL puis de la
      tester dans PHPMyAdmin avant de créer la fonction correspondante.

1. Complétez la vue `view/voiture/updated.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation `immat` a bien été mis à
   jour. Affichez en dessous de ce message la liste des voitures mise à jour (à
   la manière de `deleted.php` et `created.php`).
   
1. Complétez l'action `updated` du contrôleur de voiture pour qu'il mette à
   jour la voiture dont l'immatriculation passée en paramètre dans l'URL, puis
   qu'il affiche la vue `view/voiture/updated.php` après l'avoir correctement
   initialisée.
   
1. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>


## Gérer plusieurs contrôleurs

Maintenant que notre site propose une gestion minimale des voitures (*Create /
Read / Update / Delete*), notre objectif est d'avoir une interface similaire
pour les utilisateurs et les trajets. Dans ce TD, nous allons dans un premier
temps rendre notre MVC de voitures plus générique. Cela nous permettra de
l'adapter plus facilement aux utilisateurs et trajets dans un second temps.

### Dans le routeur

Pour l'instant, nous n'avons travaillé que sur le contrôleur *voiture*. Nous
souhaitons maintenant rajouter les contrôleurs *utilisateur* et *trajet*. Pour
gérer tous les contrôleurs à partir de notre page d'accueil unique `index.php`,
nous avons besoin d'appeler le bon contrôleur dans le routeur.

Désormais, nous devons donc spécifier le contrôleur demandé dans le *query
string*. Par exemple, l'ancienne page `index.php?action=readAll` du contrôleur
*voiture* devra s'obtenir avec `index.php?controller=voiture&action=readAll`.

<div class="exercise">

1. Définissez une variable `controller` dans `routeur.php` en récupérant sa
valeur à partir de l'URL, et en mettant le contrôleur *voiture* par défaut.

   **Aide :** Ce bout de code est similaire à celui concernant `action` dans
  `routeur.php`.

2. On souhaite créer le nom de la classe à partir de `controller`. Par exemple,
   quand `$controller="voiture"`, nous souhaitons créer une variable
   `controller_class` qui vaut `"ControllerVoiture"`.  
   **Créez** la variable `controller_class` à l'aide de la fonction
   [`ucfirst`](http://php.net/manual/fr/function.ucfirst.php) (UpperCase
   FIRST letter) qui sert à mettre en majuscule la première lettre d'une chaîne
   de caractère.

3. Testez si la classe de nom `controller_class` existe à l'aide de la fonction
   [`class_exists`](http://php.net/manual/fr/function.class-exists.php) et
   appelez l'action `action` de la classe `controller_class` le cas
   échéant. Autrement appelez l'action `error` de `ControllerVoiture`.

3. Testez votre code en appelant vos anciennes pages du contrôleur *voiture*.

</div>

### Début du nouveau contrôleur

Maintenant que notre routeur est en place, nous pouvons créer de nouveaux
contrôleurs. Pour avoir un aperçu de l'étendu du travail, commençons par créer
l'action `readAll` de `Utilisateur`.

<div class="exercise">

1. Créez un contrôleur `controller/ControllerUtilisateur.php` similaire à celui
   des voitures avec uniquement l'action `readAll` et le `require` du modèle
   pour l'instant.

   **Astuce :**Vous pouvez utiliser la fonction de remplacement (`Ctrl+H` sur
     Netbeans) pour remplacer toutes les `voiture` par `utilisateur`. En cochant
     `Préserver la casse` (`Preserve case`), vous pouvez faire en sorte de
     respecter les majuscules lors du remplacement.

1. Quelles différences notez-vous entre le code de `ControllerUtilisateur.php` et
   celui de `ControllerVoiture.php`

1. Chargez la classe `ControllerUtilisateur.php` dans `routeur.php` pour qu'il y
   ait accès.

2. Créez un modèle `model/ModelUtilisateur.php` basé sur votre classe
   `Utilisateur` des TDs 2 & 3. Ce modèle ne contiendra que les *getter*, les
   *setter*, le constructeur et la fonction getAllUtilisateurs pour l'instant.

   <!--
   Code de base donné avec get, set, __construct
   puis remplacement avec NetBeans (garder majuscule) de voiture => utilisateur pour la fonction getAllVoitures()
   -->

1. Quelles différences notez-vous entre le code de `ModelUtilisateur.php` et
   celui de `ModelVoiture.php`

3. Créez une vue `view/utilisateur/list.php` similaire à celle des
   voitures (sans nécessairement de lien pour l'instant).

4. **Testez** votre action en appelant l'action `readAll` du contrôleur
   `Utilisateur` (qui est accessible dans la barre de menu de votre site
   normalement).

</div>

## Modèle et contrôleur générique

L'implémentation du CRUD pour les utilisateurs et les trajets est un code très
similaire à celui pour les voitures. Nous pourrions donc copier/coller le code
des voitures et changer les (nombreux) endroits nécessaires.

Pour éviter de perdre un temps conséquent à développer le CRUD pour chaque
nouvel objet, nous allons mettre en commun le code autant que possible.

### Création d'un modèle générique

Nous allons déplacer de `ModelVoiture.php` vers le modèle générique `Model.php`
toutes les fonctions qui ne sont pas spécifiques aux voitures.

<div class="exercise">

Commençons par la fonction `getAllVoitures()` de `ModelVoiture.php`. Comme vous
l'avez remarqué, la seule différence entre `getAllVoitures()` et
`getAllUtilisateurs()` est le nom de la table et le nom de la classe des objets
en sortie. Voici donc comment nous allons faire pour avoir un code générique :

1. Déplacez la fonction `getAllVoitures()` de `ModelVoiture.php` vers
   `Model.php` en la renommant `selectAll()`.

1. Faites que la classe `ModelVoiture` hérite de `Model` (mot clé `extends`
   comme en Java).  
   Créez dans `ModelVoiture.php` une variable `object` qui est `protected`
   (accessible uniquement dans la classe courante et ses classes filles),
   `static` (qui ne dépend que de la classe, pas des objets) et qui prend la
   valeur `voiture`.

1. Faites de même pour `ModelUtilisateur`.

1. Écrivons maintenant le code de `selectAll()`. L'idée est que cette fonction
   sera héritée par `ModelVoiture` et `ModelUtilisateur`. On veut donc que quand
   on fait `ModelVoiture::selectAll()`, la fonction aille récupérer la variable
   `$object='voiture'` de `ModelVoiture` et s'en serve pour appeler la bonne
   table `voiture` et renvoyer le bon type d'objet `ModelVoiture`. Et quand on
   appelera `ModelUtilisateur::selectAll()`, on récupèrera la variable
   `$object='utilisateur'` de `ModelUtilisateur` et on pourra appeler la bonne
   table `utilisateur` et renvoyer le bon type d'objet
   `ModelUtilisateur`. Allons-y :

   1. créez une variable `table_name` dans `selectAll()` qui récupère le nom de
      l'objet courant avec `static::$object` (car les deux coïncident).
   
      **Plus d'explications:** La syntaxe `static::$object` est
      [quelque peu subtile](http://php.net/manual/fr/language.oop5.late-static-bindings.php).
      Dans notre cas, elle permet que lorsque l'on appelle
      `ModelVoiture::selectAll()`, qui est héritée de `Model::selectAll()`, la
      variable `static::$object` aille chercher `ModelVoiture::$object` et non
      pas `Model::$object`.
   
   1. créez une variable `class_name` dans `selectAll()` qui contiendra `'Model'`
      concaténé au nom de l'objet avec sa première lettre en majuscule (utilisez
      encore [`ucfirst()`](http://php.net/manual/fr/function.ucfirst.php)).

   1. Servez-vous de ces deux variables pour appeler la bonne table et le bon
      type d'objet dans `selectAll()`.


1. Il ne reste plus qu'à appeler `ModelVoiture::selectAll()` au lieu de
   `getAllVoitures()` et pareil pour les utilisateurs.

1. Testez que votre site marche toujours.

</div>

### Action `read`

Voici ce que nous proposons comme factorisation de code pour faciliter les
actions `read` des différents contrôleurs :

* nous allons créer une fonction `select($primary_value)` générique dans
  `Model.php` qui permet de faire une recherche par clé primaire dans une
  table. La nouveauté est que cette fonction a besoin de connaître le nom de la
  clé primaire de la table donc nous la stokerons dans un attribut `primary` de
  nos classes `ModelVoiture` et `ModelUtilisateur`. Le paramètre
  `$primary_value` permet de donner la valeur de la clé primaire pour la
  recherche.

* nous allons remplacer tous les `$controller='voiture'` qui servent dans la vue
  générique par un attribut `object` de `ControllerVoiture.php`.

<div class="exercise">

Commençons par la fonction `select($primary_value)`. Dans cette fonction, le nom de la table et la
condition `WHERE` varie.

1. Déplacez la fonction `getVoitureByImmat($immat)` de `ModelVoiture.php` vers
   `Model.php` en la renommant `select($primary_value)`.

1. Créez dans `ModelVoiture.php` une variable

   ```php?start_inline=1
   protected static $primary='immatriculation'
   ```

   et faites de même dans `ModelUtilisateur.php`.

1. Écrivons maintenant le code de `select($primary_value)` :

   1. créez des variables `table_name` et `class_name` comme précédemment.
   
   1. créez une variable `primary_key` qui récupère la clé primaire `static::$primary`
   
   1. Servez-vous de ces trois variables pour appeler les bonnes table, clé
      primaire et type d'objet dans `select($primary_value)`.

1. Il ne reste plus qu'à appeler dans l'action `read()` de `ControllerVoiture`
   la nouvelle méthode `ModelVoiture::select($immat)`.

1. Testez que votre site marche toujours.

</div>

<div class="exercise">

Créez un attribut `protected static $object` dans vos contrôleur et remplacez la
variable `controller` dans la vue générique par un appel à `object`.

</div>

<div class="exercise">

Il ne vous reste plus qu'à créer l'action `read()` de `ControllerUtilisateur`,
sa vue associée `view.php` et à rajouter les liens vers la vue de détail dans
`list.php`.

</div>


### Action `delete`

Pas de nouveautés. 

<div class="exercise">

Nous vous laissons adapter la fonction `delete($primary)` de `Model.php`,
l'action `delete` de `ControllerUtilisateur`, sa vue associée `delete.php` et à
rajouter les liens pour supprimer dans `list.php`.

**Rappel :** Utilisez la fonction de remplacement de NetBeans pour être plus
  efficace.

</div>

### Action `create` et `update`

Les vues `create.php` et `update.php` sont quasiment identiques : elles
affichent le même formulaire, et le ré-remplissent ou non. Nous allons donc
fusionner `create.php` et `update.php` en une unique page.

<div class="exercise">

1. Supprimez la vue `create.php` et modifiez le contrôleur de sorte que
   l'action `create` appelle la vue `update.php`.

   **Attention :** quand on arrive sur la vue `update.php` depuis l'action
   `create`, les variables d'immatriculation, de couleur et de marque ne sont
   pas renseignées. Penser à les initialiser à chaîne vide dans le contrôleur.

1. le champ `immatriculation` du formulaire doit être :

   * `required` si l'action est `create` ou
   * `readonly` si l'action est `update` (on ne peut pas modifier la clé
      primaire d'un tuple).

   Utilisez une variable dans le contrôleur pour permettre l'adaptation de la
   vue à ces deux actions.

1. enfin, le champ `action` du formulaire doit être `save` si l'action est
   `create` ou `updated` si l'action est `update`.  Là aussi, utiliser une
   variable spécifique.


   <!-- Mettre à jour le contrôleur en conséquence.\\ -->
   <!-- **Indice :** `<input ... placeholder='Exemple' value='$val'>` affichera
   'Exemple' en grisé si `val` est la chaîne de caractère vide, et pré-remplira
   avec la valeur de `val` autrement. -->

1. Testez que votre nouvelle vue fusionnée marche

1. Rajoutez un champ `controller` dans le formulaire en prévision de la
   suite. Vous pouvez soit écrire en dur que le contrôleur est `voiture`, soit
   le récupérer avec l'attribut `static::$object` du contrôleur.

</div>

<div class="exercise">

Nous vous laisson adapter les actions `create` et `update` de
`ControllerUtilisateur`, leur vue associée `update.php` et à rajouter les liens
pour mettre à jour un utilisateur dans `detail.php`.

</div>

### Action `created` et `updated`

Pour ces dernières actions, il faut un peu plus travailler pour créer la
fonction correspondante dans le modèle générique.

<div class="exercise">

Créons une fonction générique pour remplacer `update($data)` de
`ModelVoiture.php`. Pour reconstituer la requête

```sql
UPDATE voiture SET marque=:marque,couleur=:couleur,immatriculation=:immatriculation WHERE id=:id
```

il est nécessaire de pouvoir lister les champs de la table `voiture`.  Ces
champs sont les entrées du tableau `data` et c'est ainsi que nous allons les
récupérer.

1. Déplacez la fonction `update()` de `ModelVoiture.php` vers `Model.php`.
1. Remplacer la table et le nom de la clé primaire par les variables adéquates.
1. Nous allons générer la partie `SET` à partir des clés du tableau associatif
   `data`. Autrement dit, si `$data['un_champ']` existe, nous voulons rajouter
   la condition `un_champ=:un_champ` à `SET`.

   **Indice:** Utilisez la boucle `foreach ($tableau as $cle => $valeur)` pour
  récupérer les clés du tableau. Googler aussi la fonction `rtrim` de PHP qui
  pourra vous être utile pour enlever la virgule de trop à la fin de votre
  requête.

</div>

<div class="exercise">

Répétez la question précédente avec la fonction `save()` des différents modèles.

</div>

## Contrôleur trajet

Adaptez chacune des actions de `ControllerTrajet.php` et les tester une à
une. Nous vous conseillons de faire dans l'ordre les actions `read`, `delete`,
`create`, `update`, `save` et `updated`.

Vous pouvez aussi rajouter des actions pour afficher la liste des passagers pour
un trajet, et inversement la liste des trajets pour un passager (table de
jointure `passager`, cf fin TD3).

