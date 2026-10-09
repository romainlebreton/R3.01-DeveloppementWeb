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
