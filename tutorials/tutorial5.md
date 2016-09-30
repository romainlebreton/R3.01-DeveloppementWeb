---
title: TD5 &ndash; Architecture MVC avancée 1/2
subtitle: index.php, chemins absolus, CRUD
layout: tutorial
---

<!-- Corriger le schéma MVC -->

<!-- viewAllVoiture.php => list.php -->
<!-- viewCreateVoiture.php => create.php -->
<!-- viewErrorVoiture.php => error.php -->
<!-- viewVoiture.php => detail.php -->
<!-- controllerVoiture.php => ControllerVoiture.php -->
<!-- modelVoiture.php => ModelVoiture.php -->

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
[questions 1 à 5 du TD précédent](tutorial4.html#vue-ajout-dune-voiture),
c'est-à-dire que vous avez codé les actions `create` et `created`.

## Remise en route

La semaine dernière, nous avons commencer à utiliser l'architecture
MVC. Le code était découpé en trois parties :

1. Le contrôleur (*e.g.* `controller/controllerVoiture.php`) est la partie
principale du script PHP. L'utilisateur se connecte au site **en appelant cette
page**. C'est donc le script PHP de cette page qui est **exécuté** ;
2. Les vues (*e.g.* `view/voiture/viewAllVoiture.php`) ne doivent contenir que
les parties du code qui écrivent la page Web. Ces scripts seront appelés par le
contrôleur qui s'en servira comme d'un outil pour générer la page Web ;
3. Le modèle (*e.g.* `model/modelVoiture.php`) est une bibliothèque des
fonctions permettant de gérer les données, *i.e.* l'interaction avec la BDD dans
notre cas. Cette bibliothèque sera utilisée par le contrôleur.

Comme nous venons de le rappeler, l'utilisateur doit se connecter au contrôleur
`controller/controllerVoiture.php` pour accéder au site. Or l'organisation
interne du site Web ne doit pas être visible au client pour des raisons de
clareté et sécurité. Nous allons déplacer la page d'entrée de notre site vers
`index.php`.

<!-- De plus, quand nous aurons plusieurs controlleurs, index.php nous permettra
d'avoir une page de navigation unique -->

<!-- Que fait un require, qu'est-ce qu'un chemin relatif, require d'un chemin
relatif par rapport à quoi ? Script exécuté ? -->

**Rappels :**

* Que fait un `require` ?  
  Il copie-colle le script du fichier indiqué à l'endroit du `require` ;
* Qu'est-ce qu'un chemin relatif ?  
  Il y a deux types de chemins : les chemins *absolus* (commençant par `/`)
  comme `/home/ann2/lebreton/public_html` partent du répertoire racine. Les chemins
  *relatifs* partent du répertoire courant comme par exemple
  `../config/Conf.php`. Dans ce cas, `.` désigne le répertoire courant et `..`
  le répertoire parent.
* Si un `require` utilise un chemin relatif, quelle est la base de ce chemin ?
  Cette question prend tout son sens quand on fait `require` d'un fichier qui
  appelle encore `require`.  
  Comme les `require` font des copier-coller, tout se passe comme si les
  `require` étaient écrits dans le premier script PHP appelé. Donc tous les
  chemins sont relatifs au premier script appelé.  
  **Exemple :** Si l'utilisateur demande la page
    `controller/controllerVoiture.php` qui fait `require
    ../model/modelVoiture.php` qui fait `require '../model/Model.php'` qui fait
    `require '../config/Conf.php'`, toutes les URL sont relatives à la page
    demandée `controller/controllerVoiture.php`. Du coup on charge bien les
    fichiers `model/modelVoiture.php`, `model/Model.php` et `config/Conf.php`.

<!--

En fait, si on ne fournit aucun chemin, le include (ou require) cherche dans les
chemins de l'include_path (.:/usr/share/php chez moi). Si le fichier n'est pas
trouvé dans l' include_path, include vérifiera dans le dossier du script
appelant et dans le dossier de travail courant avant d'échouer.

Par exemple : si on est dans model/modelUtilisateur alors require `Model.php` marche
car il n'y a pas de chemin mais require `./Model.php` ne marche pas.

-->

<!--

Il semble que l'on puisse coder un $ROOTWEB portable à base de
$_SERVER['HTTP_HOST'] qui donne l'hôte et $_SERVER['REQUEST_URI'] qui donne le
chemin dans le serveur (?)

-->

**Problème pour passer à `index.php` :**

Tous nos `require` étaient basés sur des chemins relatifs par
rapport à la page demandée, qui était le contrôleur
`controller/controllerVoiture.php`. Lorsque l'on va déplacer la page d'accueil
vers `index.php`, tous nos `require` vont être décalés. Par exemple, un `require
'../config/Conf.php'` qui pointait vers `config/Conf.php` va désormais renvoyer
vers l'adresse inconnue `../config/Conf.php`.

<div class="exercise">

1. Pour remédier au problème précédent, nous allons utiliser des chemins
   absolus. Créez une variable `$ROOT` dans votre contrôleur qui stockera le
   chemin absolu menant à votre site Web (sans slash à la fin). Par exemple, sur
   les machines de l'IUT (serveur infolimon) ou sur vos machines personnelles
   Linux
   
   ```php?start_inline=1
   $ROOT = "/home/ann2/lebreton/public_html/TD5";
   ```

   ou sur vos machines personnelles  Windows 
   
   ```php?start_inline=1
   $ROOT = "C:\\wamp\www\TD5";
   ```


2. Modifiez tous les `require` de tous les fichiers pour qu'ils utilisent des
chemins absolus à l'aide de la variable `$ROOT` précédente.  
**Testez** que votre ancien site marche toujours bien en demandant la page
`controller/controllerVoiture.php?action=readAll` dans Firefox.
   
   **Astuces :**

   * Utilisez la fonction de recherche de votre éditeur de page PHP
   pour trouver tous les `require`.
   * Utilisez la syntaxe avec les *double quotes* `"..."` qui permettent le
     remplacement de variables,
     [*cf.* les compléments.]({{site.baseurl}}/assets/tut2-complement.html#les-chanes-de-caractres)

   <!-- **Erreurs classiques :** -->   
   <!-- * Utiliser des *simple quotes* `'...'` dans l'adresse des fichiers : la variable -->
   <!-- `$ROOT` n'est pas remplacée. -->
   <!-- * Appeler la page `index.php` sans action dans Firefox ; il faut demander une -->
   <!--   action comme par exemple `readAll` pour que le site marche (pour l'instant). -->

3. On souhaite désormais que la page d'accueil soit `index.php`. Créez donc un
   tel fichier à la racine de votre site. Déplacez la définition de `$ROOT` au
   début de `index.php`, puis faites un `require` du contrôleur
   `controller/controllerVoiture.php`.  
   **Testez** que votre site marche encore en demandant la page
   `index.php?action=readAll` dans le navigateur.

4. Changer tous les liens hypertextes que vous écrivez dans `viewVoiture.php` et
   `viewAllVoiture.php` pour qu'ils pointent sur `index.php` à la place de
   `controller/controllerVoiture.php`.

</div>

On souhaiterait que notre site soit portable, c'est-à-dire que l'on puisse
facilement le déplacer sur une autre machine, à un autre endroit ... On voit
bien que la variable `$ROOT` dépend de l'installation. De plus ceux qui ont des
machines Windows ont dû se rendre compte que les chemins était séparés par des
anti-slash `\` sur Windows, contrairement à Linux et Mac qui utilisent des slash
`/`.

**Exemple :** `C:\\wamp\www` sur Windows et `/home/ann2/lebreton/public_html` sur Linux.

<div class="exercise">

3. Pour la rendre portable, nous allons récupérer à la volée le répertoire du
   site avec le code suivant dans `index.php`:
   
   ```php?start_inline=1
   // __DIR__ est une constante "magique" de PHP qui contient le chemin du dossier courant
   $ROOT = __DIR__;
   ```
   
   **Référence :**
     [Constantes magiques en PHP](http://php.net/manual/fr/language.constants.predefined.php)


   <!-- An prochain : optionel ! Et vérifier si c'est vraiment nécessaire sous Windows ?  -->

2. Définissez la constante suivante dans `index.php` qui permet d'utiliser le
bon slash de séparation des chemins selon le système :

   ```php?start_inline=1
   // DS contient le slash des chemins de fichiers, c'est-à-dire '/' sur Linux et '\' sur Windows
   $DS = DIRECTORY_SEPARATOR;
   ```
   
   **Référence :**
     [Constantes prédéfinies en PHP](http://php.net/manual/fr/dir.constants.php)

3. Changez tous vos séparateurs de tous vos `require` par `$DS`.  
   **Astuce :** Ceci peut être fait en peu de temps en utilisant la fonction de
     remplacement de votre éditeur (souvent obtenue avec `Ctrl+H`) et le
     remplacement automatique de variables dans les chaînes entre double
     guillemets `"`. Essayez d'obtenir par exemple :

   ```php?start_inline=1
   require "{$ROOT}{$DS}config{$DS}Conf.php";
   ```

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
   `viewDeletedVoiture.php` que l'on va créer dans la question suivante.
1. Complétez la vue `viewDeletedVoiture.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation  `$immat` a bien été supprimée. Affichez
   en dessous de ce message la liste des voitures contenue dans `$tab_v`
   comme dans la page d'accueil.  
   **Note :** Comme vous l'avez remarqué, le code de cette vue est très
     similaire à celle de l'action `readAll`. Nous améliorerons le système de
     vue dans le prochain TD pour éviter d'avoir deux fois le même code à deux
     endroits différents.
1. Enrichissez la vue de détail `viewVoiture.php` pour ajouter un lien
HTML qui permet de supprimer la voiture dont on affiche les détails.  
   **Aide :** Procédez par étape. Écrivez d'abord un lien 'fixe' dans votre vue.
   Puis la partie qui dépend de la voiture.
   <!-- Erreur tentante : utiliser $ROOT dans les liens. On pourrait leur faire faire
   du $ROOTWEB -->
1. Testez le tout. Quand la fonctionnalité marche, appréciez l'instant.

</div>

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

1. Complétez la vue `viewUpdateVoiture.php` pour qu'elle affiche un
   formulaire identique à celui de `viewCreateVoiture.php`, mais qui sera
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

1. Complétez la vue `viewUpdatedVoiture.php` pour qu'elle affiche un message
   indiquant que la voiture d'immatriculation `$immat` a bien été mis à jour. Affichez
   en dessous de ce message la liste des voitures mise à jour contenue dans
   `$tab_v` comme dans la page d'accueil.
1. Complétez l'action `updated` du contrôleur de voiture pour qu'il mette à
   jour la voiture dont l'immatriculation passée en paramètre dans l'URL, puis
   qu'il affiche la vue `viewUpdatedVoiture.php` après l'avoir correctement
   initialisée.
1. Enrichissez la vue de détail `viewVoiture.php` pour ajouter un lien
   HTML qui permet de mettre à jour la voiture dont on affiche les détails.
1. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>

<!--
Question complémentaire pour ceux en avance :
Refaites tout ce que vous avez fait sur Utilisateur (et Trajets).
-->
