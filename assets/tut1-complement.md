---
title: TD1 &ndash; Révisions et compléments
subtitle: Et quelques révisions sur HTTP
layout: tutorial
---

## Révisions (?) sur le fonctionnement des pages Web

### Qu'est-ce que le HTTP ? À quoi ressemble une requête HTTP ?

La requête HTTP la plus courante est la requête GET
Exemple pour demander la page Web http://infolimon.iutmontp.univ-montp2.fr/~rletud/index.html : 
 GET /~rletud/index.html HTTP/1.1
 host: infolimon.iutmontp.univ-montp2.fr

 La réponse est alors:
 HTTP/1.1 200 OK
 Date: Tue, 08 Sep 2015 13:32:19 GMT
 Server: Apache/2.2.14 (Ubuntu)
 Last-Modified: Tue, 08 Sep 2015 13:06:07 GMT
 Accept-Ranges: bytes
 Content-Length: 5781
 Content-Type: text/html

<html><head>... la page Web

On retrouve Cookie: dans la requête, Set-Cookie: dans la réponse
Un autre type courant de requêtes (POST) est envoyé par les formulaires en method="post"

Exemple :
telnet infolimon.iutmontp.univ-montp2.fr 80
Trying 162.38.222.142...
Connected to infolimon.iutmontp.univ-montp2.fr.
Escape character is '^]'.
GET /~rletud/ HTTP/1.1
host: infolimon.iutmontp.univ-montp2.fr



### Qu'est-ce qu'un serveur HTTP ? 

Un serveur HTTP est un logiciel qui répond à des requêtes HTTP

### Connaissez-vous des serveurs HTTP ? 

Apache HTTP Server (classique, celui de l'IUT), Apache TomCat (évolution
 pour J2EE), IIS (Microsoft), Node.js (codé en JavaScript)

### Comment faire pour qu'une page Web soit servie par le serveur HTTP sur infolimon ?

On écrit une page Web dans le dossier public_html de son répertoire personnel et on donne les droits au serveur HTTP Apache (utilisateur www-data) de lire les pages Web (bit r--) et de traverser les dossiers menant à la page Web (bit de permission --x)
 % Si on a activé le mod mod_dir qui permet de lister le contenu d'un dossier,
 % il faut la permission de lecture sur les dossiers pour pouvoir lister leur
 % contenu

### Quel est le rôle du navigateur pour une page Web file:// et une page web http://

Pour une URL en file://, le navigateur va lire la page Web sur le disque dur
 et interpréter son contenu (HTML par exemple) pour l'afficher.  
 
 Pour une URL en http://, le navigateur va envoyer une requête HTTP à l'hôte
 indiqué dans l'URL. Le serveur HTTP renvoie une réponse HTTP qui contient
 (normalement) la page Web demandée. Le vanigateur interprête alors la page Web
 et l'affiche.
 % Voire RequeteHTTP.png

### Où intervient le PHP ?

Un module PHP (mod_php5) est intégré au serveur HTTP Apache.  

 Quand le serveur Web reçoit une requête d'un fichier .php, il génère
 dynamiquement la page Web en executant le code PHP de la page.

 La création du document advient au moment de la requête
 % Trouver une image mieux que RolePHP.png
 Le serveur peut
 o Compiler le document à la volée (comme dans la génération statique),
 o Interagir avec d’autres serveurs (authentification, API, …),
 o Interroger des bases de données.



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


## Les permissions des fichiers Web

Dans le TD, nous vous avons indiqué 

`setfacl -m u:www-data:rwx nom_du_fichier ou nom_du_répertoire`

Cette commande donne tous les droits (rwx) à l'utilisateur `www-data`. Les ACL
permettent d'avoir des droits spécifiques à plusieurs utilisateurs et à
plusieurs groupes quand les droits classique sont limités à un utilisateur et un
groupe.


% Créer un dossier WebServeur dans public-HTML puis un sous-dossier TD1
% Tuto NetBeans
