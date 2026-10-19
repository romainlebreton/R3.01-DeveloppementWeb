---
title: Configuration Apache, namespace et autoloader
subtitle: 
layout: tutorial
lang: fr
---

## `.htaccess` 

Le fichier `.htaccess` permet de paramétrer Apache dossier par dossier. Au TD5,
nous l'utilisons pour interdire l'accès par Internet à tout le site, sauf au
dossier `web` (et `ressources`).

**Pourquoi est-ce que les ACL ne permettent pas d'obtenir ce comportement ?**

> Les ACL règlent les droits d'accès **aux fichiers sur le disque**. Or, quand
> `web/controleurFrontal.php` s'exécute, PHP (qui tourne sous l'utilisateur
> `www-data` d'Apache) doit pouvoir **lire** tous les fichiers de `src` pour les
> charger avec `require`. On ne peut donc pas retirer à `www-data` le droit de
> lecture sur `src`.
>
> Ce que l'on veut interdire, c'est seulement que ces fichiers soient servis en
> réponse à une **requête HTTP**. C'est le rôle du fichier `.htaccess`, qui règle
> le comportement d'Apache face aux requêtes, et non l'accès au disque.

## Chemin de fichier ou URL ?

Depuis que le contrôleur frontal est dans `web` et que les vues sont dans
`src/vue`, beaucoup d'erreurs viennent d'une confusion entre deux sortes
d'adresses qui se ressemblent beaucoup : les **chemins de fichiers** et les
**URL**.

### Deux sortes d'adresses

* Un **chemin de fichier** désigne un fichier sur le disque dur du serveur. Il
  est utilisé par PHP, qui s'exécute sur le serveur. Exemples :
  * `/home/lebreton/public_html/ILovePHP/bonjour.php`
  * `/var/www/html/tds-php/TD5/web/controleurFrontal.php`
