---
title: TD4 &ndash; Architecture MVC
subtitle: Modèle, Vue, Contrôleur
layout: tutorial
lang: fr
---

Au fur et à mesure que votre site Web grandit, vous allez rencontrer des
difficultés à organiser votre code. Les prochains TDs visent à vous montrer une
bonne façon de concevoir votre site web. On appelle *architectural pattern*
(patron d'architecture) une série de bonnes pratiques pour l'organisation de
votre site.

Un des plus célèbres *architectural patterns* s'appelle **MVC** (Modèle - Vue -
Contrôleur) : c'est celui que nous allons découvrir dans ce TD.

## Présentation du patron d'architecture **MVC**

Le pattern **MVC** permet de bien organiser son code source. Jusqu'à présent,
nous avons programmé de manière monolithique : nos pages Web mélangent
traitement (PHP), accès aux données (SQL) et présentation (balises HTML). Nous
allons maintenant séparer toutes ces parties pour plus de clarté.

L'objectif de ce TD est donc de réorganiser le code du TD3 pour finalement y
ajouter plus facilement de nouvelles fonctionnalités. Nous allons vous
expliquer le fonctionnement sur l'exemple de la page `lireUtilisateurs.php` du TD2 :

```php
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des utilisateurs</title>
    </head>
    <body>
        <?php
        require_once 'Utilisateur.php';
        $utilisateurs = Utilisateur::recupererUtilisateurs();
        foreach ($utilisateurs as $utilisateur)
          echo $utilisateur;
        ?>
    </body>
</html>
```

Cette page se basait sur votre classe `Utilisateur` dans `Utilisateur.php` :

```php
<?php
require_once "ConnexionBaseDeDonnees.php";

class Utilisateur {
  private string $nom;
  private string $prenom;
  private string $login;

  // getters et setters...

  public function __construct(string $nom, ...) { ... }

  public static function construireDepuisTableauSQL(array $utilisateurTableau): ModeleUtilisateur { ... }

  public function __toString()() { ... }

  public static function recupererUtilisateurs() { ... }

  public static function recupererUtilisateurParLogin(string $login) { ... }

  public function ajouter() { ... }

  // Gestion des trajets comme passager si vous avez fait les bonus du TD3
}
?>
```

L'architecture **MVC** est une manière de découper le code en trois bouts M, V et C
ayant des fonctions bien précises. Dans notre exemple, l'ancien fichier
`lireUtilisateur.php` va être réparti entre le contrôleur
`Controleur/ControleurUtilisateur.php`, le modèle `Modele/ModeleUtilisateur.php` et la vue
`vue/utilisateur/liste.php`.

Voici un aperçu de tous les fichiers que nous allons créer dans ce TD.

<img alt="Structure de nos fichiers"
src="../assets/TD4/StructureRepertoire.png" style="margin-left:auto;margin-right:auto;display:block;width:17em;">

**Conventions de nommage :**
1. Les noms des fichiers PHP de déclaration de classe commencent par une majuscule, les autres non.
2. Les noms des répertoires qui contiennent des déclarations de classe PHP commencent par une majuscule, les autres non.
3. On privilégie le français dans les noms de classe, de fichiers, de fonctions... 

### M : Le modèle

Le modèle est chargé de la gestion des données, notamment des interactions avec
la s. C'est, par exemple, la classe `Utilisateur` que vous avez créé
lors des TDs précédents (sauf la fonction `__toString()`).

<div class="exercise">

1. Créez les répertoires `Configuration`, `Controleur`, `Modele`, `vue` et `vue/utilisateur`.
2. Utilisez l'outil de refactoring de votre IDE pour renommer la classe
   `Utilisateur` en `ModeleUtilisateur`. 
   
   Vérifiez que les déclarations de type ont bien été mises à jour partout dans votre code.  
   Mettez en commentaire la fonction `__toString()` pour la désactiver.

   **Aide pour le *refactoring*** : Clic droit sur le fichier de déclaration de classe à renommer à PhpStorm, puis *Refactor* → *Rename*.
