---
title: TD4 &ndash; Architecture MVC
subtitle: Modèle, Vue, Contrôleur
layout: tutorial
---

<!-- 
Simplifier les noms : 
controller/Voiture.php qui définit ControllerVoiture.php
et model/Voiture.php qui définit ModelVoiture.php
-->

Au fur et à mesure que votre site Web grandit, vous allez rencontrer des
difficultés à organiser votre code. Les prochains TDs visent à vous montrer une
bonne façon de concevoir votre site web. On appelle *design pattern* (patron de
conception) une série de bonnes pratiques pour l'organisation de votre site.

Un des plus célèbres *design patterns* s'appelle **MVC** (Modèle - Vue -
Contrôleur) : c'est celui que nous allons découvrir dans ce TD.

## Présentation du design pattern **MVC**

Le pattern **MVC** permet de bien organiser son code source. Jusqu'à présent,
nous avons programmé de manière monolithique : nos pages Web mélangent
traitement (PHP), accès aux données (SQL) et présentation (balises HTML). Nous
allons maintenant séparer toutes ces parties pour plus de clareté.

L'objectif de ce TD est donc de réorganiser le code du TD3 pour finalement y
rajouter plus facilement de nouvelles fonctionnalités. Nous allons vous
expliquer le fonctionnement sur l'exemple de la page `lireVoiture.php` du TD2 :

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

Cette page se basait sur votre classe `Voiture` dans `Voiture.php` :

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

L'architecture **MVC** est une manière de découper le code en trois bouts M, V et C
ayant des fonctions bien précises. Dans notre exemple, l'ancien fichier
`lireVoiture.php` va être réparti entre le contrôleur
`controller/ControllerVoiture.php`, le modèle `model/ModelVoiture.php` et la vue
`view/voiture/list.php`.

Voici un aperçu de tous les fichiers que nous allons créer dans ce TDs.

<img alt="Structure de nos fichiers"
src="../assets/RepStructure.png" style="margin-left:auto;margin-right:auto;display:block;width:12em;">


### M: Le modèle

Le modèle est chargé de la gestion des données, notamment des interactions avec
la base de données. C'est, par exemple, la classe `Voiture` que vous avez créé
lors des TDs précédents (sauf la fonction `afficher()`).

<div class="exercise">
1. Créez les répertoires `config`, `controller`, `model`, `view` et `view/voiture`.
1. Renommez le fichier `Voiture.php` en `ModelVoiture.php`.  
   Renommez la classe en `ModelVoiture`. Mettez en commentaire la fonction
   `afficher()` pour la désactiver.  
   Pensez à corriger la classe appelée dans vos `setFetchMode()` pour créer des
   objets de `ModelVoiture`.
1. Déplacez vos fichiers `ModelVoiture.php` et `Model.php` dans le répertoire `model/`.
1. Déplacez `Conf.php` dans le dossier `config`.
1. Corrigez le chemin relatif de l'`include` du fichier `Conf.php` dans `Model.php`.
</div>

**N.B. :** Il est vraiment conseillé de renommer les fichiers et non de les
  copier. Avoir plusieurs copies de vos classes et fichiers est source d'erreur
  difficile à déboguer.

Dans notre cas, la nouvelle classe `ModelVoiture` gère la persistance au travers
des méthodes:

```php?start_inline=1
 $mv->save();
 $mv2 = ModelVoiture::getVoitureByImmat($immatriculation);
 $arrayVoitures = ModelVoiture::getAllVoitures();
```

**N.B. :** Souvenez-vous que les deux dernières fonctions `getVoitureByImmat`
et `getAllVoitures` sont `static`. Elles ne dépendent donc que de
leur classe (et non pas des objets instanciés). D'où la syntaxe différente
`Class::fonction_statique()` pour les appeler.

### V: la vue

Dans la vue sont regroupés toutes les lignes de code qui génèrent la page HTML
que l'on va envoyer à l'utilisateur. Les vues sont des fichiers qui ne
contiennent quasiment exclusivement que du code HTML, à l'exception de quelques
`echo` permettant d'afficher les variables pré-remplies par le contrôleur. Une
boucle `for` est toutefois autorisée pour les vues qui affichent une liste
d'éléments. **La vue n'effectue pas de traitement, de calculs**.

