---
title:  TD2 &ndash; Compléments
subtitle: Requête préparée, injection SQL et require
layout: tutorial
---


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

## Tableau associatifs

Vous connaissez déjà les tableaux classiques, ceux qui sont indexés par
`0,1,2,...`. Les tableaux en PHP peuvent aussi s'indexer par des
chaînes de caractères.

Une syntaxe pratique pour créer un tableau est la suivante

~~~
$tab = array("texte" => 1, 3 => "blabla"); 
~~~
{:.php}

Deux particularités du PHP sont la syntaxe pour rajouter une valeur en fin de
tableau

~~~
$tab[] = $valeur
~~~
{:.php}

et l'existence des boucles
[`foreach`](http://php.net/manual/fr/control-structures.foreach.php).

## `echo`, les chaînes de caractères et l'imbrication de PHP dans le HTML

### Les chaînes de caractères

* Les chaînes de caractères avec *double quote* `"` peuvent contenir des
  variables(qui seront remplacées), des sautes de lignes, des caractères
  spéciaux (tabulation `\t`, saut de ligne `\n`). Les caractères protégés sont
  `"`, `$` et `\` qui doivent être échappés comme ceci `\"`, `\$` et `\\`;
   
   Exemple :

  ~~~
  $prenom="Helmut";
  echo "Bonjour $prenom,\n çà farte ?";
  ~~~
  {:.php}
   
  donne
   
  ~~~
  Bonjour Helmut,
  çà farte ?
  ~~~
  {:.text}

  **Attention :** Pour les tableaux, il faut rajouter des accolades autour du
   nom de variable `"{$tab[0]}"`.
   
* Les chaînes de caractères avec *simple quote* `'` sont conservées telles quelles
(pas de remplacement, de caractères spéciaux ...). Les caractères protégés sont
`'` et `\` qui doivent être échappés comme ceci `\` et `\\`;


### Le `echo` *here document*

Il existe un `echo` sur plusieurs ligne très pratique

~~~
echo <<< EOT
  Texte à afficher
  sur plusieurs lignes
  avec caractères spéciaux \t \n
  et remplacement de variables $prenom
  les caractères suivants passent : " ' $ / \ ;
EOT;
~~~
{:.php}

Cette syntaxe s'intitule le "here document" et permet d'afficher plusieurs
lignes avec les mêmes caractéristiques que les chaînes entre *double quote*.
Notez que la fin de la syntaxe doit apparaître sur une nouvelle ligne, avec
uniquement un point-virgule, et pas d'espace de plus !

### Short tag `echo`

`<?= $var_name ?>`  est équivalent à `<?php echo $var_name ?>`.

### Imbrication de PHP dans le HTML

Les deux fichiers suivants sont équivalents. En effet, ce qui est en dehors des
balises PHP est écrit tel quel dans la page Web générée.


~~~
<!DOCTYPE html>
<html>
    <head>
        <title> Mon premier php </title>
    </head>
    <body>
      <?php echo "Bonjour" ?>
    </body>
</html>
~~~
{:.html}

~~~
<?php
  echo "<!DOCTYPE html>";
  echo "<html>
      <head>
          <title> Mon premier php </title>
      </head>
      <body>";
  echo "Bonjour";
  echo "</body></html>";
?>
~~~
{:.php}


## Requêtes préparées

<!-- faire le lien avec les trois lignes importante du TD -->

### Les requêtes classiques

#### Schéma d'une requête normale :

1. envoi de la requête par le client vers le serveur
2. compilation de la requête
3. plan d'exécution par le serveur
4. exécution de la requête
5. résultat du serveur vers le client

Source : [https://openclassrooms.com/courses/requete-preparee-1](https://openclassrooms.com/courses/requete-preparee-1)

#### Syntaxe PDO

~~~
$pdo = new PDO("mysql:host=$host;dbname=$dbname",$login,$pass);
$sql = "SELECT * from voiture";
$rep = $pdo->query($sql);
$tab_obj = $rep->fetchAll(PDO::FETCH_OBJ);
~~~
{:.php}

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

1. le client demande l'exécution de la requête avec l'identifiant
2. exécution
3. résultat du serveur au client

#### Syntaxe PDO

~~~
$pdo = new PDO("mysql:host=$host;dbname=$dbname",$login,$pass);
$sql = "SELECT * from voiture WHERE couleur=:c";
$req_prep = $pdo->prepare($sql);

$req_prep->bindParam(":c","bleu");
$rep = $req_prep->execute();

$tab_obj = $rep->fetchAll(PDO::FETCH_OBJ);
~~~
{:.php}

La différence par rapport aux requête non préparées se situe dans les lignes 3
puis 5 & 6. La ligne 3 prépare la requête. Il ne reste plus qu'à lui donner ses
paramètres et l'exécuter, ce qui est fait en lignes 5 & 6.

### Avantages

Outre cet aspect purement technique, il existe deux autres raisons qui peuvent
justifier l'utilisation d'une requête préparée :

* limiter la bande passante utilisée entre le client et le serveur : dû au fait que l'échange d'informations est limité au strict minimum.
* éviter les injections SQL : cela concerne la sécurité et évite que les informations rentrées par un client (à travers un formulaire par exemple) soient interprétées.

## Exemple d'injection SQL

Source : [https://fr.wikipedia.org/wiki/Injection_SQL](https://fr.wikipedia.org/wiki/Injection_SQL)

On exécute la requête SQL suivante et on connecte l'utilisateur dès que la
requête renvoie au moins une réponse.

~~~
SELECT uid FROM Users WHERE name = '$nom' AND password = '$mot_de_passe';
~~~
{:.sql}


**Attaque de la requête :**

* Utilisateur : `Dupont';--`
* Mot de passe : n'importe lequel

La requête devient :

~~~
SELECT uid FROM Users WHERE name = 'Dupont'; -- ' AND password = 'mdp';
~~~
{:.sql}

ce qui est équivalent à

~~~
SELECT uid FROM Users WHERE name = 'Dupont';
~~~
{:.sql}

L'attaquant peut alors se connecter sous l'utilisateur Dupont avec n'importe
quel mot de passe.

### Un cas concret

Pour éviter les radars, il y a des petits malins.

 <p style="text-align:center">
 ![Requête HTTP]({{site.baseurl}}/assets/injection-sql-radar.jpg)
 </p>
 
## Require

* `require` : fait un copier-coller d'un fichier externe

* `require_once` : fait de même mais au plus une fois dans le fichier
  courant. Cela évite de définir plusieurs fois la même classe dans le même
  fichier à cause de plusieurs `require`.

La bonne pratique veut que vous mettiez dans chaque fichier les `require_once` de
toutes les classes que vous allez utiliser.