3. Déplacez vos fichiers `ModeleUtilisateur.php` et `ConnexionBaseDeDonnees.php` dans le répertoire `Modele/`.
4. Déplacez la classe `ConfigurationBaseDeDonnees` dans le dossier `Configuration`.
5. Corrigez le chemin relatif du `require_once` du fichier `ConfigurationBaseDeDonnees.php` dans `ConnexionBaseDeDonnees.php`.
6. Assurez-vous que PHPStorm n'a pas créé de ligne `namespace ...`, ni `use ...` en haut de
   vos scripts PHP. Sinon, supprimez ces lignes. **Attention :** si l'utilisation de certaines classes dans votre code
   est soulignée en avertissement par votre IDE, alors des `namespace ...` et/ou `use ...` persistent quelque part dans vos classes.
</div>

**N.B. :** Il est vraiment conseillé de renommer les fichiers et non de les
  copier. Avoir plusieurs copies de vos classes et fichiers est source d'erreur
  difficile à déboguer.

Dans notre cas, la nouvelle classe `ModeleUtilisateur` gère la persistance au travers
des méthodes :

```php?start_inline=1
 $utilisateur->ajouter();
 ModeleUtilisateur::recupererUtilisateurParLogin($login);
 ModeleUtilisateur::recupererUtilisateurs();
```

**N.B. :** Souvenez-vous que les deux dernières fonctions `recupererUtilisateurParLogin`
et `recupererUtilisateurs` sont `static`. Elles ne dépendent donc que de
leur classe (et non pas des objets instanciés). D'où la syntaxe différente
`NomClasse::nomMethodeStatique()` pour les appeler.

### V : la vue

Dans la vue sont regroupées toutes les lignes de code qui génèrent la page HTML
que l'on va envoyer à l'utilisateur. Les vues sont des fichiers qui ne
contiennent quasiment exclusivement que du code HTML, à l'exception de quelques
`echo` permettant d'afficher les variables préremplies par le contrôleur. Une
boucle `for` est toutefois autorisée pour les vues qui affichent une liste
d'éléments. **La vue n'effectue pas de traitement, de calcul**.

Dans notre exemple, la vue serait le fichier `vue/utilisateur/liste.php`
suivant. Le code de ce fichier permet d'afficher une page Web contenant tous
les utilisateurs contenus dans la variable `$utilisateurs`.

```php
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des utilisateurs</title>
    </head>
    <body>
        <?php
        foreach ($utilisateurs as $utilisateur)
            echo '<p> Utilisateur de login ' . $utilisateur->getLogin() . '.</p>';
        ?>
    </body>
</html>
```

<div class="exercise">

Créez la vue `vue/utilisateur/liste.php` avec le code précédent.

**Remarque :** Pour ce fichier, votre IDE risque de souligner l'utilisation de la variable `$utilisateurs`
comme étant non-définie. C'est un comportement tout à fait normal, car il n'est jamais sûr d'utiliser
une variable dont l'existence n'est pas garantie ! Cependant, si vous savez ce que vous faites, vous pouvez
"aider" l'IDE en lui fournissant une documentation sous forme de PHPDOC. Dans notre cas :

```php
/** @var ModeleUtilisateur[] $utilisateurs */
```

</div>

### C : le contrôleur

Le contrôleur gère la logique du code qui prend des décisions. C'est en quelque
sorte l'intermédiaire entre le modèle et la vue : le contrôleur va demander au
modèle les données, les analyser, prendre des décisions et appeler la vue
adéquate en lui donnant le texte à afficher. Le contrôleur contient
exclusivement du PHP.

Il existe une multitude d'implémentations du **MVC** :

1. un gros contrôleur unique
1. un contrôleur par modèle
1. un contrôleur pour chaque action de chaque modèle

Nous choisissons ici la version intermédiaire et commençons à créer un
contrôleur pour `ModeleUtilisateur`. Voici le contrôleur
`Controleur/ControleurUtilisateur.php` sur notre exemple :

```php
<?php
require_once ('../Modele/ModeleUtilisateur.php'); // chargement du modèle

$utilisateurs = ModeleUtilisateur::recupererUtilisateurs();     //appel au modèle pour gérer la BD
require ('../vue/utilisateur/liste.php');  //copie la vue ici
?>
```


Notre contrôleur se décompose donc en plusieurs parties :

1. On charge la déclaration de la classe `ModeleUtilisateur` ;
3. on se sert du modèle pour récupérer le tableau de tous les utilisateurs avec
`$utilisateurs = Utilisateur::recupererUtilisateurs();`
4. on appelle alors la vue qui va nous générer la page Web avec
`require ('../vue/utilisateur/liste.php');`

**Notes :**