Dans notre exemple, la vue serait le fichier `view/voiture/list.php`
suivant. Le code de ce fichier permet d'afficher une page Web contenant toutes
les voitures contenues dans la variable `tab_v`.

```php
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des voitures</title>
    </head>
    <body>
        <?php
        foreach ($tab_v as $v)
            echo '<p> Voiture d\'immatriculation ' . $v->getImmatriculation() . '.</p>';
        ?>
    </body>
</html>
```

<div class="exercise">

Créez la vue `view/voiture/list.php` avec le code précédent.

</div>

### C: le contrôleur

Le contrôleur gère la logique du code qui prend des décisions. C'est en quelque
sorte l'intermédiaire entre le modèle et la vue : le contrôleur va demander au
modèle les données, les analyser, prendre des décisions et appelle la vue
adéquate en lui donnant le texte à afficher à la vue. Le contrôleur contient
exclusivement du PHP.

Il existe une multitude d'implémentations du **MVC**:

1. un gros contrôleur unique
1. un contrôleur par modèle
1. un contrôleur pour chaque action de chaque modèle

Nous choisissons ici la version intermédiaire et commençons à créer un
contrôleur pour `ModelVoiture`. Voici le contrôleur
`controller/ControllerVoiture.php` sur notre exemple :

```php
<?php
require_once ('../model/ModelVoiture.php'); // chargement du modèle
$tab_v = ModelVoiture::getAllVoitures();     //appel au modèle pour gerer la BD
require ('../view/voiture/list.php');  //redirige vers la vue
?>
```


Notre contrôleur se décompose donc en plusieurs parties :

1. On charge la déclaration de la classe `ModelVoiture` ;
3. on se sert du modèle pour récupérer le tableau de toutes les voitures avec  
`$tab_v = Voiture::getAllVoitures();`
4. on appelle alors la vue qui va nous générer la page Web avec  
`require ('../view/voiture/list.php');`

**Notes :**

* **Pourquoi `../` ?** Les adresses sont relatives au fichier courant qui est
`controller/ControllerVoiture.php` dans notre cas.
* Notez bien que c'est le contrôleur qui initialise la variable `$tab_v` et que
la vue ne fait que lire cette variable pour générer la page Web.

<div class="exercise">

1. Créez le contrôleur `controller/ControllerVoiture.php` avec le code précédent.
2. Testez votre page en appelant l'URL
[.../controller/ControllerVoiture.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD4/controller/ControllerVoiture.php)
3. Prenez le temps de comprendre le **MVC** sur cet exemple.  
   Avez-vous compris l'ordre dans lequel PHP exécute votre code ?  
   Est-ce que ce code vous semble similaire à l'ancien fichier
   `lireVoiture.php` ?  
   N'hésitez à parler de votre compréhension avec votre chargé de TD.

</div>



### Le routeur : un autre composant du contrôleur

Un contrôleur doit en fait gérer plusieurs pages. Dans notre exemple, il doit
gérer toutes les pages liées au modèle `ModelVoiture`. Du coup, on regroupe le
code de chaque page Web dans une fonction, et on met le tout dans une classe
contrôleur. 

Voici à quoi va ressembler notre contrôleur `ControllerVoiture.php`. On
reconnaît dans la fonction `readAll` le code précédent qui affiche toutes les
voitures.

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


On appelle *action* une fonction du contrôleur ; une action correspond
généralement à une page Web. Dans notre exemple du contrôleur
`ControllerVoiture`, nous allons bientôt rajouter les actions qui correspondent
aux pages suivantes :

1. afficher toutes les voitures : action `readAll`
2. afficher les détails d'une voiture : action `read`
3. afficher le formulaire de création d'une voiture : action `create`
3. créer une voiture dans la BDD et afficher un message de confirmation : action `created`
4. supprimer une voiture et afficher un message de confirmation : action `delete`

Pour recréer la page précédente, il manque encore un bout de code qui appelle la
méthode `ControllerVoiture::readAll()`. Le *routeur* est la partie du contrôleur
qui s'occupe d'appeler l'action du contrôleur. Un routeur simpliste serait le
fichier suivant `controller/routeur.php` :

```php
<?php
require_once 'ControllerVoiture.php';
ControllerVoiture::readAll(); // Appel de la méthode statique $action de ControllerVoiture
?>
```

