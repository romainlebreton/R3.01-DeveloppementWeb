---
title: Cours 1 <br> Introduction au Web dynamique
subtitle: Le rôle du PHP
layout: slideshow
lang: fr
---

<section>
## Présentation du cours

**Objectif du cours :**

* Apprendre à faire des pages dynamiques avec PHP et MySQL
* Interagir avec une base de données
* Organiser son code avec l'architecture MVC
* Mettre en place un système d'utilisateur connecté 

**Cours et TP en ligne :**

* 8 semaines de 4h : 
  * ≃ 29h de travail sur les sujets de TP
  * ≃ 3h de suivi de projet
* site Web : 
  [http://romainlebreton.github.io/R3.01-DeveloppementWeb](http://romainlebreton.github.io/R3.01-DeveloppementWeb)

**Évaluation :**

* Examen écrit final : 50%
* Projet PHP : 50%
  * Parcours A : Le projet PHP sera celui de votre SAÉ
  * Parcours B & D : Projet PHP spécifique au cours
</section>

<!-- 
<section>

## Emploi du temps prévisionnel

1. Mardi 6 septembre 2022 -- Cours d'introduction à PHP

**1er bloc de TDs -- Bases de PHP :**

1. Semaine du lundi 5 septembre 2022 -- TD 1 -- Introduction aux objets en PHP
1. Semaine du lundi 12 septembre 2022 -- TD 2 -- La persistance des données en PHP
1. Semaine du lundi 19 septembre 2022 -- TD 3 -- Requêtes préparées et association de classes
1. Semaine du lundi 26 septembre 2022 -- TD 4 -- Architecture MVC simple
1. Semaine du lundi 3 octobre 2022 -- TD 5 -- Architecture MVC avancée 1/2
1. Semaine du lundi 10 octobre 2022 -- TD 6 -- Architecture MVC avancée 2/2

**2ème bloc de TDs -- Mise en application sur le projet + TDs complémentaires :**

1. Semaine du lundi 17 octobre 2022 -- fin du TD 6 -- Architecture MVC avancée 2/2 (puis éventuellement projet)
1. Semaine du lundi 24 octobre 2022 -- Parcours A : Séance SAÉ S3.A.01, autres parcours (B & D): Séance projet
1. Semaine du lundi 7 novembre 2022 -- TD 7 -- Cookies & Sessions
1. Semaine du lundi 14 novembre 2022 -- TD 8 -- Authentification & Validation par email
1. Semaine du lundi 21 novembre 2022 -- SAÉ ou Projet

**Évaluation**

1. Semaine du lundi 2 janvier 2023 -- Évaluation SAÉ ou Projet
1. Semaine du lundi 9 janvier 2023 -- Examen final écrit

</section> 
-->

<section>

## Plan du cours

1. Le fonctionnement du World Wide Web
2. Pages Web dynamiques avec PHP
3. Transmettre des données à une page Web

</section>
<section>

# Le fonctionnement du World Wide Web

</section>
<section>

## Client / Serveur

* Le *client* : C'est le visiteur d'un site Web. Il demande la page Web au
  serveur. En pratique, vous êtes des clients quand vous surfez sur le Web.  
  Plus précisément, c'est votre *navigateur Web* (Firefox, Chrome, Safari, IE,
  Edge, ...) qui est le client, car c'est lui qui demande la page Web.

* Le *serveur* : Ce sont les ordinateurs qui délivrent les sites Web aux
  internautes, c'est-à-dire aux clients.

<br>

<p style="text-align:center">
![Mécanisme client/serveur]({{site.baseurl}}/assets/ClientServeur.png)
<br>
Le client fait une *requête* au serveur, qui répond en donnant la page Web
</p>

</section>
<section>

## Protocole de communication : HTTP

**HTTP** (*HyperText Transfer Protocol*) est un protocole de communication
entre un client et un serveur développé pour le Web. L'une de ses fonctions
principales est ainsi de récupérer des pages Web.

Versions : HTTP 1.1 pour nos besoins, HTTP 2 & 3 (performances)

Le client envoie une requête HTTP.  
Le serveur retourne une réponse HTTP.


<br>
<br>

**À quoi ressemble une requête HTTP ?**

<!-- Premier problème : plus de serveur Web en HTTP. Ils ont migrés sur HTTPS ! -->

