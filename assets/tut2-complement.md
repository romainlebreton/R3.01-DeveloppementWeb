---
title:  TD2 &ndash; Compléments
subtitle: Requête préparée, injection SQL et require
layout: tutorial
---


## Attributs statiques

## Chaînes de caractères

## Tableau associatifs

## Note sur `echo`, les chaines de caractères et l'imbrication de PHP dans le HTML

### Les différents `echo`

Référence [sur php.net](http://php.net/manual/fr/function.echo.php).

Le `echo` permet d'écrire une chaîne de caractères dans la page Web que l'on génère dynamiquement 


echo "L'échappement de caractères se fait : \"comme ceci\".";

echo "Cet echo() se
répartit sur plusieurs lignes. Il affiche aussi les
nouvelles lignes";

On peut mettre des noms de variables dans les chaînes de caractères
Attention aux tableaux

echo "this is {$baz['value']} !"; // c'est foo !

echo <<< EOT
  Texte à afficher
  sur plusieurs lignes
  avec caractères spéciaux \t \n
EOT;

echo <<<END
Cette syntaxe s'intitule le "here document" et
permet d'afficher plusieurs lignes avec de
l'interpolation de variables. Notez que la fin de
la syntaxe doit apparaître sur une nouvelle ligne,
avec uniquement un point-virgule, et pas d'espace
de plus !
END;

<?= $var_name ?> équivalent de <?php echo $var_name ?>

### Imbrication de PHP dans le HTML

echo.php avec le contenu suivant

<!DOCTYPE html>
<html>
    <head>
        <title> Mon premier php </title>
    </head>
    <body>
      <?php echo "Bonjour" ?>
    </body>
</html>

est équivalent au fichier suivant

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

En effet, ce qui est en dehors des balises PHP est écrit tel quel dans la page
Web générée.

## Requêtes préparées

Source : https://openclassrooms.com/courses/requete-preparee-1

### Schéma d'une requête normale :

1. envoi de la requête par le client vers le serveur
2. compilation de la requête
3. plan d'exécution par le serveur
4. exécution de la requête
5. résultat du serveur vers le client

### Schéma d'une requête préparée :

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


## Exemple d'injection SQL

Source : https://fr.wikipedia.org/wiki/Injection_SQL

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

## Require

* `require` : fait un copier-coller d'un fichier externe

* `require_once` : fait de même mais au plus une fois dans le fichier
  courant. Cela évite de définir plusieurs fois la même classe dans le même
  fichier à cause de plusieurs `require`.

La bonne pratique veut que vous mettiez dans chaque fichier les require_once de
toutes les classes que vous allez utiliser.

