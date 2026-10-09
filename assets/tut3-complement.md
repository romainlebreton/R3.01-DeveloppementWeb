---
title:  TD3 &ndash; Compléments
subtitle: Requête préparée
layout: tutorial
lang: fr
---

## Requêtes préparées

<!-- faire le lien avec les trois lignes importante du TD -->

### Les requêtes classiques

#### Schéma d'une requête normale :

1. envoi de la requête par le client MySQL vers le serveur MySQL
2. compilation de la requête
3. plan d'exécution par le serveur
4. exécution de la requête
5. résultat du serveur vers le client

#### Syntaxe PDO

```php?start_inline=1
$pdo = new PDO("mysql:host=$nomHote;port=$port;dbname=$nomBaseDeDonnees;charset=utf8mb4", $login, $motDePasse);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$sql = "SELECT * FROM trajet";
$pdoStatement = $pdo->query($sql);
$trajetFormatTableau = $pdoStatement->fetch();
```

Les deux premières lignes créent une connexion à la BDD (comme dans
`ConnexionBaseDeDonnees` au TD2). La troisième écrit la requête SQL. La quatrième
exécute la requête SQL et renvoie un objet `$pdoStatement` de la classe
`PDOStatement`. Cet objet est une représentation interne à PDO des réponses : on
ne peut pas lire directement les lignes de résultat dedans. La dernière ligne
sert justement à récupérer la ligne suivante du résultat dans un format PHP plus
pratique (un tableau).

**Remarque :** Au TD2, nous avons pourtant pu écrire
`foreach ($pdoStatement as $trajetFormatTableau)`. C'est possible car la classe
`PDOStatement` implémente l'interface
[`IteratorAggregate`](https://www.php.net/manual/fr/class.iteratoraggregate.php) :
elle fournit un *itérateur* que `foreach` utilise pour parcourir les résultats.
Concrètement, à chaque tour de boucle, `foreach` récupère la ligne suivante,
exactement comme un appel à `fetch()`.

### Les requêtes préparées

#### Schémas d'une requête préparée

**Phase 1 :**

1. envoi de la requête à préparer
2. compilation de la requête
3. plan d'exécution par le serveur
4. stockage de la requête compilée en mémoire
5. retour d'un identifiant de requête au client

**Phase 2 :**

1. le client MySQL demande l'exécution de la requête avec l'identifiant et les
   valeurs des paramètres
2. exécution
3. résultat du serveur au client

#### Syntaxe PDO

Au TD3, nous avons donné les valeurs des paramètres sous la forme d'un tableau
passé à `execute($values)`. Voici une autre façon de faire, qui associe les
valeurs une à une avec la méthode
[`bindValue()`](https://www.php.net/manual/fr/pdostatement.bindvalue.php) :

```php?start_inline=1
$sql = "SELECT * FROM trajet WHERE depart = :departTag AND prix <= :prixMaxTag";
$pdoStatement = $pdo->prepare($sql);

$pdoStatement->bindValue(":departTag", "Montpellier");
// Le 3e argument (optionnel) précise le type de la valeur
$pdoStatement->bindValue(":prixMaxTag", 20, PDO::PARAM_INT);
$pdoStatement->execute();

$trajetFormatTableau = $pdoStatement->fetch();
```

La différence par rapport aux requêtes non préparées se situe dans les lignes 2
puis 4 à 7. La ligne 2 prépare la requête. Il ne reste plus qu'à lui donner ses
paramètres et l'exécuter, ce qui est fait en lignes 4 à 7.

Il existe aussi la méthode
[`bindParam()`](https://www.php.net/manual/fr/pdostatement.bindparam.php), qui
associe au paramètre non pas une valeur mais une **variable** (passée par
référence). La valeur de la variable n'est lue qu'au moment de `execute()` :

```php?start_inline=1
$pdoStatement = $pdo->prepare("SELECT * FROM trajet WHERE depart = :departTag");
$depart = "Montpellier";
$pdoStatement->bindParam(":departTag", $depart);
$pdoStatement->execute(); // Trajets au départ de Montpellier

$depart = "Sète";
$pdoStatement->execute(); // Trajets au départ de Sète, sans refaire de bindParam
```

**Attention :** Comme `bindParam()` attend une variable, écrire
`bindParam(":departTag", "Montpellier")` provoque l'erreur fatale
`Argument #2 ($var) could not be passed by reference`.

### Avantages

Il existe deux raisons qui justifient l'utilisation d'une requête préparée :

* **éviter les injections SQL**. C'est la raison principale, qui concerne la
  sécurité. Les valeurs des paramètres sont transmises séparément de la requête
  SQL : les informations rentrées par un client (à travers un formulaire par
  exemple) ne sont donc jamais interprétées comme du code SQL.
* gagner en performance quand on exécute plusieurs fois la même requête avec des
  paramètres différents : la phase 1 (compilation, plan d'exécution) n'est faite
  qu'une seule fois, et seules les valeurs des paramètres sont envoyées à chaque
  exécution.

### Émulation des requêtes préparées par PDO

Par défaut, le pilote MySQL de PDO **émule** les requêtes préparées : `prepare()`
ne contacte pas le serveur MySQL. Au moment de `execute()`, PDO échappe lui-même
les valeurs des paramètres, les insère dans la requête SQL, puis envoie une
requête classique au serveur. Les deux phases décrites plus haut n'ont donc pas
lieu.

La protection contre les injections SQL reste assurée par l'échappement de PDO
(à condition d'avoir indiqué le bon encodage avec `charset=utf8mb4` lors de la
connexion). En revanche, le gain de performance disparaît.

Pour que les requêtes préparées se déroulent réellement en deux phases sur le
serveur MySQL, il faut désactiver l'émulation juste après la connexion :

```php?start_inline=1
$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
```

**Attention :** Sans émulation, un même tag (par exemple `:departTag`) ne peut
apparaître qu'une seule fois dans la requête SQL.

<!--
Récupérer l'auto incrément d'une table : PDO::lastInsertId() (déjà vu au TD3)

* lastInsertId() appelle LAST_INSERT_ID() de MySQL, qui est géré par connexion.
  Chaque requête HTTP a sa propre connexion PDO, donc pas de problème de
  concurrence : un INSERT simultané d'un autre client ne fausse pas l'id.
  Il faut juste l'appeler juste après l'INSERT, sur la même connexion, avant
  tout autre INSERT.
* Après un INSERT de plusieurs lignes, lastInsertId() renvoie l'id de la
  PREMIÈRE ligne insérée.
* Une transaction n'est pas nécessaire pour récupérer l'id. Elle sert à
  l'atomicité quand plusieurs écritures doivent réussir ou échouer ensemble
  (ex. insérer un trajet puis ses passagers avec l'id obtenu).
* INSERT ... OUTPUT INSERTED.id (SQL Server) n'existe pas en MySQL.
  INSERT ... RETURNING id existe en PostgreSQL et MariaDB >= 10.5, pas en MySQL.
-->
