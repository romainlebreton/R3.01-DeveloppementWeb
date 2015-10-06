---
title: TD5 &ndash; Architecture MVC avancée 1/2
subtitle: CRUD, index.php et dispatcher
layout: tutorial
---

Aujourd'hui nous allons développer notre site-école de covoiturage. Au fur et à
mesure que le projet grandit, nous allons bénéficier du modèle MVC qui va nous
faciliter la tâche de conception.

Le but de ce TD est donc d'avoir un site qui propose une gestion minimale des
utilisateurs et des trajets proposés en covoiturage. En attendant de pouvoir
gérer les sessions d'utilisateur, nous allons développer l'interface
"administrateur" du site.

Ce TD présuppose que vous avez au moins fait les [questions 1 à 5 du TD
précédent](tutorial4.html#vue-ajout-dune-voiture), c'est-à-dire que vous avez codé les actions `create` et `created`.

## Remise en route

La semaine dernière, nous avons commencer à utiliser l'architecture
MVC. Le code était découpé en trois parties :

1. Le contrôleur(*e.g.* `controller/controllerVoiture.php`) est la partie
   principale du script PHP. C'est cette page qui est exécuté en premier. C'est
   donc cette page que le client qui se connecte au site doit demander ;
2. La vue (*e.g.* `view/voiture/viewAllVoiture.php`) ne doit contenir que les
parties du code qui écrivent la page Web ;
3. Le modèle (*e.g.* `model/modelVoiture.php`) est une bibliothèque des
fonctions permettant de gérer les données, *i.e.* l'interaction avec la BDD dans
notre cas.

Comme nous venons de le rappeler, l'utilisateur doit se connecter au contrôleur
`controller/controllerVoiture.php` pour accéder au site. Or l'organisation
interne du site Web ne doit pas être visible au client pour des raisons de
clareté et sécurité. Nous allons bouger la page d'entrée de notre site vers
`index.php`.

**Attention :** Tous nos `require` était basés sur des chemins relatifs par
rapport à la page demandée, qui était le contrôleur
`controller/controllerVoiture.php`. Lorsque l'on va déplacer la page d'accueil
vers `index.php`, tous nos `require` vont être décalés. Par exemple, un `require
'../config/Conf.php'` qui pointait vers `config/Conf.php` va désormais renvoyer
vers l'adresse inconnue `../config/Conf.php`.  


<div class="exercise">

1. Pour remédier au problème précédent, nous allons utiliser des chemins
   absolus. Créez une variable `$ROOT` dans votre contrôleur qui stockera le
   chemin absolu menant à votre site Web (sans slash à la fin).  Par exemple,
   sur mon ordinateur
   
   ~~~
   $ROOT = "/home/lebreton/public_html/covoiturage"
   ~~~
   {:.php}

2. Modifiez tous les `require` de tous les fichiers pour qu'ils utilisent des
   chemins absolus à l'aide de la variable `$ROOT` précédente. Testez que votre
   site marche toujours bien.

3. On souhaite désormais que la page d'accueil soit `index.php`. Créez donc un
   tel fichier à la racine de votre site. Déplacez la définition de `$ROOT` au
   début de `index.php`, puis incluez le code du contrôleur
   `controller/controllerVoiture.php` avec un `require`.  
   **Testez** que votre site marche toujours bien quand vous demandez la page
   `index.php` dans le navigateur.

</div>

On souhaiterait que notre site soit portable, c'est-à-dire que l'on puisse
facilement le déplacer sur une autre machine, à un autre endroit ... On voit
bien que la variable `$ROOT` dépend de l'installation. De plus ceux qui ont des
machines Windows ont dû se rendre compte que les chemins était séparés par des
anti-slash `\` sur Windows, contrairement à Linux et Mac qui utilisent des slash
`/`.

**Exemple :** `C:\\wamp\www` sur Windows et `/home/lebreton/public_html` sur Linux.

<div class="exercise">

3. Pour la rendre portable, nous allons récupérer à la volée le répertoire du
   site avec le code suivant dans `index.php`:
   
   ~~~
   // __DIR__ est une constante "magique" de PHP qui contient le chemin du dossier courant
   $ROOT = __DIR__;
   ~~~
   {:.php}
   
   **Référence :**
     [Constantes magiques en PHP](http://php.net/manual/fr/language.constants.predefined.php)

2. Définissez la constante suivante dans `index.php` qui permet d'utiliser le
bon slash de séparation des chemins selon le système :

   ~~~
   // DS contient le slash des chemins de fichiers, c'est-à-dire '/' sur Linux et '\' sur Windows
   $DS = DIRECTORY_SEPARATOR;
   ~~~
   {:.php}
   
   **Référence :**
     [Constantes prédéfinies en PHP](http://php.net/manual/fr/dir.constants.php)

3. Changez tous vos séparateurs de tous vos `require` par `$DS`.  
   **Astuce :** Ceci peut être fait en peu de temps en utilisant la fonction de
     remplacement de votre éditeur (souvent obtenue avec `Ctrl+H`) et le
     remplacement automatique de variables dans les chaînes entre double
     guillemets `"`. Essayez d'obtenir par exemple :

   ~~~
   require "{$ROOT}{$DS}config{$DS}Conf.php";
   ~~~
   {:.php}

</div>


<!--
Récupérez sur http://www.lirmm.fr/~lebreton/teaching.html} l'archive TD5.zip qui
vous servira de base pour ce TD. Décompressez cette archive dans votre
`public_html`.  **Rentrez vos informations de connexion dans
`./config/Conf.php`.**

Si vous utilisez NetBeans, ce qui est conseillé, créez un nouveau projet à
partir du répertoire TD5 (File $\to$ New Project $\to$ 'Php application from
existing sources' $\to$ sélectionnez le répertoire TD5).

En utilisant, l'interface de PhpMyAdmin, créez les deux tables si elles
n'existent pas déjà (attention aux majuscules) :

1. une table 'utilisateur' avec 4 champs de type VARCHAR(32) : PRIMARY 'login', 'nom', 'prenom', 'email' dont l'interclassement est `utf8_general_ci` (il s'agit de l'encodage qui sera utilisé par défaut dans vos tables).
1. une table 'trajet' avec 6 champs : PRIMARY INT 'id', VARCHAR(32) 'conducteur', VARCHAR(32) 'depart', VARCHAR(32) 'arrivee', INT 'nbplaces', INT 'prix'. 
On souhaite que le champ primaire 'id' s'incrémente à chaque nouvelle insertion dans la table.
Pour ce faire, sélectionnez pour le champ 'id' la valeur par défaut `NULL` et cochez la case `A_I` (auto-increment).
L'interclassement sera toujours `utf8_general_ci`.

-->

## CRUD pour les voitures

CRUD est un acronyme pour Create Read Update Delete, qui sont les 4 opérations
de base de toute donnée. Nous allons compléter notre site pour qu'il implémente
toutes ces fonctionnalités. Lors du TD précédent, nous avont implémenté nos
premières actions (une action correspond à peu près à une page Web) :

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
* charger la vue `viewListUtilisateur.php` dont la tâche est d'afficher une belle page HTML avec le contenu de `$tab_util`.

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
comme si l'action 'readAll' était donné en paramètre.  Pour tester si un
paramètre 'action' est donné dans l'URL, utilisez la fonction
`isset($_GET['action'])` qui teste si une variable a été initialisée.

</div>

Désormais, la page
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/index.php)
doit marcher sans paramètre. Notez que vous pouvez aussi y accéder avec
l'adresse
[http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://infolimon.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `index.php` d'un répertoire
si elles existent.

<div class="exercise">

Nous souhaitons rajouter l'action `delete` aux utilisateurs. Pour cela :

1. Écrivez dans le modèle d'utilisateur la fonction `delete($login)` qui prend
   en entrée le login à supprimer. Utilisez pour cela les requêtes préparées de
   PDO.
1. Complétez l'action `delete` du contrôleur d'utilisateur pour qu'il supprime
   l'utilisateur dont le login est passé en paramètre dans l'URL, initialise les
   variables `$login` et `$tab_util`, puis qu'il affiche la vue
   `viewDeletedUtilisateur.php` que l'on va créer dans la question suivante.
1. Complétez la vue `viewDeletedUtilisateur.php` pour qu'elle affiche un message
   indiquant que l'utilisateur de login `$login` a bien été supprimé. Affichez
   en dessous de ce message la liste d'utilisateurs contenue dans `$tab_util`
   comme dans la page d'accueil.
1. Enrichissez la vue de détail `viewFindUtilisateur.php` pour ajouter un lien
   HTML qui permet de supprimer l'utilisateur dont on affiche les détails.
1. Testez le tout. Quand la fonctionnalité marche, appréciez l'instant.

</div>

<div class="exercise">

Nous souhaitons rajouter l'action `update` aux Utilisateurs. Pour cela :

1. Complétez dans le modèle d'utilisateur la fonction `update($data)`. L'entrée
   `$data` sera un tableau associatif associant aux champs de la table
   'utilisateur' les valeurs correspondantes à l'utilisateur courant. La fonction
   doit mettre à jour tous les champs de l'utilisateur dont le login est
   `$data['login']`.

   **Rappel :** Ce type d'objet `$data` est celui qui est pris en entrée par la
   méthode `execute` de `PDO`.

1. Complétez la vue `viewUpdateUtilisateur.php` pour qu'elle affiche un
   formulaire identique à celui de `viewCreateUtilisateur.php`, mais qui sera
   pré-rempli par les données de l'utilisateur courant. Toutes les informations
   nécessaires seront une fois de plus passées *via* l'URL.

   **Indice :** L'attribut `value` de la balise `<input>` permet de pré-remplir un
   champ du formulaire.  Notez aussi que l'attribut `readonly` de `<input>`
   permet d'afficher le login sans que l'internaute puisse le changer.
  
1. Complétez l'action `update` du contrôleur d'utilisateur pour qu'il affiche le
   formulaire pré-rempli. **Testez** votre action.

1. Complétez la vue `viewUpdatedUtilisateur.php` pour qu'elle affiche un message
   indiquant que l'utilisateur de login `$login` a bien été mis à jour. Affichez
   en dessous de ce message la liste d'utilisateurs mise à jour contenue dans
   `$tab_util` comme dans la page d'accueil.
1. Complétez l'action `updated` du contrôleur d'utilisateur pour qu'il mette à
   jour l'utilisateur dont le login est passé en paramètre dans l'URL, puis
   qu'il affiche la vue `viewUpdatedUtilisateur.php` après l'avoir correctement
   initialisé.
1. Enrichissez la vue de détail `viewFindUtilisateur.php` pour ajouter un lien
   HTML qui permet de mettre à jour l'utilisateur dont on affiche les détails.
1. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>

<!--
## Vues modulaires

En l'état, certains bouts de code de nos vues se retrouvent dupliqués à de multiples endroits. Par exemple, l'affichage de la liste qui se trouve dans `viewListUtilisateur.php` se retrouve en partie dans `viewCreatedUtilisateur.php`, `viewDeletedUtilisateur.php`, `viewUpdatedUtilisateur.php`, ....

Réorganisons le code pour éviter les redondances :

<div class="exercise"> 
Créer un fichier `TD5/view/header.php` avec au moins le code suivant. 
Cette en-tête de page sera commune à tout votre site.
Vous pourrez la personnaliser plus tard avec, par exemple, une barre de menus renvoyant vers les principales pages du site.

~~~
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title><?php echo $pagetitle; ?></title>
    </head>
    <body>
~~~
{:.php}

</div>

<div class="exercise">

Créer un fichier `TD5/view/footer.php` avec au moins le code suivant. 
Ce pied de page sera commun à tout votre site. 
Vous pourrez le personnaliser plus tard avec un pied de page comportant votre nom, la date de dernière modification de la page, un lien vers un formulaire de contact ou encore les logos certifiant que votre page HTML est conforme aux standards.
~~~
    </body>
</html>
~~~
{:.php}

</div>

<div class="exercise"> 
Raccourcir toutes les vues en utilisant `require (ROOT . DS . 'view' . DS . 'header.php')` en début de fichier et  `require (ROOT . DS . 'view' . DS . 'footer.php')` en fin de fichier. Initialiser la variable `$pagetitle` en début de vue.
</div> 

<div class="exercise"> 
Mettre le corps de `viewListUtilisateur.php` dans un fichier séparé `partViewListUtilisateur.php`. Réutiliser ce fichier dans `viewCreatedUtilisateur.php`, `viewDeletedUtilisateur.php`, `viewUpdatedUtilisateur.php`, ....
</div>

<div class="exercise"> 
Fusionner `viewCreateUtilisateur.php` et `viewUpdateUtilisateur.php` en une unique page. Mettre à jour le contrôleur en conséquence.

**Indice :** `<input ... placeholder='Exemple' value='$val'>` affichera 'Exemple' en grisé si `$val` est la chaîne de caractère vide, et pré-remplira avec la valeur de  `$val` autrement.
</div> 

## CRUD pour les trajets

L'implémentation du CRUD pour les trajets est un code très similaire à celui pour les utilisateurs. Nous pourrions donc copier/coller le code des utilisateurs et changer les quelques endroits nécessaires. 

Pour éviter de perdre un temps conséquent à développer le CRUD pour chaque nouvel objet, nous allons le créer automatiquement autant que faire se peut.

### Création d'un modèle générique

<div class="exercise">
Commençons par la fonction `selectAll()`. Dans cette fonction, seul le nom de la table présent dans la requête SQL varie. 

1. Déplacez la fonction `selectAll()` de `ModelUtilisateur.php` vers `Model.php`.
1. Créez dans `ModelUtilisateur.php` une variable `$table` qui est `protected` (accessible uniquement dans la classe courante et ses classes filles) et `static` (qui ne dépend que de la classe, pas des objets).
1. Utilisez cette variable dans la fonction `selectAll()` de `Model.php` pour faire la requête sur la bonne table.
Pour cela, accéder à la variable `$table` avec `static::$table` dans `Model.php`.


**Plus d'explications:** La syntaxe `static::$table` est quelque peu subtile. Dans notre cas, elle permet que lorsque l'on appelle `ModelUtilisateur::selectAll()`, qui est héritée de `Model::selectAll()`, la variable `static::$table` aille chercher `ModelUtilisateur::$table` et non pas `Model::$table`.
1. Testez que votre site marche toujours.

</div>

<div class="exercise">
Passons à la fonction `select()`. Dans cette fonction, le nom de la table et la condition `WHERE` varie. 

1. Déplacez la fonction `select()` de `ModelUtilisateur.php` vers `Model.php`.
1. Utilisez la variable statique `$table` de `ModelUtilisateur.php` pour remplacer le nom de la table.
1. Créez une variable statique `$primary` dans `ModelUtilisateur.php` qui contiendra le nom du champ de la clé primaire.
Utilisez cette variable pour remplacer le nom de la clé primaire dans `select()`.

</div>

<div class="exercise">
Répétez la question précédente avec la fonction `delete()`.
</div>

<div class="exercise">
Passons à la fonction `update()`. Pour reconstituer la requête 

~~~
UPDATE utilisateur SET nom=:nom,prenom=:prenom,email=:email,login=:login WHERE login=:login
~~~
{:.mysql}

 il est nécessaire de pouvoir lister les champs de la table 'utilisateur'. 
Ces champs sont les entrées du tableau `$data` et c'est ainsi que nous allons les récupérer.

1. Déplacez la fonction `update()` de `ModelUtilisateur.php` vers `Model.php`.
1. Remplacer la table et le nom de la clé primaire par les variables adéquates.
1. Nous allons générer la partie `SET` à partir des clés du tableau associatif `$data`. Autrement dit, si `$data['un_champ']` existe, nous voulons rajouter la condition `un_champ = :un_champ` à `SET`.

**Indice:** Utilisez la boucle `foreach ($tableau as $cle => $valeur)` pour récupérer les clés du tableau. Googler aussi la fonction `rtrim` de PHP qui pourra vous être utile pour enlever la virgule de trop à votre requête.

</div>

<div class="exercise">
Répétez la question précédente avec la fonction `insert()`.
</div>

### Adaptation du contrôleur

<div class="exercise">

Couper l'adaptation du contrôleur en petit bouts testables. Il faut aussi adapter les vues au fur et à mesure. Finalement, il faut faire quelques remplacements dans VIEW_PATH, ModelUtilisateur et les vues (comme  viewErrorUtilisateur) pour simplifier la tâche.
</div>
-->

<!-- 
%%%%%%%%%%%%%%%%%%%%%%%% Idées année dernière %%%%%%%%%%

<div class="exercise">
Factoriser le contrôleur en utilisant l'introspection ** ?? get_name
</div>

<div class="exercise">
Adapter les vues
</div>
-->
