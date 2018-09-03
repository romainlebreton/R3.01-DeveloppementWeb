---
title : Cours 1 <br> Introduction au Web dynamique
subtitle : Le rôle du PHP
layout : slideshow
---

<!-- 
Mettre à jour intervenants et heures 
Voir quand intégrer la séance Git
-->

<section>
## Présentation du cours

**Objectif du cours:**

* Apprendre à faire des pages dynamiques avec PHP et MySQL
* Organiser son code avec l'architecture MVC
* Introduction au gestionnaire de version Git & au gestionnaire GitLab

<!-- **4 intervenants :** -->

<!-- * Q1 - Mardi 15h45-18h45 - Jean-Philippe Prost -->
<!-- * Q2 - Mercredi 10h-13h - Sébastien Gagné -->
<!-- * Q3 - Vendredi 12h30-15h30 - Abdelkader Gouaïch -->
<!-- * Q4 - Vendredi 09h15-12h15 - Romain Lebreton -->

**Cours et TP en ligne :**

* site Web : 
  [http://romainlebreton.github.io/ProgWeb-CoteServeur](http://romainlebreton.github.io/ProgWeb-CoteServeur)

**Évaluation :**

* examen final : ~40%
* projet PHP : ~60%
* pas de partiel

</section>
<section>

## Emploi du temps prévisionnel

* 1 Septembre -- Cours Introductif

**1er bloc de TPs -- Bases de PHP :**

* 3  Septembre 2018 – TP 1 – Introduction aux objets en PHP
* 10 Septembre 2018 – TP 2 – La persistance des données en PHP
* 17 Septembre 2018 – TP 3 – Fin TP2 et association entre classes
* 24 Septembre 2018 -   ?  – Introduction à Git
* 1 Octobre   2018 – TP 4 – Architecture MVC simple
* 8 Octobre   2018 – TP 5 – Architecture MVC avancée 1/2
* 15 Octobre   2018 – TP 6 – Architecture MVC avancée 2/2

**2ème bloc de TPs -- Mise en application sur le projet + TPs complémentaires :**

* 22 Octobre   2018 - **Début projet**
* 29 Octobre   2018 - **Congé IUT**
* 5  Novembre  2018 - 3h projet
* 12 Novembre  2018 – TP 7 – Cookies & Sessions + 1h projet
* 19 Novembre  2018 – TP 8 – Authentification & Validation par email + 1h projet
* 26 Novembre  2018 - 3h projet
* 3  Décembre  2018 - 3h projet
* 10 Décembre  2018 - **soutenances du projet**

<!-- Peut-être cours un peu plus long que 1h -->

<!-- Introduction à Git/GitLab utile pour le travail collaboratif  -->
<!-- pour vos projets (PHP, S3, ...). -->

</section>
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
  Plus précisément c'est votre *navigateur Web* (Firefox, Chrome, Safari, IE,
  Edge, ...) qui est le client car c'est lui qui demande la page Web.

* Le *serveur* : Ce sont les ordinateurs qui délivrent les site Web aux
  internautes, c'est-à-dire aux clients.

<br>

<p style="text-align:center">
![Mécanisme client/serveur]({{site.baseurl}}/assets/ClientServeur.png)
<br>
Le client fait une *requête* que serveur, qui répond en donnant la page Web
</p>

</section>
<section>

## Protocole de communication : HTTP

**HTTP** (*HyperText Transfer Protocol*) est un protocole de communication
entre un client et un serveur développé pour le Web. L'une de ses fonctions
principales est ainsi de récupérer des pages Web.

**À quoi ressemble une requête HTTP ?**

La requête HTTP la plus courante est la requête GET. Par exemple pour demander
la page Web
[http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html](http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html)
:

```http
GET /~rletud/index.html HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr

```

 La réponse est alors:

```http
HTTP/1.1 200 OK
Date: Tue, 08 Sep 2015 13:32:19 GMT
Server: Apache/2.2.14 (Ubuntu)
Last-Modified: Tue, 08 Sep 2015 13:06:07 GMT
Accept-Ranges: bytes
Content-Length: 5781
Content-Type: text/html

<html><head>... (contenu de index.html)
```

<!-- Parler de réponse et découpage en en-tête et corps de la réponse -->

</section>
<section>

## Le navigateur comme client HTTP

<!-- Double rôle du navigateur qui fait client et interprète la page Web -->

