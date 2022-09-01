---
title: Complément 1 &ndash; Syntaxe PHP 8.1
subtitle: Un comparatif avec Java & Python
layout: tutorial
---

## Syntaxe

* Les commandes PHP doivent se trouver entre une balise ouvrante `<?php` et une balise fermante `?>`
  * Il existe une balise ouvrante `<?=` qui est un raccourci pour `<?php echo` (pratique dans les vues)
  * Si un fichier contient seulement du code PHP, il est préférable de ne pas placer la balise de fermeture à la fin du fichier (voir explication dans la documentation).

  [Documentation PHP](https://www.php.net/manual/fr/language.basic-syntax.phptags.php)

* Les noms de variables en PHP commencent par un `$`, comme par exemple `$voiture`

## Typage

* Pas de déclaration obligatoire du type d'une variation en PHP:
  * PHP: `$jour = "lundi";`
  * Java: `String jour = "lundi";`

* Le type de la valeur stockée dans une variable peut varier en PHP:
	```php
	$jour = "lundi";
	$jour = 0;
	```

* Un peu comme en Java, les principaux types que vous utiliserez en PHP sont:
  * soit des types scalaires : `bool`, `int`, `float` et `string`
  * soit des tableaux `array`
  * soit des objet `object`

  [Documentation PHP](https://www.php.net/manual/fr/language.types.intro.php)

* Optionnellement, on peut déclarer des types en PHP:
  * soit pour les arguments d'une fonction
  * soit pour la valeur de retour d'une fonction
  * soit pour les attributs de classe

  Ces types sont vérifiés à l'exécution, contrairement à Java qui les vérifie à la compilation.  
  La déclaration de type est **cruciale** pour que l'**autocomplétion** de l'IDE (PHPStorm, VSCode, ...) marche. 

  ```php
  class Requete {
	string $url;
	string $methode; // GET ou POST
  }
  class Reponse {
	int $code; // 200 OK ou 404 Not Found
	string $corps; // <html>...
  }

  function ServeurWeb(Requete $requete) : Reponse (
	// ...
  )
  ```

  [Documentation PHP](https://www.php.net/manual/fr/language.types.declarations.php)

## Orienté Objet

<style>
  @media(min-width: 1000px){
    .compareCode {
      display:flex;
    }
  }
</style>

<div class="compareCode">
  <div style="flex:auto">
  **En PHP**

  ```php
  namespace App\Covoiturage;

  class Controller {

    public renderTemplate(
      string $templatePath, 
      array $parameters = []
    ): string {
      // ...
    }
  }

  class ControllerVoiture extends Controller {

    private string $siteBaseUrl;

    public __construct(string $baseUrl) {
      $this->siteBaseUrl = $baseUrl;
    }

    public function readAll() {
      $content = $this->renderTemplate("list.php");
      // ...
    }
    
  }

  $controller = new ControllerVoiture("webinfo");
  $controller->readAll();
  ```
  </div>
  <div style="flex:auto">
  **En Java**

  ```java
  package App.Covoiturage;

  class Controller {

    public String renderTemplate(
      String templatePath, 
      List<String> parameters = {}
    ) {
      // ...
    }
  }

  class ControllerVoiture extends Controller {

    private String siteBaseUrl;

    ControllerVoiture(String baseUrl) {
      siteBaseUrl = baseUrl;
    }

    public readAll() {
      content = renderTemplate("list.php");
      // ...
    }
    
  }

  ControllerVoiture controller = new ControllerVoiture("webinfo");
  controller.readAll();
  ```
  </div>
</div>

* PHP: `$this` obligatoire, `function` avant les méthodes, constructeur nommé `__construct`
* On accède aux attributs/méthodes avec `->` au lieu de `.` en Java
* Les espaces de noms permettent de séparer les classes, comme si on les mettait dans des "dossiers" différent.
  On évite ainsi les risques de collisions :
  * `namespace`:  
    Dans l'exemple précédent, l'instruction `namespace App\Covoiturage;` dit que toutes les classes définies dans ce fichier
    vivent dans l'espace de nom `App\Covoiturage`.  
    En pratique, le fichier définit donc les classes `App\Covoiturage\Controller` et `App\Covoiturage\ControllerVoiture`.

  * `use`: Permet de raccourcir le nom de classe dans un fichier.  
    En effet,     
    ```php
    $controller = new ControllerVoiture("webinfo/~rletud/");
    ```
    ne marche pas dans un fichier qui a un namespace différent de `App\Covoiturage`.

    Il faut donc faire
    ```php
    $controller = new App\Covoiturage\Controller("webinfo/~rletud/");
    ```

    ou définir un raccourci pour le nom de classe avec `use`
    ```php
    use App\Covoiturage\Controller;
    $controller = new ControllerVoiture("webinfo/~rletud/");
    ```

    [Documentation PHP](https://www.php.net/manual/fr/language.namespaces.basics.php)

* Pas de type générique en PHP, contrairement à Java (`List<String>`). Par exemple, on peut déclarer un `array`, mais on ne peut pas spécifier
  le type des éléments dans le tableau.

* Le polymorphisme marche comme en Java:  
  Une méthode peut être implémentée différement en fonction du type.

* Pas de surcharge de fonction en PHP:  
  Java autorise 2 fonctions qui ont le même nom mais soit un nombre d'arguments différents, soit des types d'arguments différents. 
  Pas PHP.

* Les classes abstraites et les interfaces existent en PHP de façon similaire à Java.

## PHP Standards Recommendations (PSR)

Le groupe PHP-FIG (PHP Framework Interoperability Group) pour l'interopérabilité de PHP travaille pour standardiser
la pratique de PHP. Ce travail vise notamment à ce que les différents composants ou framework PHP puissent bien
communiquer entre eux.

Parmis les standards PSR les plus importants, on trouve :
* [PSR-1](https://www.php-fig.org/psr/psr-1/): Basic Code Style
* [PSR-4](https://www.php-fig.org/psr/psr-4/): Autoloaders
* [PSR-12](https://www.php-fig.org/psr/psr-12/): Extended Coding Style Guide

## PHPDoc

PHP propose son système de documentation intégré au code PHPDoc. C'est assez proche de Java avec la JavaDoc.

PHPDoc est complémentaire de la déclaration de type pour faire correctement fonctionner 
l'autocomplétion de l'IDE (PHPStorm, VSCode, ...), ainsi que l'infobulle renseignant chaque complétion.

Cette documentation s'écrit dans des DocComment, qui sont des commentaires particuliers commençant par `/** ` et finissant par `*/`.  

Exemple:
```php
/**
 * This class acts as an example on where to position a DocBlock.
 */
class Foo
{
    /** @var string|null $title contains a title for the Foo */
    protected $title = null;

    /**
     * This is a Summary.
     *
     * This is a Description. It may span multiple lines
     * or contain 'code' examples using the _Markdown_ markup
     * language.
     *
     * @param string $title A text for the title.
     *
     * @return void
     */
    public function setTitle($title)
    {
        // there should be no docblock here
        $this->title = $title;
    }
}
```

Sources et plus d'informations :
* [PSR-5 (brouillon) -- PHPDoc standard](https://github.com/php-fig/fig-standards/blob/master/proposed/phpdoc.md)
* [PSR-19 (brouillon) -- PHPDoc tags](https://github.com/php-fig/fig-standards/blob/master/proposed/phpdoc-tags.md)
* [PHP Documentator](https://docs.phpdoc.org/guide/getting-started/what-is-a-docblock.html)


## Avancé

* Il y a 4 syntaxes pour créer des chaînes de caractères:
  * [Guillemets simples](https://www.php.net/manual/fr/language.types.string.php#language.types.string.syntax.single): la plus simple
  * [Guillemets doubles](https://www.php.net/manual/fr/language.types.string.php#language.types.string.syntax.double): elle interprète les variables et plus de caractères échappés comme `\n`
  * [Syntaxe Heredoc](https://www.php.net/manual/fr/language.types.string.php#language.types.string.syntax.heredoc): Similaire aux guillemets doubles, mais on peut choisir le délimiteur de début/fin de chaîne.
  * [Syntaxe Nowdoc](https://www.php.net/manual/fr/language.types.string.php#language.types.string.syntax.nowdoc) : Similaire aux guillemets simples, mais on peut choisir le délimiteur de début/fin de chaîne.


* La syntaxe de la boucle `foreach` est :

  ```php
  foreach ($set as $value) {
      // statements;
  }

  foreach ($set as $key => $value) {
      echo "{$key} has a value of {$value}";
  }
  ```

  Les variables pouvant être itérés sont 
  soit les `array`, 
  soit les [générateurs](https://www.php.net/manual/en/language.generators.php), 
  ou tout objet implémentant l'interface abstraite [Traversable](https://www.php.net/manual/fr/class.traversable.php), c'est-à-dire 
    soit l'interface [Iterator](https://www.php.net/manual/fr/class.iterator.php), 
    soit l'interface [IteratorAggregate](https://www.php.net/manual/fr/class.iteratoraggregate.php).

* Comme en Java, le passage des arguments à une fonction se fait par valeur. 
  Sauf que comme les objets sont codés comme des références comme en Java.

  [Documentation PHP](https://www.php.net/manual/fr/language.oop5.references.php)

* PHP a un système de ramasse-miette (garbage collection) comme Java. Vous n'avez pas à vous soucier de la destruction des objets.

  [Documentation PHP](https://www.php.net/manual/fr/features.gc.refcounting-basics.php)

* Les déclarations de types optionelles supportent des types composés, notamment 
  * l'union de type : `type1|type2` (`type1` ou `type2`)
  * Type qui peut être aussi `null`: `?type` est équivalent à `type|null`  
    <br>
    
* Jonglage de type: [Documentation PHP](https://www.php.net/manual/fr/language.types.type-juggling.php)  
  PHP peut tenter de convertir le type d'une valeur en une autre automatiquement dans certains contextes:
  * Numérique: `"2" + 3` donne `5` (PHP convertit `"2"` en entier)
  * String: `echo $voiture;` appelle la méthode `$__toString()` de `$voiture`
    <br>

  * Comparaison: `$a == $b` donne des 
    [résultats très surprenants](https://www.php.net/manual/fr/types.comparisons.php#types.comparisions-loose) 
    quand `$a` et `$b` ne sont pas du même type.  
    * Il faut **absolument** utiliser `===` qui teste l'égalité des types ET des valeurs.  
    
    <span></span>
    
  * Arguments de fonctions: Le code suivant
    ```php
    function myEcho (string $s) {echo $s;}
    mecho(1); // S'execute bien et affiche 1
    ```

    passe la vérification de déclaration de type car `1` est converti en `string`

    **Solution**: Rajouter `declare(strict_types=1);` 
    [Documentation PHP](https://www.php.net/manual/fr/language.types.declarations.php#language.types.declarations.strict)
    ```php
    declare(strict_types=1);
    function myEcho (string $s) {echo $s;}
    mecho(1); // Leve une exception TypeError
    ```


* Comme Java avec son ByteCode, PHP est d'abord compilé vers un langage intermédiaire (OpCode). 
  [Source](https://php.watch/articles/php-dump-opcodes)

<!-- ## TODO

* [Named function arguments](https://www.php.net/manual/fr/functions.arguments.php#functions.named-arguments)
  `str_contains(needle: 'Bar', haystack: 'Foobar');`

* Ternary operators
  ```php
  $abs = ($value >= 0) ? $value : -$value;

  /* Equivalent to */

  if ($value >= 0) {
      $abs = $value;
  } else {
      $abs = -$value;
  }
  ```


* [Null Coalescing Operator `??`](https://www.php.net/manual/fr/language.operators.comparison.php#language.operators.comparison.coalesce): The expression `(expr1) ?? (expr2)` evaluates to `expr2` if `expr1` is `null`, and `expr1` otherwise.

* [Null-safe Operator `?->`](https://www.php.net/releases/8.0/en.php#nullsafe-operator).
  `return $user->getAddress()?->getCountry()?->isoCode;`
  The ?-> null-safe operator short-circuits the rest of the expression if it encounters a null value, and immediately returns null without causing any errors.  

* [`match`](https://www.php.net/manual/fr/control-structures.match.php)
PHP 8 introduces the match expression.[19] The match expression is conceptually similar to a switch statement and is more compact for some use cases.

* require / autoloader

* composer

* Xdebug

* Attributes allows declaring meta-data for functions, classes, properties, and parameters. Attributes map to PHP class names (declared with an Attribute itself), and they can be fetched programmatically with PHP Reflection API.

  ```php
  #[CustomAttribute]
  class Foo {
      #[AnotherAttribute(42)]
      public function bar(): void {}
  }
  ```

* Constructor Properties
  A new syntax to declare class properties right from the class constructor (__construct magic method).

  ```php
  class User {
      public function __construct(private string $name) {}
  }
  ```

Voir aussi https://www.php.net/releases/8.0/en.php ou https://php.watch/versions/8.0

-->

<!-- ## https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(object-oriented_programming)

language    construction	destruction
Java class variable = new class(parameters); This language uses garbage collection to release unused memory.
PHP	$variable = new class«(parameters)»;	unset($variable);[3]

language    class	protocol
Java comme PHP
	class name« extends parentclass»« implements interfaces» { members }	interface name« extends parentinterfaces» { members }	
    
sauf namespace 
Java package name; members
PHP namespace name; members

Class members
Constructors and destructors
PHP	function __construct(«parameters») { instructions }	function __destruct() { instructions }
Java	class(«parameters») { instructions } pas de destructeur

Fields
Java public/private/protected type field «= value»;
PHP public/private/protected $field «= value»;

Methods
Java type foo(«parameters») { instructions ... return value; }
PHP function foo(«parameters»)«: type» { instructions ... return value; }

Properties
How to declare a property named "Bar"

Manually implemented
language    read-write	read-only	write-only
Java - pas possible
PHP fonctions __get($property) et __set($property)

Automatically implemented
Ni PHP Ni Java

Overloaded operators
Standard operators
Pas Java
PHP, (extension PECL pour les opérateurs ?, RFC rejetée) seulement function call -> function __invoke

Indexers
read-write	read-only	write-only
Pas Java
PHP The class must implement the ArrayAccess interface.

Member access
Java    x.method(parameters)    x.field cls.member  ns.member
PHP	x->method(parameters)	x->field	x->property	cls::member	ns\member

Member availability
Has member?	Handler for missing member
Java (using reflection)
PHP	method_exists(x, "method")	property_exists(x, "field")	__call()	__get() / __set()

Special variables
current object	current object's parent object	null reference
Java this  super null
PHP $this parent null

Special methods
String representation	Object copy	Value equality	Object comparison	Hash code	Object ID
Java Java	x.toString()	x.clone()[51]	x.equals(y)	x.compareTo(y)[52]	x.hashCode()	System.identityHashCode(x)
PHP	$x->__toString()		clone x 	x == y	No	No	spl_object_hash(x)

Type manipulation
Get object type	Is instance of (includes subtypes)	Downcasting (with Runtime check)
Java	x.getClass()	x instanceof class	(type) x
PHP	get_class(x)	x instanceof class  This language is dynamically typed. Casting between types is unneeded.

Namespace management
Java		import ns.*;	import ns.item;
PHP		use ns;	use ns\item;
-->
