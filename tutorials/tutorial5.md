---
title: TD5 &ndash; Architecture MVC avancée 1/2
subtitle: index.php, échappement du HTML, vues modulaires, CRUD
layout: tutorial
---

<!-- Prévoir une explication écrite de la différence entre chemin de fichier et
URL.  Notament pour ceux qui mettent du ROOT dans les URL -->

<!-- require d'un chemin de fichier **et pas de query string** -->

Aujourd'hui nous allons développer notre site-école de covoiturage. Au fur et à
mesure que le projet grandit, nous allons bénéficier du modèle MVC qui va nous
faciliter la tâche de conception.

Le but des TDs 5 & 6 est donc d'avoir un site qui propose une gestion minimale
des voitures, utilisateurs et trajets proposés en covoiturage. En attendant de
pouvoir gérer les sessions d'utilisateur, nous allons développer l'interface
"administrateur" du site.

Ce TD présuppose que vous avez au moins fait les
[exercices 1 à 6 du TD précédent](tutorial4.html#vue-ajout-dune-voiture),
c'est-à-dire que vous avez codé les actions `create` et `created`.

## Remise en route

La semaine dernière, nous avons commencé à utiliser l'architecture
MVC. Le code était découpé en trois parties :

3. Le modèle (*e.g.* `model/ModelVoiture.php`) est une bibliothèque des
fonctions permettant de gérer les données, *i.e.* l'interaction avec la BDD dans
notre cas. Cette bibliothèque sera utilisée par le contrôleur.
2. Les vues (*e.g.* `view/voiture/list.php`) ne doivent contenir que
les parties du code qui écrivent la page Web. Ces scripts seront appelés par le
contrôleur qui s'en servira comme d'un outil pour générer la page Web ;
1. Le contrôleur est la partie principale du script PHP. Dans notre cas, il est
   composé de deux parties :

   1. le routeur (*e.g.* `controller/routeur.php`) est la page que l'utilisateur
      demande pour se connecter au site. C'est donc le script PHP de cette page
      qui est **exécuté**. Cette page est chargée de récupérer l'action envoyée
      avec la demande de la page et d'appeler le bon code du contrôleur
      correspondant.

   1. la partie `Voiture` du contrôleur (*e.g.*
      `controller/ControllerVoiture.php`) contient le code source des
      actions. C'est donc ici qu'est présente la logique du site Web : on y
      appelle le modèle pour récupérer/enregistrer des données, on traite ces
      données, on appelle les vues pour écrire la page Web...

<div class="exercise">

La semaine dernière, vous aviez dessiné le schéma qui explique comment le
contrôleur (le routeur et la partie Voiture), le modèle et la vue interagissent
pour créer la page qui correspond par exemple à l’action read.

Remémorez-vous ce schéma pour pouvoir l'expliquer à votre chargé de TD quand il
passera le corriger.

</div>

## Changement de la page d'accueil du site

Comme nous venons de le rappeler, l'utilisateur doit se connecter au routeur
`controller/routeur.php` pour accéder au site. Or l'organisation interne du site
Web ne doit pas être visible du client pour des raisons de clarté et pour que
l'URL reste propre. Nous allons déplacer la page d'entrée de notre site vers
`index.php`.

#### Le problème pour passer à `index.php`

Jusqu'à maintenant, la page demandée était le routeur
`controller/routeur.php`. Comme `require` fait un copier/coller du fichier
demandé, tous les fichiers se retrouvent collés dans `routeur.php`. Le problème
apparaît quand on utilise des chemins de fichiers relatifs dans nos `require`.

**Rappel :** Il y a deux types de chemins de fichiers :

* les chemins *absolus* (commençant par `/` sous Linux ou `C:\` sous Windows)
comme `/home/ann2/lebreton/public_html` partent du répertoire racine.
* les chemins *relatifs* partent du répertoire courant comme par exemple
`../config/Conf.php`. Dans ce cas, `.` désigne le répertoire courant et `..` le
répertoire parent.

Donc le problème quand on utilise des chemins de fichiers relatifs dans nos
`require`, c'est que comme ils sont tous copiés/collés dans `routeur.php`, ils
utilisent le dossier du routeur comme base.

Or lorsque l'on va déplacer la page d'accueil vers `index.php`, **tous nos
`require` vont être décalés**. Par exemple, un `require '../config/Conf.php'`
qui pointait vers `/chemin_du_site/controller/../config/Conf.php`, donc sur
`/chemin_du_site/config/Conf.php` va désormais renvoyer vers
l'adresse inconnue `/chemin_du_site/../config/Conf.php` (`/chemin_du_site/..`
pointe vers le dossier parent du dossier où se trouve le site Web).

<!-- De plus, quand nous aurons plusieurs controlleurs, index.php nous permettra
d'avoir une page de navigation unique -->

<!--

En fait, si on ne fournit aucun chemin, le include (ou require) cherche dans les
chemins de l'include_path (.:/usr/share/php chez moi). Si le fichier n'est pas
trouvé dans l' include_path, include vérifiera dans le dossier du script
appelant et dans le dossier de travail courant avant d'échouer.

Par exemple : si on est dans model/modelUtilisateur alors require `Model.php` marche
car il n'y a pas de chemin mais require `./Model.php` ne marche pas.

-->

#### Une première solution

Pour remédier au problème précédent, nous allons utiliser des chemins
absolus. Nous allons écrire le chemin absolu de fichier menant à votre site Web
dans une variable `$ROOT_FOLDER` (sans slash à la fin). Par exemple, sur les machines de l'IUT
(serveur infolimon)
   
```php?start_inline=1
$ROOT_FOLDER = "/home/ann2/votre_login/public_html/TD5";
```

ou sur vos machines personnelles Windows 
   
```php?start_inline=1
$ROOT_FOLDER = "C:\\wamp\www\TD5";
```

Nous allons se servir de cette variable pour créer des chemins de fichiers
absolus en écrivant

```php?start_inline=1
require_once "{$ROOT_FOLDER}/config/Conf.php";
```

au lieu de chemins de fichiers relatifs

```php?start_inline=1
require_once "./config/Conf.php";
```

<div class="exercise">

Pour garder notre code propre, nous allons écrire une fonction `build_path`
qui prend en entrée `array("config","Conf.php")` et renvoie
`"{$ROOT_FOLDER}/config/Conf.php"`.

1. Créez une classe PHP `File` dans un fichier `lib/File.php`.

1. Créez la méthode statique `build_path` de la classe `File` suivante

   ```php?start_inline=1
   public static function build_path($path_array) {
       // $ROOT_FOLDER (sans slash à la fin) vaut
       // "/home/ann2/votre_login/public_html/TD5" à l'IUT 
       $ROOT_FOLDER = "Votre chemin de fichier menant au site Web";
       return $ROOT_FOLDER. '/' . join('/', $path_array);
   }
   ```

   **Note :** [Documentation de la fonction `join`](http://php.net/manual/fr/function.join.php).
   
1. **Incluez** votre classe `File.php` dans le routeur `routeur.php`.  
   **Modifiez** tous les `require` de tous les fichiers pour qu'ils utilisent des
   chemins absolus en utilisant la méthode `build_path`.  
   **Testez** que votre ancien site marche toujours bien en demandant la page
   `controller/routeur.php?action=readAll` dans votre navigateur.

   **Remarque :** Contrairement au `require` du routeur, le `require` de
     `File.php` ne peut pas se faire avec `build_path` puisqu'il n'a pas
     encore été déclaré. Il faut donc le faire "à la main".

3. On souhaite désormais que la page d'accueil soit `index.php`. Créez donc un
   tel fichier à la racine de votre site. Déplacez le `require` de `File.php` du
   routeur vers le début de `index.php`, puis faites un
   `require` du routeur `controller/routeur.php`.  
   **Testez** que votre site marche encore en demandant la page
   `index.php?action=readAll` dans le navigateur.

4. Changer toutes les URLs que vous avez écrites dans les vues pour qu'elles
   pointent sur `index.php` à la place de `controller/routeur.php`.

</div>

#### Une solution portable

On souhaite que notre site soit portable, c'est-à-dire que l'on puisse
facilement le déplacer sur une autre machine, à un autre endroit ... On voit
bien que la variable `$ROOT_FOLDER` dépend de l'installation. De plus ceux qui
ont des machines Windows ont dû se rendre compte que les chemins était séparés
par des anti-slash `\` sur Windows, contrairement à Linux et Mac qui utilisent
des slash `/`.

**Exemple :** `C:\\wamp\www` sur Windows et `/home/ann2/lebreton/public_html`
sur Linux.

Pour la rendre portable, nous allons récupérer à la volée le répertoire du site
avec le code suivant:
   
```php?start_inline=1
// __DIR__ est une constante "magique" de PHP qui contient le chemin du dossier courant
$ROOT_FOLDER = __DIR__;
```

De même, nous utiliserons la constante PHP `DIRECTORY_SEPARATOR` qui permet
d'utiliser le bon slash de séparation des chemins selon le système :

```php?start_inline=1
// DS contient le slash des chemins de fichiers, c'est-à-dire '/' sur Linux et '\' sur Windows
$DS = DIRECTORY_SEPARATOR;
```

<div class="exercise">

1. Pour rendre le site Web portable, nous allons récupérer à la volée le
   répertoire du site avec le code suivant :
   
   ```php?start_inline=1
   // __DIR__ est une constante "magique" de PHP qui contient le chemin du dossier courant
   // Comme File.php est dans le dossier lib, nous devons redescendre d'un dossier avec '/..'
   $ROOT_FOLDER = __DIR__ . "/..";
   ```
   
   **Référence :**
     [Constantes magiques en PHP](http://php.net/manual/fr/language.constants.predefined.php)


   <!-- An prochain : optionel ! Et vérifier si c'est vraiment nécessaire sous
   Windows ?  -->

2. Définissez aussi la constante suivante dans `index.php` qui permet d'utiliser le
bon slash de séparation des chemins selon le système :

   ```php?start_inline=1
   // DS contient le slash des chemins de fichiers, c'est-à-dire '/' sur Linux et '\' sur Windows
   $DS = DIRECTORY_SEPARATOR;
   ```
   
   **Référence :**
     [Constantes prédéfinies en PHP](http://php.net/manual/fr/dir.constants.php)

3. Il ne reste plus qu'à changer la fonction `build_path` pour qu'elle
   utilise ces deux constantes.

4. **Retestez** votre site Web.

</div>

<!--
function build_path($segments) {
    return __DIR__. DIRECTORY_SEPARATOR . join(DIRECTORY_SEPARATOR, $segments);
}

$path = build_path(array("config","Conf.php"));
-->

## Sécurité des vues 

Nous allons apprendre pourquoi nous devons faire attention lorsque nous
remplaçons une variable PHP par sa valeur dans l'écriture de la page HTML. Vous
allez voir que les raisons sont assez similaires au problème derrière les
injections SQL.

Prenons l'exemple de notre vue `detail.php` qui écrit en autre

```php?start_inline=1
echo "<p> Voiture $v->getImmatriculation() </p>";
```

Que se passe-t-il si l'utilisateur a rentré du code HTML à la place d'une
immatricutation ?

<div class="exercise">

Créez une voiture d'immatriculation `<h1>Hack` et regardez comment elle
s'affiche.

</div>

L'immatriculation est comprise comme du code HTML et est donc interprétée. Ce
comportement est non désiré et peut carrément être dangeureux, notamment si
l'utilisateur se met à écrire du JavaScript. 

<!-- XSS et aussi que ça marche bien pour Math O'reilly (! ') -->

#### Échappement dans du HTML

Pour éviter cela, il faut faire **attention aux caractères protégés** du
HTML. Voici la liste des caractères qui font la différence entre du texte pur et
du code HTML :

1. les chevrons `<` et `>` car ils délimitent les balises HTML ;
2. les guillements simples `'` ou doubles `"` car ils délimitent les valeurs des
   attributs ;
3. L'esperluette `&` car elle sert à échapper les caractères. Par exemple, le
   code HTML `&quot;` sert à afficher une esperluette `&`.

Ces caractères spéciaux doivent être échappés dans les vues pour que le texte
s'affiche bien mais ne risque pas de changer la structure du document
HTML. Voici comment échapper ces caractères :

| `&lt;` | `&gt;` | `&amp;` | `&quot;` | `&apos;` |
|  `<`   |  `>`   |   `&`   |   `"`    |   `'`    |
{: #entities .centered }

<style scoped>
#entities td { padding: 0.5ex 2em }
#entities td:not(:first-child) { border-left: solid thin #aaa }
</style>

**Bonne nouvelle :** PHP fait ceci pour nous avec la fonction
  [`htmlspecialchars`](http://php.net/manual/fr/function.htmlspecialchars.php).

<div class="exercise">

1. Changer donc toutes vos vues pour appliquer la fonction `htmlspecialchars` à
toutes les variables PHP.  
Nous vous conseillons de créer des variables temporaires pour stocker le texte
échappé, par exemple `$vImmatriculation`, puis d'afficher ces variables.

2. Vérifiez que votre voiture d'immatriculation `<h1>Hack` s'affiche maintenant
   correctement et ne créé plus de balise HTML `<h1>`. Allez voir dans le code
   source comme l'immatriculation a été échappée.

</div>

#### Échappement des URLS

De la même manière, il faut encoder les URLs pour éviter d'en changer le sens
lorsque l'on insère une donnée fournie par l'utilisateur. Par exemple, nous
allons devoir échapper les caractères `?` et `=` puisqu'ils permettent de passer
de l'information dans l'URL avec le format *query string*.

Pour information, la liste des caractères réservés des URLs sont
`:/?#[]@!$&'()*+,;=`. Nous allons donc utiliser la fonction
[`rawurlencode`](http://php.net/manual/fr/function.rawurlencode.php) pour
échapper les variables PHP qui interviennent dans des URLs.


<div class="exercise">

1. Créez une voiture d'immatriculation `&immat=h` en utilisant votre action
   `create` ;

1. Observez que le lien vers la vue de détail de cette voiture ne marche
   pas. Pourquoi ?

   <!-- On change la signification de l'URL et on dit que l'immat est h au lieu
   de &immat=h -->

1. Changer la vue `detail.php` pour qu'elle encode à l'aide de `rawurlencode` la
   variable PHP correspondant à l'immatriculation.  
   **Attention :** Il ne faut pas encoder l'immatriculation déjà échappée pour
   le HTML. Il faut créer deux variables : une immatriculation pour le HTML et
   une pour les URLs.

1. Testez que le lien vers la vue de détail remarche.

</div>

**Source :** [RFC 3986 sur les URI](https://www.ietf.org/rfc/rfc3986.txt)

## Vues modulaires

En l'état, certains bouts de code de nos vues se retrouvent dupliqués à de
multiples endroits. Les prochaines questions vont vous aider à réorganiser le
code pour éviter les redondances en vue d'améliorer la maintenance du code et
son debuggage.

### Mise en commun de l'en-tête et du pied de page

Actuellement, les scripts de vues sont chargées d'écrire l'ensemble de la page
Web, du `<!DOCTYPE HTML><html>...` jusqu'au `</body></html>`. C'est
problématique car cela nous empêche de mettre facilement deux vues bout à
bout. Voyons cela sur un exemple.

Supposez que l'on souhaite que notre vue de création (action `created`) de
*voiture* affiche *"Votre voiture a bien été créée"* puis la liste des
voitures. Il serait donc naturel d'écrire le message puis d'appeller la vue
`list.php`. Mais comme cette dernière vue écrivait la page HTML du début à la
fin, on ne pouvait rien y rajouter au milieu !

Décomposons nos pages Web en trois parties : le *header* (en-tête), le *body*
(corps ou fil d'ariane) et le *footer* (pied de page). Dans le site final de
l'an dernier, on voit bien la distinction entre les 3 parties. On note aussi que
le *header* et le *footer* sont communs à toutes nos pages.

<p style="text-align:center">
<img src="{{site.baseurl}}/assets/headerbodyfooter.png" width="95%"
style="vertical-align:top">
</p>

Au niveau du HTML, le *header* correspond à la partie suivante (nous créerons
l'en-tête et le pied de page plus tard).

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
   de `view.php` est de charger une en-tête et un pied de page communs, ainsi
   que la vue dont le nom est stocké dans la variable `$view` (et le titre de
   page contenu dans `$pagetitle`).

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
   $filepath = "{$ROOT_FOLDER}{$DS}view{$DS}{$controller}{$DS}{$view}.php";
   require $filepath;
   ?>
       </body>
   </html>
   ```
   
2. Dans vos vues existantes, supprimer les parties du code correspondant aux
   *header* et *footer*.

3. Reprendre l'action `readAll` du contrôleur pour qu'à la place d'un `require`
   de `list.php`, on utilise `require` de `view.php` en initialisant les
   variables `$view='list'` et `$pagetitle='Liste des voitures'`.

   <!-- 3. Redéfinir le `VIEW_PATH` en début de fichier par `define('VIEW_PATH', ROOT -->
   <!--    . DS . 'view' . DS);` -->
   <!-- Enfin, rajouter un `require VIEW_PATH . "view.php";` à la fin du fichier
   pour -->
   <!-- appeler notre vue générique. -->

4. **Testez** votre action `readAll`. Regardez le code source de la page Web
   pour vérifier que le HTML généré est correct.

5. Modifiez les autres actions et testez votre site.

</div> 


Nous allons bénéficier de notre changement d'organisation pour rajouter un
*header* et un *footer* (minimalistes) à toutes nos pages.

<div class="exercise"> 

1. Modifier la vue `view.php` pour ajouter en en-tête de page une barre de menu,
avec trois liens:

   * un lien vers la page d'accueil des voitures  
     `index.php?action=readAll`
   * un lien vers la future page d'accueil des utilisateurs  
     `index.php?action=readAll&controller=utilisateur`
   * un lien vers la future page d'accueil des trajets  
     `index.php?action=readAll&controller=trajet`

   <!-- Le lien vers utilisateur doit marcher après la partie sur le dispatcher
   ? -->

2. Modifier la vue `view.php` pour rajouter un footer minimaliste comme par
   exemple

   ```html
   <p style="border: 1px solid black;text-align:right;padding-right:1em;">
     Site de covoiturage de ...
   </p>
   ```

</div> 

Notre réorganisation nous permet aussi de résoudre le problème soulevé plus tôt
à propos de la vue de création d'une voiture.

<div class="exercise">

Nous souhaitons créer une vue `created.php` qui affiche le message

```html
<p>La voiture a bien été créée !</p>
```

avant de faire un require de `list.php` puisque cette vue sert à écrire la liste
des voitures.

1. Créez la vue `created.php` comme expliqué ci-dessus.  
   **Remarque :** La vue `created.php` ne doit plus faire que deux lignes
   maintenant.

2. Changez l'action `created` du contrôleur pour appeler cette vue.  
   **Attention :** Il faut initialiser la variable `$tab_v` contenant le tableau
   de toutes les voitures afin qu'elle puisse être affichée dans la vue.

</div>

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

<!--
Question complémentaire pour ceux en avance :
Refaites tout ce que vous avez fait sur Utilisateur (et Trajets).
-->