Quand on ouvre une URL en `http://`, le navigateur va agir comme un client
HTTP. Il va donc envoyer une *requête HTTP*.
<!-- à l'hôte indiqué dans l'URL. -->

Le serveur HTTP renvoie une réponse HTTP qui contient la page Web
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
Cliquer sur un lien fait pareil que demander une page Web par la barre
d'adresse, cela envoie une requête HTTP.

</div>
</div>

</section>
<section>

## Écoutons le réseau

<!-- Ouvrir http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html dans le
navigateur en expliquant la requête et réponse -->

Ouvrons
[http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html](http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html)
en écoutant le réseau à l'aide des outils de développement (`F12` ou Menu Outils/Outils de développement puis onglet Réseau).

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

* Apache HTTP Server : classique, celui que l'on utilisera
* Apache TomCat : évolution pour Java (J2EE)
* IIS (Internet Information Services) : Microsoft
* Node.js : codé en JavaScript.

<br>

**En pratique** lors des TDs, nous utiliserons le serveur **HTTP** Apache de
  l'IUT (`webinfo`) et nous vous ferons installer des serveurs HTTP sur vos
  ordinateurs portables.

<!-- La pratique du serveur avec public_html, PB file://, installation chez eux -->

<br>
<br>

**Résumé :**

* Un serveur Web = un serveur **HTTP**


</section>
<section>

## Comment déposer une page Web sur le serveur HTTP de l'IUT ?

<br>

Il suffit de déposer vos fichiers HTML/CSS/PHP dans le dossier `public_html`
de votre répertoire personnel.

<br>
<br>

**Comment ça marche ?**

Quand vous demandez la page
[http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html](http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html),
le serveur HTTP (Apache) de l'IUT va rechercher la page `index.html` dans le
dossier `public_html` du répertoire personnel de `rletud`.

<!-- **Attention aux droits:** -->

</section>
<section>

# Pages Web statiques ou dynamiques

</section>
<section>

## Différence entre page statique/dynamique

* Les sites *statiques* :  
  Sites réalisés uniquement à l'aide de HTML/CSS.  
  Ils fonctionnent très bien mais leur contenu ne change pas en fonction du client.  
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
  2. le serveur crée la page spécialement pour le client (en suivant les instructions du PHP) ;
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

## Le langage de création de page Web : PHP

<div style="display:flex;align-items:center;">
<div style="flex-grow:1">
Le rôle de PHP est justement de générer du code HTML.

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
**Attention :** Les clients (navigateur) sont incapables de comprendre le code PHP : ils ne
connaissent que le HTML et le CSS.

<p style="text-align:center;">
<img src="{{site.baseurl}}/assets/OpenPHPInBrowser.jpg" alt="Quand on ouvre un .php directement dans le navigateur">
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

