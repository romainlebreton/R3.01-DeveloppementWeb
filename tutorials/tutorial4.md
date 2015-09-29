---
title: TD4 &ndash; Architecture MVC
subtitle: Modèle, Vue, Contrôleur
layout: tutorial
---

Si vous programmez de manière monolithique, vos pages actuelles mélangent
traitement (couche d'accès aux données) et présentation (balises HTML),
*et c'est le mal !*

L'objectif de ce TD est donc de réorganiser le code du TD3 pour finalement y
rajouter plus facilement de nouvelles fonctionnalités. Nous allons vous
expliquer le fonctionnement sur l'exemple de la page `lireVoiture.php` du TD2 :

~~~
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
~~~
{:.html}

Cette page se basait sur votre classe `Voiture` dans `Voiture.php` :

~~~
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
~~~
{:.php}

L'architecture MVC est une manière de découper le code en trois bouts M, V et C
ayant des fonctions bien précises. Dans notre exemple, l'ancien fichier
`lireVoiture.php` va être réparti entre le contrôleur
`controller/controllerVoiture.php`, le modèle `model/modelVoiture.php` et la vue
`view/voiture/viewAllVoiture.php`.

Voici un aperçu de tous les fichiers que nous allons créer dans ce TDs.

<img alt="Structure de nos fichiers"
src="../assets/RepStructure.png" style="margin-left:auto;margin-right:auto;display:block;">


## M: Le modèle

Le modèle est chargé de la gestion des données, notamment des interactions avec
la base de données. C'est, par exemple, la classe `Voiture` que vous avez créé
lors des TDs précédents (sauf la fonction `afficher()`).

<div class="exercise">
Renommez le ficher `Voiture.php` en `./model/modelVoiture.php`. Renommez la
classe en `ModelVoiture`. Commentez ou supprimez la fonction `afficher()`.
</div>

**N.B. :** Il est vraiment conseillé de renommer le fichier et non de le copier. Avoir plusieurs copies de vos classes et fichiers est source d'erreur difficle à debuger.

Dans notre cas, la nouvelle classe `ModelVoiture` gère la persistance au travers
des méthodes:

~~~
 $mv->save();
 $mv2 = ModelVoiture::getVoitureByImmat($immatriculation);
 $arrayVoitures = ModelVoiture::getAllVoitures();
~~~
{:.php}

**N.B. :** Souvenez-vous que les deux dernières fonctions `getVoitureByImmat`
et `getAllVoitures` sont `static`. Elles ne dépendent donc que de
leur classe (et non pas des objets instanciés). D'où la syntaxe différente
`Class::fonction_statique()` pour les appeler.

## V: la vue

Dans la vue sont regroupés toutes les lignes de code qui génèrent la page HTML
que l'on va envoyer à l'utilisateur. Les vues sont des fichiers qui ne
contiennent quasiment exclusivement que du code HTML, à l'exception de quelques
`echo` permettant d'afficher les variables pré-remplies par le contrôleur. Une
boucle `for` est toutefois autorisée pour les vues qui affichent une liste
d'éléments. **La vue n'effectue pas de traitement, de calculs**.


<!--
Ce avec quoi l'utilisateur interagit se nomme précisément la vue.  Sa première
tâche est d'afficher la page Web à l'utilisateur. La vue reçoit aussi toute les
actions de l'utilisateur (remplissage de formulaire dans notre cas) et les
envoient au contrôleur.

La vue n'effectue pas de traitement, elle se contente d'afficher les résultats
des traitements effectués par le modèle et d'interagir avec l'utilisateur.  
-->

Dans notre exemple, la vue serait le fichier `view/voiture/viewAllVoiture.php`
suivant :

~~~
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des voitures</title>
    </head>
    <body>
        <?php
        foreach ($tabVoitures as $v)
          echo '<p> Voiture d\'immatriculation ' . $v->getImmatriculation() . '.</p>';
        ?>
    </body>
</html>
~~~
{:.html}

<div class="exercise">

Créez la vue `view/voiture/viewAllVoiture.php` avec le code précédent.

</div>

## C: le contrôleur

Le contrôleur gère le tout ; il reçoit les *actions* de l'utilisateur, lit ou
met à jour les données à travers le modèle, puis appelle la vue adéquate. Il
existe une multitude d'implémentations du MVC:

1. un gros contrôleur unique
1. un contrôleur par modèle
1. un contrôleur pour chaque action de chaque modèle

Nous choisissons ici la version intermédiaire. Voici le contrôleur
`controller/controllerVoiture.php` sur notre exemple :

~~~
<?php
include ('model/modelVoiture.php'); // chargement du modèle
$action = $_GET['action'];          // recupère l'action passée dans l'URL

switch ($action) {
    case "readAll":
        $tabVoitures = ModelVoiture::getAllVoitures();     //appel au modèle pour gerer la BD
        require ('view/voiture/viewAllVoiture.php');  //"redirige" vers la vue
        break;
}
?>
~~~
{:.php}

Le contrôleur est fait pour gérer plusieurs *actions* (une action correspond à
peu près à une page Web). En effet aujourd'hui notre contrôleur va devoir
savoir:

1. afficher toutes les voitures : action `readAll`
2. afficher les détails d'une voiture : action `read`
3. enregistrer une voiture : action `save`
4. supprimer une voiture : action `delete`

L'action est passée dans l'URL au format *query string* (comme les données des
formulaires en méthode `GET`). Par exemple, pour afficher toutes les voitures,
nous devrons demander l'URL
[.../controllerVoiture.php?action=readAll](http://infolimon/~mon_login/PHP/TD4/controller/controllerVoiture.php?action=readAll).

Notre contrôleur se décompose donc en plusieurs parties :

1. on récupère l'action de l'utilisateur avec `$action = $_GET['action'];` 
2. le `switch` - `case` nous permet d'exécuter le code de la bonne action ;
3. on se sert du modèle pour récupérer le tableau de toutes les voitures avec  
`$tabVoitures = Voiture::getAllVoitures();`
4. on appelle alors la vue qui va nous générer la page Web avec  
`require ('view/voiture/viewAllVoiture.php');`

Notez bien que c'est le contrôleur qui initialise la variable `$tab_v` et que la
vue ne fait que la lire pour générer la page Web.

<div class="exercise">

1. Créez le contrôleur `controller/controllerVoiture.php` avec le code précédent.
2. Testez votre page en appelant l'URL
[.../controllerVoiture.php?action=readAll](http://infolimon/~mon_login/PHP/TD4/controller/controllerVoiture.php?action=readAll)
3. Prenez le temps de comprendre le MVC sur cet exemple. Avez-vous compris
   l'ordre dans lequel PHP exécute votre code ? Est-ce que ce code vous semble
   similaire à l'ancien fichier `lireVoiture.php` ? N'hésitez à parler de votre
   compréhension avec votre chargé de TD.

</div>

## À vous de jouer

### Vue "détail d'une voiture"

Comme la page qui liste toutes les voitures (action `readAll`) ne donne pas
toutes les informations, nous souhaitons créer une page de détail dont le rôle
sera d'afficher toutes les informations de la voiture. Cette action aura besoin
de connaître l'immatriculation de la voiture visée ; on utilisera encore le
*query string* pour passer l'information dans l'URL en même temps que l'action :  
[.../controllerVoiture.php?action=read&immat=AAA111BB](http://infolimon/~mon_login/PHP/TD4/controller/controllerVoiture.php?action=read&immat=AAA11BB)

<!-- donner syntaxe complète du switch case -->

<div class="exercise"> 

<!--
1. Comme nous l'avons suggéré précédent, la place de la fonction `afficher()`
   n'est pas dans le modèle mais bien dans la vue. Déplacez donc la fonction au
   début de `viewAllVoiture.php`, adaptez-la pour qu'elle marche et faites en
   sorte d'elle n'affiche plus que l'immatriculation de la voiture.

   **Attention :**
   
   1. Comme la fonction `afficher()` n'appartient plus à la classe `Voiture`, elle
      n'a plus accès à la voiture courante `$this`. Il faut donc donner la voiture
      en paramètre de `afficher($voiture)`.
   3. Les attributs de `Voiture` sont par défaut `private`. Vous devez donc
      utiliser les **getter** de `Voiture` (ou passer les attributs en `public`
      mais en cachette car c'est mal !).
   2. La fonction n'appartient plus à une classe ; elle ne peux donc plus être `public`.
-->

1. Créez une vue `./view/voiture/viewVoiture.php` qui doit afficher tous les
   détails de la voiture stockée dans `$v`. (Cette variable sera initialisée
   dans le contrôleur plus tard, *cf.* `$tab_v` dans l'exemple précédent.)

1. Rajoutez une action `read` au contrôleur. Cette action devra récupérer
   l'immatriculation donnée dans l'URL, appeler la fonction
   `getVoitureByImmat()` du modèle, mettre la voiture visée dans la variable
   `$v` et appeler la vue précédente.

   **Aide :** Allez sur
   [http://php.net/manual/fr/control-structures.switch.php](http://php.net/manual/fr/control-structures.switch.php)
   pour comprendre la syntaxe du `switch` - `case`.

   <!-- htmlspecialchars et filtrage ? -->

2. Testez cette vue en appelant la page du contrôleur avec les bons
paramètres dans l'URL.
<!-- (Souvenez-vous comment les formulaires utilisant la méthode **GET** écrivent les
paramètres dans l'URL) -->

3. Rajoutez des liens cliquables `<a>` sur les immatriculations de la vue `readAll`
   qui renvoient sur la vue de détail de la voiture concernée.

4. Remplissez la vue `./view/voiture/viewErrorVoiture.php` pour gérer les
immatriculations non reconnues.

</div>

### Vue "ajout d'une voiture"

Nous allons créer deux actions `create` et `created` qui doivent respectivement
afficher un formulaire de création d'une voiture et effectuer l'enregistrement
dans la BDD.

<div class="exercise">

1. Créez une action `create` dont le but est d'afficher le formulaire que vous
   aviez créé lors du TD1 dans le fichier `creerVoiture.php`. La vue que vous
   créerez s'appelera `./view/voiture/viewCreateVoiture.php`. La page de
   traitement de ce formulaire devra être le contrôleur `controllerVoiture` avec
   l'action `create`.

1. Créez l'action `created` et sa vue associée
`./view/voiture/viewCreateVoiture.php`. L'action dans le contrôleur devra

   1. récupérer les donnés de la voiture à partir de la *query string*,
   2. appeler la méthode `save` du modèle,
   3. afficher une vue similaire à l'action `readAll` avec écrit **Votre voiture
      a bien été créée** en supplément.

1. Testez le tout, c-à-d. la création de la voiture depuis le formulaire (action
   `create`).

</div> 

### Vue "suppression d'une voiture"

<div class="exercise">

Rajouter une fonctionnalité *"Supprimer une voiture"* à
votre site (action `delete`). Ajouter un lien cliquable pour supprimer chaque
voiture dans la liste des voitures (dans la vue `view/voiture/viewAllVoiture.php`).

</div>



### Factorisation du code des vues

<div class="exercise">
Créer dans le répertoire view deux fichiers `header.php`
et `footer.php`. Le header correspond à l'en-tête de votre site qui ne varie pas
selon la page. Vous pouvez par exemple le remplir avec une liste de lien vers
les différentes actions (liste, ajout, recherche) sur vos voitures. Le footer
pourrait être un simple bandeau avec votre nom, un copyright et un lien pour
vous écrire.

Charger ces fichiers respectivement au début et à la fin du `<body>` de toutes vos vues.

  **NB ** : Attention aux chemins relatifs lors de l'inclusion des header et footer dans vos vues. 
</div> 

## Et si le temps le permet...



<div class="exercise"> 

Rajoutons des comportements par défaut :

1. Nous voudrions qu'un utilisateur qui navigue à la racine du site arrive
automatiquement sur la page du contrôleur. Créer pour cela un `index.php` à la
racine qui charge seulement la page `./controller/controllerVoiture.php` à l'aide 
d'un `require`.

2. Nous voudrions aussi que le contrôleur exécute l'action `"readAll"` si aucune
action n'est spécifiée dans les paramètres de l'URL.

   **Aide :** Utiliser la fonction `isset($_GET['action'])` pour déterminer si
une action a été donnée. Vous aurez aussi besoin du 'case' `default` de switch -
case
([http://php.net/manual/fr/control-structures.switch.php](http://php.net/manual/fr/control-structures.switch.php)).
</div>

<div class="exercise">
Gérer le cas particulier de l'ajout d'une voiture existant déjà dans la base
de donnée. 
</div> 

<div class="exercise">
Gérer les options des voitures : 
Reprendre la méthodologie du TD précédent pour l'association `passager` entre les Trajets et les Utilisateurs. 

Créer une table options dans votre base de données avec deux champs de type VARCHAR, `immatriculation` et `option`, qui constitueront la clé primaire.

Mettre à jour les fonctions `save()`, `getVoitureByImmat($im)` et `getAllVoitures()`
pour qu'elles prennent en charge les options.  Mettre aussi à jour la vue de
détail pour qu'elle affiche les options.
</div>



<!--
 Choses à faire:
 ---------------
 - préparer squelette class avec fonction/attribut statique/non statique 
 -> Comment appelle-t-on la fonction/attribut dedans/dehors la classe

 - chaîne de charactères et php : syntaxe '', "" et heredoc . Plus Attention guillemets inversés ` optionnel pour nom de table / colonne dans MySQL

 Pouvant être rajouté au TD
 --------------------------
 - Rajouter header & footer & titre aux vues
 - header : liste + chercher + ajout
 - Gérer page par défaut : liste
 - Gérer racine renvoie vers controleur
 - Gérer ajout de voiture existante !
 - Action / Vue "del" = supprimer avec lien dans la liste des voitures
-->
