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

La requête HTTP la plus courante est la requête GET. Par exemple pour demander la page Web [http://infolimon.iutmontp.univ-montp2.fr/~rletud/index.html](http://infolimon.iutmontp.univ-montp2.fr/~rletud/index.html) :

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

### Comment faire pour qu'une page Web soit servie par le serveur HTTP sur infolimon ?

On écrit une page Web dans le dossier public_html de son répertoire personnel et
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
Si on a activé le module `mod_dir` qui permet de lister le contenu d'un dossier,
il faut la permission de lecture sur les dossiers pour pouvoir lister leur
contenu.
 
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
`file -bi nom_du_fichier`
pour détecter l'encodage des caractères.

La commande `iconv` est utile pour changer l'encodage des caractères d'un fichier.  
**Exemple :** `iconv -f ISO-8859-15 -t UTF-8 < input.txt > output.txt`


<!--
% Créer un dossier WebServeur dans public-HTML puis un sous-dossier TD1
% Tuto NetBeans
-->