* ASP .NET : conçu par Microsoft, il exploite le framework .NET (C#).
* Ruby on Rails : ce framework s'utilise avec le langage Ruby.
* Django : il est similaire à Ruby on Rails, mais il s'utilise en langage
  Python.
* Java Server Pages : particulièrement utilisé dans le monde professionnel.

**Lequel est le meilleur ?**
Tout dépend de vos connaissances en programmation.

PHP se démarque de ses concurrents par une importante communauté qui peut vous
aider. C'est un langage facile à utiliser, idéal pour les débutants comme pour
les professionnels (Wikipédia, Yahoo et Facebook).

<p style="text-align:center">
<img src="{{site.baseurl}}/assets/ServerSideProgLang.png" alt="Popularité des langages côté serveur">  
Popularité des langages côté serveur
</p>

<!-- https://w3techs.com/technologies/overview/programming_language/all -->

</section>
<section>

# Un premier aperçu de PHP

</section>
<section>

## PHP comme langage de génération de pages Web

<br>

**PHP sert à créer des documents HTML :**

* Il prend donc en entrée un fichier `.php` qui contient de l'HTML et du PHP
* Il ressort un document HTML pur.
* Pour cela, il exécute les instructions PHP qui lui indique comment générer le
document en sortie.

<br>

**Remarque :** PHP peut en générer tout type de document, pas nécessairement du
  HTML.


</section>
<section>

## Votre premier fichier PHP

Document PHP en entrée :

```php
<?php
  echo "Hello World!";
?>
```

<br>

PHP s'exécute sur ce document et produit

```text
Hello World
```

<br>

**Explications :**

* Les balises ouvrantes `<?php` et fermantes `?>` doivent entourer le code PHP

* L'instruction `echo` a pour effet d'insérer du texte dans le document en sortie

<br>
<br>

**Démonstration avec la ligne de commande `php`**


</section>
<section>

## Imbrication de PHP dans le HTML 1/2

Le document `PHP` suivant

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

produira

```html
<!DOCTYPE html>
<html>
    <head>
        <title> Mon premier php </title>
    </head>
    <body>
      Bonjour
    </body>
</html>
```

</section>
<section>

## Imbrication de PHP dans le HTML 2/2

En fait, les deux fichiers suivants sont équivalents.  

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

```php
<?php
  echo "<!DOCTYPE html>";
  echo "<html>
      <head>
          <title> Mon premier php </title>
      </head>
      <body>";
  echo "Bonjour";
  echo "</body></html>"; ?>
```

En effet, ce qui est en dehors des balises PHP est écrit tel quel dans la page
Web générée (comme si on avait fait `echo`).

</section>
<section>

## Test de la page sur un serveur HTTP

* Enregistrons ce fichier PHP sur le serveur HTTP `webinfo` de l'IUT. Les
fichiers PHP se mettent dans le dossier `public_html` de votre répertoire
personnel.

* Vous pouvez alors y accéder à partir de l'URL
[http://webinfo.iutmontp.univ-montp2.fr/~loginIUT/](http://webinfo.iutmontp.univ-montp2.fr/~loginIUT/)
en remplaçant `loginIUT` par votre login.

<div class="incremental">
<div>
**Exemple :**

* On écrit le fichier `bonjour.php` suivant dans notre dossier `public_html`

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
  [http://webinfo/~loginIUT/bonjour.php](http://webinfo.iutmontp.univ-montp2.fr/~rletud/bonjour.php)
  pour voir la page générée

  ```text
  Bonjour
  ```

  **Note :** Regardez les sources pour voir la page complète.

</div>
</div>

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

<br>

* On peut créer le tableau case par case :

  ```php?start_inline=1
  $coordonnees['prenom'] = 'Marc';
  $coordonnees['nom'] = 'Assin';
  ```

  **NB :** En `PHP` les variables commencent par `$`

* Ou l'initialiser en une fois

  ```php?start_inline=1
  $coordonnees = array (
    'prenom' => 'Marc',
    'nom'    => 'Assin'  );
  ```


* Notez l'existence des boucles
  [`foreach`](http://php.net/manual/fr/control-structures.foreach.php) pour
  parcourir ces tableaux :

  ```php?start_inline=1
  foreach ($variable_tableau as $key => $value){
      //commandes
  }
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
1. En les écrivant dans l'URL

1. En utilisant le mécanisme **POST** des formulaires
<!-- </div> -->

</section>
<section>

## 1 - Les *query strings* dans l'URL

Une *URL* (Uniform Resource Locator) sert à représenter une adresse sur le Web.

<!-- ou plus généralement à identifier une ressource -->

* Une URL simple :

  <p style="text-align:center">
  <a href="http://romainlebreton.github.io/ProgWeb-CoteServeur/classes/class1.html#comment-faire-">
  <img alt="Exemple d'URL" src="{{site.baseurl}}/assets/URLSimple.png" width="900px">
  </a>
  </p>

  <!-- Protocole : ftp, http, file, ... -->
  <!-- nom de domain (ou IP) avec ou sans port -->
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

Quand un client demande `bonjour.php?nom=Assin&prenom=Marc` :

* PHP remplit le tableau `$_GET` avec

  ```php?start_inline=1
  $_GET["nom"] = "Assin";
  $_GET["prenom"] = "Marc";
  ```

* puis PHP exécute le script `bonjour.php`.

</section>
<section>

## Exemple de transmission en GET

<br>

Une 1ère page avec un lien contenant des informations dans son *query string*.

<div style="display:flex;align-items:center;">
<div style="flex-grow:1">
```html
<a href="bonjour.php?nom=Assin&prenom=Marc">
  Dis-moi bonjour !
</a>
```
</div>
<div style="flex-grow:1;display:inline;text-align:center;">
<a href="http://webinfo.iutmontp.univ-montp2.fr/~rletud/bonjour2.php?nom=Assin&prenom=Marc">Dis-moi bonjour !</a>
</div>
</div>

<br>
<br>

Quand on clique sur ce lien, on est renvoyé sur la page `bonjour.php` suivante

```php
<p>Bonjour <?php echo $_GET['prenom']; ?> !</p>
```

qui va s'exécuter pour créer la page Web

```html?start_inline=1
<p>Bonjour Marc !</p>
```

<br>

**En effet,** PHP aura rempli le tableau  `$_GET` avec

```php?start_inline=1
$_GET["nom"] = "Assin";
$_GET["prenom"] = "Marc";
```

avant de lancer le script `bonjour.php`.

</section>
<section>

## 2 - Les formulaires

<br>

On va voir qu'il y a deux types de formulaires :

* ceux dont les données sont envoyées avec la **méthode GET**

* ceux dont les données sont envoyées avec la **méthode POST**

</section>
<section>

## Les formulaires GET

Considérons le formulaire suivant et supposons que l'utilisateur ai tapé `MaDonnee`

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
<form method="get" action="http://webinfo.iutmontp.univ-montp2.fr/~rletud/traitement.php" style="display:inline">
<input type="text" name="nom_var" value="MaDonnee">
<input type="submit">
</form>
</div>
</div>

1. le clic sur le bouton `Valider` :
  * charge la page `traitement.php` (champ `action` du formulaire)
  * transmet ses informations dans le *query string*
  
2. donc le clic sur `Valider` charge l'URL `traitement.php?nom_var=MaDonnee`  
  On reconnaît le champ `name` du formulaire et ce qu'a rempli l'utilisateur

3. la page `traitement.php` suivante s'exécute avec le tableau
   `$_GET['nom_var']="MaDonnee";`

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
type **GET**.

<br>

En effet lorsque l'on valide le formulaire, le navigateur (client HTTP) envoie
la requête **HTTP** de type **GET** suivante

```http
GET /~rletud/traitement.php?nom_var=valeur HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr

```

<br>

C'est de cette manière que l'on demande une page Web généralement.

<br>

**Remarque:**

Les formulaires **GET** utilisent donc l'envoi de données dans le *query string*.

<!--
PREVOIR UNE DEMO AVEC LES OUTILS RESEAUX
-->

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
<form method="post" action="http://webinfo.iutmontp.univ-montp2.fr/~rletud/traitePost.php" style="display:inline">
<p style="margin:auto">
<input type="text" name="nom_var" value="MaDonnee">
<input type="submit">
</p>
</form>
</div>
</div>

**Différences :**

1. `method="post"`
1. la page chargée va être `traitePost.php` **sans *query string* ;**
2. les données du formulaire sont envoyées dans le **corps** d'une requête
   **HTTP** de type **POST** (*cf.* prochain slide) ;
3. On récupère les données dans le tableau PHP `$_POST`. 

   **Exemple :**

   Quand on clique sur `Valider`,  PHP fait

   ```php?start_inline=1
   $_POST["nom_var"] = "valeur"
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

<br>

<div style="display:flex;align-items:center">
<div style="flex-grow:1;">
**Démonstration avec l'outil *Réseaux* :**
</div>
<div style="flex-grow:1;text-align:center">
<form method="post" action="http://webinfo.iutmontp.univ-montp2.fr/~rletud/traitePost.php" style="display:inline">
<input type="text" name="nom_var" value="MaDonnee">
<input type="submit">
</form>
</div>
</div>

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

  * est plus propre car les valeurs ne sont plus affichées dans la barre d'adresse du navigateur

  * **Attention :**  
  ces informations **ne sont pas vraiment cachées** pour autant.

<!--
Note sur ù met-on le dollar 

$objet->attribut
$tableau[$index]
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

# Sources

**Sources :**

* [Open Classrooms - Concevez votre site web avec PHP et MySQL](https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql)
* [Documentation officielle de PHP](http://php.net/manual/fr/)

</section>
<section>

## Bonus : Émuler un client HTTP textuel

**Expérience amusante :**  
Même si le client HTTP le plus connu est votre navigateur, il est facile de
simuler un client HTTP autrement. La commande `telnet` permet d'envoyer du texte à
une machine distance. En envoyant le texte d'une requête HTTP à un serveur HTTP,
celui nous envoie sa réponse HTTP normalement.

**Exemple :**  

```http
> telnet webinfo.iutmontp.univ-montp2.fr 80
GET /~rletud/ HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr

```

nous répond

```http
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
```

Faites de même avec la requête POST précédente.

</section>
