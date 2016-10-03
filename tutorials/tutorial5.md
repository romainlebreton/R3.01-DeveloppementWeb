---
title: TD5 &ndash; Architecture MVC avancée 1/2
subtitle: index.php, chemins absolus, CRUD
layout: tutorial
---

<!-- Corriger le schéma MVC -->

<!-- viewAllVoiture.php => list.php -->
<!-- viewCreateVoiture.php => create.php -->
<!-- error.php => error.php -->
<!-- detail.php => detail.php -->
<!-- ControllerVoiture.php => ControllerVoiture.php -->
<!-- ModelVoiture.php => ModelVoiture.php -->

<!-- faille XSS dans la vue : Echapper texte dans HTML -->

<!-- Prévoir une explication écrite de la différence entre chemin de fichier et
URL.  Notament pour ceux qui mettent du ROOT dans les URL -->

<!-- require d'un chemin de fichier **et pas de query string** -->

Aujourd'hui nous allons développer notre site-école de covoiturage. Au fur et à
mesure que le projet grandit, nous allons bénéficier du modèle MVC qui va nous
faciliter la tâche de conception.

<!--Le but de ce TD est donc d'avoir un site qui propose une gestion minimale des
utilisateurs et des trajets proposés en covoiturage. En attendant de pouvoir
gérer les sessions d'utilisateur, nous allons développer l'interface
"administrateur" du site.-->

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
      demande pour se connecter au site. C'est donc le script PHP de cette page qui
      est **exécuté**. Cette page est chargée de récupérer l'action envoyée avec la
      demande de la page et d'appeler le bon code du contrôleur correspondant.

   1. la partie `Voiture` du contrôleur (*e.g.* `controller/ControllerVoiture.php`)
      contient le code source des actions. C'est donc ici qu'est présente la logique
      du site Web : on y appelle le modèle pour récupérer/enregistrer des données,
      on traite ces données, on appelle les vues pour écrire la page Web...

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

<div class="exercise">

1. Pour remédier au problème précédent, nous allons utiliser des chemins
   absolus. Créez une variable `$ROOT_FOLDER` dans votre routeur qui stockera le
   chemin absolu menant à votre site Web (sans slash à la fin). Par exemple, sur
   les machines de l'IUT (serveur infolimon)
   <!-- ou sur vos machines personnelles Linux -->
   
   ```php?start_inline=1
   $ROOT_FOLDER = "/home/ann2/votre_login/public_html/TD5";
   ```

   ou sur vos machines personnelles Windows 
   
   ```php?start_inline=1
   $ROOT_FOLDER = "C:\\wamp\www\TD5";
   ```

