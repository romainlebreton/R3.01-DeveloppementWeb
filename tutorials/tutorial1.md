---
title: TD1 &ndash; Introduction aux objets en PHP
subtitle: Et quelques révisions sur HTTP
layout: tutorial
---

## Méthodologie

Quelques consignes qui vous feront gagner beaucoup de temps en développement web:

1. PHP est un langage de programmation. Vous ne codez pas du Java avec
   BlocNotes, c'est pareil pour PHP. Utilisez un environnement de développement
   et nous allons utiliser NetBeans dans ce cours (sauf si vous avez déjà votre
   éditeur préféré).
  <!--
  NetBeans à partir du TD2 pour qu'ils ne croient pas que NetBeans cache le
  fonctionnement d'une page Web
  -->
2. Ne copiez **jamais** vos fichiers à plusieurs endroits.
3. Merci de ne pas imprimer ce TP.

## Accédez à vos pages web

Créez une page **index.html** avec le contenu suivant et enregistrez la dans
le répertoire **public_html** de votre espace personnel.

~~~
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
{:.html}


1. Ouvrez cette page dans le navigateur directement en double-cliquant dessus
   directement depuis votre gestionnaire de fichiers.
   Notez l'URL du fichier :
   [file://chemin_de_mon_compte/public_html/index.html](file://chemin_de_mon_compte/public_html/index.html).
   
   **Un problème avec les accents ?** Dans l'entête du fichier HTML vous avez
   spécifié l'encodage `<meta charset="utf-8" />`. Il faut que vos
   fichiers soient enregistrés avec le même encodage. UTF-8 est souvent l'encodage
   par défaut, mais les éditeurs de texte offrent des fois souvent le choix de
   l'encodage lors du premier enregistrement du fichier.

2. Ouvrez cette même page depuis le navigateur en tapant l'URL suivante dans
   la barre d'adresse
   [http://infolimon.iutmontp.univ-montp2.fr/~mon_login/index.html](http://infolimon.iutmontp.univ-montp2.fr/~mon_login/index.html)

   **Un problème de droit ?** Pour afficher vos pages, le serveur HTTP Apache
   doit pouvoir lister le contenu de votre répertoire **public_html**. À
   l'IUT, la gestion des droits se fait par les ACL. Les droits UNIX classique
   sont rendus inopérants par les ACL.  Il faut donner les droits à l'utilisateur
   www-data (Apache) par la commande setfacl dans un terminal sous Linux :
   
   `setfacl -m u:www-data:rwx nom\_du\_fichier ou répertoire`

3. Quelle(s) différence(s) observez-vous entre les deux pages ?


4. Créez une page echo.php avec le contenu suivant et enregistrez-la dans le
   répertoire **public_html** de votre espace personnel.

   ~~~
   <!DOCTYPE html>
   <html>
       <head>
           <meta charset="utf-8" />
           <title> Mon premier php </title>
       </head>
   
       <body>
   	<?php
     	$texte="hello";             //commentaire en PHP
           $texte=$texte." "."world"; // concatenation de 2 chaines de caracteres
           echo $texte;
           ?>
           <!-- ceci est un commentaire -->
           Bonjour
       </body>
   </html> 
   ~~~
   {:.html}


5. Ouvrez cette page dans le navigateur directement depuis votre gestionnaire de fichiers :  
   [file://chemin_de_mon_compte/public_html/echo.php](file://chemin_de_mon_compte/public_html/echo.php).

6. Ouvrez cette page dans le navigateur dans un second onglet en passant par le serveur web :   
   [http://infolimon.iutmontp.univ-montp2.fr/~mon_login/echo.php](http://infolimon.iutmontp.univ-montp2.fr/~mon_login/echo.php)

7. Quelle(s) différence(s) observez-vous dans l'affichage des deux pages Web ?

8. Quelle(s) différence(s) observez-vous dans le code source des deux pages Web ?  
   (Clic droit, code source ou `Ctrl-U`)


## La programmation objet en PHP

PHP était initialement conçu comme un langage de script, mais est passé Objet à partir de la
version 5.

### Un exemple de classe PHP

Créer un fichier **Voiture.php** :

~~~
<?php
class Voiture {

  private $marque;
  private $couleur;
  private $immatriculation;
   
  //un getter      
  public function getMarque() {
       return $this->marque;  
  }
  
  //un setter 
  public function setMarque($marque2) {
       $this->marque = $marque2;
  }
   
   //Un constructeur
   public function __construct($m,$c,$i)  {
     $this->marque = $m;
     $this->couleur = $c;
     $this->immatriculation = $i;     
  } 
        
  // une methode d'affichage.
  public function afficher() {
    echo '<p> Voiture '.$this->immatriculation.' de marque'.$this->marque.'</p>' ;
  }
}
?>
~~~
{:.php}


### Différences avec Java

1. Pas de typage 
2. Les variables sont précédées d'un `$`
3. Pour accéder à un attribut ou une fonction d'un objet, on utilise le `->` au lieu du `.`
4. Le constructeur ne porte pas le nom de la classe, mais s'appelle `__construct()`.


### Utilisation de cette classe

Dans un fichier **testVoiture.php**, le code suivant

~~~
<?php
  require 'Voiture.php';   //Equivalent du import en Java
  $voiture1 = new Voiture('Renault','Bleu','256AB34'); 
  $voiture2 = new Voiture('Peugeot','Vert','128AC30');
  $voiture1->afficher();
  $voiture2->afficher();
?>
~~~
{:.php}

Testez cette page: 
[http://infolimon.iutmontp.univ-montp2.fr/~mon_login/testVoiture.php](http://infolimon.iutmontp.univ-montp2.fr/~mon_login/testVoiture.php)

À la différence de Java, il n'y a pas de besoin d'une méthode `main()`. N'importe quelle
fichier **PHP** est considéré comme un `main()`.


### Gestion des listes

1. Ajouter un attribut **options** à la classe voiture. 
2. Initialiser cette liste dans le constructeur, à l'aide de `\$this->options = array();`
3. Ajouter une méthode à la classe `Voiture` qui permet d'ajouter une option à la liste,
   à l'aide de `\$this->options[] = \$uneOption;` qui ajoute l'option `uneOption`
   à la fin du tableau d'options `options.
4. Modifier la méthode `afficher()` pour qu'elle permette de lister les options

   ~~~
   foreach ($this->options as $i => $option) {
       echo($this->options[$i]);
       //de meme pour echo($option); 
   }
   ~~~
   {:.php}



## Interaction avec un formulaire

1. Créez un fichier **formulaireVoiture.html**, réutilisiez l'entête du fichier
   **index.html** et dans le body, insérez le formulaire suivant:

   ~~~
   <form method="get" action="creerVoiture.php">
     <fieldset>
        <legend>Mon formulaire :</legend> <p>
        <label for="immatriculation">Immatriculation</label> :
        <input type="text" placeholder="Ex : 256AB34" name="immatriculation" 
        	        id="immatriculation" required/>
        </p> <p>
        <label for="marque">Marque</label> :
        <input type="text" placeholder="Ex : Renault" name="marque" id="marque"  required/>
        </p> <p>
        <label for="couleur">Couleur</label> :
        <input type="text" placeholder="Ex : Bleu" name="couleur" id="couleur"  required/>
        </p> <p>
        <input type="submit" value="Envoyer" /> </p>
      </fieldset> 
   </form>
   ~~~
   {:.html}

2. Cliquez sur le bouton "Envoyer". Vous voyez apparaître dans votre navigateur l'url:
   [http://infolimon.iutmontp.univ-montp2.fr/~mon_login/creerVoiture.php?immatriculation=256AB34&marque=Renault&couleur=Bleu](http://infolimon.iutmontp.univ-montp2.fr/~mon_login/creerVoiture.php?immatriculation=256AB34&marque=Renault&couleur=Bleu)

   La page **creerVoiture.php** n'existe pas, vous devez donc avoir une erreur 404.

3. Dans le corps de cette page, vous pouvez récupérer la valeur du champ "marque"
   du formulaire à l'aide de :

   ~~~
   <?php
     $marque = $_GET["Marque"];
   ?>
   ~~~
   {:.php}

4. Complétez cette page de sorte qu'elle récupère tous les champs de voiture,
   instancie la classe Voiture et appelle la méthode affiche().

5. Afin d'éviter que les paramètres du formulaire n'apparaissent dans l'url, modifiez 
   le formulaire pour qu'il appelle la méthode post:

   ~~~
   <form method="post" action="creerVoiture.php">
   ~~~
   {:.html}

   et côté PHP, récupérez les paramètres avec

   ~~~
   <?php
     $marque = $_POST["Marque"];
   ?>
   ~~~
   {:.php}

   
## Exercice : Site de covoiturage

Vous allez programmer les classes d'un site de covoiturage, dont voici la description d'une version
minimaliste:

* **Trajet :** Un trajet comprend un point de départ, un point d'arrivée et une date de
départ. 
* **Utilisateur :** Un utilisateur peut proposer un trajet en indiquant le nombre de places 
disponibles et un prix. 
<!--
 demander à participer à un trajet (comme passager).
 accepter la demande de participation.
-->
* **Plateforme :** Connait la liste des utilisateurs et de tous les trajets. 


## Chez vous

Vous pouvez installer Apache + PhP + MySql sur votre machine perso (WAMP sous
windows, LAMP sous Linux, MAMP sous MacOs)

Attention, pensez à modifier le php.ini pour mettre `display_errors = On`, pour
avoir les messages d'erreurs. Car par défaut, le serveur est configuré en mode
production (`display\_errors = Off`).