* **Pourquoi `../` ?** Les adresses sont relatives au fichier courant qui est
`Controleur/ControleurUtilisateur.php` dans notre cas.
* Notez bien que c'est le contrôleur qui initialise la variable `$utilisateurs` et que
la vue ne fait que lire cette variable pour générer la page Web.

<div class="exercise">

1. Créez le contrôleur `Controleur/ControleurUtilisateur.php` avec le code précédent.
2. Testez votre page en appelant l'URL
[.../Controleur/ControleurUtilisateur.php](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/PHP/TD4/Controleur/ControleurUtilisateur.php)
3. Prenez le temps de comprendre le **MVC** sur cet exemple.
   Avez-vous compris l'ordre dans lequel PHP exécute votre code ?
   Est-ce que ce code vous semble similaire à l'ancien fichier
   `lireUtilisateur.php` ?
   N'hésitez à parler de votre compréhension avec votre chargé de TD.

</div>



### Le routeur : un autre composant du contrôleur

Un contrôleur doit en fait gérer plusieurs pages. Dans notre exemple, il doit
gérer toutes les pages liées au modèle `ModeleUtilisateur`. Du coup, on regroupe le
code de chaque page Web dans une fonction, et on met le tout dans une classe
contrôleur.

Voici à quoi va ressembler notre contrôleur `ControleurUtilisateur.php`. On
reconnaît dans la fonction `afficherListe` le code précédent qui affiche tous les
utilisateurs.

```php
<?php
require_once ('../Modele/ModeleUtilisateur.php'); // chargement du modèle
class ControleurUtilisateur {
    // Déclaration de type de retour void : la fonction ne retourne pas de valeur
    public static function afficherListe() : void {
        $utilisateurs = ModeleUtilisateur::recupererUtilisateurs(); //appel au modèle pour gérer la BD
        require ('../vue/utilisateur/liste.php');  //"redirige" vers la vue
    }
}
?>
```


On appelle *action* une fonction du contrôleur ; une action correspond
généralement à une page Web. Dans notre exemple du contrôleur
`ControleurUtilisateur`, nous allons bientôt ajouter les actions qui correspondent
aux pages suivantes :

1. afficher tous les utilisateurs : action `afficherListe`
2. afficher les détails d'un utilisateur : action `afficherDetail`
3. afficher le formulaire de création d'un utilisateur : action `afficherFormulaireCreation`
3. créer un utilisateur dans la s et afficher un message de confirmation : action `creerDepuisFormulaire`
<!-- 4. supprimer un utilisateur et afficher un message de confirmation : action `delete` -->

Pour recréer la page précédente, il manque encore un bout de code qui appelle la
méthode `ControleurUtilisateur::afficherListe()`. Le *routeur* est la partie du contrôleur
qui s'occupe d'appeler l'action du contrôleur. Un routeur simpliste serait le
fichier suivant `Controleur/routeur.php` :

```php
<?php
require_once 'ControleurUtilisateur.php';
ControleurUtilisateur::afficherListe(); // Appel de la méthode statique $action de ControleurUtilisateur
?>
```

<div class="exercise">
1. Modifiez le code de `ControleurUtilisateur.php` et créez le fichier
   `Controleur/routeur.php` pour correspondre au code ci-dessus ;
