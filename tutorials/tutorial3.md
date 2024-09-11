---
title: TD3 &ndash; Requêtes préparées et association de classes
subtitle: SQL JOIN
layout: tutorial
lang: fr
---

<!-- Afficher après la requête préparée la requête qui a vraiment été faite pour
voir l'échappement des caractères spéciaux dans SQL
Voir aussi si on arrive à enregitrer des noms comme D'alembert-ignac dans la BDD
-->

<!-- Expliquer comment les requêtes préparées empêchent les injections SQL -->

<!-- Dire Pb = requête SQL avec remplacement de variables qui peuvent venir de l'util -->

<!-- Changer interclass, moteur BDD : onglet Opérations -->

<!--
http://defeo.lu/aws-2014/classes/class5
Échappement SQL
Fonctions d’échappement:

PHP : mysqli::real_escape_string,
PDO/Doctrine : PDO::quote, Doctrine::quote,
Échappement automatique : requêtes préparées.
-->

Ce TD3 est le prolongement du TD2 sur l'enregistrement des données dans une BDD
en utilisant la classe `PDO` de PHP. Nous poursuivons par le concept très
important de requêtes préparées. Puis nous coderons des associations entre
plusieurs tables de la BDD.

<!-- 
**Attention :** Il est nécessaire d'avoir fini
  [la section 2.1 du TD précédent](tutorial2.html#faire-une-requête-sql-sans-paramètres),
  qui vous faisait coder votre première requête `SELECT * FROM utilisateur`, pour
  attaquer ce TD. 
  -->

Nous vous invitons toujours à utiliser les différentes commandes
`status/log/add/commit` de `git` pour savoir où vous en êtes et enregistrer vos
modifications.

## Les injections SQL

### Exemple d'injection SQL

Imaginez un site Web qui, pour connecter un utilisateur, exécute la requête SQL
suivante et accepte la connexion dès que la requête renvoie au moins une
réponse.

```sql
SELECT uid FROM Users WHERE name = '$nom' AND password = '$motDePasse';
```

Un utilisateur malveillant pourrait taper les renseignements suivants :

* Utilisateur : `Dupont';--`
* Mot de passe : n'importe lequel

La requête devient :

```sql
SELECT uid FROM Users WHERE name = 'Dupont'; -- ' AND password = 'mdp';
```

ce qui est équivalent à

```sql
SELECT uid FROM Users WHERE name = 'Dupont';
```

L'attaquant peut alors se connecter sous l'utilisateur Dupont avec n'importe
quel mot de passe. Cette attaque du site Web s'appelle une **injection SQL**.

Vous aurez un exercice à la fin du TD pour simuler une injection SQL.

*Source :* [https://fr.wikipedia.org/wiki/Injection_SQL](https://fr.wikipedia.org/wiki/Injection_SQL)

## Les requêtes préparées

Imaginez que nous ayons codé une fonction `recupererUtilisateurParLogin($login)`
comme suit

```php?start_inline=1
function recupererUtilisateurParLogin(string $login) {
    $sql = "SELECT * from utilisateur WHERE login='$login'";
    $pdoStatement = ConnexionBaseDeDonnees::getPdo()->query($sql);
    return $pdoStatement->fetch();
}
```

Cette fonction marche, mais pose un gros problème de sécurité ; elle est
vulnérable aux **injections SQL** et un utilisateur pourrait faire comme dans
l'exemple précédent pour exécuter le code SQL qu'il souhaite.


Pour empêcher les **injections SQL**, nous allons utiliser une fonctionnalité
qui s'appelle les **requêtes préparées** et qui est fournie par PDO. Voici
comment les requêtes préparées fonctionnent :

1. On met un *tag* `:nomTag` en lieu de la valeur à remplacer dans la requête
SQL

1. On doit "préparer" la requête avec la commande `prepare($requeteSql)`

1. Puis utiliser un tableau pour associer des valeurs aux noms des tags des
   variables à remplacer :

   ```php?start_inline=1
   $values = array("nomTag" => "une valeur"); // Sans deux points devant nomTag
   ```

1. Et exécuter la requête préparée avec `execute($values)`

1. On peut alors récupérer les résultats comme précédemment (e.g. avec
   `fetch()`)

Voici toutes ces étapes regroupées dans une fonction :

```php?start_inline=1
function recupererUtilisateurParLogin(string $login) : Utilisateur {
    $sql = "SELECT * from utilisateur WHERE login = :loginTag";
    // Préparation de la requête
    $pdoStatement = ConnexionBaseDeDonnees::getPdo()->prepare($sql);

    $values = array(
        "loginTag" => $login,
        //nomdutag => valeur, ...
    );
    // On donne les valeurs et on exécute la requête
    $pdoStatement->execute($values);

    // On récupère les résultats comme précédemment
    // Note: fetch() renvoie false si pas d'utilisateur correspondant
    $utilisateurFormatTableau = $pdoStatement->fetch();

    return Utilisateur::construireDepuisTableauSQL($utilisateurFormatTableau);
}
```

**Remarque :** Il existe une autre solution pour associer une à une les valeurs
aux variables d'une requête préparée avec la fonction
[`bindParam()`](http://php.net/manual/fr/pdostatement.bindparam.php) de la classe
PDO (qui permet de donner le type de la valeur). Cependant, nous vous conseillons
d'utiliser systématiquement la syntaxe avec un tableau `execute($values)`.

<div class="exercise">
1. Copiez/collez dans un nouveau dossier TD3 les fichiers `ConfigurationBaseDeDonnees.php`,
   `ConnexionBaseDeDonnees.php`, `Utilisateur.php` et `lireUtilisateurs.php`.

1. Copiez la fonction précédente `recupererUtilisateurParLogin` dans la classe `Utilisateur`
   en la déclarant publique et statique.

2. Testez la fonction `recupererUtilisateurParLogin` dans un nouveau fichier `testRequetePrepare.php`.

   **Remarque :** Vous aurez sans doute une erreur `Class "ConnexionBaseDeDonnees" not found`.
   Où inclure `ConnexionBaseDeDonnees.php` : dans `Utilisateur.php` ou dans `creerUtilisateur.php` ?  
   Règle simple : chaque fichier doit inclure les classes dont il a besoin.
   Comme `Utilisateur.php` a besoin de la classe `ConnexionBaseDeDonnees` (à cause de l'instruction `ConnexionBaseDeDonnees::getPdo()`),
   c'est au début de `Utilisateur.php` qu'il faut faire `require_once "ConnexionBaseDeDonnees.php";`.
   
3. On souhaite que `recupererUtilisateurParLogin` renvoie `null` s'il n'existe pas
   d'utilisateur de login `$login`. Mettez à jour le code
   et la déclaration de type. Testez votre code.

</div>

**Désormais, toutes les requêtes SQL doivent être codées en utilisant des
requêtes préparées**, sauf éventuellement des requêtes SQL sans variable comme
`SELECT * FROM utilisateur`.

<div class="exercise">

2. Créez une fonction `public function ajouter() : void` dans la classe `Utilisateur` qui insère l'utilisateur
courant (`$this`) dans la BDD. On vous rappelle la syntaxe SQL d'une insertion :

   ```sql
   INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)
   ```

   **Attention :** La requête `INSERT INTO` ne renvoie pas de résultats ; il ne
     faut donc pas faire de `fetch()` sous peine d'avoir une erreur
     `SQLSTATE[HY000]: General error`.

3. Testez cette fonction dans `testRequetePrepare.php` en créant un objet de classe
   `Utilisateur` et en l'enregistrant.
   
**Remarque :** Le nom de la fonction `ajouter()` peut prêter à confusion. En effet, lorsqu'on voit une fonction `ajouter()`
 dans une classe `Utilisateur`, on ne s'attend pas forcément à ce qu'il y ait un enregistrement en BD.
Pour le moment nous allons garder le nom de cette méthode tel quel, car dans quelques semaines le code de celle-ci sera migré ailleurs (dans une classe de persistance)
et le nom `ajouter()` prendra tout son sens.
</div>

<div class="exercise">

Branchons maintenant notre enregistrement d'utilisateur dans la BDD au formulaire
de création d'utilisateur du TD1 :

2. Copiez dans le dossier TD3 les fichiers `creerUtilisateur.php` et
   `formulaireCreationUtilisateur.html` du TD1.

3. Modifiez la page `creerUtilisateur.php` de sorte qu'elle sauvegarde
   l'objet `Utilisateur` reçu (en GET ou POST, au choix).

4. Testez l'insertion grâce au formulaire `formulaireCreationUtilisateur.html`.

5. Vérifiez dans PhpMyAdmin que les utilisateurs sont bien sauvegardés.

6. Essayez d'ajouter un utilisateur dont un champ contient un guillemet simple
   `'`, par exemple un nom `"D'Artagnan"`. Est-ce qu'elle a bien été
   sauvegardée ? Si ce n'est pas le cas, c'est sûrement que vous n'avez pas
   utilisé les requêtes préparées.


<!--
TODO:  https://phpdelusions.net/pdo#errors
Reporting PDO errors
TL;DR:
Despite what all other tutorials say, you don't need a try..catch operator to report PDO errors. Catch an exception only if you have a handling scenario other than just reporting it. Otherwise just let it bubble up to a site-wide handler (note that you don't have to write one, there is a basic built-in handler in PHP, which is quite good).

The only exception (pun not intended) is the creation of the PDO instance, which in case of error might reveal the connection credentials (that would be the part of the stack trace).
-->

<!-- **N'oubliez pas** de protéger tout votre code contenant du PDO
  (`recupererUtilisateurs`, ...)  avec des try - catch comme dans `ConnexionBaseDeDonnees`. En effet,
  chaque ligne de code liée à PDO est susceptible de lancer une exception,
  qu'il nous faut capturer et traiter (rôle du `catch`). -->

</div>

## Utilisateurs et trajets

Vous avez couvert dans le cours *R2.01 -- Développement orienté objets*
les diagrammes de classes. Ce type de diagramme est utile pour
penser la base de donnée d'une application Web. Voici le nôtre :

<img alt="Diagramme entité association"
src="https://www.plantuml.com/plantuml/png/JOv1IyGm48Nl-HL3Zy92zvhJ2Y9u4rn_m3GPocWoASb4HF6_crIxv50wx-MzcUzI5BFM64nvPzamOmH9dWfjS9xdmNK1IxbNpRnKfIUNv8M_26PZzXTuLGvSKAbc-3Od26bbiL1QGTQc9SL1RPcwyQz_ZYNNZ6-aUvyzM63HDdfg20f37NFc3wBHygXTFxJVbIFjD_ZpjaEIFDROuImiAOL-SqIUxgPJ-mu22rlZmPNocBBsZnkcyvYsLfRdW8vAwxaalhgUDXTgOmo_" style="margin-left:auto;margin-right:auto;display:block;">

<!-- Source code:
https://www.plantuml.com/plantuml/uml/JOv1IyGm48Nl-HL3Zy92zvhJ2Y9u4rn_m3GPocWoASb4HF6_crIxv50wx-MzcUzI5BFM64nvPzamOmH9dWfjS9xdmNK1IxbNpRnKfIUNv8M_26PZzXTuLGvSKAbc-3Od26bbiL1QGTQc9SL1RPcwyQz_ZYNNZ6-aUvyzM63HDdfg20f37NFc3wBHygXTFxJVbIFjD_ZpjaEIFDROuImiAOL-SqIUxgPJ-mu22rlZmPNocBBsZnkcyvYsLfRdW8vAwxaalhgUDXTgOmo_
 -->

**Question :** Comment implémenteriez-vous l'association *conducteur* entre
utilisateurs et trajets dans la BDD en tenant compte de sa multiplicité ?

**Notre solution (surlignez le texte caché à droite) :**
 <span style="color:#FCFCFC">
Comme il n'y a qu'un conducteur par trajet, nous allons rajouter un champ
*conducteurLogin* à la table *trajet*.
</span>


### Création des tables

<div class="exercise">
La table `utilisateur` avec quelques utilisateurs a déjà été créée dans votre PhpMyAdmin. Créez la table `trajet` comme suit :

1. Créez une table `trajet` avec les champs suivants :
   * `id` : INT, clé primaire, qui s'auto-incrémente (voir en dessous)
   * `depart` : VARCHAR 64
   * `arrivee` : VARCHAR 64
   * `date` : DATE
   * `prix` : INT
   * `conducteurLogin` : VARCHAR 64
   * `nonFumeur` : BOOLEAN

   **Note :** On souhaite que le champ primaire `id` s'incrémente à chaque nouvelle
   insertion dans la table. Pour ce faire, cochez la case `A_I` (auto-increment) pour le champ `id`.

   **Note :** Observez qu'à l'enregistrement de votre table dans PhpMyAdmin le type BOOLEAN est remplacé
   par `tinyint`, où `0` correspond à` "faux" et `1` correspond à "vrai".

   **Important :** Avez-vous bien pensé à `InnoDB` et `utf8_general_ci` comme précédemment ?

3. Insérez quelques trajets en prenant soin de ne pas remplir la case `id` (pour
   que l'auto-incrément marche) et en mettant dans `conducteurLogin` un login
   d'utilisateur valide (pour éviter des problèmes par la suite).

</div>

### Lecture des tables

Au niveau du PHP, nous vous fournissons la classe de base `Trajet.php`.
Elle est assez semblable à la classe `Utilisateur.php` que vous avez déjà codée, à quelques détails près : 

1. l'attribut `$date` est stocké en tant qu'objet de la classe PHP `DateTime` ;
2. l'attribut `$id` peut être `null` pour indiquer que l'on ne connait pas encore l'identifiant d'un trajet ;
3. l'attribut `$conducteur` est stocké en tant qu'objet de la classe PHP `Utilisateur` ;


<div class="exercise">

1. Enregistrez la classe suivante :
<!-- [`Utilisateur.php`]({{site.baseurl}}/assets/TD3/Utilisateur.php) et -->
[`Trajet.php`]({{site.baseurl}}/assets/TD3/Trajet.php).

1. En vous inspirant de `lireUtilisateurs.php`, créez `lireTrajets.php` qui liste les
   trajets. Vous allez devoir modifier la fonction
   `Trajet::construireDepuisTableauSQL` car

   * la date renvoyée par MySQL est un `string`, alors que `Trajet` attend un
     `DateTime`. Pour transformer une date `string` en `DateTime`, utilisez le
     constructeur `new DateTime($dateString)`.
   * MySQL ne renvoie que le login du conducteur tandis que `Trajet` attend un
     `Utilisateur`. Utilisez la méthode `Utilisateur::recupererUtilisateurParLogin`.
   * MySQL renvoie le booléen `nonFumeur` comme un entier `0` ou `1`. Par chance,
     PHP converti automatiquement les entiers en booléen donc il n'y a rien à
     faire.

</div>


### Contrainte sur le conducteur

On souhaite que le champ `trajet.conducteurLogin` corresponde à tout moment au
login `utilisateur.login` d'un conducteur existant. Vous souvenez-vous quelle
est la fonctionnalité des bases de données qui permet ceci ?

**Réponse (surlignez le texte caché à droite) :** <span style="color:#FCFCFC">Il faut utiliser des clés
  étrangères.</span>

<div class="exercise">

Voici les étapes pour faire ce lien :

1. À l'aide de l'interface de PhpMyAdmin, faites de `trajet.conducteurLogin` un
   **index**.

   **Aide :** Dans l'onglet `Structure` de la table `trajet`, cliquez sur l'icône de
   l'action `index` en face du champ `conducteurLogin`.


   **Plus de détails :** Dire que le champ `conducteurLogin` est un **index** revient à
   dire à MySql que l'on veut trouver rapidement les lignes qui ont un `conducteurLogin`
   donné. Du coup, MySql va construire une structure de donnée pour permettre cette
   recherche rapide. Une **clé étrangère** est nécessairement un **index**, car on
   a besoin de ce genre de recherches pour tester rapidement la contrainte de clé
   étrangère.

2. Ajoutez la contrainte de **clé étrangère** entre `trajet.conducteurLogin` et
   `utilisateur.login`. Pour ceci, allez dans l'onglet `Structure` de la table
   `trajet` et cliquez sur `Vue relationnelle` pour accéder à la
   gestion des clés étrangères.

   Nous allons utiliser le comportement `ON DELETE CASCADE` pour qu'une
   association soit supprimée si la clé étrangère est supprimée, et le
   comportement `ON UPDATE CASCADE` pour qu'une association soit mise à jour si
   la clé étrangère est mise à jour.

   **Attention :** Pour supporter les clés étrangères, il faut que le moteur de
   stockage de toutes vos tables impliqués soit `InnoDB`. Vous pouvez choisir ce
   paramètre à la création de la table ou le changer après coup dans l'onglet
   `Opérations`.

</div>

<!--
Plutôt que le texte: "Reprendre les classes du TP précédent sur le covoiturage et y ajouter l'utilisation d'une base de données. Chaque utilisateur sera identifié par un id, de même pour chaque trajet."

-> Il faudrait donner soit le diagramme de classe, soit mieux entités/associations de trajet (annonce), voiture et utilisateur.
-->

### Création d'un trajet

La création d'un trajet à partir d'un formulaire va nous permettre d'apprendre à
gérer le fait qu'un formulaire HTML, une classe PHP et une base de donnée ne
stockent pas certaines données de la même façon.

<div class="exercise">

1. Nous vous fournissons le formulaire de création de trajets. Enregistrez [`formulaireCreationTrajet.html`]({{site.baseurl}}/assets/TD3/formulaireCreationTrajet.html).  
   **Notez** que la date est un `<input type="date">`, et que le booléen `nonFumeur` est un `<input type="checkbox">`.
2. En vous inspirant de `creerUtilisateur.php`, créez 
   `creerTrajet.php` qui traite les données du formulaire précédent. Les 2 étapes clés sont la création d'un objet `Trajet` et l'appel à la méthode `ajouter()` de `Trajet`. Voici comment faire : 

   1. À la création de l'objet `Trajet`
      * mettez `id` à `null` pour indiquer que vous ne connaissez pas son identifiant ;
      * le formulaire renvoie une date sous forme de `string` alors que la date du
        trajet doit être un objet `DateTime`. Appliquez la transformation de l'exercice sur la lecture des tables.
      * le formulaire ne renvoie que le login du conducteur tandis que `Trajet` attend un
        `Utilisateur`. Appliquez la transformation de l'exercice sur la lecture des tables.
      * le formulaire indique le booléen `nonFumeur` en remplissant, ou pas, la
        case `$_GET["nonFumeur"]`. Utilisez donc `isset($_GET["nonFumeur"])` pour
        lire le booléen envoyé par le formulaire.
   
   2. Créez la méthode dynamique `ajouter()` de `Trajet`.  
      La requête `INSERT` doit remplir tous les champs sauf `id`, qui sera
      rempli automatiquement par MySQL.  
      Pour le tableau de valeurs donné à la requête préparée
      * MySQL attend une date `string`. Si `$date` est un `DateTime`, alors
        `$date->format("Y-m-d")` permet de la convertir en `string` ;
      * MySQL attend seulement le login du conducteur ;
      * MySQL stocke le booléen `nonFumeur` comme un entier. Il faut ainsi
        donner à MySQL `1` si le trajet est non-fumeur, ou `0` sinon.
3. Testez l'enchaînement du formulaire de création et de
   `creerTrajet.php`. Vérifiez dans votre base de données que le trajet est
   bien créé.

</div>

## L'association `passager` entre utilisateurs et trajets

### Dans la base de donnée

**Question :** Comment implémenteriez-vous l'association *passager* entre
utilisateurs et trajets dans la BDD en tenant compte de ses multiplicités ?

<img alt="Diagramme entité association"
src="https://www.plantuml.com/plantuml/png/JOv1IyGm48Nl-HL3Zy92zvhJ2Y9u4rn_m3GPocWoASb4HF6_crIxv50wx-MzcUzI5BFM64nvPzamOmH9dWfjS9xdmNK1IxbNpRnKfIUNv8M_26PZzXTuLGvSKAbc-3Od26bbiL1QGTQc9SL1RPcwyQz_ZYNNZ6-aUvyzM63HDdfg20f37NFc3wBHygXTFxJVbIFjD_ZpjaEIFDROuImiAOL-SqIUxgPJ-mu22rlZmPNocBBsZnkcyvYsLfRdW8vAwxaalhgUDXTgOmo_" style="margin-left:auto;margin-right:auto;display:block;">

**Réponse (surlignez le texte caché à droite) :** <span style="color:#FCFCFC">Comme la relation *passager* est non
bornée (on ne limite pas le nombre d'utilisateurs d'un trajet et inversement), on
utilise une table de jointure.</span>


Nous choisissons donc de créer une table `passager` qui contiendra deux champs :

* l'identifiant INT `trajetId` d'un trajet et
* l'identifiant VARCHAR(64) `passagerLogin` d'un utilisateur.

Pour inscrire un utilisateur à un trajet, il suffit d'écrire la ligne
correspondante dans la table `passager` avec leur `passagerLogin` et leur
`trajetId`.

**Question :** Quelle est la clé primaire de la table `passager` ?

**Réponse (surlignez à droite) :** <span style="color:#FCFCFC">Le couple
  (*trajetId*, *passagerLogin*). Si vous choisissez *trajetId* seul comme clé
  primaire, un trajet aura au plus un passager, et si vous choisissez
  *passagerLogin*, chaque utilisateur ne pourra être passager que sur un
  unique trajet.</span>

<div class="exercise">
1. Créer la table `passager` en utilisant l'interface de PhpMyAdmin.

   **Important :** Avez-vous bien pensé à `InnoDB` et `utf8_general_ci` comme précédemment ?

1. Assurez-vous que vous avez bien le bon couple en tant que clé primaire. Cela
   se voit dans la section `Index` de l'onglet `Structure`.

2. Rajoutez la contrainte de **clé étrangère** entre `passager.trajetId` et
`trajet.id`, puis entre `passager.passagerLogin` et
`utilisateur.login`. Utiliser encore les comportements `ON DELETE CASCADE` et
`ON UPDATE CASCADE` pour qu'une association soit mise à jour si la clé étrangère
est mise à jour.

3. À l'aide de l'interface de PhpMyAdmin, insérer quelques associations pour que
la table `passager` ne soit pas vide.

4. Vous allez maintenant vous assurer de la bonne gestion des clés étrangères en
testant le comportement `ON DELETE CASCADE`. Pour cela :
   1. créez un trajet correspondant à un certain conducteur,
   1. puis inscrivez des passagers pour ce trajet
   1. supprimez ensuite le conducteur en question de la table `utilisateur` et
      vérifiez que les lignes de la table `passager` précédemment insérées ont
      bien été supprimées elles aussi.

</div>

### Au niveau du PHP

Nous allons maintenant pouvoir compléter le code PHP de notre site pour gérer
l'association. Commençons par rajouter des fonctions à nos classes `Utilisateur`
et `Trajet`.

Avant toute chose, vous souvenez-vous comment faire une jointure en SQL ? Si
vous n'êtes pas tout à fait au point sur les différents `JOIN` de SQL, vous
pouvez vous rafraîchir la mémoire en lisant
[https://www.w3schools.com/sql/sql_join.asp](https://www.w3schools.com/sql/sql_join.asp).


<div class="exercise">

1. Codez une fonction `recupererPassagers()` dans `Trajet.php` qui retournera un
   tableau d'`Utilisateur` correspondant aux passagers du trajet courant en
   faisant la requête adéquate. Voici la signature de la fonction.

   <!-- Si on avait codé getTrajetById avant, on pourrait coder $t->recupererPassagers() ? -->

   ```php
    /**
     * @return Utilisateur[]
     */
    private function recupererPassagers() : array {
      // À coder
    }
    ```   

   **Indices :**

   * Utiliser une requête à base d'`INNER JOIN`. Une bonne stratégie
   pour développer la bonne requête est d'essayer des requêtes dans l'onglet SQL de
   PhpMyAdmin jusqu'à tenir la bonne.
   * Inspirez-vous de `Utilisateur::recupererUtilisateurs` pour la création d'objets
     `Utilisateurs` depuis une réponse SQL.
   * Comme vous demandez à `fetch` de créer des objets de la classe
     `Utilisateur`, il faut inclure le fichier de classe. De manière générale,
     la bonne pratique est que chaque fichier PHP inclus les fichiers dont il a
     besoin. C'est plus sûr que de compter sur les autres fichiers. Et le `once`
     du `require_once` vous met à l'abri d'une inclusion multiple du même
     fichier de déclaration de classe.
   * **Avez-vous** bien utilisé une requête préparée dans `recupererPassagers` ?

2. Nous allons stocker la liste des passagers comme un attribut de la classe
   `Trajet`. 
   1.  Rajoutez l'attribut
      ```php
      /**
      * @var Utilisateur[]
      */
      private array $passagers;
      ```
   2. Mettez à jour le constructeur pour qu'il gère cet attribut avec la valeur par défaut `[]`.
   3. Générez à l'aide de PHPStorm les accesseurs `getPassagers` et
      `setPassagers`. 
   3. Modifiez la fonction `construireDepuisTableauSQL` pour qu'elle instancie
      le nouveau `$trajet` avec une liste des passagers vide, qu'elle récupère
      les passagers de ce trajet, et qu'elle stocke ces passagers dans
      l'attribut. 

3. Testez votre code en modifiant `lireTrajets.php` pour qu'il affiche pour
   chaque trajet sa liste des passagers.

</div>

**Remarque :** L'annotation avant la fonction `recupererPassagers`
```php
 /**
  * @return Utilisateur[]
  */
```
est de la documentation PHP ([PHPDoc](https://www.phpdoc.org/)). Elle permet
d'indiquer à l'IDE que la fonction renverra un tableau d'`Utilisateur`. PHPDoc
est dans ce cas plus précis que le type de retour de la fonction : `array`. Idem pour 
```php
/**
* @var Utilisateur[]
*/
```
qui indique que la variable suivante sera un tableau d'`Utilisateur`.

## Créez une injection SQL

Nous vous proposons de créer un exemple
d'injection SQL. 

<div class="exercise">
Mettons en place notre attaque SQL :

1. Pour ne pas supprimer une table importante, créons une table `utilisateur2` qui ne craint rien :
    * allez dans PHPMyAdmin et cliquez sur votre base de donnée (celle dont le
     nom est votre login à l'IUT)
   * Dans l'onglet SQL `Importer`, donnez le fichier
     [`utilisateur2.sql`]({{site.baseurl}}/assets/TD3/utilisateur2.sql) qui créera une table
     `utilisateur2` avec quelques utilisateurs.
1. Nous vous fournissons le fichier PHP que nous allons attaquer :
[`formulaireLectureUtilisateur.php`]({{site.baseurl}}/assets/TD3/formulaireLectureUtilisateur.php)  
Ce fichier contient un formulaire qui affiche les informations d'un utilisateur
étant donné son login.  
**Testez** ce fichier en donnant un login existant.  
**Lisez** le code pour être sûr de bien comprendre le fonctionnement de cette
  page (et demandez au professeur si vous ne comprenez pas tout !).

1. **Trouvez** ce qu'il faut taper dans le formulaire pour que
   `recupererUtilisateurParLogin` vide la table `utilisateur2` (SQL Truncate).
     
   **Aide :**  Le point clé de ce fichier est que la fonction
   `recupererUtilisateurParLogin` a été codée sans requête préparée et est
   vulnérable aux injections SQL.

   ```php?start_inline=1
   function recupererUtilisateurParLogin(string $login) : ?Utilisateur {
      $sql = "SELECT * from utilisateur2 WHERE login='$login'";
      echo "<p>J'effectue la requête <pre>$sql</pre></p>";
      $pdoStatement = ConnexionBaseDeDonnees::getPDO()->query($sql);
      $utilisateurTableau = $pdoStatement->fetch();

      if ($utilisateurTableau !== false) {
            return Utilisateur::construireDepuisTableauSQL($utilisateurTableau);
      }
      return null;
   }
   ```
</div>
   

<!--
'; TRUNCATE TABLE utilisateur2; --
-->

### Deux cas concrets

Pour éviter les radars, il y a des petits malins.

 <p style="text-align:center">
 ![Injection SQL Radar]({{site.baseurl}}/assets/injection-sql-radar.jpg)
 </p>

Ou un petit XKCD 

 <p style="text-align:center">
 ![Injection SQL Ecole]({{site.baseurl}}/assets/exploits_of_a_mom.png)
 </p>

## Et si le temps le permet...

Si vous êtes bien avancés sur les TDs, voici une liste d'idées pour compléter
notre site. Certaines de ces idées pourraient être particulièrement utiles pour
la SAE3A.

### Chargement paresseux des trajets d'un utilisateur en tant que passager

De la même manière que dans l'exercice sur `recupererPassagers()`, utilisons une
jointure SQL pour trouver tous les trajets d'un utilisateur.

La nouveauté de cet exercice est que nous ne récupèrerons pas les passagers d'un
utilisateur systématiquement lors d'un appel à `construireDepuisTableauSQL`
(chargement hâtif). Nous récupèrerons les passagers uniquement si
l'accesseur `getTrajetsCommePassager` est appelé. De plus, nous stockerons les
passagers dans un attribut afin de ne pas les récupérer plusieurs fois. Du coup,
la liste des passagers sera initialisée à `null` pour indiquer que la liste n'a
pas encore été chargée.

<div class="exercise">

1. Créez une fonction `recupererTrajetsCommePassager()` dans `Utilisateur.php`
   qui retournera les trajets auxquels l'utilisateur courant est inscrit en tant
   que passager. Voici la signature de la fonction :

   ```php
   /**
    * @return Trajet[]
    */
   private function recupererTrajetsCommePassager() : array
   ```

2. Nous allons stocker la liste des trajets comme un attribut de la classe
   `Utilisateur`. 
   1.  Rajoutez l'attribut
      ```php
      /**
      * @var Trajet[]|null
      */
      private ?array $trajetsCommePassager;
      ```
   2. Mettez à jour le constructeur pour qu'il initialise cet attribut à `null`.
   3. Générez à l'aide de PHPStorm les accesseurs `getTrajetsCommePassager` et
      `setTrajetsCommeConducteur`.  
   4. Modifiez le code de `getTrajetsCommePassager` pour que, si
      `$trajetsCommePassager` est `null`, alors on l'initialise à l'aide de `recupererTrajetsCommePassager`. 

3. Testez votre code en modifiant `lireUtilisateurs.php` pour qu'il affiche pour
   chaque utilisateur la liste de ses trajets en tant que passager.
</div>

**Attention :** 
* Si on code la liste des trajets d'un utilisateur en chargement hâtif, on
  risque de causer une boucle infinie. En effet, le chargement d'un trajet, va
  impliquer le chargement de tous ses passagers (chargement hâtif), qui va
  charger les trajets (chargement hâtif) de tous ces passagers, qui va charger
  les passagers de tous les trajets de tous les passagers...
* Deux solutions existent : 
  * Éviter que les associations en chargement hâtif forment une boucle entre
    plusieurs classes comme précédemment. Pour cela, codez assez d'associations
    en chargement paresseux pour éviter les boucles. Ou ne codez pas que les
    associations dont vous aurez besoin dans l'une de vos pages Web.
  * (hors programme) Mettre en place un cache au niveau de l'accès à la base de
    données. Cette solution est utilisée dans les solutions professionnelles de
    gestion des bases de données appelées
    [*ORM*](https://fr.wikipedia.org/wiki/Mapping_objet-relationnel) (*cf.*
    Hibernate au semestre 3, ou Doctrine au semestre 5). Cette stratégie est par
    exemple expliqué dans la [documentation de
    Doctrine](https://www.doctrine-project.org/projects/doctrine-orm/en/3.2/reference/unitofwork.html#how-doctrine-keeps-track-of-objects).

### Désinscrire un utilisateur d'un trajet et inversement

Rajoutons une fonctionnalité : dans une future vue qui listera les
trajets d'un utilisateur, nous voudrions avoir un lien 'Désinscrire' qui
enlèvera l'utilisateur courant du trajet sélectionné.

<div class="exercise">

1. Créer une `public function supprimerPassager(string $passagerLogin): bool` dans `Trajet.php`.
   Cette fonction devra désinscrire l'utilisateur `passagerLogin` du trajet courant.

2. Créez une page `supprimerPassager.php` qui reçoit un `login` d'utilisateur et
   un `trajet_id` via le *query string* de l'URL, et qui désinscrit cet
   utilisateur comme passager de ce trajet.

   **Remarque :** Vous aurez besoin de créer un `$trajet` pour pouvoir appeler la méthode `$trajet->supprimerPassager()`. Deux possibilités : 
   * Soit vous rajoutez une méthode `Trajet::recupererTrajetParId` similaire à `Utilisateur::recupererUtilisateurParLogin`.
   * Soit vous créez un `$trajet` avec des fausses données, sauf l'`id` qui est
     correct. Une manière propre de procéder est de mettre les autres attributs
     à `null`, ce qui implique de changer les types pour autoriser `null`.


3. Rajoutez à `lireTrajets.php` de liens `<a>` de désinscription pour chaque
   passager de chaque trajet qui renvoient sur `supprimerPassager.php` en transmettant via le *query string* de l'URL les bons `login` et `trajet_id`. 

4. Testez la désinscription.

</div>

### Gestion des erreurs

Traitons plus systématiquement tous les cas particuliers. Pour l'instant, 
les méthodes suivantes sont correctement codées :
* `recupererUtilisateurs()` de `Utilisateur.php` n'a pas de cas particulier,
* `recupererUtilisateurParLogin()` de `Utilisateur.php` gère un login inconnu en renvoyant l'utilisateur `null`.

Par contre, vous allez améliorer les méthodes suivantes :
* `ajouter()` de `Utilisateur.php` ne traite pas :
  * le cas d'un utilisateur existant déjà en base de donnée (`SQLSTATE[23000]: Integrity constraint violation`)
  * le cas d'un problème de données, par exemple : chaîne de caractères trop longue (`SQLSTATE[22001]: String data, right truncation`)
* `supprimerPassager()` de `Trajet.php` ne traite pas le cas d'un passage inexistant.

<div class="exercise">

1. Pour la méthode `ajouter()`, les cas particuliers génèrent une exception de la classe `PDOException`.
   Modifiez la déclaration de type de la méthode pour qu'elle retourne un booléen 
   pour indiquer si la sauvegarde s'est bien passée. Modifiez la méthode pour intercepter les `PDOException`
   avec un `try/catch` et retourner `false` en cas de problème.

2. Pour la méthode `supprimerPassager()`, utilisez la méthode
   [`rowCount()`](https://www.php.net/manual/fr/pdostatement.rowcount.php) de la
   classe `PDOStatement` pour vérifier que la requête de suppression a bien
   supprimé une ligne de la BDD. Modifiez la déclaration de type de la méthode
   pour qu'elle retourne un booléen pour indiquer si la suppression s'est bien
   passée.

3. Lors de l'insertion dans la base de données avec `ajouter()` de `Trajet`, il est possible
   de récupérer l'identifiant auto-incrémenté généré par la base de données et
   le renseigner dans l'objet courant. Pour ceci, utilisez
   `ConnexionBaseDeDonnees::getPdo()->lastInsertId()` après l'exécution de
   `$pdoStatement->execute(...)`.

</div>

Documentation : 
* [SQLSTATE error codes](https://docs.oracle.com/cd/E15817_01/appdev.111/b31228/appd.htm)
  <!-- *SQLSTATE : 23000 : 23 Integrity constraint violation -->
* [MySql error reference](https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html)
   <!-- Error number: 1062; Symbol: ER_DUP_ENTRY; SQLSTATE: 23000
   Message: Duplicate entry '%s' for key %d -->


### Quelques idées complémentaires

Voici une liste d'idées pour compléter notre site :

1. Notre liste des trajets d'un utilisateur est incomplète : il manque les
   trajets dont il est conducteur (et non passager). La page qui liste les
   trajets d'un utilisateur pourrait donner les deux listes comme conducteur et
   comme passager.
2. Pour tester votre compréhension de la transmission de données entre MySQL,
   PHP et un formulaire, créer un formulaire `mettreAJourTrajet.php` qui lira
   l'identifiant du trajet depuis la *query string*, chargera le trajet depuis
   MySQL puis préremplira un formulaire de modification du trajet avec les
   valeurs du trajet actuel. Ce formulaire est proche de celui de création, à
   ceci près qu'il rajoute des valeurs par défaut dans les `<input>`.  
   Créez ensuite un script de traitement du formulaire de mise à jour (proche du
   script de création) et vérifiez dans la base de donnée que la modification a
   bien marchée.
<!-- 1. Vous pouvez aussi éventuellement mettre en place des `trigger` dans votre SQL
   pour gérer le nombre de passagers par véhicule ... -->
