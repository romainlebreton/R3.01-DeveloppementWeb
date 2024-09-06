---
title: TD1 &ndash; Introduction à PHP
subtitle: Hello World, objets et formulaires
layout: tutorial
lang: fr
---

<!--
Présentez les getter et setter génériques à l'aide de $objet->$attr_name
http://php.net/manual/en/language.oop5.php
-->

<!--
Need to URL decode $_GET ??
-->

Bienvenus dans le premier TD de PHP, qui vous fera découvrir un serveur Web sous
Docker, initialiser le dépôt Git de vos TDs, utiliser PhpStorm, apprendre les
bases du langage PHP et exécuter vos premiers scripts PHP.

## Mettre en place un serveur Web sous Docker

Commençons par vous faire découvrir un serveur Web sous Docker. 


<div class="exercise">

Allez sur la page du [dépôt *Serveur Web
Docker*](https://gitlabinfo.iutmontp.univ-montp2.fr/Enseignants-Web/docker/-/blob/main/README.md),
et faites le tutoriel d'installation et de configuration qui se trouve dans la
partie `Tutoriel` > `Premier contact`. Vous ne devez normalement pas y passer
plus de 30 minutes.

</div>

## Git et IDE pour PHP

### Configuration de Git

Ce cours de PHP est aussi l'occasion de continuer à manipuler le gestionnaire de version
Git, qui conversera la chronologie de toutes vos modifications. Commençons par
nous assurer que Git est bien configuré sur vos machines.

<div class="exercise">

1. Nous allons configurer Git pour qu'il connaisse votre nom et votre adresse
   email (**étudiante**), ce qui sera utile quand vous travaillerez en groupe pour savoir qui a
   enregistré quelle modification :

   ```bash
   git config --global user.name "Votre Prénom et Nom"
   git config --global user.email "votreemail@etu.umontpellier.fr"
   ```
   
   <!-- 
   1. Pour nous simplifier la vie plus tard, veuillez exécuter la commande
   suivante. Cela change l'éditeur de texte qu'ouvre Git par défaut.
   
   ```shell
   git config --global core.editor "gedit --new-window -w"
   ``` 
   -->

1.  Au cas où vous utilisez le protocole HTTPS pour vous connecter à un dépôt
    Git, vous aurez besoin d'exécuter d'abord la commande suivante pour que `git
    clone` marche.
      
      ```bash
	   # Pour anticiper une erreur due aux certificats de l'IUT
	   #              "server certificate verification failed"
	   git config --global http.sslverify false
      ```
    **Remarque :** nous vous recommandons de vous connecter à vos dépôts Git par SSH.

</div>

Vous allez maintenant créer votre copie du dépôt Git des TDs PHP afin de pouvoir
enregistrer vos modifications dedans.

<div class="exercise">

1. Allez sur la [page web du dépôt Git initial des TDs PHP](https://gitlabinfo.iutmontp.univ-montp2.fr/Enseignants-Web/tds-php).
2. Créez votre copie du dépôt en cliquant en haut à droite sur le bouton *Fork*.
3. Dans *Project URL*, changer *Select a namespace* par votre login IUT, puis cliquez sur *Fork project* en bas de la page.
4. (Optionnel mais recommandé) Si vous êtes sur une nouvelle machine, recréez
   une clé SSH et déposez-la sur GitLab en reprenant [le tout début du tutoriel
   Git de 1ère
   année](https://gitlabinfo.iutmontp.univ-montp2.fr/valicov/tutoGit1ereAnnee#cr%C3%A9ation-dun-compte-gitlab). 
4. Sur la page de votre fork, copiez l'adresse pour cloner le dépôt que l'on trouve en cliquant sur le bouton bleu *Code*.
5. Depuis un terminal dans le dossier `~/public_html`, faites `git clone` de l'adresse de la question précédente.

</div>

### PhpStorm

PHP est un langage de programmation donc utilisez un environnement de
développement. Vous ne codez pas du Java avec BlocNotes, c'est pareil pour
PHP. Nous coderons donc notre PHP sous PhpStorm de la suite logicielle JetBrains (comme Intellij Idea).

Si vous utilisez un portable fourni par l'IUT, PhpStorm est déjà installé.
Sinon, installez-le à l'aide de ces [instructions dans les compléments du
TD1]({{site.baseurl}}/assets/tut1-complement.html#installer-phpstorm-sur-sa-machine).

#### Cloner un dépôt Git sous PhpStorm

<div class="exercise">

1. Lancez PhpStorm. 
   <!-- Sur les portables fournis par l'IUT, vous pouvez exécuter 
   ```bash
   ~/RepertoireCourant$  cd /opt/phpstorm/bin
   /opt/phpstorm/bin$  ./phpstorm.sh
   ``` -->
2. Connectez-vous pour activer la licence académique que vous avez eu l'an dernier. Pour la
   retrouver, connectez-vous au [site de
   JetBrains](https://account.jetbrains.com/licenses).  
   **Sinon**, remplissez [ce formulaire](https://www.jetbrains.com/shop/eform/students) en utilisant votre adresse universitaire pour bénéficier d'une licence académique.  
   Quelques minutes après, vous recevrez un email de confirmation suivi d'un
   second email d'activation où vous devrez accepter les conditions
   d'utilisation et choisir un nom d'utilisateur et un mot de passe. Conservez
   précieusement ces informations, car c'est grâce à elles que vous pourrez
   importer votre licence sur toutes les machines que vous allez utiliser (chez
   vous, à l'IUT etc).
3. Cliquez en haut à droite sur *Open* puis sélectionnez le dossier `tds-php/TD1` (qui deviendra un projet PHPStorm).
</div>

**Documentations de PhpStorm**

* [Documentation officielle en anglais](https://www.jetbrains.com/help/phpstorm/quick-start-guide-phpstorm.html)
* [Documentation à l'IUT de Intellij Idea](https://gitlabinfo.iutmontp.univ-montp2.fr/dev-objets/TP2) (proche de PhpStorm)

**Autre IDE**

Si vous le souhaitez fortement, vous pouvez aussi utiliser d'autres IDE. 
VSCode est une bonne alternative, mais il manque des fonctionnalités PHP. 
Notez cependant que nous n'assurons pas le support d'autres IDE.  

## Accédez à vos pages web

Nous avons vu lors du [cours 1]({{site.baseurl}}/classes/class1.html) le
[fonctionnement du World Wide Web sur le modèle de client & serveur HTTP]({{site.baseurl}}/classes/class1.html#le-fonctionnement-du-world-wide-web). Mettons
en pratique tout cela !

### Une page HTML de base

<div class="exercise">

1. Le dépôt Git contient la page `public_html/tds-php/TD1/page1.html` suivante
   ```html
   <!DOCTYPE html>
   <html>
       <head>
           <title> Insérer le titrer ici </title>
           <meta charset="utf-8" />
       </head>
   
       <body>
           Un problème avec les accents à é è ?
           <!-- ceci est un commentaire -->
       </body>
   </html>
   ```
   
2. Ouvrez le dossier `public_html/tds-php/TD1` avec le gestionnaire de fichier puis double-cliquez sur `page1.html` pour l'ouvrir dans votre navigateur.
   Remarquez que l'URL de la page est
   [file://.../public_html/tds-php/TD1/page1.html](file://.../public_html/tds-php/TD1/page1.html).

   **Que fait le gestionnaire de fichier quand on double-clique ?**  
   **Que signifie le *file* au début de l'URL ?**  
   <!-- **Est-ce que la page HTML s'affiche correctement ?**   -->
   **Est-ce qu'il y a une communication entre un serveur et un client HTTP ?**
   
   **Réponses (surlignez le texte caché à droite):** 
   <span style="color:#FCFCFC">
   Le gestionnaire de fichier ouvre page1.html dans le navigateur en tant que fichier local. Autrement dit, le navigateur va lire le fichier page1.html directement sur le disque dur. C'est la signification de file au début de l'URL. Du coup, le navigateur n'envoie pas de requête HTTP, et n'attends pas de réponse en retour. 
   <!-- La page s'affiche correctement. -->
   </span>

   <!-- * **Rappel : Un problème avec les accents ?**
     Dans l'en-tête du fichier HTML vous devez rajouter la ligne qui spécifie
     l'encodage
   
     ```html
     <meta charset="utf-8" />
     ```
     Il faut que vos fichiers soient enregistrés avec le même encodage. UTF-8 est
     souvent l'encodage par défaut, mais les éditeurs de texte offrent généralement
     le choix de l'encodage lors du premier enregistrement du fichier. -->

3. **[Vous souvenez-vous]({{site.baseurl}}/classes/class1.html#comment-dposer-une-page-web-sur-le-serveur-http-de-liut-)
   comment fait-on pour qu'une page Web soit servie par 
   le serveur HTTP de Docker
   (à l'URL
   [http://localhost/tds-php/TD1/page1.html](http://localhost/tds-php/TD1/page1.html))
   ?**
   <!-- le serveur HTTP de l'IUT
   (à l'URL
   [http://localhost_IUT/TD1/page1.html](http://localhost_IUT/TD1/page1.html))
   ?** -->

   **Réponse :**
   <span style="color:#FCFCFC">
   Les pages Web doivent être enregistrées dans le dossier **public_html** de
   votre répertoire personnel.
   </span>

   **Ouvrez donc** `page1.html` depuis le navigateur en tapant l'URL dans la
   barre d'adresse.
   
   **Est-ce qu'il y a une communication entre un serveur et un client HTTP maintenant ?**  
   **Comment fait-on pour voir la page Web brute (code source), et non son rendu HTML par le navigateur ?**    
   **Réponses (surlignez le texte caché à droite):** 
   <span style="color:#FCFCFC">
   Cette fois-ci, l'URL commence par *http* et donc le navigateur envoie une requête HTTP à l'URL demandée. Le navigateur reçoit une réponse HTTP qui contient une page HTML. Puis, le navigateur affiche le rendu HTML de la page. Pour voir le code source HTML, il faut faire un clic droit sur la page, puis *Affichez le code source* (ou **Ctrl+U**).
   </span>
   
</div>

<!-- ### Droits d'accès des pages Web   

Votre page ne s'affiche peut-être pas à cause d'un problème de droit. Pour
pouvoir servir vos pages, le serveur HTTP doit avoir le droit de lecture des
pages Web (permission `r--`) et le droit de traverser les dossiers menant à la
page Web (permission `--x`).

Le conteneur Docker tourne sous Linux donc nous utiliserons les droits Linux. Le
serveur Web exécute le logiciel Apache avec le nom d'utilisateur `www-data`. Les
droits Linux de base sont donnés soit à tous les utilisateurs, soit
spécifiquement à l'utilisateur ou groupe propriétaire du fichier. Plutôt que
de donner les droits `rwx` sur vos pages Web à tous les utilisateurs, nous allons
rajouter les droits d'accès uniquement à `www-data` en utilisant un système de
droits plus avancé de Linux : les Access control lists (ACLs).

1. Pour exécuter une commande dans un terminal au sein d'un conteneur Docker,
   allez dans l'onglet gauche *Containers* de Docker Desktop, cliquez sur les trois points ⋮ de votre conteneur, puis `>_ Open in terminal`

   ![OpenInTerminal](../assets/TD1/OpenInTerminal.png){: .blockcenter}

1. Exécutez les commandes suivantes : 

   ```bash
   # On modifie (-m) récursivement (-R) les droits r-x
   # de l'utilisateur (u:) www-data
   setfacl -R -m u:www-data:r-x /var/www/html
   # On fait de même avec des droits par défaut (d:)
   # (les nouveaux fichiers prendront ces droits)
   setfacl -R -m d:u:www-data:r-x /var/www/html
   ```

   Astuce : Exécutez préalablement la commande `bash` pour retrouver votre shell habituel `bash` (autocomplétion avec `Tab`, prompt de la forme `username@hostname:current_path#`).

Pour donner les bons droits à l'utilisateur `www-data` du serveur Web Apache,
utilisez la commande `setfacl` dans un terminal sous Linux :

**Note :**  Pour lire les droits ACL d'un fichier ou
dossier, on tape `getfacl nom_du_fichier`. -->

<!-- Attention, il peut rester un dernier problème avec les mask -->

### Notre première page PHP

<div class="exercise">

4. Le dépôt Git contient la page `public_html/tds-php/TD1/echo.php` suivante

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
[file://.../public_html/TD1/echo.php](file:///.../public_html/TD1/echo.php).

   **Que se passe-t-il quand on ouvre un fichier PHP directement dans le navigateur ?**  
   **Pourquoi ?**  
   *Ça vous rappelle le [cours 1]({{site.baseurl}}/classes/class1.html#le-langage-de-cration-de-pages-web--php) j'espère ?*  
   **Réponses (surlignez le texte caché à droite):** 
   <span style="color:#FCFCFC">
   Un navigateur ne sait que faire d'un script PHP. Du coup, soit il vous demande comment l'ouvrir, soit il le télécharge directement.
   </span>

6. Ouvrez cette page dans le navigateur dans un second onglet en passant par le
   serveur HTTP de Docker :  
   [http://localhost/tds-php/TD1/echo.php](http://localhost/tds-php/TD1/echo.php)

   **Que se passe-t-il quand on demande un fichier PHP à un serveur HTTP ?**  
   **Regardez les sources de la page Web (Clic droit, code source ou `Ctrl-U`)
     pour voir ce qu'a vraiment généré PHP**.  
   *N'hésitez pas à relire la partie du
    [cours 1 concernée]({{site.baseurl}}/classes/class1.html#mcanisme-de-gnration-des-pages-dynamiques-22).*

   **Réponses (surlignez le texte caché à droite):** 
   <span style="color:#FCFCFC">
   Quand le serveur Web reçoit une requête HTTP pour un fichier PHP, il exécute le script PHP et renvoie la page Web générée par le script.
   </span>

</div>



## Les bases de PHP

### Différences avec Java

2. Le code PHP doit être compris entre la balise ouvrante `<?php` et la balise fermante `?>`
2. Les variables sont précédées d'un `$`
1. Il n'est pas obligatoire de déclarer le type d'une variable (cf. plus loin dans le TD)

### Les chaînes de caractères

Différentes syntaxes existent en PHP ; selon les délimiteurs que l'on utilise,
le comportement est différent.

#### Avec guillemets simples

Les chaînes de caractères avec ***simple quote* `'`** sont conservées telles
quelles (pas de caractères spéciaux `\n`...). Les caractères
protégés sont `'` et `\` qui doivent être échappés avec un anti-slash comme ceci
`\'` et `\\`;

<!-- **Exemple :**

```php?start_inline=1
echo 'Bonjour $prenom,\n ça farte ?';
```

donne

```text
Bonjour $prenom,\n ça farte ?
``` -->

La concaténation de chaînes de caractères se fait avec l'opérateur point `.`  
```php?start_inline=1
$texte = 'hello' . 'World !';
```

#### Avec guillemets doubles

Pour simplifier le code suivant
```php?start_inline=1
$prenom="Helmut";
echo 'Bonjour ' . $prenom . ', ça farte ?';
```

PHP propose une syntaxe de chaîne de caractères entourée de ***double quotes* `"`**
qui permet d'écrire  

```php?start_inline=1
$prenom="Helmut";
echo "Bonjour $prenom, ça farte ?";
```

Les chaînes de caractères avec ***double quotes* `"`** peuvent contenir :
* des variables (qui seront remplacées par leur valeur),
* des sauts de lignes,
* des caractères spéciaux (tabulation `\t`, saut de ligne `\n`).
* Les caractères protégés sont `"`, `$` et `\` qui doivent être échappés avec
un anti-slash `\` comme ceci : `\"`, `\$` et `\\`;

**Astuce :** En cas de problèmes avec le remplacement de variables, rajoutez
des accolades autour de la variable à remplacer. Cela marche aussi bien pour
les tableaux `"{$tab[0]}"`, les attributs `"{$objet->attribut}"` et les
fonctions `"{$objet->fonction()}"`.
   

**Documentation :**
[Les chaînes de caractères sur PHP.net](http://php.net/manual/fr/language.types.string.php)

<div class="exercise">
Qu'écrivent chacun des `echo` suivants ?

```php?start_inline=1
$prenom = "Marc";

echo "Bonjour\n " . $prenom;
echo "Bonjour\n $prenom";
echo 'Bonjour\n $prenom';

echo $prenom;
echo "$prenom";
```

Testez votre réponse en rajoutant ce code dans `echo.php`.

**Astuce:** 
* Vous pouvez aussi tester ce code dans le terminal (sans passer par un serveur Web et un navigateur). Pour cela, écrivez votre script dans `echo.php` (n'oubliez pas la balise ouvrante `<?php` en début de fichier). Puis, dans le terminal, exécutez `php echo.php`.

   Ce fonctionnement est plus proche de ce que vous auriez fait en Python avec `python script.py`, ou en Java avec `javac program.java` puis `java program` .
</div>

### Affichage pour le débogage

Les fonctions `print_r` et `var_dump` affichent les informations d'une variable
et sont très utiles pour déboguer notamment les tableaux ou les objets.  
La différence est que `print_r` est plus lisible car `var_dump` affiche plus de
choses (les types).


### Les tableaux associatifs

Les tableaux en PHP peuvent aussi s'indexer par des entiers ou des chaînes de caractères :

* Pour initialiser un tableau, on utilise la syntaxe

  ```php?start_inline=1
  $utilisateur = array(
   'prenom' => 'Juste',
   'nom'    => 'Leblanc'
  );
  ```

  ou la syntaxe raccourcie équivalente

  ```php?start_inline=1
  $utilisateur = [
   'prenom' => 'Juste',
   'nom'    => 'Leblanc'
  ];
  ```

* On peut ajouter des cases à un tableau :

  ```php?start_inline=1
  $utilisateur['passion'] = 'maquettes en allumettes';
  ```

  **Note :** Le tableau `$utilisateur` contient plusieurs associations. Par
    exemple, il associe à la chaîne de caractères `'prenom'` la chaîne de
    caractères `'Juste'`.  
  Dans cette association, `'prenom'` s'appelle la **clé** (ou **index**) et
`'Juste'` la **valeur**.

* On peut rajouter facilement un élément "à la fin" d'un tableau avec

  ```php?start_inline=1
  $utilisateur[] = "Nouvelle valeur";
  ```

* Pour le remplacement de variable dans des chaînes de caractères délimités par
  des guillemets doubles, on utilise une des syntaxes suivantes

  ```php
  // Syntaxe avec {$...}
  echo "Je m'appelle {$utilisateur['nom']}";
  echo "Je m'appelle {$utilisateur["nom"]}";
  // Syntaxe simplifiée
  // Attention, pas de guillemets autour de la clé "nom"
  echo "Je m'appelle  $utilisateur[nom]";
  ```

* Notez l'existence des boucles
  [`foreach`](http://php.net/manual/fr/control-structures.foreach.php) pour
  parcourir les paires clé/valeur des tableaux. 

  ```php?start_inline=1
  foreach ($monTableau as $cle => $valeur){
      //commandes
  }
  ```

  La boucle `foreach` va boucler sur les associations du tableau. Pour chaque
  association, `foreach` va mettre la clé de l'association dans la variable
  `$cle` et la valeur dans `$valeur` puis exécuter les commandes.
  Par exemple

  ```php?start_inline=1
  foreach ($utilisateur as $cle => $valeur){
      echo "$cle : $valeur\n";
  }
  ```
  
  va afficher ceci 
  
  ```
  prenom : Juste
  nom : Leblanc
  passion : maquettes en allumettes
  0 : Nouvelle valeur
  ```
  
  **Remarque :** La boucle `foreach` est indispensable pour parcourir les
  indices et valeurs d'un tableau indexé par des chaînes de caractères.  
  Il existe aussi bien sûr une boucle `for` classique si le tableau est indexé
  uniquement par des entiers

  ```php?start_inline=1
  for ($i = 0; $i < count($monTableau); $i++) {
      echo $monTableau[$i];
  }
  ```

  Pour comprendre `foreach` autrement, le code suivant

  ```php?start_inline=1
  foreach ($monTableau as $cle => $valeur){
      //commandes
  }
  ```

  est équivalent à
  
    ```php?start_inline=1
  for ($i = 0; $i < count(array_keys($monTableau)); $i++) {
      $cle = array_keys($monTableau)[$i];
	  $valeur = $monTableau[$cle];
      //commandes
  }
  ```


**Source :** [Les tableaux sur php.net](http://php.net/manual/fr/language.types.array.php)

<!-- ### Les structures de contrôle -->

<!-- Syntaxe alternative -->
<!-- http://php.net/manual/fr/control-structures.alternative-syntax.php -->

### Exercices d'application

<div class="exercise">

1. Dans votre fichier `echo.php`, créez trois variables `$nom`, `$prenom` et
`$login` contenant des chaînes de caractères de votre choix ;

1. Créez la commande PHP qui écrit dans votre fichier le code HTML suivant (en
   remplaçant bien sûr le nom par le contenu de la variable `$nom` ...) :

   ```html
   <p> Utilisateur Juste Leblanc de login leblancj </p>
   ```

2. Faisons maintenant la même chose mais avec un tableau associatif `utilisateur`:

   * Créez un tableau `$utilisateur` contenant trois clés `"nom"`, `"prenom"` et
   `"login"` avec les valeurs de votre choix ;

   * Utilisez l'un des affichages de débogage (*e.g.* `var_dump`) pour vérifier
     que vous avez bien rempli votre tableau ;

   * Affichez le contenu de "l'utilisateur-tableau" au même format HTML 

   ```html
   <p> Utilisateur Juste Leblanc de login leblancj </p>
   ```

3. Maintenant nous souhaitons afficher une liste d'utilisateurs :

   * Créez une liste (un tableau indexé par des entiers) `$utilisateurs` de quelques
     "utilisateurs-tableaux" ;

   * Utilisez l'un des affichages de débogage (*e.g.* `var_dump`) pour vérifier
     que vous avez bien rempli `$utilisateurs` ;

   * Modifier votre code d'affichage pour écrire proprement en HTML un titre
     "Liste des utilisateurs :" puis une liste (`<ul><li>...</li></ul>`) contenant les informations
     des utilisateurs.

4. Pour déboguer votre script, il est parfois pratique d'afficher la sortie brute du script. Vous souvenez-vous comment faire ?  
   **Réponse (surlignez à droite):** 
   <span style="color:#FCFCFC">Affichez donc le code source de la page.</span>
 
5. Rajoutez un cas par défaut qui affiche "Il n'y a aucun utilisateur." si la
   liste est vide.  
   (On vous laisse chercher sur internet la fonction qui teste si un tableau est
   vide)

6. Enregistrez votre travail dans Git via PhpStorm.

   <!-- 1. Faites `git status` pour connaître l'état du dépôt Git.
   1. Faites `git add TD1/echo.php` pour lui dire d'enregistrer les
   modifications dans `echo.php`.
   2. Faites `git commit` pour valider l'enregistrement des modifications et
      écrivez un petit message de validation (comme e.g. *"TD1 Exo4 Affichage de
      variables"*).
   3. Finissez par `git status` pour voir que tout s'est bien passé. -->
   
</div>

## La programmation objet en PHP

PHP était initialement conçu comme un langage de script, mais est passé *Orienté Objet* à partir de la
version 5. Plutôt que d'utiliser un tableau, créons une classe pour nos utilisateurs.

### Un exemple de classe PHP

<div class="exercise">

1. Créer un fichier **Utilisateur.php** avec le contenu suivant

   ```php
   <?php
   class Utilisateur {
   
       private $login;
       private $nom;
       private $prenom;
   
       // un getter      
       public function getNom() {
           return $this->nom;
       }
   
       // un setter 
       public function setNom($nom) {
           $this->nom = $nom;
       }
   
       // un constructeur
       public function __construct(
         $login,
         $nom, 
         $prenom,
      ) {
           $this->login = $login;
           $this->nom = $nom;
           $this->prenom = $prenom;
       } 
              
       // Pour pouvoir convertir un objet en chaîne de caractères
       public function __toString() {
         // À compléter dans le prochain exercice
       }
   }
   ?>
   ```

   Notez les **différences avec Java** :

   * Pour accéder à un attribut ou une fonction d'un objet, on utilise le `->`
     au lieu du `.` de Java.
   * En PHP, `$this` est obligatoire pour accéder aux attributs et méthodes d'un objet.
   * On doit mettre le mot-clé `function` avant de déclarer une méthode
   * Le constructeur ne porte pas le nom de la classe, mais s'appelle
     `__construct()`.
   * En PHP, on ne peut pas avoir deux fonctions avec le même nom, même si elles
     ont un nombre d'arguments différent. En particulier, il ne peut y avoir au
     maximum qu'un constructeur.

2. Créez des *getter* et des *setter* pour `$prenom` et `$login` ;  
   (PhpStorm peut les générer automatiquement pour vous avec Clic droit > Generate)

3. L'intérêt des *setter* est notamment de vérifier ce qui va être écrit dans
   l'attribut.
   Comme le login est limité à 64 caractères, codez un *setter* qui 
   ne stocke que les 64 premiers caractères du login dans l'objet.
   Mettez aussi à jour le constructeur pour ne garder que les 64 premiers caractères.      
   (Documentation PHP :
   [fonction `substr` *substring*](http://php.net/manual/fr/function.substr.php)).


4. Remplissez `__toString()` qui permet de convertir un utilisateur en chaine de caractères.
   <!-- (Regardez le code du constructeur de la classe Utilisateur : comme en
   Java, on peut utiliser le mot-clé `$this` mais suivi de `->`) ; -->

5. Testez que votre classe est valide pour PHP : la page générée par le serveur
   Web Docker à partir de `Utilisateur.php` ne doit pas afficher d'erreur.  
   **Demandez donc** votre page au serveur Web
   [http://localhost/tds-php/TD1/Utilisateur.php](http://localhost/tds-php/TD1/Utilisateur.php).

6. Enregistrez votre travail sous Git à l'aide de PhpStorm.

</div>

### Utilisation de la classe `Utilisateur`

Nous voulons utiliser la classe `Utilisateur` dans un autre script `testUtilisateur.php`. Il faut donc inclure le fichier `Utilisateur.php`, qui contient la déclaration de la classe de `Utilisateur`, dans `testUtilisateur.php` pour pouvoir l'utiliser.

#### Require

PHP a plusieurs façons d'inclure un fichier :

* `require "dossier/fichier.php"` : inclut et exécute le fichier spécifié en
   argument, ici `"dossier/fichier.php"`. Autrement dit, tout se passe comme si
   le contenu de `fichier.php` avait été copié/collé à la place du `require`.  
   Renvoie une erreur si le fichier n'existe pas.

* `require_once "dossier/fichier.php"` : fait de même que `require` mais la différence est que si le
  code a déjà été inclus, il ne le sera pas une seconde fois.  
  Ceci est particulièrement utile pour inclure une classe car cela assure qu'on
  ne l'inclura pas deux fois.

Notez qu'il existe `include` et `include_once` qui ont le même effet mais
n'émettent qu'un warning si le fichier n'est pas trouvé (au lieu d'une erreur).

#### Exercice

<div class="exercise">

1. Créez un fichier **testUtilisateur.php** contenant le squelette HTML classique (`<html>`,`<head>`,`<body>` ...)

2. Dans la balise `<body>`, on va vouloir créer des objets `Utilisateur` et les afficher :

   * Incluez `Utilisateur.php` à l'aide de `require_once` comme vu précédemment ;

   * Initialisez une variable `$utilisateur1` de la classe `Utilisateur` ;

   <!-- $utilisateur1 = new Utilisateur('Renault','Bleu','256AB34');  -->

   * Affichez cet utilisateur avec un `echo`, ce qui appellera implicitement la méthode `__toString()`.

3. Testez votre page sur le serveur Web :  
   [http://localhost/tds-php/TD1/testUtilisateur.php](http://localhost/tds-php/TD1/testUtilisateur.php)
   
</div>

### Déclaration de type

<div class="exercise">
Optionnellement, on peut déclarer les types de certaines variables PHP :
* les arguments d'une fonction
* la valeur de retour d'une fonction
* les attributs de classe

Ces types sont vérifiés à l'exécution, contrairement à Java qui les vérifie à la compilation.  
La déclaration de type est **cruciale** pour que l'IDE devine correctement le type des objets et pour que vous puissiez bénéficier pleinement de l'**autocomplétion** de l'IDE. 

Exemple :
```php
class Requete {
  // Déclaration de type d'un attribut
  string $url;
  string $methode; // GET ou POST
}
class Reponse {
  int $code; // 200 OK ou 404 Not Found
  string $corps; // <html>...
}

// Déclaration de type d'un paramètre de fonction (Requete)
// et d'un retour de fonction (Reponse)
function ServeurWeb(Requete $requete) : Reponse {
   // Corps de la fonction ...
}
```

[Documentation PHP](https://www.php.net/manual/fr/language.types.declarations.php)

1. Mettez à jour `Utilisateur.php` pour déclarer `nom`, `prenom` et `login` comme `string` dans
   * les attributs de classes,
   * les arguments des setters,
   * les sorties des getters,
   * les arguments du constructeur,
   * le type de sortie de `__toString()`.

   **Note :** Pour pouvoir utiliser les déclarations de type, il faut indiquer à PhpStorm que vous voulez utiliser la version 8.3 du langage PHP. Pour ceci, cliquez en bas à droite de l'IDE sur `PHP: *.*` pour basculer vers `PHP: 8.3`.

2. Testez que PHP vérifie bien les types : dans `testUtilisateur.php`, appelez une fonction qui attend en argument un `string` en lui donnant à la place un tableau (le tableau vide `[]` par exemple). Vous devez recevoir un message comme suit

   ```
   PHP Fatal error:  Uncaught TypeError: Utilisateur::__construct(): Argument #1 ($nom) must be of type string, array given
   ```

   <!-- 3. Testez en donnant une valeur entière à la place d'un `string`. Malheureusement, la vérification de PHP n'échoue pas. En effet, par défaut, PHP convertit automatiquement les types scalaires (`bool`, `int`, `float` et `string`) entre eux.

   1. Rajoutez l'instruction `declare(strict_types=1);` au début de votre fichier PHP. Ceci active la vérification de types, même entre types scalaires.  
   Vérifiez que la vérification de type de PHP échoue maintenant.

   **Attention :** La déclaration `declare(strict_types=1);` doit être la première instruction de votre script PHP. Il faut donc écrire en ligne 1 
   ```php
   <?php declare(strict_types=1); ?>
   ```
   sans aucun espace avant `<?php`. 
   
   Aussi, `declare(strict_types=1);` marche fichier par fichier. Il doit donc être mis en haut de chaque fichier pour marcher partout.
   -->

3. Enregistrez votre travail sous Git à l'aide de PhpStorm.

</div>

## Interaction avec un formulaire

<div class="exercise">

1. Créez un fichier **formulaireUtilisateur.html**, réutilisez l'entête du fichier
   **echo.php** et dans le body, insérez le formulaire suivant :

   ```html
   <form method="get" action="creerUtilisateur.php">
     <fieldset>
       <legend>Mon formulaire :</legend>
       <p>
         <label for="login_id">Login</label> :
         <input type="text" placeholder="leblancj" name="login" id="login_id" required/>
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

   <!-- L'attribut important des `<input type="text">` est `name="nom"` qui indique -->
   <!-- que ce que vous taperez dans ce champ texte sera associé au nom de variable -->
   <!-- `nom`. -->

   **Rappels supplémentaires :**

   * L'attribut `for` de `<label>` doit contenir l'identifiant d'un champ
    `<input>` pour qu'un clic sur le texte du `<label>` vous amène directement
    dans ce champ.

   * l'attribut `placeholder` de `<input>` sert à écrire une valeur par défaut pour aider l'utilisateur.

3. Créez des champs dans le formulaire pour pouvoir rentrer le nom et le prénom de l'utilisateur.

4. Souvenez-vous (ou relisez le
   [cours 1]({{site.baseurl}}/classes/class1.html#les-formulaires-de-mthode-get)) de ce que fait un clic sur le bouton **"Envoyer"**.  
   Vérifiez en cliquant sur ce bouton.
   
   **Comment sont transmises les informations ?**  
   **Comment s'appelle la partie de l'URL contenant les informations ?**

5. Prenez l'habitude d'enregistrer régulièrement votre travail sous Git. En
   cliquant sur l'icône Git en bas à gauche de PhpStorm, vous pouvez retrouver
   l'historique de vos enregistrements passés.

</div>
<div class="exercise">

5. Créez un fichier `creerUtilisateur.php` :

   1. Aidez-vous si nécessaire du [cours 1]({{site.baseurl}}/classes/class1.html)
   pour savoir comment récupérer l'information envoyée par le formulaire.
   1. Vérifiez que `creerUtilisateur.php` reçoit bien des informations dans le *query
   string*. Pour cela, vérifiez que le tableau `$_GET` n'est pas vide (comment afficher un tableau facilement ?).
   1. En reprenant du code de `testUtilisateur.php`, faites que `creerUtilisateur.php`
   affiche les informations de l'utilisateur envoyée par le formulaire.
   2. Bien sûr, **testez votre page** en la demandant au serveur Web.

6. Afin d'éviter que les données du formulaire n'apparaissent dans l'URL, modifiez 
   le formulaire pour qu'il appelle la méthode POST :

   ```html
   <form method="post" action="creerUtilisateur.php">
   ```
   
   et côté `creerUtilisateur.php`, mettez à jour la récupération des paramètres :

   1. Souvenez-vous (ou relisez le
   [cours 1]({{site.baseurl}}/classes/class1.html)) de par où passe
   l'information envoyée par un formulaire de méthode POST ;
   2. Changez `creerUtilisateur.php` pour récupérer l'information envoyée par le formulaire ;
   3. Essayez de
   [**retrouver l'information envoyée par le formulaire**]({{site.baseurl}}/classes/class1.html#coutons-le-rseau)
   avec les outils de développement (Onglet Réseau).

7. Avez-vous pensé à enregistrer vos modifications sous Git ? Faites-le
   notamment en fin de TD pour retrouver plus facilement où vous en êtes la
   prochaine fois.  
   <!-- **Note :** Vous pouvez faire `git diff` à tout moment pour voir les
   modifications que vous avez faites depuis la dernière validation (`commit`). -->
   <!-- On voit toutes les modifications sauf celles en cours d'enregistrement avec `git add` -->
</div>


<!-- ## Travailler depuis chez vous en local

Si vous voulez éviter de vous connecter sur webinfo (en FTP ou SSH) pour travailler depuis chez vous, vous pouvez installer un serveur Apache + PhP + MySql + PhpMyAdmin sur votre machine. Vous pourrez alors lancer votre script avec l'URL `localhost`.

#### Installation tout en un

Nous vous proposons d'utiliser XAMPP qui est disponible sur Windows, Mac & Linux : 

* Instructions pour Linux  
   [https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql/4237816-preparez-votre-environnement-de-travail#/id/r-7414761](https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql/4237816-preparez-votre-environnement-de-travail#/id/r-7414761)
  
* Instructions pour Windows  
   [https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql/4237816-preparez-votre-environnement-de-travail#/id/r-8356749](https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql/4237816-preparez-votre-environnement-de-travail#/id/r-8356749)
  
* Instructions pour macOS  
  [https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql/4237816-preparez-votre-environnement-de-travail#/id/r-8356822](https://openclassrooms.com/fr/courses/918836-concevez-votre-site-web-avec-php-et-mysql/4237816-preparez-votre-environnement-de-travail#/id/r-8356822)  

**Attention**, pensez à modifier le `php.ini` pour mettre `display_errors = On`
et `error_reporting = E_ALL`, pour avoir les messages d'erreurs. Car par défaut,
le serveur est configuré en mode production (`display_errors = Off`). 

Pour localiser le fichier `php.ini`, exécutez la commande suivante dans un script PHP via votre navigateur:
```php
echo php_ini_loaded_file();
```
Votre `php.ini` se trouve dans `/opt/lampp/etc/` pour une installation avec XAMP sous Linux.

Il faut redémarrer Apache pour que les modifications soient prises en compte. Dans le terminal, exécutez
```bash
sudo /opt/lampp/lampp stop
sudo /opt/lampp/lampp start
```

#### Installation depuis les paquets

Pour une [installation depuis les paquets](https://www.google.com/search?q=install+apache+php+phpmyadmin+mysql+ubuntu&tbs=qdr:y) de Apache + MySql + Php + PhpMyAdmin sous Linux, votre `php.ini` se trouve dans `/etc/php/8.3/apache2/` et le redémarrage du serveur se fait avec 
```bash
sudo service apache2 restart
``` -->


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