2. Testez la nouvelle architecture en appelant la page
[.../Controleur/routeur.php](http://webinfo/~mon_login/PHP/TD4/Controleur/routeur.php).
3. Prenez le temps de comprendre le **MVC** sur cet exemple.
   Avez-vous compris l'ordre dans lequel PHP exécute votre code ?
</div>

#### Maintenant un vrai routeur

Le code précédent marche sauf que le client doit pouvoir choisir quelle action
est-ce qu'il veut effectuer. Du coup, il va faire une requête pour la page
`routeur.php`, mais en envoyant l'information qu'il veut que `action` soit égal à
`afficherListe`. Pour transmettre ces données à la page du routeur, nous allons les
écrire dans l'URL avec la syntaxe du *query string* (cf. [**rappel** sur query
string dans le cours
1]({{site.baseurl}}/classes/class1.html#les-query-strings-dans-lurl)).

De son côté, le routeur doit récupérer l'action envoyée et appeler la méthode
correspondante du contrôleur. Pour appeler la méthode statique de
`ControleurUtilisateur` dont le nom se trouve dans la variable `$action`, le PHP
peut faire comme suit. Voici le fichier `Controleur/routeur.php` mis à jour :

```php
<?php
require_once 'ControleurUtilisateur.php';
// On récupère l'action passée dans l'URL
$action = ...;
// Appel de la méthode statique $action de ControleurUtilisateur
ControleurUtilisateur::$action();
?>
```

<div class="exercise">

1. Modifiez le code `Controleur/routeur.php` pour correspondre au code ci-dessus
   en remplissant vous-même la ligne 4. Si vous ne vous souvenez plus comment
   extraire un paramètre d'une URL,
   [relisez la partie sur le query string dans le cours
   1.]({{site.baseurl}}/classes/class1.html#les-query-strings-dans-lurl)
1. Testez la nouvelle architecture en appelant la page
   [.../Controleur/routeur.php](http://webinfo/~mon_login/PHP/TD4/Controleur/routeur.php)
   en ajoutant l'information que `action` est égal à `afficherListe` dans l'URL au
   format *query string*.
3. Prenez le temps de comprendre le **MVC** sur cet exemple.
   Avez-vous compris l'ordre dans lequel PHP exécute votre code ?
   Est-ce que ce code vous semble similaire à l'ancien fichier
   `lireUtilisateur.php` ?
   N'hésitez à parler de votre compréhension avec votre chargé de TD.

</div>

#### Solutions

Voici le déroulé de l'exécution du routeur pour l'action `afficherListe` :

1. Le client demande l'URL
[.../Controleur/routeur.php?action=afficherListe](http://webinfo/~mon_login/PHP/TD4/Controleur/routeur.php?action=afficherListe).
1. Le routeur récupère l'action donnée par l'utilisateur dans l'URL avec
   `$action = $_GET['action'];` (donc `$action="afficherListe"`)
2. le routeur appelle la méthode statique `afficherListe` de `ControleurUtilisateur.php`
3. `ControleurUtilisateur.php` se sert du modèle pour récupérer le tableau de tous les utilisateurs ;
4. `ControleurUtilisateur.php` appelle alors la vue qui va nous générer la page Web.


## À vous de jouer

### Vue "détail d'un utilisateur"

Comme la page qui liste tous les utilisateurs (action `afficherListe`) ne donne pas
toutes les informations, nous souhaitons créer une page de détail dont le rôle
sera d'afficher toutes les informations de l'utilisateur. Cette action aura besoin
de connaître le login de l'utilisateur visé ; on utilisera encore le
*query string* pour passer l'information dans l'URL en même temps que l'action :
[.../routeur.php?action=afficherDetail&login=AAA111BB](http://webinfo/~mon_login/PHP/TD4/Controleur/routeur.php?action=afficherDetail&login=AAA11BB)

<div class="exercise">

1. Créez une vue `./vue/utilisateur/detail.php` qui doit afficher tous les
   détails de l'utilisateur stocké dans `$utilisateur` de la même manière que l'ancienne
   fonction `__toString()` (encore commentée dans `ModeleUtilisateur`).
   **Note :** La variable `$utilisateur` sera initialisée dans le contrôleur plus tard,
   *cf.* `$utilisateurs` dans l'exemple précédent.

1. Ajoutez une action `afficherDetail` au contrôleur `ControleurUtilisateur.php`. Cette
   action devra récupérer le login donné dans l'URL, appeler la
   fonction `recupererUtilisateurParLogin()` du modèle, mettre l'utilisateur visée dans la
   variable `$utilisateur` et appeler la vue précédente.

2. Testez cette vue en appelant la page du routeur avec les bons paramètres dans
l'URL.

3. Ajoutez des liens cliquables `<a>` sur les logins de la vue `liste.php`
   qui renvoient sur la vue de détail de l'utilisateur concernée.

4. On souhaite gérer les logins non reconnus : Créez une vue
   `./vue/utilisateur/erreur.php` qui affiche un message d'erreur générique *"Problème
   avec l'utilisateur"* et renvoyez vers cette vue si
   `recupererUtilisateurParLogin()` ne trouve pas d'utilisateur qui correspond à
   ce login, ou si aucun login n'est indiqué dans l'URL.

</div>

### Changement de l'appel à la vue

Actuellement, le chargement d'une vue se fait à l'aide du code 
```php?start_inline=1
require ('../vue/utilisateur/liste.php');
```
On peut légitimement se demander comment le script `liste.php` accède à la variable locale `$utilisateurs` de
`ControleurUtilisateur::afficherListe()`. C'est parce que `require` a pour effet
de "copier/coller" les instructions du `liste.php` dans la méthode `ControleurUtilisateur::afficherListe()`.

Cela pose plusieurs problèmes :
1. la vue a accès à toutes les variables accessibles dans `ControleurUtilisateur::afficherListe()`,
1. la manière de procéder du `require` est très éloignée d'un code orienté-objet propre,
1. une duplication de code commence à se dessiner avec les multiples instructions "*require ('../vue*"

<div class="exercise">

1. Créez dans `ControleurUtilisateur.php` une méthode 
   ```php?start_inline=1
   private static function afficherVue(string $cheminVue, array $parametres = []) : void {
      extract($parametres); // Crée des variables à partir du tableau $parametres
      require "../vue/$cheminVue"; // Charge la vue
   }
   ```
   dont le rôle est d'afficher la vue qui se trouve au chemin `$cheminVue`. L'argument `$parametres`
   sert à définir quelles variables existeront lors de l'exécution de la vue. Par exemple, si
   vous appelez
   ```php?start_inline=1
   ControleurUtilisateur::afficherVue('utilisateur/detail.php', [
      "utilisateurEnParametre" => new Utilisateur("leblancj", "Leblanc", "Juste")
   ]);
   ```
   alors `afficherVue` affichera la vue `vue/utilisateur/detail.php`, qui aura accès uniquement à la variable
   `$utilisateurEnParametre` qui vaut `new Utilisateur("leblancj", "Leblanc", "Juste")`. 
   
   Remarques :

   * La création des variables est faite par la fonction 
   [`extract`](https://www.php.net/manual/fr/function.extract.php) fournie par PHP.

   * La syntaxe `$parametres = []` dans la déclaration de `afficherVue` indique que l'argument
   `$parametres` est optionnel. S'il n'est pas fourni, alors il prendra la valeur par défaut
   `[]`.  
    Ainsi, on peut appeler `ControleurUtilisateur::afficherVue('utilisateur/detail.php')`, ce qui est un 
    raccourci pour `ControleurUtilisateur::afficherVue('utilisateur/detail.php', [])`.

1. Remplacez tous les `require ('../vue/utilisateur/xxx.php');` par des appels à `afficherVue()`.
   Testez que tout fonctionne.

</div>


### Vue "ajout d'un utilisateur"

Nous allons créer deux actions `afficherFormulaireCreation` et `creerDepuisFormulaire` qui doivent respectivement
afficher un formulaire de création d'un utilisateur et effectuer l'enregistrement
dans la s.

<div class="exercise">

1. Commençons par l'action `afficherFormulaireCreation` qui affichera le formulaire :
   1. Créez la vue `./vue/utilisateur/formulaireCreation.php` qui reprend le code de
      `formulaireCreationUtilisateur.html` du TD3.  
      Repasser le formulaire en méthode `GET` pour faciliter son débogage.  
   2. Ajoutez une action `afficherFormulaireCreation` à `ControleurUtilisateur.php` qui affiche cette
      vue.
2. Testez la page d'affichage du formulaire en appelant l'action `afficherFormulaireCreation` de `routeur.php`.
3. Ajoutez aussi un lien *Créer un utilisateur* vers l’action
   `afficherFormulaireCreation` dans `liste.php`.
</div>

<div class="exercise">

3. Créez l'action `creerDepuisFormulaire` dans le contrôleur qui devra

   1. récupérer les données de l'utilisateur à partir de la *query string*,
   2. créer une instance de `ModeleUtilisateur` avec les données reçues,
   3. appeler la méthode `ajouter` du modèle,
   4. appeler la fonction `afficherListe()` pour afficher le tableau de
      tous les utilisateurs.

4. Testez l'action `creerDepuisFormulaire` de `routeur.php` en donnant
   le login, le nom et le prénom.

5. Nous souhaitons maintenant relier l'envoi du formulaire de création à
   l'action `creerDepuisFormulaire` pour que l'utilisateur soit bien créé : 
   1. La page de traitement du formulaire (l'attribut `action` de `<form>`)
   devra renvoyer vers `routeur.php`;
   2. Afin d'envoyer l'information `action=creerDepuisFormulaire` en plus des
      informations saisies dans le formulaire, la bonne façon de faire
      est d'ajouter un champ caché à votre formulaire :

      ```html?start_inline=1
      <input type='hidden' name='action' value='creerDepuisFormulaire'>
      ```
      
      Si vous ne connaissez pas les `<input type='hidden'>`, allez lire
      [la documentation](https://developer.mozilla.org/fr/docs/Web/HTML/Element/input/hidden).

6. Testez le tout, c.-à-d. que la création de l'utilisateur depuis le formulaire
   (action `afficherFormulaireCreation`) appelle bien l'action `creerDepuisFormulaire` et que l'utilisateur est bien
   créée dans la s.

</div>

## Récapitulons

Voici le **diagramme de séquence** UML (simplifié) du cas d'utilisation "*Afficher les détails d'un utilisateur*".

<img alt="Diagramme entité association"
src="https://www.plantuml.com/plantuml/png/ZLPBZkCs4Dtp58MUHMOMGWV8JXW8Cnq1oQ8RuqntigUfifffcLJuQVW4EK1E4MUT6_WcEKbAD1s9RTBnmh18lbVrwl53VhAE6-Ut0xClKetSy2rO_CsZ4lY0rl8UFm-oLo1GEJGBr9tUhNZNITN3TzyoneNJ1cw-7oG1uSUdfzKDS0kn_SvWnnWHdHHovDHpyuZc5Rs1poCNppY1uoTZHrBL7DirV2L1XxySXh1J9ldA7PxWnp-ecjW1DMoqUIdWgiPexoXn3RWxx8LtKYkmmiZHpPI8OOojzOwgqigPmzy3TTt0ktlPFxkxmMDQKUGaVO6e9zxFJWxIyWa17p-AWLlRDC1OP5LD5beJrZfEyGZCDnj95PZsi7TS3ky_p7gpPCPGTK05dCfuqDtXpm6fX9LKBubG6i81IoAJYRkzzHRDxItKvwmmZL_Mlw9BT6JbLKsa5yerAFnus1jSabRStEjUgcNnPs4O4mQZBGftKgixRh75TcgYPUoCKJLvQ0qzkbMdtt-0Vtx_0uGvx7bOC1t2y8rK95O9Z5BA2T-kYOtilU7kBMxfUJvIrPJPDRIuvOgKoGwLanj9sMoYhS1avQ6gxCnNTDgRD5c7vNHbEpBXouwLOQlsozlseoCfMn8uRuMuDWAwuuwlAHxSjIsmekS4XReu-JHQDHI08DF6N0_Isf0pu3Y8KzI0BFb9R1CDZO63GbPKbTq-kH3fd5ov7sBDeq5o59UxZGQYXQd1mOPbpmNB4XXLCaNA6934dqW1UoRs_vWT9kBprIQwSOV2kwJi9EAo4UO-kKpCwRfw_EcUqM2Lng-1N1cr2iik5JU3hX2vGIUUhvDusJM_wDnei-KEfcMCt1VLvUHbKYJdkQ2IdV7IO8kZb_Rfc8DCkkemprmh6H5dg0khy0oQzOayA8lBI2ZUvD7jq_LvEMxfolp5usJgjCIaGNArYsV-yN70UwIUEST_6OZ7w1TAp8KEFf4AUc8ztCDeTETbidE875yHz7Lw1FrW45LovawmUDIMQfXVO7F6PQOiYqKELFCxhy2Fo6NNwM79ZXyKu_Z4f4iiRiNmjCnGFb4nVZly2m00" style="margin-left:auto;margin-right:auto;display:block;">

<!-- Source code:
https://www.plantuml.com/plantuml/uml/ZLPBZkCs4Dtp58MUHMOMGWV8JXW8Cnq1oQ8RuqntigUfifffcLJuQVW4EK1E4MUT6_WcEKbAD1s9RTBnmh18lbVrwl53VhAE6-Ut0xClKetSy2rO_CsZ4lY0rl8UFm-oLo1GEJGBr9tUhNZNITN3TzyoneNJ1cw-7oG1uSUdfzKDS0kn_SvWnnWHdHHovDHpyuZc5Rs1poCNppY1uoTZHrBL7DirV2L1XxySXh1J9ldA7PxWnp-ecjW1DMoqUIdWgiPexoXn3RWxx8LtKYkmmiZHpPI8OOojzOwgqigPmzy3TTt0ktlPFxkxmMDQKUGaVO6e9zxFJWxIyWa17p-AWLlRDC1OP5LD5beJrZfEyGZCDnj95PZsi7TS3ky_p7gpPCPGTK05dCfuqDtXpm6fX9LKBubG6i81IoAJYRkzzHRDxItKvwmmZL_Mlw9BT6JbLKsa5yerAFnus1jSabRStEjUgcNnPs4O4mQZBGftKgixRh75TcgYPUoCKJLvQ0qzkbMdtt-0Vtx_0uGvx7bOC1t2y8rK95O9Z5BA2T-kYOtilU7kBMxfUJvIrPJPDRIuvOgKoGwLanj9sMoYhS1avQ6gxCnNTDgRD5c7vNHbEpBXouwLOQlsozlseoCfMn8uRuMuDWAwuuwlAHxSjIsmekS4XReu-JHQDHI08DF6N0_Isf0pu3Y8KzI0BFb9R1CDZO63GbPKbTq-kH3fd5ov7sBDeq5o59UxZGQYXQd1mOPbpmNB4XXLCaNA6934dqW1UoRs_vWT9kBprIQwSOV2kwJi9EAo4UO-kKpCwRfw_EcUqM2Lng-1N1cr2iik5JU3hX2vGIUUhvDusJM_wDnei-KEfcMCt1VLvUHbKYJdkQ2IdV7IO8kZb_Rfc8DCkkemprmh6H5dg0khy0oQzOayA8lBI2ZUvD7jq_LvEMxfolp5usJgjCIaGNArYsV-yN70UwIUEST_6OZ7w1TAp8KEFf4AUc8ztCDeTETbidE875yHz7Lw1FrW45LovawmUDIMQfXVO7F6PQOiYqKELFCxhy2Fo6NNwM79ZXyKu_Z4f4iiRiNmjCnGFb4nVZly2m00
-->

Concernant le PHP, notez la communication entre les 3 entités Modèle, Vue, Contrôleur :
* le Contrôleur interroge le Modèle afin de récupérer les différents éléments concernant les utilisateurs ;
* le Modèle encapsule les informations de connexion à la s et plus généralement gère la **persistance des données** (cette partie sera approfondie et améliorée dans le TD6) ;
* le Contrôleur transmet les éléments à afficher à la Vue ; ces éléments sont préalablement traités, simplifiés afin de ne pas trop exposer la logique du code métier à la Vue
* le rôle de la Vue est d'afficher les informations transmises ; idéalement la Vue ne gère pas les objets métiers de l'application et se contente uniquement d'afficher les infos
* Il n'y a pas d'interactions entre la vue et le modèle dans l'optique d'encourager une bonne séparation des tâches.

Plus globalement :

* Le serveur Web (Apache) existe avant la requête et continuera de vivre après :
  c'est un *démon*, c'est-à-dire qu'il tourne en continu pour écouter les
  requêtes HTTP. Quand il reçoit une requête, il crée un nouveau processus à
  l'aide d'un fork. C'est ce nouveau processus qui traitera la requête,
  notamment en exécutant PHP.
* Les scripts PHP sont donc exécutés indépendamment. Ceci implique par exemple
  que la connexion à la base de données est refaite à chaque exécution (requête HTTP du client).
* Le script PHP renvoie le code HTML de la page Web, ce qui constituera le corps
  de la réponse HTTP. À partir de ce code HTML, le serveur Web Apache crée et renvoie
  au client une réponse HTTP complète en ajoutant des en-têtes HTTP.
* On voit que le serveur de base de données est un autre *démon*.

Quelques détails de lecture des diagrammes de séquence :

* Quand un acteur (bulle grise) apparait au milieu du diagramme de séquence, cela signifie
  que l'instance correspondante est créée à ce moment-là.
* Un acteur *<<class>> NomDeClasse* fait référence au `NomDeClasse` en tant que classe (et pas une instance particulière de celle-ci).
  Donc cet acteur existe tout le temps et n'est pas créé par un appel de
  constructeur. Ainsi, sur cet acteur, seules les méthodes statiques peuvent être invoquées. 

<!--

* On a l'impression que la vue appelle le modèle avec $user->getLogin(). Au TD5, on verra que la vue n'a accès qu'aux classes de transfert de données (DataObjects), et donc pas aux méthodes de manipulation de la base de données (qui seront dans le repository, et non accessible depuis la vue)

-->