2. Modifiez tous les `require` de tous les fichiers pour qu'ils utilisent des
chemins absolus à l'aide de la variable `$ROOT_FOLDER` précédente.  
**Testez** que votre ancien site marche toujours bien en demandant la page
`controller/routeur.php?action=readAll` dans votre navigateur.
   
   **Astuces :**

   * Utilisez la fonction de recherche de votre éditeur de page PHP
   pour trouver tous les `require`.
   * Utilisez la syntaxe avec les chaînes de caractères avec *double quotes*
     `"..."` qui permettent le remplacement de variables,
     [*cf.* le TD1.]({{site.baseurl}}/tutorials/tutorial1.html#les-chanes-de-caractres)

   <!-- **Erreurs classiques :** -->   
   <!-- * Utiliser des *simple quotes* `'...'` dans l'adresse des fichiers : la variable -->
   <!-- `$ROOT_FOLDER` n'est pas remplacée. -->
   <!-- * Appeler la page `index.php` sans action dans Firefox ; il faut demander une -->
   <!--   action comme par exemple `readAll` pour que le site marche (pour l'instant). -->

3. On souhaite désormais que la page d'accueil soit `index.php`. Créez donc un
   tel fichier à la racine de votre site. Déplacez la définition de
   `$ROOT_FOLDER` du routeur vers le début de `index.php`, puis faites un
   `require` du routeur `controller/routeur.php`.  
   **Testez** que votre site marche encore en demandant la page
   `index.php?action=readAll` dans le navigateur.

4. Changer toutes les URLs que vous avez écris dans les vues pour qu'elles
   pointent sur `index.php` à la place de `controller/routeur.php`.

</div>

On souhaiterait que notre site soit portable, c'est-à-dire que l'on puisse
facilement le déplacer sur une autre machine, à un autre endroit ... On voit
bien que la variable `$ROOT_FOLDER` dépend de l'installation. De plus ceux qui ont des
machines Windows ont dû se rendre compte que les chemins était séparés par des
anti-slash `\` sur Windows, contrairement à Linux et Mac qui utilisent des slash
`/`.

**Exemple :** `C:\\wamp\www` sur Windows et `/home/ann2/lebreton/public_html` sur Linux.

<div class="exercise">

3. Pour la rendre portable, nous allons récupérer à la volée le répertoire du
   site avec le code suivant dans `index.php`:
   
   ```php?start_inline=1
   // __DIR__ est une constante "magique" de PHP qui contient le chemin du dossier courant
   $ROOT_FOLDER = __DIR__;
   ```
   
   **Référence :**
     [Constantes magiques en PHP](http://php.net/manual/fr/language.constants.predefined.php)


   <!--
   An prochain : optionel ! Et vérifier si c'est vraiment nécessaire sous Windows ?
   -->

2. Définissez la constante suivante dans `index.php` qui permet d'utiliser le
bon slash de séparation des chemins selon le système :

   ```php?start_inline=1
   // DS contient le slash des chemins de fichiers, c'est-à-dire '/' sur Linux et '\' sur Windows
   $DS = DIRECTORY_SEPARATOR;
   ```
   
   **Référence :**
     [Constantes prédéfinies en PHP](http://php.net/manual/fr/dir.constants.php)

3. Changez tous vos séparateurs de tous vos `require` par `$DS`.  
**Astuce :**

   * Ceci peut être fait en peu de temps en utilisant la fonction de
     remplacement de votre éditeur (souvent obtenue avec `Ctrl+H`) et le
     remplacement automatique de variables dans les chaînes entre double
     guillemets `"`. Essayez d'obtenir par exemple :

     ```php?start_inline=1
     require "{$ROOT_FOLDER}{$DS}config{$DS}Conf.php";
     ```

   * (Optionel) Si vous voulez rendre votre code encore plus propre, vous pouvez
     écrire une fonction `file_build_path` qui prend en entrée
     `array("config","Conf.php")` et renvoie
     `"{$ROOT_FOLDER}{$DS}config{$DS}Conf.php"`. Une solution peut être obtenue
     à l'aide de la fonction PHP
     [`join`](http://php.net/manual/fr/function.join.php).

</div>

<!--
function file_build_path($segments) {
    return __DIR__. DIRECTORY_SEPARATOR . join(DIRECTORY_SEPARATOR, $segments);
}

$path = file_build_path(array("config","Conf.php"));
-->

## Sécurité des vues 

Nous allons apprendre pourquoi nous devons faire attention lorsque lorque nous
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

4. **Testez** votre action `readAll`.

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

Le script `viewAllVoiture.php` sert à écrire la liste des
voitures. Plutôt que d'avoir une copie de ce script dans
`viewCreatedVoiture.php`, `viewDeletedVoiture.php` et
`viewUpdatedVoiture.php`, incluez-le avec un `require`.

**Remarque :** Le fichier `viewDeletedVoiture.php` ne doit plus faire que
deux lignes maintenant.

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


<!--
Le site squelette se navigue à partir de la page principale `TD5/index.php` en
passant des paramètres dans l'URL comme par exemple
`TD5/index.php?controller=utilisateur\&action=readAll`. La page principale
`TD5/index.php` contient principalement le code du dispatcher, dont la fonction
est de charger le bon contrôleur en fonction des paramètres reçus dans
l'URL. Dans notre exemple, nous avons passé en paramètres
`controller=utilisateur`, donc le dispatcher chargera le contrôleur
`ControllerUtilisateur.php`.  Le dispatcher fait lui-même partie du contrôleur
dans le modèle MVC car il n'affiche ni page HTML (rôle des vues), ni ne manipule
les données (rôle des modèles).


À son tour, le contrôleur chargé va, en fonction de l'action donnée en paramètre dans l'URL, traiter la requête, agir avec le modèle correspondant puis afficher la vue adéquate.
Dans notre exemple, l'action est 'readAll' et le contrôleur va donc :

* demander au modèle `ModelUtilisateur.php` de lire tous les utilisateurs de la base de donnée ;
* initialiser une variable `$tab_util` ;
* charger la vue `utilisateur/list.php` dont la tâche est d'afficher une belle page HTML avec le contenu de `$tab_util`.

Pour l'instant, notre site ne sait que traiter les actions 'read' (recherche), 'readAll' (liste) et 'insert' (création) pour les utilisateurs.

<div class="exercise">
Prendre le temps de vérifier que l'on comprend bien le site squelette donné et son organisation. En cas de doute, relire le TD précédent, Googler la partie du code mystérieuse ou demander à votre professeur.
</div>

-->

On veut rajouter un comportement par défaut pour la page d'accueil ; nous allons
faire en sorte qu'un utilisateur qui arrive sur `index.php` voit la même page
que s'il était arrivé sur `index.php?action=readAll`.

<div class="exercise">

Si aucun paramètre n'est donné dans l'URL, initialisons la variable `$action`
avec la chaîne de caractères `readAll`.  Ainsi le `switch($action)` chargera
bien la bonne partie du code.  
Pour tester si un paramètre `action` est donné dans l'URL, utilisez la fonction
`isset($_GET['action'])` qui teste si une variable a été initialisée.

**Note :** De manière générale, il ne faut jamais lire un `$_GET['action']`
  avant d'avoir vérifié si il était bien défini avec un `isset(...)` sous peine
  d'avoir des erreurs `Undefined index : action ...`.

</div>

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

Désormais, la page
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php)
doit marcher sans paramètre. Notez que vous pouvez aussi y accéder avec
l'adresse
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `index.php` d'un répertoire
si elles existent.

<div class="exercise">

Nous souhaitons rajouter l'action `delete` aux voitures. Pour cela :

1. Écrivez dans le modèle de voiture la fonction `delete($immat)` qui prend
   en entrée l'immatriculation à supprimer. Utilisez pour cela les requêtes préparées de
   PDO.
1. Complétez l'action `delete` du contrôleur de voiture pour qu'il supprime
   la voiture dont l'immatriculation est passée en paramètre dans l'URL, initialise les
   variables `$immat` et `$tab_v`, puis qu'il affiche la vue
   `voiture/deleted.php` que l'on va créer dans la question suivante.
1. Complétez la vue `voiture/deleted.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation  `$immat` a bien été supprimée. Affichez
   en dessous de ce message la liste des voitures contenue dans `$tab_v`
   comme dans la page d'accueil.  
   **Note :** Comme vous l'avez remarqué, le code de cette vue est très
     similaire à celle de l'action `readAll`. Nous améliorerons le système de
     vue dans le prochain TD pour éviter d'avoir deux fois le même code à deux
     endroits différents.
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

<div class="exercise">

Nous souhaitons rajouter l'action `update` aux voitures. Pour cela :

1. Complétez dans le modèle de voiture la fonction `update($data)`. L'entrée
   `$data` sera un tableau associatif associant aux champs de la table
   `voiture` les valeurs correspondantes à la voiture courante. La fonction
   doit mettre à jour tous les champs de la voiture  dont l'immatriculation  est
   `$data['immat']`.

   **Rappel :** Ce type d'objet `$data` est celui qui est pris en entrée par la
   méthode `execute` de `PDO`,
   [*cf.* le TD3](/tutorials/tutorial3.html#requtes-prpares).

1. Complétez la vue `voiture/update.php` pour qu'elle affiche un
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

1. Complétez la vue `voiture/updated.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation `$immat` a bien été mis à jour. Affichez
   en dessous de ce message la liste des voitures mise à jour contenue dans
   `$tab_v` comme dans la page d'accueil.
1. Complétez l'action `updated` du contrôleur de voiture pour qu'il mette à
   jour la voiture dont l'immatriculation passée en paramètre dans l'URL, puis
   qu'il affiche la vue `voiture/updated.php` après l'avoir correctement
   initialisée.
1. Enrichissez la vue de détail `detail.php` pour ajouter un lien
   HTML qui permet de mettre à jour la voiture dont on affiche les détails.
1. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>

<!--
Question complémentaire pour ceux en avance :
Refaites tout ce que vous avez fait sur Utilisateur (et Trajets).
-->
