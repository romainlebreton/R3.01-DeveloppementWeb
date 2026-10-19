---
title:  TD2 &ndash; Compléments
subtitle: Attributs et méthodes statiques, base de données dans PhpStorm
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

## Accéder à la base de données depuis PhpStorm

PhpStorm intègre un client de bases de données complet. Une fois configuré, il
permet de parcourir et modifier vos tables sans quitter l'éditeur, d'exécuter des
requêtes SQL dans une console, et surtout de bénéficier de l'autocomplétion et de
la vérification du SQL écrit dans vos chaînes de caractères PHP.

### Créer la source de données

1. Ouvrez la fenêtre **Database** : *View* → *Tool Windows* → *Database* (ou
   l'icône en forme de cylindre dans la barre latérale droite).

2. Cliquez sur **+** → *Data Source* → **MariaDB**.

   ![PhpStormAddDataSource]({{site.baseurl}}/assets/TD2/PhpStormAddDataSource.jpg){: .blockcenter}

3. Dans l'onglet *General*, renseignez les mêmes informations que dans votre
   fichier `ConfigurationBaseDeDonnees.ini` :

   * *Host* : `webinfo.iutmontp.univ-montp2.fr`
   * *Port* : `3316` (et non le port MariaDB par défaut 3306)
   * *Authentication* : `User & Password`
   * *User* : votre login IUT
   * *Password* : le mot de passe que vous avez défini dans phpMyAdmin
   * *Database* : votre login IUT (c'est le nom de votre base de données)

   Vous pouvez aussi renommer la source de données (champ *Name* en haut), par
   exemple en `webinfo`.

   ![PhpStormDataSource]({{site.baseurl}}/assets/TD2/PhpStormDataSource.png){: .blockcenter}

4. Si un lien **Download missing driver files** apparaît en bas de la fenêtre,
   cliquez dessus : PhpStorm télécharge le pilote JDBC de MariaDB.

5. Cliquez sur **Test Connection**. Vous devez obtenir une coche verte
   *Succeeded*. Sinon, vérifiez en priorité le port, le login et le mot de passe
   (essayez de vous connecter à phpMyAdmin avec les mêmes identifiants).

**Remarque :** La configuration de la source de données est enregistrée dans `.idea/dataSources.xml`, mais le mot de passe, lui, est stocké dans le
trousseau de mots de passe de votre système (selon l'option *Save* à côté du
champ *Password*). Il ne se retrouve donc pas dans vos fichiers versionnés par
Git.

**MariaDB ou MySQL ?** Le serveur de bases de données de l'IUT (`webinfo`) utilise
**MariaDB**, une version dérivée de **MySQL** (un *fork*) créée par les développeurs
d'origine de MySQL après son rachat par Oracle. Les deux systèmes restent très
largement compatibles (même syntaxe SQL, même protocole, même port 3306 par défaut) :
tout ce que vous lirez sur MySQL s'applique donc presque toujours à MariaDB.

### Parcourir et modifier les données

* Dans la fenêtre **Database**, dépliez la source de données jusqu'à
  *tables* : vous y retrouvez vos tables (par exemple `utilisateur`), leurs
  colonnes, clés et index.

  ![PhpStormDatabaseTree]({{site.baseurl}}/assets/TD2/PhpStormDatabaseTree.png){: .blockcenter}

* Double-cliquez sur une table pour afficher son contenu. Vous pouvez modifier
  une cellule, ajouter une ligne (**+**) ou en supprimer une (**−**). Les
  modifications ne sont envoyées à la base qu'après avoir cliqué sur **Submit**
  (flèche verte ou `Ctrl+Entrée`).

  ![PhpStormTable]({{site.baseurl}}/assets/TD2/PhpStormTable.png){: .blockcenter}

* Si vous modifiez la structure de la base depuis phpMyAdmin (ou depuis votre
  code), pensez à rafraîchir la vue avec le bouton **Refresh** (`Ctrl+F5`) pour
  que PhpStorm prenne en compte les changements.

### Exécuter des requêtes dans la console SQL

Clic droit sur la source de données → *New* → **Query Console** (ou
`Ctrl+Maj+F10`). Vous pouvez y écrire n'importe quelle requête SQL, avec
autocomplétion des noms de tables et de colonnes. Placez le curseur sur une
requête et appuyez sur `Ctrl+Entrée` pour l'exécuter ; le résultat s'affiche
dans un onglet en bas de la fenêtre.

```sql
SELECT * FROM utilisateur WHERE login = 'leblancj';
```

![PhpStormConsole]({{site.baseurl}}/assets/TD2/PhpStormConsole.png){: .blockcenter}

C'est l'endroit idéal pour mettre au point vos requêtes SQL avant de les
recopier dans votre code PHP (comme on le faisait jusqu'ici avec phpMyAdmin).

### Autocomplétion du SQL dans le code PHP

PhpStorm reconnaît automatiquement le SQL contenu dans une chaîne de caractères
PHP commençant par `SELECT`, `INSERT`, `UPDATE`, `DELETE`… Pour qu'il
comprenne la syntaxe de MariaDB et connaisse vos tables, deux réglages sont
nécessaires dans *File* → *Settings* → *Languages & Frameworks* :

1. **SQL Dialects** : choisissez `MariaDB` comme *Project SQL Dialect*.

2. **SQL Resolution Scopes** : choisissez votre source de données comme
   *Project mapping*.

Vous bénéficiez alors, directement dans vos fichiers PHP, de l'autocomplétion
des noms de tables et de colonnes, et PhpStorm souligne les tables ou colonnes
qui n'existent pas :

```php?start_inline=1
$sql = "SELECT * FROM utilisateur WHERE login = :loginTag";
$pdoStatement = ConnexionBaseDeDonnees::getPdo()->prepare($sql);
```

**Remarques :**

* Si une chaîne n'est pas reconnue comme du SQL (par exemple parce qu'elle est
  construite par concaténation), placez le curseur dans la chaîne, faites
  `Alt+Entrée` → *Inject language or reference* → `MariaDB`.
* `Alt+Entrée` dans une requête SQL permet aussi de l'exécuter directement sur
  la base (*Run query in console*), pratique pour vérifier rapidement une
  requête écrite dans le code.