La requête HTTP la plus courante est la requête de méthode GET. Par exemple pour demander
la page Web  
[http://romainlebreton.github.io/R3.01-DeveloppementWeb/classes/class1.html](http://romainlebreton.github.io/R3.01-DeveloppementWeb/classes/class1.html)
:

<br>

```http
GET /R3.01-DeveloppementWeb/classes/class1.html HTTP/1.1
Host: romainlebreton.github.io

```

</section>
<section>

## Protocole de communication : Réponse HTTP

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 13231
[...]

<!DOCTYPE html>
<html>
  <head lang="en">
    <meta charset="utf-8">
    <title>Cours 1  Introduction au Web dynamique</title>
  </head>
  <body>
    <ul class="menu" id="top-menu">...</ul>
    <div class="main">...
      <h1>Cours 1 -- Introduction au Web dynamique 
        <span class="subtitle">Le rôle du PHP</span>
      </h1>    
    </div>
  </body>
</html>
```

<!-- Parler de réponse et découpage en en-tête et corps de la réponse -->

</section>
<section>

## Le navigateur comme client HTTP

<!-- Double rôle du navigateur qui fait client et interprète la page Web -->

Quand on ouvre une URL en `http://`, le navigateur va agir comme un client
HTTP. Il va donc envoyer une *requête HTTP*.
<!-- à l'hôte indiqué dans l'URL. -->

Le client HTTP reçoit la réponse du serveur HTTP qui contient la page Web
demandée.

Le navigateur interprète alors la page Web et l'affiche.

<br>
<br>

<p style="text-align:center">
![Requête HTTP]({{site.baseurl}}/assets/RequeteHTTP.png)
</p>

<br>
<br>
<!-- Je vous ai montré ce qui se passe quand je demande une page Web -->
<!-- en tapant une URL dans la barre d'adresse -->
**Que se passe-t-il quand on clique sur un lien hypertexte `<a>` ?**
<div class="incremental">
<div>
Cliquer sur un lien est similaire à demander une page Web par la barre
d'adresse :  
cela envoie une requête HTTP de verbe `GET`.

</div>
</div>

</section>
<section>

## Écoutons le réseau

<!-- Ouvrir https://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html dans le
navigateur en expliquant la requête et réponse -->

1. Exemple pour observer une communication HTTP brute : 
   ```bash
   # Avec cURL (préinstallé)
   curl -v http://romainlebreton.github.io/helloWorld.html
   # Avec HTTPie (à installer)
   http -p HBhb http://romainlebreton.github.io/helloWorld.html
   ```
2. Pour observer au sein du navigateur :  
   outils de développement (`F12` ou Menu
   Outils/Outils de développement)  
   puis onglet Réseau.


    Regardons les communications HTTP quand :

    * on ouvre l'URL  
      https://romainlebreton.github.io/helloWorld.html
    * on clique sur le lien  
      [https://romainlebreton.github.io/helloWorld.html](https://romainlebreton.github.io/helloWorld.html)

    <!--
    Ouvrir Réseau, recharger la page,
    view source des Request Headers puis
    view source des Response Headers puis
    Response
    -->

    <!-- Nous verrons l'autre type courant (POST) de requêtes HTTP lors de l'envoi de -->
    <!-- formulaires en méthode POST.  -->

</section>
<section>

## Qu'est-ce qu'un serveur HTTP ? 

Un *serveur* **HTTP** est un logiciel qui répond à des requêtes HTTP.  
Il est souvent associé au port 80 de la machine hôte.

<br>

**Quelques exemples de serveurs HTTP ?**

* Apache HTTP Server : serveur historique (depuis 1995), celui que l'on utilisera
* Apache TomCat : évolution pour Java (J2EE)
* Nginx : serveur le plus utilisé au monde depuis 2021. Très performant
* IIS (Internet Information Services) : Microsoft
* Node.js : codé en JavaScript.

<br>

**En pratique** lors des TDs, nous utiliserons : 
* principalement un serveur **HTTP** Apache dans un conteneur Docker sur vos portables.
* sinon, le serveur **HTTP** Apache de l'IUT (`webinfo`)

<!-- La pratique du serveur avec public_html, PB file://, installation chez eux -->

<br>
<br>

**Résumé :**

* Un serveur Web = un serveur **HTTP**

<!-- Note 03/09/2019 Remettre dessin et donner plus explications : serveur écoute le réseau, lit la requête, envoie le fichier -->

</section>
<section>

## Serveur Web sous Docker

**Installation du serveur Web :**

* Instructions au début du [TP1]({{site.baseurl}}/tutorials/tutorial1.html)
* Avant votre première séance de TP : 
  * Installez Docker Desktop au moins 
  * Si possible, créer le conteneur Docker contenant un serveur Web
  * Si possible, lancez PhpStorm et activez votre licence `JetBrains`
* Démo : création du conteneur une fois que Docker Desktop est installé

<br>

**Utilisation du serveur Web Docker :**

* Déposer vos fichiers HTML/CSS/PHP dans le dossier `public_html` .
* Quand vous demandez la page  
[http://localhost/index.html](https://localhost/index.html),  
le serveur HTTP Docker va rechercher le fichier  
`/home/lebreton/public_html/index.html`.
* Idem la page  
[http://localhost/image/topsecret.jpg](http://localhost/image/topsecret.jpg)  
renvoie sur le fichier  
`/home/lebreton/image/topsecret.jpg`.


</section>
<section>

## Serveur Web `webinfo` de l'IUT

**Différence :**
* Serveur Web Docker pour le développement : pages Web accessibles localement
* Serveur `webinfo` de l'IUT : pages Web accessibles partout

<br>

**Où déposer vos fichiers HTML/CSS/PHP pour le serveur `webinfo` ?**  
Dans le dossier `public_html` de votre répertoire personnel **à l'IUT** à l'aide de FTP ou SSH ([instructions sur l'intranet](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-aux-serveurs/)).

<br>

**Utilisation du serveur Web Docker :**

* Quand vous demandez la page  
[https://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html](https://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html),  
le serveur HTTP (Apache) de l'IUT va rechercher le fichier  
`/home/ann2/rletud/public_html/index.html`.
* Idem la page  
[https://webinfo.iutmontp.univ-montp2.fr/~rletud/image/topsecret.jpg](https://webinfo.iutmontp.univ-montp2.fr/~rletud/image/topsecret.jpg)  
renvoie sur le fichier  
`/home/ann2/rletud/public_html/image/topsecret.jpg`.

<!-- **Attention aux droits:** -->

<!-- Note 03/09/2019 : comme avant mais envoie le fichier /home_rletud/public_html/index.html -->

</section>
<section>

# Pages Web statiques ou dynamiques

</section>
<section>

## Différence entre page statique/dynamique

* Les sites *statiques* :  
  Sites réalisés uniquement à l'aide de HTML/CSS.  
  Ils fonctionnent très bien, mais leur contenu ne change pas en fonction du client.  
  Les sites statiques sont donc bien adaptés pour réaliser des sites « vitrine»
  (e.g. projet HTML/CSS 1ère année).

<p style="text-align:center">
![Requête HTTP]({{site.baseurl}}/assets/RequeteHTTP.png)
</p>

  <!-- il faut que le propriétaire du site (le webmaster) modifie le code source pour y ajouter des nouveautés. -->

* Les sites *dynamiques* :  
  Leur contenu change en fonction du client. **Des exemples ?**  
  <!-- Bonjour *untel*, vos informations, votre mot de passe ... -->
  Ils utilisent d'autres langages tels que PHP pour générer du HTML et CSS.  
  La plupart des sites Web que vous visitez sont dynamiques.

**Fonctionnalités typiques de sites dynamiques :**  
un espace membres, un forum, un compteur de visiteurs, des actualités, une
newsletter

<!-- Note 03/09/2019 : statique : une url = un fichier, dynamique : une url = un script est exécuté et produit la page renvoyée -->

</section>
<section>

## Mécanisme de génération des pages dynamiques 1/2

<!-- Voir l'un puis l'autre -->

**Rappel :**

* Site statique :  
  1. le client demande au serveur à voir une page Web (requête HTTP) ;
  2. le serveur lui répond en lui envoyant la page réclamée (réponse HTTP).
  
  <!-- déjà vu -->
  
<p style="text-align:center">
![Requête HTTP]({{site.baseurl}}/assets/RequeteHTTP.png)
</p>

</section>
<section>

## Mécanisme de génération des pages dynamiques 2/2

<!-- PHP : recette pour créer page HTML -->

* Site dynamique :  
  1. le client demande au serveur à voir une page Web (requête HTTP) ;
  2. le serveur crée la page spécialement pour le client.  
     Dans notre cas, le serveur va exécuter un script PHP ;
  3. le serveur répond au client en lui envoyant la page qu'il vient de générer (réponse HTTP).

<p style="text-align:center">
![Génération PHP]({{site.baseurl}}/assets/RolePHP.png)
</p>

</section>
<!-- <section> -->

<!-- ## Où intervient le PHP ? -->

<!-- Un module PHP (mod_php5) est intégré au serveur HTTP Apache. -->

<!-- Quand le serveur Web reçoit une requête d'un fichier .php, il génère -->
<!-- dynamiquement la page Web en exécutant le code PHP de la page. -->

<!-- La page généré est ensuite renvoyée dans la réponse HTTP. -->

<!-- **C'est ce que l'on appelle une page dynamique.** -->

<!--
 La création du document advient au moment de la requête
 Le serveur peut
 o Compiler le document à la volée (comme dans la génération statique),
 o Interagir avec d’autres serveurs (authentification, API, …),
 o Interroger des bases de données.
-->

<!-- <br> -->

<!--  <p style="text-align:center"> -->
<!--  ![Rôle du PHP]({{site.baseurl}}/assets/RolePHP.png) -->
<!--  </p> -->


<!-- </section> -->
<section>

## Le langage de création de pages Web : PHP

<div style="display:flex;align-items:center;">
<div style="flex-grow:1">
Le rôle de PHP ("**P**HP: **H**ypertext **P**reprocessor") est justement de générer du code HTML.

C'est un langage que seuls les **serveurs** comprennent et qui permet de rendre
votre site dynamique.
</div>
<div style="flex-grow:1">
<p style="text-align:center">
<img src="{{site.baseurl}}/assets/ElePHPant.svg" style="width:200px" alt="Mascotte PHP">  
L'éléPHPant, la mascotte de PHP
</p>
</div>
</div>

<br>

<div class="incremental">
<div>
**Attention :** Les clients (navigateurs) sont incapables de comprendre le code PHP : ils ne
connaissent que le HTML et le CSS.

<p style="text-align:center;">
<img src="{{site.baseurl}}/assets/openingphp.png" style="width:300px" alt="Quand on ouvre un .php directement dans le navigateur">
</p>
</div>
</div>

<!--
Attention notamment si vous ouvrez demandez une page PHP avec le protocole
file:// (e.g. si vous double-cliquez sur un fichier PHP sur les ordinateurs de
l'IUT), le fichier PHP est envoyé directement au navigateur qui ne sait pas le
lire
-->

</section>
<section>

## Les concurrents de PHP

* ASP.NET : conçu par Microsoft, il exploite le framework .NET (C#).
* Ruby : avec le framework Ruby on Rails par exemple.
* Java : framework Jakarta Server Pages (anciennement Java Server Pages)  
  particulièrement utilisé dans le monde professionnel.
* Python : framework Django, Flask...
* JavaScript : aussi côté serveur avec avec Node.js

**Lequel est le meilleur ?**
Tout dépend de vos connaissances en programmation.

<img src="{{site.baseurl}}/assets/php_concu.png" style="width:450px; float:right; margin-left:30px;" alt="Popularité des langages côté serveur">  
PHP se démarque de ses concurrents par une importante communauté qui peut vous
aider. 

C'est un langage facile à utiliser, idéal pour les débutants comme pour
les professionnels (Wikipédia, Tumblr et Facebook).

<div style="clear:both;"></div>

<!-- https://w3techs.com/technologies/overview/programming_language/all -->

</section>
<section>

# Un premier aperçu de PHP

</section>
<section>

## PHP comme langage de génération de pages Web

<br>

**PHP va nous servir à créer des documents HTML :**

* Il prend donc en entrée un fichier `.php` <!-- qui contient de l'HTML et du PHP -->
* Il exécute les instructions PHP sans compilation (langage interprété)
* Il affiche en sortie un document HTML  
  (comme un programme C écrirait dans sa sortie standard).

<br>

**Remarques :** 
* PHP est un langage de programmation au même titre que Java, Python, C...
* N'importe quel langage peut écrire une page HTML en sortie
* PHP est juste pratique pour écrire des pages Web de par sa syntaxe, les fonctions qu'il propose...

<!-- Rq 04/09/2019 : Confus de dire contient de l'HTML et du PHP ?
                     Sortie standard
-->

</section>
<section>

## Votre premier fichier PHP

L'exécution du document `helloWorld.php` suivant

```php
<?php
  $message = "Hello World!\n";
  echo $message;
?>
```

affiche en sortie le texte 

```text
Hello World↵
```

<br>

**Explications :**

* Les balises ouvrantes `<?php` et fermantes `?>` doivent entourer le code PHP

* Les noms de variables commencent par un `$` en PHP

* L'instruction `echo` a pour effet d'insérer du texte dans le document en sortie  
  (autrement dit, d'écrire dans la sortie standard)

<br>

**Démonstration avec la ligne de commande `php`**
```bash
$ php helloWorld.php 
Hello World!
```

<!-- Rq 04/09/2019 : Dire que c'est juste une syntaxe raccourcie ? -->

</section>
<section>

## Comment générer la page HTML suivante ?

```php
<!DOCTYPE html>
<html>
  <head>
    <title> Mon premier php </title>
  </head>
  <body>
  Il est actuellement 09:04.
  </body>
</html>
```

On pourrait faire

```php
<?php
  echo "<!DOCTYPE html>\n";
  echo "<html>
  <head>
    <title> Mon premier php </title>
  </head>
  <body>\n";
  echo "  Il est actuellement " . date("H:i") . ".\n";
  echo "  </body>\n</html>"; ?>
```

</section>
<section>

## Imbrication de PHP dans le HTML

Heureusement, PHP propose une syntaxe plus lisible:
```php
<!DOCTYPE html>
<html>
  <head>
    <title> Mon premier php </title>
  </head>
  <body>
  Il est actuellement <?php echo date("H:i");?>.
  </body>
</html>
```

Ce qui est en dehors des balises PHP est écrit tel quel dans la page
Web générée (comme si on avait fait `echo`).

<br>
<br>

Remarquez aussi la différence :
* en Java: `System.out.println("Hello");`
* en PHP: `echo "Hello";`

</section>
<section>

## Un script PHP sur un serveur HTTP 1/2

Deux principales façons d'exécuter un script PHP:
* soit dans le terminal avec la commande `php`;
* soit le serveur Web appelle lui-même l'interpréteur PHP 
  * pour exécuter le script
  * et renvoyer la sortie du script en tant que réponse HTTP.


</section>
<section>

## Un script PHP sur un serveur HTTP 2/2

En pratique sur un exemple :

* On écrit le fichier `/home/lebreton/public_html/bonjour.php` : <!-- `/home/ann2/public_html/bonjour.php` -->

  ```php
  <!DOCTYPE html>
  <html>
      <head>
          <title> Mon premier php </title>
      </head>
      <body>
        <?php echo "Bonjour"; ?>
      </body>
  </html>
  ```

* On ouvre
  [http://localhost/bonjour.php](http://localhost/bonjour.php)
  pour voir la page générée

  ```text
  Bonjour
  ```

<br>

**Note :** Affichez le code source de la page HTML pour retrouver la sortie complète du script `<!DOCTYPE html><html>...`

</section>
<section>

## Les tableaux associatifs

Vous connaissez déjà les *tableaux classiques*, ceux qui sont indexés par
`0,1,2,...`.

<br>

Les tableaux en PHP peuvent aussi s'indexer par des chaînes de caractères :

<p style="text-align:center;">
Ce sont les **tableaux associatifs**
</p>

* Pour initialiser un tableau :

  ```php?start_inline=1
  $coordonnees = array (
    'nom'    => 'Assin',
    'prenom' => 'Marc'   
  );
  ```

  ou de façon plus courte et équivalente

  ```php?start_inline=1
  $coordonnees = [
    'nom'    => 'Assin',
    'prenom' => 'Marc'   
  ];
  ```

* Notez l'existence des boucles
  [`foreach`](http://php.net/manual/fr/control-structures.foreach.php) pour
  parcourir ces tableaux :

  ```php?start_inline=1
  foreach ($coordonnees as $key => $value){
      echo $key . " : " . $value . "\n"; 
  } // Affiche "nom : Assin↵prenom : Marc"
  ```
{:.incremental}

</section>
<section>

# Transmettre des données à une page Web

<div class="incremental">
<div>
Les pages Web se transmettent des données entre elles.  
Par exemple, votre nom/prénom, le fait que vous soyez connectés, vos réponses
aux formulaires d'inscription.

Sans données supplémentaires, on n'aurait pas de pages personnalisées et on
serait ramenés aux sites statiques.

## Comment ça marche ?
</div>
</div>

</section>
<section>

## Deux moyens pour transmettre des données à une page Web

<br>
<br>
<br>

<!-- <div style="font-size:xx-large"> -->
1. Dans une requête HTTP de méthode **GET**, que l'on obtient

   1. en cliquant sur une URL, et notamment dans les liens `<a>`
   
   1. en validant un formulaire de méthode **GET**

1. Dans une requête HTTP de méthode **POST**, que l'on obtient
   1. en validant un formulaire de méthode **POST**
<!-- </div> -->

</section>
<section>

## Les *query strings* dans l'URL

Une *URL* (Uniform Resource Locator) sert à représenter une adresse sur le Web.

<!-- ou plus généralement à identifier une ressource -->

* Une URL simple :

  <p style="text-align:center">
  <!-- <a href="http://romainlebreton.github.io/R3.01-DeveloppementWeb/classes/class1.html#comment-faire-"> -->
  <img alt="Exemple d'URL" src="{{site.baseurl}}/assets/URLSimple.png" width="900px">
  <!-- </a> -->
  </p>

  <!-- Protocole : ftp, http, file, ... -->
  <!-- nom de domaine (ou IP) avec ou sans port -->
  <!-- chemin d'accès (relatif ou absolu) -->
  <!-- ancre (/signet) optionnel -->

* Une URL avec *query string* (chaîne de requête) :

  <p style="text-align:center">
  <img alt="Exemple d'URL" src="{{site.baseurl}}/assets/URLQueryString.png" width="900px">
  </p>

  <!-- ? pour délimiter la query string (chaîne de requête) -->
  <!-- puis des couples nom_param=val_param séparés par des & -->
{:.incremental}
  
<p class="myfootnote">
**Sources :** [Standard des URL](https://tools.ietf.org/html/rfc3986),
[Wikipedia](https://fr.wikipedia.org/wiki/Uniform_Resource_Locator)
</p>

<!--
Percent-Encoding : on encode sous la forme "%" HEXDIG HEXDIG les caractères
problématiques, genre non ASCII, délimiteurs ...

Voir PHP : urlencode
-->

<!--
Attention, en HTML le & est encodé &amp; car il sert à déclarer le début
d'entité spéciales (e.g. &amp; &nbsp; ...).
Ceci est aussi valable pour les valeurs d'attributs HTML, donc les liens !
Si vous ne le faites pas, le code ne passera pas la validation W3C.

Ref:
http://mrcoles.com/blog/how-use-amersands-html-encode/
https://www.w3.org/TR/xhtml1/guidelines.html#C_12
-->

</section>
<section>

## Récupérer des données GET en PHP

<br>

PHP est capable de récupérer les données saisies dans les URLs.

<br>

PHP va automatiquement remplir le tableau associatif `$_GET` avec les
informations contenues dans le *query string*.

<br>

<br>

**Exemple :**

Quand un client demande `bonjourGet.php?nom=Assin&prenom=Marc` :

* PHP remplit le tableau `$_GET` avec

  ```php?start_inline=1
  $_GET = [
    "nom" => "Assin",
    "prenom" => "Marc"
  ];
  ```

* puis PHP exécute le script `bonjourGet.php`.

</section>
<section>

## Exemple de transmission avec la méthode GET


Quand on clique sur un lien avec des informations dans son *query string*.

<div style="display:flex;align-items:center;">
<div style="flex-grow:1">
```html
<a href="bonjourGet.php?nom=Assin&prenom=Marc">
  Dis-moi bonjour !
</a>
```
</div>
<div style="flex-grow:1;display:inline;text-align:center;">
<a href="https://webinfo.iutmontp.univ-montp2.fr/~rletud/bonjourGet.php?nom=Assin&prenom=Marc">Dis-moi bonjour !</a>
</div>
</div>

* PHP rempli le tableau `$_GET` avec

  ```php?start_inline=1
    $_GET = ["nom" => "Assin", "prenom" => "Marc"];
  ```

* puis exécute `bonjourGet.php` 

  ```php
  <p>Bonjour <?php echo $_GET['prenom']; ?> !</p>
  ```

* qui va générer

  ```html?start_inline=1
  <p>Bonjour Marc !</p>
  ```


</section>
<!-- <section> -->

<!-- ## 2 - Les formulaires -->

<!-- <br> -->

<!-- On va voir qu'il y a deux types de formulaires : -->

<!-- * ceux dont les données sont envoyées avec la **méthode GET** -->

<!-- * ceux dont les données sont envoyées avec la **méthode POST** -->

<!-- </section> -->
<section>

## Les formulaires de méthode GET

Considérons le formulaire suivant et supposons que l'utilisateur a tapé `MaDonnee`

<div style="display:flex;align-items:center">
<div style="flex-grow:1;">
```html
<form method="get" action="traitement.php">
  <input type="text" name="nom_var" />
  <input type="submit" />
</form>
```
</div>
<div style="flex-grow:1;text-align:center">
<form method="get" action="https://webinfo.iutmontp.univ-montp2.fr/~rletud/traitement.php" style="display:inline">
<input type="text" name="nom_var" value="MaDonnee">
<input type="submit">
</form>
</div>
</div>

1. le clic sur le bouton `Valider` :
   * charge la page `traitement.php` (champ `action` du formulaire)
   * transmet ses informations dans le *query string*
  
   Donc le clic sur `Valider` charge l'URL `traitement.php?nom_var=MaDonnee`

   On reconnaît l'attribut `name="nom_var"` de `<input>` et la valeur remplie par l'utilisateur.

3. la page `traitement.php` suivante s'exécute avec le tableau  
   `$_GET = ["nom_var" => "MaDonnee"];`

   ```php
   <p>La donnée nom_var est <?php echo $_GET['nom_var']; ?> !</p>
   ```

4. la page générée par `traitement.php` est 

   ```html?start_inline=1
   <p>La donnée nom_var est MaDonnee !</p>
   ```
{:.incremental}

</section>
<section>

## Pourquoi la méthode du formulaire s'appelle "GET" ?

<br>

Parce que en `method="get"`, le formulaire envoie une requête **HTTP** de
méthode **GET**.

<br>

En effet, lorsque l'on valide le formulaire, le navigateur (client HTTP) envoie
la requête **HTTP** de type **GET** suivante

```http
GET /~rletud/traitement.php?nom_var=valeur HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr

```

<br>

C'est de cette manière que l'on demande une page Web généralement.

<br>

**Remarque :**

Les formulaires **GET** utilisent donc l'envoi de données dans le *query string*.

</section>
<section>

# Envoi de données *via* la méthode POST

<!-- On l'obtient en utilisant des formulaires de méthode POST. -->

</section>
<section>

## Les formulaires POST

<!-- Un formulaire en méthode **POST** envoie ses informations différemment : -->

<!-- <p style="text-align:center"> -->
<!-- elles **ne sont plus** encodées dans le *query string*. -->
<!-- </p> -->

<div style="display:flex;align-items:center">
<div style="flex-grow:1;">
```html
<form method="post" action="traitePost.php">
  <input type="text" name="nom_var" />
  <input type="submit" />
</form>
```
</div>
<div style="flex-grow:1;text-align:center">
<form method="post" action="https://webinfo.iutmontp.univ-montp2.fr/~rletud/traitePost.php" style="display:inline">
<p style="margin:auto">
<input type="text" name="nom_var">
<input type="submit">
</p>
</form>
</div>
</div>

**Différences :**

1. La méthode du formulaire devient `method="post"`
3. On récupère les données dans le tableau PHP `$_POST`. 

<br>

**Exemple :**

Quand on clique sur `Valider`, PHP rempli le tableau

```php?start_inline=1
$_POST = ["nom_var" => "valeur"];
```

juste avant d'exécuter la page PHP `traitePost.php` suivante

```php
<p>La donnée nom_var est <?php echo $_POST['nom_var']; ?> !</p>
```

qui va s'exécuter pour créer la page Web

```html?start_inline=1
<p>La donnée nom_var est MaDonnee !</p>
```

</section>
<!-- <section> -->

<!-- ## Les formulaires POST 2/3 -->

<!-- <br> -->
<!-- <br> -->

<!-- Plus précisément, avec un formulaire en `method="post"` : -->

<!-- 1. la page chargée va être `traitePost.php` **sans *query string* ;** -->

<!-- 2. les données du formulaire sont envoyées dans le **corps** d'une requête -->
<!--    **HTTP** de type **POST** (*cf.* prochain slide) ; -->

<!-- 3. On récupère les données dans le tableau PHP `$_POST`.   -->
<!--    Dans notre exemple, PHP fait l'affectation -->

<!--    ```php?start_inline=1 -->
<!--    $_POST["nom_var"] = "valeur" -->
<!--    ``` -->
   
<!--    juste avant d'exécuter la page PHP `traitePost.php`. -->

<!-- </section> -->
<section>

## Les requêtes HTTP de type POST

Nous voyons ici le deuxième type de requête HTTP le plus courant :

<p style="text-align:center;">
**les requêtes HTTP de type POST.**
</p>

<br>

```http
POST /~rletud/traitePost.php HTTP/1.1
Host: localhost
Content-Length:14
Content-Type:application/x-www-form-urlencoded

nom_var=valeur

```

<br>

Elles servent aussi à demander des pages Web. Les principales différences sont :

1. la présence dans la requête **HTTP** d'un **corps de requête** en plus de l'en-tête.

2. L'en-tête et le corps de la requête sont séparés par une ligne vide.

3. Le corps de la requête **HTTP** sert ici à envoyer les informations.  
   Il n'y a donc plus de *query string* dans l'URL.

<br>

<div style="display:flex;align-items:center">
<div style="flex-grow:1;">
**Démonstration avec l'outil *Réseaux* :**
</div>
<div style="flex-grow:1;text-align:center">
<form method="post" action="https://webinfo.iutmontp.univ-montp2.fr/~rletud/traitePost.php" style="display:inline">
<input type="text" name="nom_var" value="MaDonnee">
<input type="submit">
</form>
</div>
</div>

</section>
<section>

## Requête POST via le terminal

En utilisant HTTPie (à installer) pour un meilleur affichage

```bash
# --form pour envoyer une requête POST avec les données à la fin
# -p pour afficher : H/B request headers/body, h/b response headers/body
http --form https://webinfo.iutmontp.univ-montp2.fr/~rletud/traitePost.php nom_var='Romain' -p HBhb
```

**Requête** 
```http
POST /~rletud/traitePost.php HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Content-Length: 14
[...]

nom_var=Romain
```

**Réponse**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 39
[...]

<p>La donnée nom_var est Romain !</p>
```

</section>
<section>

## Avantages et inconvénients des deux méthodes

<br>

* La méthode **GET** :

  * se prête bien à un site en **développement** car on peut facilement
  contrôler les valeurs et noms de variables du formulaire.
  
  * Il est facile de créer un lien `<a>` vers une page traitant un formulaire en
  méthode GET et d'y envoyer des données via le *query string.*
 
  <br>
 
* La méthode **POST** :

  * est plus propre, car les valeurs ne sont plus affichées dans la barre d'adresse du navigateur

  * **Attention :**  
  ces informations **ne sont pas vraiment cachées** pour autant.

<!--
Note sur où met-on le dollar 

$objet->attribut
$tableau[$index]
$tableau["cle"]
Classe::$attribut_static

-->


<!--
%%%


PHP 7
Versions de PHP et apports

1er exemple echo et mélange
Explication processus création page


Dans une note séparées sur la page des TDs ?



Serveur Web, diag client / serveur / php, file:/// http://

DevTools Network pour voir les requetes dans le navigateur

dire aussi que cliquer sur un lien, c'est juste demander une page Web donc faire une requete HTTP

echo ...

Isoler que PHP écrit la page Web
Différentes façons d'écrire : zone PHP, echo

Reprendre le fil rouge de site de covoiturage

Parler des spécificités du PHP (vs Java) : typage, lambda, portée variables ???

require

tableaux

echo

if - for imbriqués html

-->


</section>
<section>

## Bilan du cours

À la suite de ce cours, vous devez comprendre la signification du vocabulaire
suivant :

* protocole HTTP

* client HTTP

* requête HTTP scindée en 2 parties : en-tête et corps

* verbes HTTP : GET, POST

* serveur HTTP, fourni par le logiciel Apache à l'IUT

* réponse HTTP scindée en 2 parties : en-tête et corps

* Site Web statique / dynamique

* la partie *query string* d'une URL 

* formulaire de méthode GET ou POST  
  Et comment l'information est transmise



</section>
<section>

# Sources

**Sources :**

* [Open Classrooms - Concevez votre site web avec PHP et MySQL](https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql)
* [Documentation officielle de PHP](http://php.net/manual/fr/)

</section>

<!-- ## Bonus : Émuler un client HTTP textuel

**Expérience "amusante" :**  
Même si le client HTTP le plus connu est votre navigateur, il est facile de
simuler un client HTTP autrement. La commande `telnet` permet d'envoyer du texte à
une machine distance. En envoyant le texte d'une requête HTTP à un serveur HTTP,
celui nous envoie sa réponse HTTP normalement.

**Exemple :**  

```http
> telnet romainlebreton.github.io 80
GET /R3.01-DeveloppementWeb/assets/Cours1/HelloWorld.html HTTP/1.1
Host: romainlebreton.github.io

```

nous répond

```http
HTTP/1.1 200 OK
Server: GitHub.com
Content-Type: text/html; charset=utf-8
Content-Length: 170
[...]

<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Fichier test</title>
  </head>
    <body>
        <h1>Hello world</h1>
    </body>
</html>
```

Faites de même avec la requête POST précédente.

</section> -->
