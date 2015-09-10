---
title: TD1 &ndash; Révisions et compléments
subtitle: Et quelques révisions sur HTTP
layout: tutorial
---

## Révisions (?) sur le fonctionnement des pages Web

### Qu'est-ce que le HTTP ? 

L'HyperText Transfer Protocol est un protocole de communication entre un client
et un serveur développé pour le Web. L'une de ses fonctions principales est
ainsi de récupérer des pages Web.

### À quoi ressemble une requête HTTP ?

La requête HTTP la plus courante est la requête GET. Par exemple pour demander
la page Web
[http://infolimon.iutmontp.univ-montp2.fr/~rletud/index.html](http://infolimon.iutmontp.univ-montp2.fr/~rletud/index.html)
:

~~~
GET /~rletud/index.html HTTP/1.1
host: infolimon.iutmontp.univ-montp2.fr

~~~
{:.http}

 La réponse est alors:

~~~
HTTP/1.1 200 OK
Date: Tue, 08 Sep 2015 13:32:19 GMT
Server: Apache/2.2.14 (Ubuntu)
Last-Modified: Tue, 08 Sep 2015 13:06:07 GMT
Accept-Ranges: bytes
Content-Length: 5781
Content-Type: text/html

<html><head>...
~~~
{:.http}

Nous verrons l'autre type courant de requêtes (POST) lors de l'envoi de
formulaires en méthode POST. Nous verrons aussi plus tard que les cookies ont
gérés dans les requêtes et réponses HTTP.

<!-- On retrouve Cookie: dans la requête, Set-Cookie: dans la réponse -->

<!-- On peut voir les en-têtes avec les outils de développement de FIrefox ou Chrome --> 

**Expérience amusante :**  
Même si le client HTTP le plus connu est votre navigateur, il est facile de
simuler un client HTTP autrement. La commande `telnet` permet d'envoyer du texte à
une machine distance. En envoyant le texte d'une requête HTTP à un serveur HTTP,
celui nous envoie sa réponse HTTP normalement.

**Exemple :**  

~~~
> telnet infolimon.iutmontp.univ-montp2.fr 80
GET /~rletud/ HTTP/1.1
host: infolimon.iutmontp.univ-montp2.fr

~~~
{:.http}

nous répond

~~~
HTTP/1.1 200 OK
Date: Tue, 08 Sep 2015 20:24:04 GMT
Server: Apache/2.2.14 (Ubuntu)
Last-Modified: Tue, 08 Sep 2015 20:05:38 GMT
Accept-Ranges: bytes
Content-Length: 225
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title> Insérer le titrer ici </title>
  </head>

  <body>
    Un problème avec les accents à é è ?
    <!-- ceci est un commentaire -->
  </body>
</html>
~~~
{:.http}

### Qu'est-ce qu'un serveur HTTP ? 

Un serveur HTTP est un logiciel qui répond à des requêtes HTTP. Il est souvent
associé au port 80 de la machine hôte.

### Quelques exemples de serveurs HTTP ? 

Apache HTTP Server (classique, celui de l'IUT), Apache TomCat (évolution
 pour J2EE), IIS (Microsoft), Node.js (codé en JavaScript).

### Quel est le rôle du navigateur pour une page Web file:// et une page web http://

Pour une URL en file://, le navigateur va lire la page Web sur le disque dur
 et interpréter son contenu (HTML par exemple) pour l'afficher.  
 
 Pour une URL en http://, le navigateur va en plus agir comme un client HTTP. Il
 va donc envoyer une requête HTTP à l'hôte indiqué dans l'URL. Le serveur HTTP
 renvoie une réponse HTTP qui contient (normalement) la page Web demandée. Le
 vanigateur interprête alors la page Web et l'affiche.

 <p style="text-align:center">
 ![Requête HTTP]({{site.baseurl}}/assets/RequeteHTTP.png)
 </p>

### Où intervient le PHP ?

Un module PHP (mod_php5) est intégré au serveur HTTP Apache.  Quand le serveur
Web reçoit une requête d'un fichier .php, il génère dynamiquement la page Web en
exécutant le code PHP de la page. La page généré est ensuite renvoyée dans la
réponse HTTP.  
C'est ce que l'on appelle une page dynamique.

<!--
 La création du document advient au moment de la requête
 Le serveur peut
 o Compiler le document à la volée (comme dans la génération statique),
 o Interagir avec d’autres serveurs (authentification, API, …),
 o Interroger des bases de données.
-->

 <p style="text-align:center">
 ![Rôle du PHP]({{site.baseurl}}/assets/RolePHP.png)
 </p>

<!--

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

En effet, ce qui est en dehors des balises PHP est écrit tel quel dans la page Web générée.
-->

## Note sur les URLs

### Les URL en `http://` et `https://`

**Exemple :** http://infolimon.iutmontp.univ-montp2.fr/~rletud/index.html 

Ici, la 1ère partie de l'URL `http://` correspond toujours au protocole de
communication, qui est bien sûr le Hypertext Transfer Protocol dans notre cas.
En 2ème partie, nous avons désormais l'hôte `infolimon.iutmontp.univ-montp2.fr`
qui décrit la machine à qui s'adresser. Enfin la 3ème partie
`/~rletud/index.html` correspond au chemin complet de la page Web pour le serveur.  
**Référence :** [Les URL](https://fr.wikipedia.org/wiki/Uniform_Resource_Locator)

<!--
Pour les formulaires, il faut définir la query string

Parler d'URL relative ? 

En général 
scheme:[//[user:password@]domain[:port]][/]path[?query][#fragment]
Nous reviendrons plus tard en particulier sur la partie query et fragment.
-->

### Les URL en `file://`

**Exemple :** file:///home/lebreton/public_html/index.html

L'URL (Uniform Ressource Locator "localisateur uniforme de ressource") est un
format d'adresse qui permet de localiser des pages Web. La 1ère partie
`file://` correspond au protocole de communication (ici un fichier sur votre
disque dur). La 2ème partie est le chemin absolu du fichier Web
`/home/lebreton/public_html/index.html`  
**Référence :** [Schéma d'URI 'file'](https://en.wikipedia.org/wiki/File_URI_scheme)


Pour nous, une adresse commençant par `file://` est à proscrire. En effet, une
telle adresse signifie que nos pages PHP ne passent pas par le serveur HTTP
(Apache). Et donc que le PHP n'est pas interprété.


*Note culturelle (optionelle):* En fait, `file://` est un schéma d'URI (Uniform Ressource
Identifier) qui est un schéma plus général et qui identifie pleins d'autres
objets que des pages Web.
Les schémas d'URI "http://" et "https:" correspondent à ce que l'on appelle
les URL.



## Encodage des caractères

**Un problème avec les accents ?**  
Cela provient sûrement de l'encodage des caractères. Comme indiqué dans le TD,
l'encodage d'une page Web se déclare dans son en-tête avec `<meta
charset="utf-8" />` si le fichier est encodé en UTF-8.

Sous linux, les fichiers sont encodés en UTF8 (ou ASCII) par défaut. 
Le problème vient comme souvent de Windows qui tend encore à utiliser l'encodage
ISO-8859-15.

Sous linux, on peut utiliser la commande 
`file nom_du_fichier`
pour détecter l'encodage des caractères.

La commande `iconv` est utile pour changer l'encodage des caractères d'un fichier.  
**Exemple :** `iconv -f ISO-8859-15 -t UTF-8 < input.txt > output.txt`


<!--
% Créer un dossier WebServeur dans public-HTML puis un sous-dossier TD1
% Tuto NetBeans
-->

<!--
### Comment faire pour qu'une page Web soit servie par le serveur HTTP sur infolimon ?

On écrit une page Web dans le dossier **public_html** de son répertoire personnel et
on donne les droits au serveur HTTP Apache (utilisateur www-data) de lire les
pages Web (bit r--) et de traverser les dossiers menant à la page Web (bit de
permission --x).

Dans le TD, nous vous avons indiqué la commande

~~~
setfacl -m u:www-data:r-x nom_du_fichier ou nom_du_répertoire
~~~
{:.bash}

Cette commande donne les droits `r-x` à l'utilisateur `www-data`. Les ACL
permettent d'avoir des droits spécifiques à plusieurs utilisateurs et à
plusieurs groupes quand les droits classiques sont limités à un utilisateur et un
groupe.

**Note :**  
Si on a activé le module Apache `mod_dir` qui permet de lister le
contenu d'un dossier, il faut donner la permission de lecture sur les dossiers à
Apache pour qu'il puisse lister leur contenu.
-->

## Formulaires et PHP

### Méthode GET

Comprenons comment marche le formulaire suivant :

~~~
<form method="get" action="traitement.php">
    <input type="text" name="nom_var" />
	<input type="submit" />
</form>
~~~
{:.html}

Un clic sur le bouton de soumission `<input type="submit" />` du formulaire a
pour effet de charger la page Web `traitement.php` avec des arguments.  Plus
précisement, si l'utilisateur a tapé `valeur` dans le champ texte
`<input type="text" name="nom_var" />`,
le navigateur va demander la page Web `traitement.php?nom_var=valeur`.

La partie `nom_var=valeur` de l'URL s'appelle la *query string*. PHP comprend la
*query string* et s'en sert pour remplir le tableau `$_GET`. Dans notre
exemple, PHP se charge de faire l'affectation
`$_GET["nom_var"] = "valeur"`
juste avant d'exécuter la page PHP `traitement.php`.

**Pourquoi la méthode s'appelle "GET" ?**  
Parce qu'elle correspond à une requête HTTP de type GET (la plus courante pour
demander une page Web.

Lors du clic sur le bouton de soumission du formulaire, le navigateur (qui est un client HTTP) va envoyer la requête HTTP suivante

~~~
GET /~rletud/traitement.php?nom_var=valeur HTTP/1.1
host: infolimon.iutmontp.univ-montp2.fr

~~~
{:.http}

Vous pouvez utiliser la commande `telnet infolimon.iutmontp.univ-montp2.fr 80` dans le terminal pour répéter vous-même l'expérience.


### Méthode POST

Considérons le même formulaire mais en `method="post"` :

~~~
<form method="post" action="traitementPost.php">
    <input type="text" name="nom_var" />
	<input type="submit" />
</form>
~~~
{:.html}

La fonctionnement va être similaire à trois différences près :

1. la page chargée va être `traitementPost.php` sans query string ;
2. les données du formulaire sont envoyées avec la requête HTTP ;
3. On récupère les données dans le tableau PHP `$_POST`. Dans notre exemple, PHP
   fait l'affectation `$_POST["nom_var"] = "valeur"` juste avant d'exécuter la
   page PHP `traitementPost.php`.


Plus précisement, le navigateur va faire la requête HTTP suivante

~~~
POST /~rletud/traitementPost.php HTTP/1.1
host: localhost
Content-Length:14
Content-Type:application/x-www-form-urlencoded

nom_var=valeur

~~~

Nous voyons ici le deuxième type de requête HTTP le plus courant : les requêtes
POST. Elles servent aussi à demander des pages Web. La principale différence est
que l'on peut envoyer, en plus de l'en-tête de la requête HTTP, un corps de
requête HTTP contenant des informations. L'en-tête et le corps de la requête
sont séparés par une ligne vide.

Vous pouvez le tester comme précédement avec la commande `telnet`.

### Avantages et inconvénients des 2 méthodes

* La méthode GET se prête bien à un site en développement car on peut facilement
contrôler les valeurs et noms de variables du formulaire.  
  Il est facile de créer un lien `<a>` vers une page traitant un formulaire en
  méthode GET et d'y envoyer des données via le *query string.*

* La méthode POST est plus propre car les valeurs ne sont plus affichées dans la barre d'adresse du navigateur. Attention, ces informations ne sont pas vraiment cachées pour autant.

<!--
Note sur ù met-on le dollar 

$objet->attribut
$tableau[$index]
Classe::$attribut_static

-->
