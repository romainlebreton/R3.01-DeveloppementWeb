---
title: TD1 &ndash; Introduction à PHP
subtitle: Hello World, objets et formulaires
layout: tutorial
---

<!--
Reprendre le fil rouge de site de covoiturage
-->

<!--
Présentez les getter et setter génériques à l'aide de $objet->$attr_name
http://php.net/manual/en/language.oop5.php
-->

<!--
Need to URL decode $_GET ??
-->

## Méthodologie

Quelques consignes qui vous feront gagner beaucoup de temps en développement web:

1. PHP est un langage de programmation donc utilisez un environnement de
   développement. Vous ne codez pas du Java avec BlocNotes, c'est pareil pour
   PHP. Nous coderons donc notre PHP sous NetBeans à partir du TD2 (sauf si vous
   avez déjà votre éditeur préféré).

   **Exceptionnellement** pour ce TD, utilisez un éditeur de base comme
    *gedit* ou *notepad++*. Ainsi, nous n'aurons pas l'impression que la grosse machinerie
    qu'est NetBeans nous cache trop de choses.
     
2. Ne copiez **jamais** vos fichiers à plusieurs endroits.
3. Merci de **ne pas** imprimer ce TP.

## Accédez à vos pages web

Nous avons vu lors du [cours 1]({{site.baseurl}}/classes/class1.html) le
[fonctionnement du WWW sur le modèle de client & serveur HTTP]({{site.baseurl}}/classes/class1.html#le-fonctionnement-du-world-wide-web). Mettons
en pratique tout cela !

### Une page HTML de base

1. Créez une page **page1.html** avec le contenu suivant et enregistrez la dans
le répertoire **public_html** de votre espace personnel.

   ```html
   <!DOCTYPE html>
   <html>
       <head>
           <title> Insérer le titrer ici </title>
       </head>
   
       <body>
           Un problème avec les accents à é è ?
           <!-- ceci est un commentaire -->
       </body>
   </html>
   ```

1. Ouvrez cette page dans le navigateur directement en double-cliquant dessus
   directement depuis votre gestionnaire de fichiers.
   Notez l'URL du fichier :
   [file://chemin_de_mon_compte/public_html/page1.html](file://chemin_de_mon_compte/public_html/page1.html).

   **Que fait le gestionnaire de fichier quand on double-clique ?**  
   **Que signifie le *file* au début de l'URL ?**  
   **Est-ce que la page HTML s'affiche correctement ?**  
   **Est-ce qu'il y a une communication entre un serveur et un client HTTP ?**
   
   * **Rappel : Un problème avec les accents ?**
     Dans l'en-tête du fichier HTML vous devez rajouter la ligne qui spécifie
     l'encodage
   
     ```html
     <meta charset="utf-8" />
     ```
     Il faut que vos fichiers soient enregistrés avec le même encodage. UTF-8 est
     souvent l'encodage par défaut, mais les éditeurs de texte offrent généralement
     le choix de l'encodage lors du premier enregistrement du fichier.

2. **[Vous souvenez-vous]({{site.baseurl}}/classes/class1.html#test-de-la-page-sur-un-serveur-http)
   comment fait-on pour qu'une page Web soit servie par le serveur HTTP de l'IUT
   (sur
   [webinfo.iutmontp.univ-montp2.fr](http://webinfo.iutmontp.univ-montp2.fr))
   ?**

   * Les pages Web doivent être enregistrées dans le dossier **public_html** de
   votre répertoire personnel.

   * Le serveur HTTP de l'IUT servira vos pages Web à l'adresse suivante
     [http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page1.html](http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page1.html)

   **Ouvrez donc** `page1.html` depuis le navigateur en tapant l'URL dans la
   barre d'adresse.
   
   **Est-ce que la page HTML s'affiche correctement ?**  
   **Est-ce qu'il y a une communication entre un serveur et un client HTTP maintenant ?**

   <br>

   **Aide : Un problème de droit ?**  
   Pour pouvoir servir vos pages, le serveur HTTP (Apache) de l'IUT doit avoir
   le droit de lecture des pages Web (permission `r--`) et le droit de traverser
   les dossiers menant à la page Web (permission `--x`). À
   l'IUT, la gestion des droits se fait par les ACL.  
   Pour donner les droits à l'utilisateur www-data (Apache), utilisez la commande
   `setfacl` dans un terminal sous Linux :

   * `setfacl -m u:www-data:--x nom_du_répertoire`  pour chaque répertoire
     menant à votre page Web.
     
   * Puis `setfacl -m u:www-data:r-- nom_de_la_page_Web`

   **Note :** Les ACL permettent d'avoir des droits spécifiques à plusieurs
   utilisateurs et à plusieurs groupes quand les droits classiques sont limités
   à un utilisateur et un groupe. Pour lire les droits ACL d'un fichier ou
   dossier, on tape `getfacl nom_du_fichier`.

### Notre première page PHP

4. Créez une page `echo.php` avec le contenu suivant.  
   Pour ne pas que votre **public_html** devienne une décharge de pages Web à ciel
   ouvert, créez des répertoires pour les cours et les TDs. Nous vous
   conseillons donc d'enregistrer `echo.php` dans
   `.../public_html/PHP/TD1/echo.php`.

   ```php
   <!DOCTYPE html>
   <html>
       <head>
           <meta charset="utf-8" />
           <title> Mon premier php </title>
       </head>
   
       <body>
           Voici le résultat du script PHP : 
           <?php
             // Ceci est un commentaire PHP sur une ligne
             /* Ceci est le 2ème type de commentaire PHP
             sur plusieurs lignes */
           
             // On met la chaine de caractères "hello" dans la variable 'texte'
             // Les noms de variable commencent par $ en PHP
             $texte = "hello world !";

             // On écrit le contenu de la variable 'texte' dans la page Web
             echo $texte;
           ?>
       </body>
   </html> 
   ```

5. Ouvrez cette page dans le navigateur directement depuis votre gestionnaire de
fichiers OU de façon équivalente avec une URL en `file://` comme :  
[file://chemin_de_mon_compte/public_html/PHP/TD1/echo.php](file:///home/ann2/mon_login_IUT/public_html/PHP/TD1/echo.php).

   **Que se passe-t-il quand on ouvre un fichier PHP directement dans le navigateur ?**  
   **Pourquoi ?**  
   *Ça vous rappelle le [cours 1]({{site.baseurl}}/classes/class1.html#le-langage-de-cration-de-page-web--php) j'espère ?* 

6. Ouvrez cette page dans le navigateur dans un second onglet en passant par le
   serveur HTTP de l'IUT :  
   [http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/echo.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/echo.php)

   **Que se passe-t-il quand on demande un fichier PHP à un serveur HTTP ?**  
   **Regardez les sources de la page Web (Clic droit, code source ou `Ctrl-U`)
     pour voir ce qu'a vraiment généré PHP**.  
   *N'hésitez pas à relire la partie du
    [cours 1 concernée]({{site.baseurl}}/classes/class1.html#mcanisme-de-gnration-des-pages-dynamiques-22).*

## Les bases de PHP

### Différences avec Java

2. Le code PHP doit être compris entre la balise ouvrante `<?php` et la balise fermante `?>`
2. Les variables sont précédées d'un `$`
1. Pas de typage des variables

### Les chaînes de caractères

1. Les chaînes de caractères avec ***double quote* `"`** peuvent contenir :
   * des variables (qui seront remplacées par leur valeur),
   * des sauts de lignes,
   * des caractères spéciaux (tabulation `\t`, saut de ligne `\n`).
   * Les caractères protégés sont `"`, `$` et `\` qui doivent être échappés avec
   un anti-slash `\` comme ceci : `\"`, `\$` et `\\`;
   
   **Exemple :**

   ```php?start_inline=1
   $prenom="Helmut";
   echo "Bonjour $prenom,\n ça farte ?";
   ```
  
   donne
   
   ```text
   Bonjour Helmut,
   ça farte ?
   ```
  
   **Astuce :** En cas de problèmes avec le remplacement de variables, rajoutez
   des accolades autour de la variable à remplacer. Cela marche aussi bien pour
   les tableaux `"{$tab[0]}"`, les attributs `"{$objet->attribut}"` et les
   fonctions `"{$objet->fonction()}"`.
   
2. Les chaînes de caractères avec ***simple quote* `'`** sont conservées telles
quelles (pas de remplacement, de caractères spéciaux ...). Les caractères
protégés sont `'` et `\` qui doivent être échappés avec un anti-slash comme ceci
`\'` et `\\`;

   **Exemple :**

   ```php?start_inline=1
   echo 'Bonjour $prenom,\n ça farte ?';
   ```
  
   donne
   
   ```text
   Bonjour $prenom,\n ça farte ?
   ```

3. La concaténation de chaînes de caractères se fait avec l'opérateur point `.`  
   **Exemple :**

   ```php?start_inline=1
   $texte = "hello" . 'World !';
   ```

**Documentation :**
  [Les chaînes de caractères sur PHP.net](http://php.net/manual/fr/language.types.string.php)

### Le `echo` *here document*

Il existe un `echo` sur plusieurs ligne très pratique

```php?start_inline=1
$prenom="Helmut";
echo <<< EOT
Texte à afficher
sur plusieurs lignes
avec caractères spéciaux \t \n
 et remplacement de variables $prenom
les caractères suivants passent : " ' $ / \ ;
EOT;
```

Cette syntaxe s'intitule le "here document" et permet d'afficher plusieurs
lignes avec les mêmes caractéristiques que les chaînes entre *double quote*.
Notez que la fin de la syntaxe doit apparaître **au début d'une nouvelle ligne** (pas d'espaces avant),
avec uniquement un point-virgule, et **pas d'espace de plus à la fin** !

Par exemple le code PHP précédent génère

```text
Texte à afficher
sur plusieurs lignes
avec caractères spéciaux 	 

 et remplacement de variables Helmut
les caractères suivants passent : " ' $ / \ ;
```

**Documentation :**
  [Syntaxe Heredoc sur PHP.net](http://php.net/manual/fr/language.types.string.php#language.types.string.syntax.heredoc)

### Affichage pour le débogage

Les fonctions `print_r` et `var_dump` affichent les informations d'une variable
et sont très utiles pour déboguer notamment les tableaux ou les objets.  
La différence est que `print_r` est plus lisible car `var_dump` affiche plus de
choses (les types).

### Require

PHP a plusieurs façons d'inclure un fichier :

* `require` : inclut et exécute le fichier spécifié en argument. Renvoie une
  erreur si le fichier n'existe pas.

* `require_once` : fait de même que `require` mais la différence est que si le
  code a déjà été inclus, il ne le sera pas une seconde fois.  
  Ceci est particulièrement utile pour inclure une classe car cela assure qu'on
  ne l'inclura pas deux fois.

Notez qu'il existe `include` et `include_once` qui ont le même effet mais
n'émettent qu'un warning si le fichier n'est pas trouvé (au lieu d'une erreur).


### Les tableaux associatifs

Les tableaux en PHP peuvent aussi s'indexer par des entiers ou des chaînes de caractères :

* Pour créer un tableau vide, on utilise la syntaxe

  ```php?start_inline=1
  $mon_tableau = array();
  ```

* On peut créer le tableau case par case :

  ```php?start_inline=1
  $coordonnees['prenom'] = 'François';
  $coordonnees['nom'] = 'Dupont';
  ```

  **Note :** Le tableau `$coordonnees` contient plusieurs associations. Par
    exemple, il associe à la chaîne de caractères `'prenom'` la chaîne de
    caractères `'François'`.  
  Dans cette association, `'prenom'` s'appelle la **clé** (ou **index**) et
`'François'` la **valeur**.

* On peut aussi initialiser le tableau comme ceci

  ```php?start_inline=1
  $coordonnees = array (
    'prenom' => 'François',
    'nom'    => 'Dupont'  );
  ```


* Notez l'existence des boucles
  [`foreach`](http://php.net/manual/fr/control-structures.foreach.php) pour
  parcourir les paires clé/valeur des tableaux. La boucle `foreach` va boucler
  sur les associations du tableau. Pour chaque association, `foreach` va mettre
  la clé de l'association dans la variable `$cle` et la valeur dans `$valeur`
  puis exécuter les commandes.

  ```php?start_inline=1
  foreach ($mon_tableau as $cle => $valeur){
      //commandes
  }
  ```

  **Remarque :** La boucle `foreach` est indispensable pour parcourir les
  indices et valeurs d'un tableau indexé par des chaînes de caractères.  
  Il existe aussi bien sûr une boucle `for` classique si le tableau est indexé
  uniquement par des entiers

  ```php?start_inline=1
  for ($i = 0; $i < count($mon_tableau); $i++) {
      echo $mon_tableau[$i];
  }
  ```

* On peut rajouter facilement un élément "à la fin" d'un tableau avec

  ```php?start_inline=1
  $mon_tableau[] = "Nouvelle valeur";
  ```

**Source :** [Les tableaux sur php.net](http://php.net/manual/fr/language.types.array.php)

<!-- ### Les structures de contrôle -->

<!-- Syntaxe alternative -->
<!-- http://php.net/manual/fr/control-structures.alternative-syntax.php -->

### Exercice d'application

1. Dans votre fichier `echo.php`, créez trois variables `$marque`, `$couleur` et
`$immatriculation` contenant des chaînes de caractères de votre choix ;

2. Créez la commande PHP qui écrit dans votre fichier le code HTML suivant (en
   remplaçant bien sûr la marque par le contenu de la variable `$marque` ...) :

   ```html
   <p> Voiture 256AB34 de marque Renault (couleur bleu) </p>
   ```

3. Faisons maintenant la même chose mais avec un tableau associatif `voiture`:

   * Créez un tableau `$voiture` contenant trois clés `"marque"`, `"couleur"` et
   `"immatriculation"` et les valeurs de votre choix ;

   * Utilisez l'un des affichages de débogage (*e.g.* `var_dump`) pour vérifier
     que vous avez bien rempli votre tableau ;

   * Affichez le contenu de la "voiture-tableau" au même format HTML 

   ```html
   <p> Voiture 256AB34 de marque Renault (couleur bleu) </p>
   ```

4. Maintenant nous souhaitons afficher une liste de voitures :

   * Créez une liste (un tableau indexé par des entiers) `$voitures` de quelques
     "voitures-tableaux" ;

   * Utilisez l'un des affichages de débogage (*e.g.* `var_dump`) pour vérifier
     que vous avez bien rempli  `$voitures` ;

   * Modifier votre code d'affichage pour écrire proprement en HTML un titre
     "Liste des voitures :" puis une liste (`<ul>`) contenant les informations
     des voitures.

   * Rajoutez un cas par défaut qui affiche "Il n'y a aucune voiture." si la
     liste est vide.  
     (On vous laisse chercher sur internet la fonction qui teste si un tableau est vide)

<!-- empty -->


## La programmation objet en PHP

PHP était initialement conçu comme un langage de script, mais est passé Objet à partir de la
version 5. Plutôt que d'utiliser un tableau, créons une classe pour nos voitures.

### Un exemple de classe PHP

1. Créer un fichier **Voiture.php** avec le contenu suivant

   ```php
   <?php
   class Voiture {
   
     private $marque;
     private $couleur;
     private $immatriculation;
      
     // un getter      
     public function getMarque() {
          return $this->marque;  
     }
     
     // un setter 
     public function setMarque($marque2) {
          $this->marque = $marque2;
     }
      
     // un constructeur
     public function __construct($m, $c, $i)  {
      $this->marque = $m;
      $this->couleur = $c;
      $this->immatriculation = $i;
     } 
           
     // une methode d'affichage.
     public function afficher() {
       // À compléter dans le prochain exercice
     }
   }
   ?>
   ```

2. Notes les **différences avec Java** :

   * Pour accéder à un attribut ou une fonction d'un objet, on utilise le `->`
     au lieu du `.`
   * Le constructeur ne porte pas le nom de la classe, mais s'appelle
     `__construct()`. Et on a le droit à au plus un constructeur, qu'on pourra
     éventuellement appeler avec un sous-ensemble de paramètres.

3. Créez des *getter* et des *setter* pour `$couleur` et `$immatriculation` ;

3. L'intérêt des *setter* est notamment de vérifier ce qui va être écrit dans
   l'attribut. Limitez par exemple les immatriculations à 8 caractères en
   modifiant le *setter* correspondant
   ([Documentation PHP : strlen](http://php.net/manual/fr/function.strlen.php)).

4. Remplissez `afficher()` qui permet d'afficher les informations de la voiture courante (regardez le code du constructeur de la classe Voiture : comme en Java, on peut utiliser le mot-clé `this` mais suivi de `->`) ;

5. Testez que votre classe est valide pour PHP : la page générée par le serveur
   Web `webinfo` à partir de `Voiture.php` ne doit pas afficher d'erreur.  
   **Demandez donc** votre page à `webinfo`
   [http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/Voiture.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/Voiture.php)

### Utilisation de la classe `Voiture`

1. Créez un fichier **testVoiture.php** contenant le squelette HTML classique (`<html>`,`<head>`,`<body>` ...)

2. Dans la balise `<body>`, on va vouloir créer des objets `Voiture` et les afficher :

   * Incluez `Voiture.php` à l'aide de `require_once` comme vu précédemment ;

   * Initialisez une variable `$voiture1` de la classe `Voiture` avec la même
     syntaxe qu'en Java ;

   <!-- $voiture1 = new Voiture('Renault','Bleu','256AB34');  -->

   * Affichez cette voiture à l'aide de sa méthode `afficher()` .

3. Testez votre page sur `webinfo` :  
   [http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/testVoiture.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD1/testVoiture.php)
   

## Interaction avec un formulaire

1. Créez un fichier **formulaireVoiture.html**, réutilisiez l'entête du fichier
   **echo.php** et dans le body, insérez le formulaire suivant:

   ```html
   <form method="get" action="creerVoiture.php">
     <fieldset>
       <legend>Mon formulaire :</legend>
       <p>
         <label for="immat_id">Immatriculation</label> :
         <input type="text" placeholder="Ex : 256AB34" name="immatriculation" id="immat_id" required/>
       </p>
       <p>
         <input type="submit" value="Envoyer" />
       </p>
     </fieldset> 
   </form>
   ```

2. Souvenez-vous (ou relisez le
   [cours 1]({{site.baseurl}}/classes/class1.html)) de la signification des
   attributs `action` de `<form>` et `name` de `<input>`

   <!-- L'attribut important des `<input type="text">` est `name="marque"` qui indique -->
   <!-- que ce que vous taperez dans ce champ texte sera associé au nom de variable -->
   <!-- `marque`. -->

   **Rappels supplémentaires :**

   * L'attribut `for` de `<label>` doit contenir l'identifiant d'un champ
    `<input>` pour que un clic sur le texte du `<label>` vous amène directement
    dans ce champ.

   * l'attribut `placeholder` de `<input>` sert à écrire une valeur par défaut pour aider l'utilisateur.

3. Créez des champs dans le formulaire pour pouvoir rentrer la marque et la couleur de la voiture.

4. Souvenez-vous (ou relisez le
   [cours 1]({{site.baseurl}}/classes/class1.html)) de ce que fait un clic sur le bouton **"Envoyer"**.  
   Vérifiez en cliquant sur ce bouton.
   
   **Comment sont transmises les informations ?**  
   **Comment s'appelle la partie de l'URL contenant les informations ?**


5. Créez un fichier `creerVoiture.php` :

   1. Aidez-vous si nécessaire du [cours 1]({{site.baseurl}}/classes/class1.html)
   pour savoir comment récupérer l'information envoyée par le formulaire.
   1. Vérifiez que `creerVoiture.php` reçoit bien des informations dans le *query
   string*. Pour cela, vérifiez que le tableau `$_GET` n'est pas vide.
   1. En reprenant du code de `testVoiture.php`, faites que `creerVoiture.php`
   affiche les informations de la voiture envoyée par le formulaire.
   1. Bien sûr, **testez votre page** en la demandant à `webinfo`.

6. Afin d'éviter que les paramètres du formulaire n'apparaissent dans l'URL, modifiez 
   le formulaire pour qu'il appelle la méthode POST :

   ```html
   <form method="post" action="creerVoiture.php">
   ```
   
   et côté `creerVoiture.php`, mettez à jour la récupération des paramètres.

7. 1. Souvenez-vous (ou relisez le
   [cours 1](({{site.baseurl}}/classes/class1.html))) de par où passe
   l'information envoyée par un formulaire de méthode POST ;
   1. Changez `creerVoiture.php` pour récupérer l'information envoyée par le formulaire ;
   1. Essayez de
   [**retrouver l'information envoyée par le formulaire**]({{site.baseurl}}/classes/class1.html#coutons-le-rseau)
   avec les outils de développement (Onglet Réseau).

   
## Les bases d'un site de covoiturage

Vous allez programmer les classes d'un site de covoiturage, dont voici la description d'une version
minimaliste:

* **Utilisateur :** Un utilisateur possède des champs propres `(login, nom,
prénom)`
* **Trajet :** Une annonce de trajet comprend :
1. un identifiant unique `id`,
1. les détails d'un trajet (un point de départ `depart` et un point d’arrivée
`arrivee`),
1. des détails spécifiques à l’annonce comme une date de départ `date`,
1. un nombre de places disponibles `nbplaces`,
1. un prix `prix`,
1. et le login du conducteur `conducteur_login`,

**Astuce :** Pour éviter de taper 7 *getters*, 7 *setters* et un constructeur
  avec 7 arguments pour `Trajet`, nous allons coder :

1. des *getters* génériques `get($nom_attribut)` qui renvoient l'attribut de nom
`$nom_attribut`. Utilisez la syntaxe suivante pour accéder à l'attribut de nom
`$nom_attribut` de l'objet `$objet` :

   ```php?start_inline=1
   $objet->$nom_attribut
   ```
1. des *setters* génériques `set($nom_attribut, $valeur)` ;
1. un constructeur `__construct($data)` qui prend un tableau dont les index
   correspondent aux attributs de la classe.

## Installez un serveur Apache chez vous

Nous vous conseillons d'installer Apache + PhP + MySql + PhpMyAdmin sur votre machine perso,
ce sera très utile pour la suite et notamment pour le projet.

**Installation :**

* sous Linux : Au choix

  * XAMP  
    [https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-ordinateur-2#r-911385](https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-ordinateur-2#r-911385)
    <!-- MariaDb (Open Source fork of MySQL) -->
  * LAMP  
    [https://doc.ubuntu-fr.org/lamp](https://doc.ubuntu-fr.org/lamp)  
    Vérifiez que vous installez bien aussi `phpmyadmin` et que vous activez le
    module Apache `userdir` pour pouvoir mettre vos pages Web dans `public_html`.
  
  <!-- Penser à activer PHP pour les userdir dans php*.conf -->
  
* sous Mac OS X (MAMP) :  
  [https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-ordinateur-2#r-911335](https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-ordinateur-2#r-911335)
  
* Sous Windows (WAMP) :  
  [https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-ordinateur-2#r-911305](https://openclassrooms.com/courses/concevez-votre-site-web-avec-php-et-mysql/preparer-son-ordinateur-2#r-911305)
  

**Attention**, pensez à modifier le php.ini pour mettre `display_errors = On` et
`error_reporting = E_ALL`, pour avoir les messages d'erreurs. Car par défaut, le
serveur est configuré en mode production (`display_errors = Off`). Il faut
redémarrer Apache pour que les modifications soient prises en compte.

<!-- Si ça ne marche pas, c'est que l'on édite pas le bon php.ini . Afficher la
configuration vec phpinfo() pour trouver le php.ini qui est utilisé -->


<!--
Nombre d'arguments variable
http://php.net/manual/fr/functions.arguments.php#functions.variable-arg-list

... en PHP 5.6+

utilisé dans la fonction comme un tableau
function sum(...$numbers) { ...}

à l'inverse, tableau vers liste d'arguments 
add(...[1, 2])

-->