* Une **URL** désigne une ressource sur Internet. Elle est utilisée par le
  **navigateur** (le client), qui envoie une requête HTTP au serveur. Exemple :
  
  <div class="centered">
  `http://localhost/tds-php/TD5/web/controleurFrontal.php`
  </div>

  se décompose en le protocole `http://`, le nom de domaine `localhost`, et le
  chemin `/tds-php/TD5/web/controleurFrontal.php` (voir aussi la [note sur les
  URL du TD1]({{site.baseurl}}/assets/tut1-complement.html#note-sur-les-urls)).

Le chemin d'une URL ressemble à un chemin de fichier, mais ce n'est pas le même :
c'est Apache qui fait la correspondance entre les deux. Par exemple, le chemin
d'URL `/tds-php/TD5/web/controleurFrontal.php` correspond au fichier
`/var/www/html/tds-php/TD5/web/controleurFrontal.php`.

### Qui lit l'adresse ?

Pour savoir quelle sorte d'adresse écrire, il faut se demander **qui va
l'utiliser** :

| Emplacement dans le code | Utilisé par | Type d'adresse |
|--------------------------|-------------|----------------|
| `require`, `require_once` (déclaration de classe, vue) | PHP | chemin de fichier |
| `parse_ini_file`, `move_uploaded_file`, … | PHP | chemin de fichier |
| `<a href="…">` | navigateur | URL |
| `<form action="…">` | navigateur | URL |
| `<link rel="stylesheet" href="…">` (CSS), `<img src="…">`, `<script src="…">` | navigateur | URL |
| `header("Location: …")` (TD9) | navigateur | URL |
{: .centered}

**En résumé :** ce qui est argument d'une fonction PHP est un chemin de fichier ;
ce qui est écrit dans du HTML (ou dans un en-tête HTTP) envoyé au navigateur est
une URL.

Le [complément sur l'upload de fichiers]({{site.baseurl}}/assets/tut4-complement.html)
illustre bien la différence : la même image est désignée par le chemin de fichier
`__DIR__ . "/../../ressources/img/profils/$nomFichier"` dans `move_uploaded_file`,
et par l'URL relative `../ressources/img/profils/$nomFichier` dans `<img src="…">`.

### Relatif par rapport à quoi ?

Les deux sortes d'adresses peuvent être **relatives**, c.-à-d. ne pas commencer
par `/` (ni par `http://`). Mais elles ne sont pas relatives à la même chose !

* Un **chemin de fichier relatif** est interprété par PHP par rapport au dossier
  du script exécuté, c.-à-d. en pratique `web`, le dossier de
  `controleurFrontal.php`, et **pas** par rapport au fichier qui contient le
  `require`. C'est pour cela que nous n'utilisons que des chemins de fichiers
  absolus construits avec `__DIR__` (voir le TD5).

  À l'inverse, `__DIR__` contient le dossier du **fichier dans lequel il est
  écrit**, et **pas** celui du script exécuté. Par exemple, si
  `web/controleurFrontal.php` charge `src/Modele/ConnexionBaseDeDonnees.php`, qui
  contient

  ```php?start_inline=1
  parse_ini_file(__DIR__ . '/../Configuration/ConfigurationBaseDeDonnees.ini');
  ```

  alors `__DIR__` vaut `/var/www/html/tds-php/TD5/src/Modele` (et non
  `/var/www/html/tds-php/TD5/web`), même si c'est `controleurFrontal.php` qui
  est exécuté. Le chemin obtenu ne dépend donc pas du script qui a fait le
  `require`, ce qui le rend fiable.

* Une **URL relative** est complétée par le navigateur par rapport à l'**URL de
  la page affichée**, c.-à-d. celle de la barre d'adresse. Le navigateur ne sait
  rien de vos fichiers PHP : il ne voit que le HTML qu'il a reçu. Or toutes nos
  pages sont produites par
  `http://localhost/tds-php/TD5/web/controleurFrontal.php`. Les URL relatives sont
  donc toutes complétées à partir du dossier d'URL
  `http://localhost/tds-php/TD5/web/`, même si le code HTML est écrit dans une
  vue de `src/vue/utilisateur/`.

Voici comment le navigateur complète quelques URL, si la page affichée est
`http://localhost/tds-php/TD5/web/controleurFrontal.php` :

| URL écrite dans le HTML | URL complétée par le navigateur |
|-------------------------|---------------------------------|
| `controleurFrontal.php?action=afficherListe` | `http://localhost/tds-php/TD5/web/controleurFrontal.php?action=afficherListe` |
| `./css/styles.css` | `http://localhost/tds-php/TD5/web/css/styles.css` |
| `../ressources/img/logo.png` | `http://localhost/tds-php/TD5/ressources/img/logo.png` |
| `../../index.html` | `http://localhost/tds-php/index.html` |
| `/projet/` | `http://localhost/projet/` |
{: .centered}

**Remarques :**
* Une URL qui commence par `/` est relative au **nom de domaine** : elle repart
  de la racine du site `http://localhost/`. Ce n'est donc pas la même chose que
  le `/` d'un chemin de fichier, qui désigne la racine du disque dur.
* Quand une URL désigne un dossier, comme `http://localhost/projet/`, Apache
  renvoie le fichier `index.html` ou `index.php` de ce dossier s'il existe, ou
  sinon liste les fichiers du dossier (si `mod_autoindex` est activé).
* On privilégie les URL relatives car elles continuent de fonctionner si le site
  est déplacé, par exemple de `http://localhost/tds-php/TD5/` vers
  `http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/`.

### Exemple : le formulaire de création d'un utilisateur

Le formulaire de `src/vue/utilisateur/formulaireCreation.php` doit envoyer ses
données à l'action `creerDepuisFormulaire` du contrôleur frontal.

```html
<!-- Correct -->
<form method="get" action="controleurFrontal.php">
<!-- Incorrect -->
<form method="get" action="../../../web/controleurFrontal.php">
```

La deuxième version a été écrite en partant du fichier
`src/vue/utilisateur/formulaireCreation.php` sur le disque. Mais le navigateur la
complète à partir de l'URL de la page affichée et obtient
`http://localhost/web/controleurFrontal.php`, qui n'existe pas.

C'est aussi pour cela que PhpStorm affiche parfois un *warning* sur les URL de
vos vues : de son point de vue, vous êtes dans `src/vue/…`, alors que le
navigateur chargera la page depuis `web`.

### Erreurs classiques

* **Calculer une URL relative depuis l'emplacement du fichier de vue** : voir
  l'exemple ci-dessus.
* **Mettre un chemin de fichier dans une URL**, par exemple
  ```php
  <link rel="stylesheet" href="<?= __DIR__ ?>/../../ressources/css/navstyle.css">
  ```
  Le navigateur reçoit `href="/var/www/html/tds-php/TD5/src/vue/../../ressources/css/navstyle.css"`,
  qu'il interprète comme l'URL
  `http://localhost/var/www/html/tds-php/TD5/src/vue/../../ressources/css/navstyle.css`,
  d'où une erreur 404. `__DIR__` (ou toute constante contenant un chemin de fichier)
  n'a rien à faire dans un attribut `href`, `src` ou `action`.
* **Utiliser une URL en `file://`** : elle désigne un fichier de *votre* disque
  dur et ne passe pas par le serveur HTTP. Elle est donc à proscrire (voir le
  [TD1]({{site.baseurl}}/assets/tut1-complement.html#les-url-en-file)).
* **Mettre une URL dans un `require`**, par exemple
  `require "controleurFrontal.php?action=afficherListe";`. Un `require` attend un
  chemin de fichier : il n'y a pas de *query string*. Pour passer des données à
  une vue, on définit des variables avant le `require`.

## `namespace`

Les espaces de noms permettent d'encapsuler des classes, fonctions pour éviter
les conflits. Ils fonctionnent de manière similaire aux fichiers qui sont
répartis dans des dossiers.

Source : [Documentation sur PHP.net](https://www.php.net/manual/fr/language.namespaces.rationale.php)

### Noms non qualifiés, qualifiés et absolus

* `file1.php`

```php
<?php
namespace EspaceBase\SousEspace;

class Foo
{
    static function methodeStatique() {
      echo "Méthode statique de Foo dans file1.php\n";
    }
    function methode() {
      echo "Méthode dynamique de Foo dans file1.php\n";
    }
}
```

* `file2.php`

```php
<?php
namespace EspaceBase;
require_once 'file1.php';

class Foo
{
    static function methodeStatique() {
      echo "Méthode statique de Foo dans file2.php\n";
    }
    function methode() {
      echo "Méthode dynamique de Foo dans file2.php\n";
    }
}

/* nom non qualifié */
$f = new Foo(); // Classe \EspaceBase\Foo
$f->methode(); // Affiche "Méthode dynamique de Foo dans file2.php"
Foo::methodeStatique(); // Affiche "Méthode statique de Foo dans file2.php"

/* nom qualifié */
$f = new SousEspace\Foo(); // Classe \EspaceBase\SousEspace\Foo
$f->methode(); // Affiche "Méthode dynamique de Foo dans file1.php"
SousEspace\Foo::methodeStatique(); // Affiche "Méthode statique de Foo dans file1.php"

/* nom absolu */
$f = new \EspaceBase\SousEspace\Foo(); // Classe \EspaceBase\SousEspace\Foo
$f->methode(); // Affiche "Méthode dynamique de Foo dans file1.php"
\EspaceBase\SousEspace\Foo::methodeStatique(); // Affiche "Méthode statique de Foo dans file1.php"
```

Source : [Documentation sur PHP.net](https://www.php.net/manual/fr/language.namespaces.basics.php)

### Accès aux classes, fonctions et constantes globales depuis un espace de noms

Les classes, fonctions et constantes fournies par PHP (`PDO`, `strlen`,
`PHP_EOL`, ...) sont déclarées dans l'espace de noms global `\`. Depuis un
espace de noms, PHP ne les traite pas toutes de la même façon :

* pour une **fonction** ou une **constante** non qualifiée, PHP la cherche
  d'abord dans l'espace de noms courant, puis, s'il ne la trouve pas, dans
  l'espace de noms global. C'est pour cela que `strlen("abc")` fonctionne sans
  `\` ;
* pour une **classe**, PHP ne cherche **que** dans l'espace de noms courant.
  C'est pour cela qu'il faut écrire `\PDO` ou `use PDO;` au TD5, sinon on obtient
  l'erreur `Class "App\Covoiturage\Modele\PDO" not found`.

```php
<?php
namespace App\Covoiturage\Modele;

$a = strlen('hi');          // OK : fonction globale strlen trouvée par repli
$b = PHP_EOL;               // OK : constante globale PHP_EOL trouvée par repli
$c = new \DateTime();       // OK : classe globale DateTime
$d = new DateTime();        // Erreur : classe App\Covoiturage\Modele\DateTime introuvable
```

Si l'espace de noms courant déclare lui-même une fonction, une constante ou une
classe de même nom, on peut toujours accéder à celle de l'espace global avec un
`\` :

```php
<?php
namespace Foo;

function strlen() {}
const INI_ALL = 3;
class Exception {}

$a = \strlen('hi'); // appelle la fonction globale strlen
$b = \INI_ALL; // accède à la constante globale INI_ALL
$c = new \Exception('error'); // instancie la classe globale Exception
```

Source : [Documentation sur PHP.net](https://www.php.net/manual/fr/language.namespaces.fallback.php)

## Explication de l'implémentation de l'*autoloader* 

### `spl_autoload_register`

La fonction 
[`spl_autoload_register`](https://www.php.net/manual/fr/function.spl-autoload-register.php)
est le cœur du mécanisme de chargement automatique de classes de PHP. On lui donne en argument 
une fonction qui sera appelée si PHP rencontre une classe qui n'a pas encore été déclarée.

La méthode `register()` de `Psr4AutoloaderClass` ne fait qu'enregistrer la
méthode `loadClass()` de l'objet chargeur avec un appel à
`spl_autoload_register`.

Le reste de la classe transforme un nom de classe qualifié en un nom de
fichier (méthode `loadMappedFile`), puis charge le fichier avec `requireFile`.

### Exemple plus simple

Vous pouvez voir un exemple plus court d'autoloader à [cette adresse](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader-examples.md#closure-example). 
Attention, cet exemple n'est pas recommandé car :
* il n'utilise pas de programmation orientée-objet,
* il ne permet d'associer qu'un seul préfixe de nom de classe qualifié à un chemin de fichier.

### Pas d'autoloader pour les vues ?

Pourquoi n'utilise-t-on pas l'autoloader pour charger les vues ? Parce que
l'autoloader charge automatiquement **des classes**. Or les vues ne sont pas des
classes PHP.