<div class="exercise">
1. Modifiez le code de `ControllerVoiture.php` et créez le fichier
   `controller/routeur.php` pour correspondre au code ci-dessus ;   
2. Testez la nouvelle architecture en appelant la page
[.../controller/routeur.php](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php).
3. Prenez le temps de comprendre le **MVC** sur cet exemple.  
   Avez-vous compris l'ordre dans lequel PHP exécute votre code ?
</div>

#### Maintenant un vrai routeur

Le code précédent marche sauf que le client doit pouvoir choisir quelle action
est-ce qu'il veut effectuer. Du coup, il va faire une requête pour la page
`routeur.php` mais en envoyant l'information qu'il veut que `action` soit égal à
`readAll`. Pour transmettre ces données à la page du routeur, nous allons les
écrire dans l'URL avec la syntaxe du *query string* (cf.  [**rappel** sur query
string dans le cours
1]({{site.baseurl}}/classes/class1.html#les-query-strings-dans-lurl)).

De son côté, le routeur doit récupérer l'action envoyée et appeler la méthode
correspondante du contrôleur.

<div class="exercise">

1. Quelle URL faut-il écrire pour demander la page du routeur en lui envoyant
   l'information que `action` est égal à `readAll` ?
1. Comment récupère-t-on en PHP la valeur qui a été assignée à `action` dans l'URL ?  
   [**Rappel** sur query string dans le cours 1]({{site.baseurl}}/classes/class1.html#les-query-strings-dans-lurl)
</div>

Pour appeler la méthode statique de `ControllerVoiture` dont le nom se trouve
dans la variable `$action`, le PHP peut faire comme suit. Voici le fichier
`controller/routeur.php` mis à jour :

```php
<?php
require_once 'ControllerVoiture.php';
// On recupère l'action passée dans l'URL
$action = ...; // À remplir, voir Exercice 5.2
// Appel de la méthode statique $action de ControllerVoiture
ControllerVoiture::$action(); 
?>
```

<div class="exercise">

1. Modifiez le code `controller/routeur.php` pour correspondre au code ci-dessus en remplissant vous-même la ligne 4 ;
1. Testez la nouvelle architecture en appelant la page
[.../controller/routeur.php](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php) en rajoutant l'information que `action` est égal à `readAll` comme vu à l'exercice 5.1.
3. Prenez le temps de comprendre le **MVC** sur cet exemple.  
   Avez-vous compris l'ordre dans lequel PHP exécute votre code ?  
   Est-ce que ce code vous semble similaire à l'ancien fichier
   `lireVoiture.php` ?  
   N'hésitez à parler de votre compréhension avec votre chargé de TD.

</div>

#### Solutions

Voici le déroulé de l'exécution du routeur pour l'action `readAll`:

1. Le client demande l'URL
[.../controller/routeur.php?action=readAll](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php?action=readAll).
1. Le routeur récupère l'action donnée par l'utilisateur dans l'URL avec
   `$action = $_GET['action'];` (donc `$action="readAll"`)
2. le routeur appelle la méthode statique `readAll` de `ControllerVoiture.php`
3. `ControllerVoiture.php` se sert du modèle pour récupérer le tableau de toutes les voitures ;
4. `ControllerVoiture.php` appelle alors la vue qui va nous générer la page Web.


## À vous de jouer

### Vue "détail d'une voiture"

Comme la page qui liste toutes les voitures (action `readAll`) ne donne pas
toutes les informations, nous souhaitons créer une page de détail dont le rôle
sera d'afficher toutes les informations de la voiture. Cette action aura besoin
de connaître l'immatriculation de la voiture visée ; on utilisera encore le
*query string* pour passer l'information dans l'URL en même temps que l'action :  
[.../routeur.php?action=read&immat=AAA111BB](http://webinfo/~mon_login/PHP/TD4/controller/routeur.php?action=read&immat=AAA11BB)

<div class="exercise"> 

1. Créez une vue `./view/voiture/detail.php` qui doit afficher tous les
   détails de la voiture stockée dans `$v` de la même manière que l'ancienne
   fonction `afficher()` (encore commentée dans `ModelVoiture`).  
   **Note :** La variable `$v` sera initialisée dans le contrôleur plus tard,
   *cf.* `$tab_v` dans l'exemple précédent.

1. Rajoutez une action `read` au contrôleur `ControllerVoiture.php`. Cette
   action devra récupérer l'immatriculation donnée dans l'URL, appeler la
   fonction `getVoitureByImmat()` du modèle, mettre la voiture visée dans la
   variable `$v` et appeler la vue précédente.

2. Testez cette vue en appelant la page du routeur avec les bons paramètres dans
l'URL.

3. Rajoutez des liens cliquables `<a>` sur les immatriculations de la vue `list.php`
   qui renvoient sur la vue de détail de la voiture concernée.

4. On souhaite gérer les immatriculations non reconnues: Créez un vue
   `./view/voiture/error.php` qui affiche un message d'erreur et renvoyez vers
   cette vue si `getVoitureByImmat()` ne trouve pas de voiture qui correspond à
   cette immatriculation.

</div>

### Vue "ajout d'une voiture"

Nous allons créer deux actions `create` et `created` qui doivent respectivement
afficher un formulaire de création d'une voiture et effectuer l'enregistrement
dans la BDD.

<div class="exercise">

1. Commençons par l'action `create` qui affichera le formulaire :
   1. Créez la vue `./view/voiture/create.php` qui reprend le code de
      `formulaireVoiture.html` fait dans le TD1.  
      La page de traitement de ce formulaire devra être l'action `created` du
      routeur `routeur.php`.
   1. Rajoutez une action `create` à `ControllerVoiture.php` qui affiche cette
      vue.
1. Testez votre page en appelant l'action `create` de `routeur.php`.

1. Créez l'action `created` dans le contrôleur qui devra

   1. récupérer les donnés de la voiture à partir de la *query string*,
   1. créer une instance de `ModelVoiture` avec les données reçues,
   2. appeler la méthode `save` du modèle,
   3. appeler la fonction `readAll()` pour afficher le tableau de
      toutes les voitures.

1. Testez l'action `created` de `routeur.php` en donnant
   l'immatriculation, la marque et la couleur dans l'URL.

1. Testez le tout, c-à-d. que la création de la voiture depuis le formulaire
   (action `create`) appelle bien l'action `created` et que la voiture est bien
   créée dans la BDD.

   **Attention à l'envoi de `action=created` :** Vous souhaitez envoyer
   l'information `action=created` en plus des informations saisies lors de
   l'envoi du formulaire. Il y a deux possibilités :

   1. Vous pouvez rajouter l'information dans l'URL avec

      ```html?start_inline=1
      <form action='routeur.php?action=created' ...>
      ```
      **mais** cela ne marche **pas** si la méthode est `GET`.
   2. Ou (**conseillé**) vous rajoutez un champ caché à votre formulaire :

      ```html?start_inline=1
      <input type='hidden' name='action' value='created'>
      ```

      Si vous ne connaissez pas les `<input type='hidden'>`, allez lire
      [la documentation](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input).


</div> 

## Et si le temps le permet...

<div class="exercise">

Dessinez sur un bout de papier un schéma qui explique comment le contrôleur (le
routeur et la partie Voiture), le modèle et la vue interagissent pour créer la
page qui correspond par exemple à l'action `read`.

</div>

<div class="exercise">

Utilisons les `try` / `catch` sur le requêtes SQL pour traiter l'erreur qui se
produit quand on veut sauvegarder une voiture déjà existante :

1. Créez une telle erreur
1. Utilisez un
   [affichage de débogage]({{site.baseurl}}/tutorials/tutorial1.html#affichage-pour-le-débogage)
   pour explorer le contenu de l'objet d'erreur `PDOException $e` dans `save()` ;
1. Identifiez le code d'erreur MySql qui correspond à notre erreur. Utilisez si
   nécessaire la
   [page MySql des codes d'erreurs](https://dev.mysql.com/doc/refman/5.7/en/error-messages-server.html).
1. Si cette erreur se produit, faites que `save()` renvoie `false` plutôt que de
   planter.
1. Traiter le cas où `save()` renvoie `false` dans l'action `created` pour
   renvoyer vers une page d'erreur.

</div>

<div class="exercise">

Rajouter une fonctionnalité *"Supprimer une voiture"* à votre site (action
`delete`). Ajouter un lien cliquable pour supprimer chaque voiture dans la liste
des voitures (dans la vue `view/voiture/list.php`).

</div>
