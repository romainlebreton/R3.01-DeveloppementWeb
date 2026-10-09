---
title:  TD2 &ndash; Compléments
subtitle: Attributs et méthodes statiques
layout: tutorial
lang: fr
---

## Les attributs et méthodes `static`

### Attributs statiques

Un attribut d'une classe est *statique* s'il ne dépend pas des instances de la
classe mais seulement de la classe elle-même. Si on pense en termes de mémoire,
on peut avoir plusieurs instances différentes d'une même classe en mémoire, mais
un attribut statique ne sera présent qu'une seule fois en mémoire.

Comme un attribut `static` ne dépend que de la classe, on y accède avec la
syntaxe `NomClasse::$nomAttribut` en PHP (attention au `$`). Par contraste, les
attributs classiques s'accèdent par la syntaxe `$instance->nomAttribut` (sans `$`
devant `nomAttribut`).

**Exemple du TD2 :** dans le patron de conception *Singleton*, l'unique instance
de la connexion est stockée dans un attribut statique, car elle doit être
partagée par toute l'application et non appartenir à un objet particulier :

```php?start_inline=1
class ConnexionBaseDeDonnees {
    private static ?ConnexionBaseDeDonnees $instance = null;

    private static function getInstance() : ConnexionBaseDeDonnees {
        if (is_null(ConnexionBaseDeDonnees::$instance))
            ConnexionBaseDeDonnees::$instance = new ConnexionBaseDeDonnees();
        return ConnexionBaseDeDonnees::$instance;
    }
    // ...
}
```

Notez que, même à l'intérieur de la classe, nous écrivons
`ConnexionBaseDeDonnees::$instance` (et non `$this->instance`).

### Méthodes statiques

Une méthode non statique (appelée aussi dynamique) peut se comprendre comme une
méthode qui reçoit un argument `$this` en supplément des arguments déclarés. Du
coup, une méthode statique est juste une fonction rangée dans une classe, dans
laquelle on n'a pas accès à `$this`. On l'appelle avec la syntaxe
`NomClasse::nomMethode()`.

**Exemples du TD2 :**

* `ConnexionBaseDeDonnees::getPdo()` est statique : on peut récupérer l'objet
  `PDO` depuis n'importe quel endroit du code, sans avoir à créer ou à
  transporter un objet `ConnexionBaseDeDonnees`.
* `Utilisateur::construireDepuisTableauSQL($utilisateurFormatTableau)` est
  statique car, au moment de l'appeler, on n'a justement pas encore d'objet
  `Utilisateur` : c'est cette méthode qui le crée.
* `Utilisateur::recupererUtilisateurs()` est statique car elle concerne tous les
  utilisateurs de la base de données, et pas un utilisateur en particulier.
* À l'inverse, `$utilisateur->getLogin()` est une méthode dynamique : elle lit
  un attribut d'un utilisateur précis, donc elle a besoin de `$this`.

Pour choisir, posez-vous la question : *« Ma méthode a-t-elle besoin d'un objet
précis (de `$this`) pour fonctionner ? »* Si non, elle peut être statique.

### Erreurs fréquentes

* Utiliser `$this` dans une méthode statique provoque l'**erreur fatale**
  (qui arrête le script)  
  `Using $this when not in object context`.
* Appeler une méthode dynamique de manière statique, par exemple
  `Utilisateur::getLogin()`, provoque l'**erreur fatale**  
  `Non-static method Utilisateur::getLogin() cannot be called statically`.
* Écrire `$this->instance` pour lire l'attribut statique `$instance` ne fonctionne
  pas, mais PHP n'affiche que des **avertissements** (`Notice` puis `Warning`)  
  `Accessing static property ConnexionBaseDeDonnees::$instance as non static`  
  `Undefined property: ConnexionBaseDeDonnees::$instance`  
  et le script continue avec la valeur `null`. Cette erreur est donc plus
  sournoise : le bug se manifestera plus loin dans le code.

### Constantes de classe

La syntaxe `NomClasse::` sert aussi pour les *constantes de classe*, déclarées
avec le mot-clé `const`. Vous en avez utilisé dans le TD2 : `PDO::FETCH_ASSOC`
ou `PDO::ATTR_ERRMODE` sont des constantes de la classe `PDO`. C'est l'équivalent
de `Math.PI` en Java.

```php?start_inline=1
class Exemple {
    // Pas de $ devant le nom d'une constante
    public const NOM_CONSTANTE = 42;
}

echo Exemple::NOM_CONSTANTE; // Affiche 42
```

### Autre utilisation

Les attributs statiques servent aussi à coder des comportements de classe. Par
exemple, on peut attribuer un identifiant unique à chaque instance d'une classe
en stockant dans un attribut statique le nombre d'instances déjà créées :

```php?start_inline=1
class Ticket {
    private static int $nombreTickets = 0;
    private int $numero;

    public function __construct() {
        Ticket::$nombreTickets++;
        $this->numero = Ticket::$nombreTickets;
    }
}
```

### (Optionnel) Les mots-clés `self` et `static`

Dans les TDs, nous écrivons toujours explicitement le nom de la classe
(`ConnexionBaseDeDonnees::$instance`), même à l'intérieur de la classe, car
c'est plus lisible. Vous rencontrerez cependant souvent dans du code PHP les
mots-clés `self` et `static` :

* `self` désigne la classe dans laquelle le code est écrit ;
* `static` désigne la classe sur laquelle la méthode a été appelée, ce qui fait
  une différence en cas d'héritage.

```php?start_inline=1
class Mere {
    public static function afficherSelfStatic() {
        // NomClasse::class a pour valeur
        // la chaîne de caractères "NomClasse"
        echo "self : " . self::class . "\n";
        echo "static : " . static::class . "\n";
    }
}

class Fille extends Mere {
}

Fille::afficherSelfStatic();
// Affiche :
// self : Mere
// static : Fille
```
