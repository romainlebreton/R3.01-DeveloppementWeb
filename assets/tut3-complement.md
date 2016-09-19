---
title:  TD3 &ndash; Compléments
subtitle: Requête préparée et injection SQL
layout: tutorial
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

Source : [https://openclassrooms.com/courses/requete-preparee-1](https://openclassrooms.com/courses/requete-preparee-1)

#### Syntaxe PDO

```php?start_inline=1
$pdo = new PDO("mysql:host=$host;dbname=$dbname",$login,$pass);
$sql = "SELECT * from voiture";
$rep = $pdo->query($sql);
$tab_obj = $rep->fetchAll(PDO::FETCH_OBJ);
```

La première ligne crée une connexion à la BDD. La deuxième écrit la requête
SQL. La 3ème exécute la requête SQL et met les réponses dans `$rep`. Mais `$rep`
est une représentation interne à PDO des réponses et n'est pas utilisable. La
ligne 4 sert justement à transformer la réponse en un format PHP plus pratique.

### Les requêtes préparées

#### Schémas d'une requête préparée

**Phase 1 :**

1. envoi de la requête à préparer
2. compilation de la requête
3. plan d'exécution par le serveur
4. stockage de la requête compilée en mémoire
5. retour d'un identifiant de requête au client

**Phase 2 :**

1. le client MySQL demande l'exécution de la requête avec l'identifiant
2. exécution
3. résultat du serveur au client

#### Syntaxe PDO

```php?start_inline=1
$pdo = new PDO("mysql:host=$host;dbname=$dbname",$login,$pass);
$sql = "SELECT * from voiture WHERE couleur=:c";
$req_prep = $pdo->prepare($sql);

$req_prep->bindParam(":c","bleu");
$req_prep->execute();

$req_prep->fetchAll(PDO::FETCH_OBJ);
```

La différence par rapport aux requête non préparées se situe dans les lignes 3
puis 5 & 6. La ligne 3 prépare la requête. Il ne reste plus qu'à lui donner ses
paramètres et l'exécuter, ce qui est fait en lignes 5 & 6.

### Avantages

Outre cet aspect purement technique, il existe deux autres raisons qui peuvent
justifier l'utilisation d'une requête préparée :

* limiter la bande passante utilisée entre le client MySQL et le serveur MySQL :
  dû au fait que l'échange d'informations est limité au strict minimum.
* éviter les injections SQL : cela concerne la sécurité et évite que les
  informations rentrées par un client (à travers un formulaire par exemple)
  soient interprétées.

## Exemple d'injection SQL

Source : [https://fr.wikipedia.org/wiki/Injection_SQL](https://fr.wikipedia.org/wiki/Injection_SQL)

On exécute la requête SQL suivante et on connecte l'utilisateur dès que la
requête renvoie au moins une réponse.

```sql
SELECT uid FROM Users WHERE name = '$nom' AND password = '$mot_de_passe';
```


**Attaque de la requête :**

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
quel mot de passe.

### Un cas concret

Pour éviter les radars, il y a des petits malins.

 <p style="text-align:center">
 ![Requête HTTP]({{site.baseurl}}/assets/injection-sql-radar.jpg)
 </p>
 
