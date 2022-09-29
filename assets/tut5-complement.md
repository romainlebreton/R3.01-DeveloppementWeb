---
title: Configuration Apache, namespace et autoloader
subtitle: 
layout: tutorial
lang: fr
---

## `.htaccess` 

Fichier permettant de paramétrer Apache

Pourquoi est-ce que les ACL ne permettent pas de faire notre comportement ?
  
> On veut qu'Apache puisse exécuter tous les scripts PHP, donc on ne peut pas toucher les ACL.
> Par contre, il ne doit pas répondre à certaines requêtes, donc on a besoin du fichier `.htaccess`.

### Si le fichier .htaccess ne marche pas

Normalement, les fichiers `.htaccess` marchent à l'IUT sur `webinfo`, et dans
une installation classique de XAMP sous Linux.

Cependant, si cela ne marche pas sur votre installation, il faut paramétrer
Apache pour utiliser les fichiers `.htaccess`. Pour ceci, il faut modifier le
fichier `apache2.conf` pour transformer les lignes `AllowOverride none` en
`AllowOverride All`.

## `namespace`

Les espaces de noms permettent d'encapsuler des classes, fonctions pour éviter
les conflits. Ils fonctionnent de manière similaire aux fichiers qui sont
répartis dans des dossiers.

Source : [Documentation sur PHP.net](https://www.php.net/manual/fr/language.namespaces.rationale.php)

### `namespace`


* `file1.php`

```php
namespace EspaceBase\SousEspace;

class Foo
{
    static function methodestatique() {
      echo "Methode statique de Foo dans file1.php\n";
    }
    function methode() {
      echo "Methode dynamique de Foo dans file1.php\n";
    }
}
```

* `file2.php`

```php
namespace EspaceBase;
include 'file1.php';

class Foo
{
    static function methodestatique() {
      echo "Methode statique de Foo dans file2.php\n";
    }
    function methode() {
      echo "Methode dynamique de Foo dans file2.php\n";
    }
}

/* nom non qualifié */
$f = new Foo(); // Classe \EspaceBase\Foo
$f->methode(); // Affiche "Methode dynamique de Foo dans file2.php"
Foo::methodestatique(); // Affiche "Methode statique de Foo dans file2.php"

/* nom qualifié */
$f = new SousEspace\Foo(); // Classe \EspaceBase\SousEspace\Foo
$f->methode(); // Affiche "Methode dynamique de Foo dans file1.php"
SousEspace\Foo::methodestatique(); // Affiche "Methode statique de Foo dans file1.php"

/* nom absolu */
$f = new \EspaceBase\SousEspace\Foo(); // Classe \EspaceBase\SousEspace\Foo
$f->methode(); // Affiche "Methode dynamique de Foo dans file1.php"
\EspaceBase\SousEspace\Foo::methodestatique(); // Affiche "Methode statique de Foo dans file1.php"
```

Source : [Documentation sur PHP.net](https://www.php.net/manual/fr/language.namespaces.basics.php)

#### Accès aux classes, fonctions et constantes globales depuis un espace de noms

```php
namespace Foo;

function strlen() {}
const INI_ALL = 3;
class Exception {}

$a = \strlen('hi'); // appel la fonction globale strlen
$b = \INI_ALL; // accès à une constante INI_ALL
$c = new \Exception('error'); // instantie la classe globale Exception
```

Source : [Documentation sur PHP.net](https://www.php.net/manual/fr/language.namespaces.basics.php)

<!-- ### `use` 

use 

use as -->

## autoloader

<!-- ### spl_autoregister

Attend une fonction qui prend une classe.

### Exemple plus simple

exemple plus simple dans 
  https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader-examples.md
  closure example -->

### Pas d'autoloader pour les vues ?

Pourquoi n'utilise-t-on pas l'autoloader pour charger les vues ? Parce que
l'autoloader charge automatique **des classes**. Or les vues ne sont pas des
classes PHP.