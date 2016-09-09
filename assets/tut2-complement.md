---
title:  TD2 &ndash; Compléments
subtitle: Requête préparée, injection SQL et require
layout: tutorial
---

## Créer un projet avec NetBeans

### Si vous commencez un projet de zéro

#### Configuration courte

1. Allez dans le menu Fichier > Nouveau Projet > PHP > PHP Application

2. Changez le dossier (.../public_html/PHP/TD2 par exemple) et le nom du projet
   (TD2 par exemple).

3. Appuyez sur Finish

#### Configuration complète

1. Allez dans le menu Fichier > Nouveau Projet > PHP > PHP Application

2. Changez le dossier et le nom du projet puis choisissez la version de PHP la plus
   élevée.

3. Appuyez sur Next

4. * Exécuter comme "Site Web local",

   * URL du projet : l'adresse de votre page Web sur `infolimon`, par exemple
   [http://infolimon/~votre_login/PHP/TD2/](http://infolimon/~votre_login/PHP/TD2/)

5. Appuyez sur Finish

### Si vous reprenez un projet en cours

Allez dans le menu Fichier > Nouveau Projet > PHP > PHP Application **with
existing sources**


### Fonctionnalités utiles

* Indentation automatique : Source > Format ou `Alt+Maj+F`
* Ouvrir la page Web : Éxécuter projet ou (`F6`).  
  Cela ouvre dans le navigateur l'URL donnée lors de la configuration complète.
* Activer/désactiver les commentaires : sélectionner une région de texte et
  taper `Ctrl+Shift+C`

## Les attributs et méthodes `static`

### Attributs statiques

Un attribut d'une classe est *statique* si il ne dépend pas des instances d'une
classe mais juste de la classe. Si on pense en terme de mémoire, on peut avoir
plusieurs instances différentes d'un même objet en mémoire, mais un attribut
statique ne sera présent qu'une seule fois en mémoire.

Comme un attribut `static` ne dépend que de la classe, on l'appelle avec la
syntaxe `Classe::$nom_attribut` en PHP. Par contraste, les attributs classiques
s'accèdent par la syntaxe `$instance->attribut`.

De la même manière que `$this` renvoie sur l'instance courante lors de la
déclaration d'une classe, `self` renvoie la classe courante (uniquement lors de
la déclaration d'une classe).

### Fonctions statiques

Une fonction non statique peut se comprendre comme une fonction qui reçoit un
argument `$this` en supplément des arguments déclarés. Du coup, une fonction
statique est juste une fonction dans laquelle on n'a pas accès à `$this`.

### Utilisation

Les attributs statiques sont utiles pour créer des attributs communs à une
classe. Par exemple, la constante `Math::Pi` en Java agit un peu comme une
variable globale à la classe `Math`.

<!-- vérifier la syntaxe de Math::Pi -->

Les attributs statiques servent aussi à coder des comportements de classe. Par
exemple, on peut attribuer un identifiant unique à chaque instance d'une classe
en stockant dans une variable statique le nombre d'instances.


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
 
