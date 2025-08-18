---
title: TD6 &ndash; Architecture MVC avancée 2/2
subtitle: Vues modulaires, filtrage, formulaires améliorés
layout: tutorial
lang: fr
---

<!-- Ajouter des fonctions de sécurité/contrôle avec isset($_GET) et les
htmlspecialchars quand on écrit dans du HTML et URLencode quand on écrit dans
une URL -->

<!-- XSS et protection de l'écriture html -->

<!--
Ajouter dispatcher
-->

<!--
Ou est-ce qu'ils codent vraiment utilisateurs et trajets ?
-->

Nous continuons de développer notre site-école de covoiturage. En attendant de pouvoir gérer les
sessions d'utilisateur, nous allons développer l'interface "administrateur" du
site.

Ce TD présuppose que vous avez fini [le TD précédent](tutorial5.html).

## Amélioration du routeur

On veut ajouter un comportement par défaut du routeur qui est contenu dans le
contrôleur frontal. Nous allons faire en sorte qu'un utilisateur qui arrive sur
`controleurFrontal.php` voit la même page que s'il était arrivé sur
`controleurFrontal.php?action=afficherListe`.

#### Action par défaut

<div class="exercise">

1. Si aucun paramètre n'est donné dans l'URL, initialisons la variable `action`
   avec la chaîne de caractères `"afficherListe"` dans `controleurFrontal.php`.
   Utilisez la fonction `isset($_GET['action'])` qui teste si la variable
   `$_GET['action']` a été initialisée, ce qui est le cas si et seulement si une
   variable `action` a été donnée dans l'URL.

1. Testez votre site en appelant `controleurFrontal.php` sans action.

**Note :** De manière générale, il ne faut jamais lire la case d'un tableau
  avant d'avoir vérifié qu'elle était bien définie avec un `isset(...)` sous peine
  d'avoir des erreurs `Undefined index : ...`.

</div>

Désormais, la page [http://localhost/tds-php/TD6/web/controleurFrontal.php](http://localhost/tds-php/TD6/web/controleurFrontal.php) doit marcher sans paramètre ([http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD6/web/controleurFrontal.php](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD6/web/controleurFrontal.php) si vous hébergez le site sur le serveur de l'IUT).

<!-- **Note :** que vous pouvez aussi y accéder avec l'adresse
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `controleurFrontal.php` d'un répertoire
si elles existent. -->

#### Vérification de l'action

<div class="exercise">

On souhaite que le routeur vérifie que `action` est le nom d'une méthode de
`ControleurUtilisateur.php` avant d'appeler cette méthode. Sinon, nous renverrons
vers une page d'erreur.

1. Créez une action `afficherErreur(string $messageErreur = "")` dans le contrôleur
   *utilisateur* qui affiche la vue d'erreur `src/vue/utilisateur/erreur.php` contenant
   le message d'erreur *Problème avec l'utilisateur : `$messageErreur`*, ou juste
   *Problème avec l'utilisateur* si le message est vide. Pour ce faire, il faudra adapter la vue
   `erreur.php` créée dans les TDs précédents.

3. **Modifiez** le code du routeur pour implémenter la vérification de l'action.
   Si l'action n'existe pas, appelez l'action `afficherErreur`.

   **Notes :** 
   * Vous pouvez récupérer le tableau des méthodes visibles d'une classe avec
   [la fonction `get_class_methods()`](http://php.net/manual/fr/function.get-class-methods.php)
   et tester si une valeur appartient à un tableau avec
   [la fonction `in_array`](http://php.net/manual/fr/function.in-array.php).
   * `get_class_methods()` prend en argument une chaine de caractères contenant le
   nom de la classe **qualifié**, c.-à-d. avec le `namespace`.
   <!-- (*Astuce optionnelle*) Si une classe possède un alias avec `use`, on peut
   récupérer le nom de classe qualifié avec
   [`::class`](https://www.php.net/manual/fr/language.oop5.basic.php#language.oop5.basic.class.class).
   Exemple :
   ```php
   use App\Covoiturage\Controleur\ControleurUtilisateur;
   echo ControleurUtilisateur::class
   // Affiche App\Covoiturage\Controleur\ControleurUtilisateur
   ``` -->

4. Modifiez tous les appels à `afficherVue` vers `'utilisateur/erreur.php'` pour
   qu'ils utilisent `afficherErreur` avec un message adéquat.

</div>

## Séparation des données et de leur persistance

Une bonne pratique de la programmation orientée objet est de suivre des
principes de conception, notamment [*SOLID*](https://fr.wikipedia.org/wiki/SOLID_(informatique)).
Vous en avez entendu parler l'an dernier en cours de *Développement Orienté Objet* et vous allez également
les aborder dans le cours *Qualité de développement* de Semestre 3. Le `S` de *SOLID* signifie
*Single responsibility principle* (ou principe de responsabilité unique en
français) : chaque classe doit faire une seule tâche.

Actuellement, notre classe `ModeleUtilisateur` gère 2 tâches : la gestion des
utilisateurs et leur persistance dans une base de donnée. Ceci est contraire aux
principes *SOLID*. Plus concrètement, si on veut enregistrer un utilisateur
différemment plus tard (dans une session, dans un fichier, via un appel d'API,
ou avec une classe *mock* pour des tests), cela impliquera beaucoup de
réécriture de code.

Nous allons séparer les méthodes gérant la persistance des données des autres méthodes
propres aux utilisateurs (méthodes métiers). Voici le diagramme de classe UML modifié que
nous allons obtenir à la fin de cette section :

<img alt="Diagramme de classe"
src="//www.plantuml.com/plantuml/png/ZP91Qy9048Nl-HLpZDIAlNeeIhqKR6jhUnDa4eUmThExpCuMhFZVksfAbjIY44XuyxqtuUsElI1Bg7NcFvLno5Y3iMlovE1kE4pKKgFt4n5MHH1wBArPg6-2OPOPhCaxB0acpYqVx9TL4XWhMZx594tBAGg-51ig1NOPG0QdCFWGfPL7eS37mGq0h5OnsGk7Kd9jAsNwO6pT1ySKtxr8tKRgE1b1v9Ife17Zl2j5LwesEpp9x11mMj1hrEfNxPtXvyUW_9JNEXgzjRIEvoYdR5Gwu3xRNr7U6pdhbLZU_bjUYZJhTbvGLBa7fZ8uOkA4zuVVG6RSTcdSs234UG93QB-ZhR1MNxDZZfnsF89arlKt9wwOfkI2ykzOQCAmU9tboV96_HCLIupFnVO6vmiRt5--jQar6vDPXrh_0000" style="margin-left:auto;margin-right:auto;display:block;">

Notez que dans le schéma UML ci-dessus :
* `ModeleUtilisateur` est scindé en deux classes `UtilisateurRepository` et `Utilisateur`.
* `UtilisateurRepository` et `Utilisateur` ont changé de dossier et de `namespace` par
  rapport à `ModeleUtilisateur`.
* `ajouter` est maintenant une méthode statique qui prend un `Utilisateur` en
  argument.
* La classe `UtilisateurRepository` dépend de `Utilisateur`, mais pas l'inverse
(d'où la direction du lien de dépendance entre les deux classes).

En termes de fichiers, nous aurons l'arborescence suivante après nos modifications :

<img alt="Nouvelle organisation du dossier Modele"
src="{{site.baseurl}}/assets/TD6/listeFichiers.png" style="margin-left:auto;margin-right:auto;display:block;" width=400>


Le dossier `Repository` gère la persistance des données. Le nom `Repository` est
le nom du patron de conception que l'on utilise et que l'on retrouve dans les
outils professionnels (*ORM Doctrine* par exemple).

<div class="exercise">

1. Renommez la classe
   `ModeleUtilisateur` en `Utilisateur`.     
   Utilisez le *refactoring* de PhpStorm : Clic droit sur le nom de la classe >
   *Refactor* > *Rename*.

2. Créez deux dossiers `DataObject` et `Repository` dans `Modele`.

3. Créez une classe `UtilisateurRepository` dans le dossier `Repository` avec le `namespace`
   correspondant (`App\Covoiturage\Modele\Repository`). Déplacez les méthodes suivantes
   de `Utilisateur` dans `UtilisateurRepository` :
   * `recupererUtilisateurs`
   * `recupererUtilisateurParLogin`
   * `ajouter` : À transformer en une méthode statique prenant en paramètre un
   objet de type `Utilisateur`. Cet objet sera l'utilisateur à ajouter. Utilisez
   donc les getters de cet `Utilisateur` afin de retrouver les données à insérer
   dans la requête SQL de la méthode `ajouter`.
   * `construireDepuisTableauSQL` : changez si nécessaire le corps de la
   fonction afin qu'un objet `Utilisateur` soit correctement retourné. 
   * éventuellement `recupererTrajetsCommePassager` : À transformer en une
   méthode `public static` prenant en paramètre un objet de type `Utilisateur`
   dont les getters vous serviront dans les données à insérer dans la requête
   SQL.  
   Mettez à jour l'appel de cette fonction dans `Utilisateur`.
   
   Pensez également à adapter le code des autres fonctions
   de la classe `UtilisateurRepository` afin qu'elles appellent correctement la méthode `construireDepuisTableauSQL`.

4. Déplacer `Utilisateur` dans le dossier `DataObject` et `ConnexionBaseDeDonnees` dans
   `Repository`. 
   
   **Attention** si vous utilisez le drag & drop de PhpStorm, vous allez
   avoir des mauvaises surprises car les `namespace` risquent de ne pas se mettre à jour correctement...  
   La façon correcte de le faire : Clic droit sur le nom de la classe > *Refactor* > *Move Class* > Indiquer le `namespace` correspondant.
   
   Vérifiez que votre code correspond à celui indiqué dans le diagramme de classe évoqué précédemment.

5. Faites remarcher les actions une par une :
   * `afficherListe` : 
     * `recupererUtilisateurs` appartient à la classe `UtilisateurRepository` désormais.
   * `afficherDetail` : 
     * `recupererUtilisateurParLogin` appartient à la classe `UtilisateurRepository`.
   * `creerDepuisFormulaire` :
     * `ajouter` et `recupererUtilisateurs` appartiennent à la classe `UtilisateurRepository` désormais.
     * `ajouter` sera maintenant statique et prendra en argument un objet de
       la classe `Utilisateur` ; les getters de `Utilisateur` servent à construire la requête SQL.

</div>

## CRUD pour les utilisateurs

CRUD est un acronyme pour *Create/Read/Update/Delete*, qui sont les quatre
opérations de base de toute donnée. Nous allons compléter notre site pour qu'il
implémente toutes ces fonctionnalités. Lors des TDs précédents, nous avons
implémenté nos premières actions :

1. *Read* -- afficher tous les utilisateurs : action `afficherListe`
2. *Read* -- afficher les détails d'un utilisateur : action `afficherDetail`
3. *Create* -- afficher le formulaire de création d'un utilisateur : action `afficherFormulaireCreation`
4. *Create* -- créer un utilisateur dans la BDD : action `creerDepuisFormulaire`

Nous allons compléter ces opérations avec la mise à jour et une version
améliorée de la suppression.

#### Action `supprimer`

<div class="exercise">

Nous souhaitons ajouter l'action `supprimer` aux utilisateurs. Pour cela :

1. Écrivez dans `UtilisateurRepository` une méthode statique
   `supprimerParLogin($login)` qui prend en entrée le login à
   supprimer (pensez à utiliser les requêtes préparées de `PDO`).

1. Créez une vue `src/vue/utilisateur/utilisateurSupprime.php` qui affiche *"L'utilisateur
   de login `$login` a bien été supprimé*", suivi de la liste des
   utilisateurs en appelant la vue `liste.php` (de la même manière que
   `utilisateurCreee.php`).

2. Écrivez l'action `supprimer` du contrôleur d'utilisateur pour que

   1. il supprime l'utilisateur dont le login est passé en paramètre dans
      l'URL,
   2. il affiche la vue `utilisateurSupprime.php` en utilisant le mécanisme de vue
      générique, et en donnant en paramètres les variables nécessaires dans la vue.  

3. Enrichissez la vue `liste.php` pour ajouter des liens HTML qui permettent de
   supprimer un utilisateur.

   **Aide :** Procédez par étape. Écrivez d'abord un lien *fixe* dans votre vue,
   puis la partie qui dépend de l'utilisateur.
   <!-- Erreur tentante : utiliser $ROOT_FOLDER dans les liens. On pourrait leur faire faire
   du $ROOTWEB -->

4. Testez le tout. Quand la fonctionnalité marche, appréciez l'instant.

</div>

<!--

Il semble que l'on puisse coder un $ROOTWEB portable à base de
$_SERVER['HTTP_HOST'] qui donne l'hôte et $_SERVER['REQUEST_URI'] qui donne le
chemin dans le serveur (?)

-->

#### Actions `afficherFormulaireMiseAJour` et `mettreAJour`

<div class="exercise">

Nous souhaitons ajouter l'action `afficherFormulaireMiseAJour`, qui affiche le
formulaire de mise à jour, aux utilisateurs. Pour cela :

1. Créez une vue `src/vue/utilisateur/formulaireMiseAJour.php` qui affiche un
   formulaire identique à celui de `formulaireCreation.php`, mais qui sera
   prérempli par les données de l'utilisateur courant. Voici quelques points à
   prendre en compte avant de se lancer :

   2. La vue reçoit un objet `Utilisateur $utilisateur` qui servira à remplir le formulaire avec ses attributs.

   1. L'attribut `value` de la balise `<input>` permet de préremplir un champ du
   formulaire. Utilisez l'attribut HTML `readonly` de `<input>` pour que 
   l'internaute ne puisse pas changer le login.

   3. Rappel : Vous souhaitez envoyer l'information `action=mettreAJour` en plus des
      informations saisies lors de l'envoi du formulaire. La bonne façon de faire
      pour un formulaire de méthode `GET` est d'ajouter un champ caché 
      ```html
      <input type='hidden' name='action' value='mettreAJour'>
      ```

      <!-- 
      Si vous avez un formulaire en méthode POST et que vous voulez transmettre l'action en méthode GET,
      vous pouvez rajouter l'information dans l'URL avec

      ```html?start_inline=1
      <form method="post" action='controleurFrontal.php?action=creerDepuisFormulaire'>
      ```
      -->

   4. Pensez bien à échapper vos variables PHP avant de les écrire dans l'HTML
     et dans les URL.

   5. Astuce optionnelle : La vue `formulaireMiseAJour.php` peut être
   raccourcie en utilisant la syntaxe 
   ```php
   <?= $loginHTML ?>
   ```
   qui est équivalente à
   ```php
   <?php echo $loginHTML; ?>
   ```

2. Écrivez l'action `afficherFormulaireMiseAJour` du contrôleur d'utilisateur
   pour qu'il affiche le formulaire prérempli. Nous ne passerons que le login de
   l'utilisateur *via* l'URL ; les autres informations seront récupérées dans la
   BDD via `UtilisateurRepository`.  
   **Vérifiez** que l'action `afficherFormulaireMiseAJour` affiche bien le
   formulaire.


1. Ajoutons les liens manquants. Enrichissez la vue `liste.php` pour ajouter des
   liens HTML qui permettent de mettre à jour un utilisateur. Ces liens pointent
   donc vers le formulaire de mis-à-jour prérempli.

</div>

<div class="exercise">

1. Maintenant, passons à l'action `mettreAJour` qui effectue la mise à jour dans la
   BDD.

   Créez la vue `src/vue/utilisateur/utilisateurMisAJour.php` pour qu'elle
   affiche *"L'utilisateur de login `$login` a bien été mis à jour*". Affichez
   en dessous de ce message la liste des utilisateurs mise à jour (à la manière
   de `utilisateurSupprime.php` et `utilisateurCreee.php`).

2. Ajoutez à `UtilisateurRepository` une méthode statique
   `mettreAJour(Utilisateur $utilisateur)`. Cette méthode est proche de
   `ajouter(Utilisateur $utilisateur)`, à ceci près qu'elle utilise une requête
   SQL `UPDATE` et que son type de retour est `void`. En effet, on va
   considérer qu'une mise à jour se passe toujours correctement.

3. Créez l'action `mettreAJour` du contrôleur d'utilisateur. Cette action
   instancie l'utilisateur avec les données provenant du formulaire, appelle
   ensuite `UtilisateurRepository::mettreAJour`, puis affiche la vue
   `src/vue/utilisateur/utilisateurMisAJour.php`.

   **Remarque :** N'utilisez pas la méthode `construireDepuisTableauSQL` même si
   cela marcherait actuellement. En effet, la fonction
   `construireDepuisTableauSQL` est codée pour recevoir une réponse à une
   requête SQL au format tableau, et non les données d'un formulaire, ce qui
   sera notamment différent pour les trajets...

4. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>

## Gérer plusieurs contrôleurs

Maintenant que notre site propose une gestion minimale des utilisateurs (*Create /
Read / Update / Delete*), notre objectif est d'avoir une interface similaire
pour les trajets. Dans ce TD, nous allons dans un premier
temps rendre notre MVC d'utilisateurs plus générique. Cela nous permettra de
l'adapter plus facilement aux trajets dans un second temps.

### Dans le routeur du contrôleur frontal

Pour l'instant, nous n'avons travaillé que sur le contrôleur *utilisateur*. Nous
souhaitons maintenant ajouter le contrôleur *trajet*. Pour
gérer tous les contrôleurs à partir de notre page d'accueil unique `controleurFrontal.php`,
nous avons besoin d'appeler le bon contrôleur dans le routeur.

Désormais, nous devons donc spécifier le contrôleur demandé dans le *query
string*. Par exemple, l'ancienne page `controleurFrontal.php?action=afficherListe` du contrôleur
*utilisateur* devra s'obtenir avec `controleurFrontal.php?controleur=utilisateur&action=afficherListe`.

<div class="exercise">

1. Définissez une variable `controleur` dans `controleurFrontal.php` en récupérant sa
valeur à partir de l'URL, et en mettant le contrôleur *utilisateur* par défaut.

   **Aide :** Ce bout de code est similaire à celui concernant `action` dans
  `controleurFrontal.php`.

1. On souhaite créer le nom de la classe à partir de `controleur`. Par exemple,
   quand `$controleur="utilisateur"`, nous souhaitons créer une variable
   `$nomDeClasseControleur` qui vaut `"App\Covoiturage\Controleur\ControleurUtilisateur"`.  
   **Créez** la variable `$nomDeClasseControleur` à l'aide de la fonction
   [`ucfirst`](http://php.net/manual/fr/function.ucfirst.php) (UpperCase
   FIRST letter) qui sert à mettre en majuscule la première lettre d'une chaîne
   de caractère.

2. Testez si la classe de nom `$nomDeClasseControleur` existe à l'aide de la
   fonction [`class_exists`](http://php.net/manual/fr/function.class-exists.php)
   et appelez l'action `action` de la classe `$nomDeClasseControleur` le cas
   échéant. Autrement appelez l'action `afficherErreur` de `ControleurUtilisateur`.

3. Testez votre code en appelant vos anciennes pages du contrôleur *utilisateur*.

   **Attention :** les liens URL de vos différentes vues risquent de ne plus fonctionner.
   Si oui, trouvez pourquoi et corrigez.

</div>

### Début du nouveau contrôleur

Maintenant que notre routeur dans le contrôleur frontal est en place, nous
pouvons créer de nouveaux contrôleurs. Pour avoir un aperçu de l'étendu du
travail, commençons par créer l'action `afficherListe` de `Trajet`.

<div class="exercise">

2. Créez deux classes `DataObject/Trajet.php` et
   `Repository/TrajetRepository.php` (indépendamment de la classe `Trajet` que vous avez fait dans les TDs 2 & 3)

3. À partir de votre classe `Trajet` des TDs 2 & 3, copiez/collez : 
   
   * dans `DataObject/Trajet.php` : les attributs, les *getter*, les *setter* et le
   constructeur.
   * dans `Repository/TrajetRepository.php` : les fonctions
     `construireDepuisTableauSQL($trajetTableau)`, `recupererTrajets()` et
     `recupererPassagers()`.


   <!-- Enlevez les `require_once`, indiquez les bons `namespace` correspondant aux
   dossiers et importez les classes nécessaires avec `use`. -->


4. Corrigeons les appels aux méthodes dans `TrajetRepository.php` : 
   * `Utilisateur::recupererUtilisateurParLogin` → `UtilisateurRepository::recupererUtilisateurParLogin`
   * `Utilisateur::construireDepuisTableauSQL` → `UtilisateurRepository::construireDepuisTableauSQL`
   * `Trajet::construireDepuisTableauSQL` → `TrajetRepository::construireDepuisTableauSQL`
   * changez la signature de la fonction `recupererPassagers` pour 
     ```php
     static public function recupererPassagers(Trajet $trajet): array
     ```
     et corrigez le tableau de valeurs donné à la requête préparée.
   * `$trajet->recupererPassagers()` → `TrajetRepository::recupererPassagers($trajet)`
   
   Si vous aviez codé l'attribut `trajetsCommePassager` de `Utilisateur` au TD3 : 
   * Dans `UtilisateurRepository.php` :  
     `Trajet::construireDepuisTableauSQL` → `TrajetRepository::construireDepuisTableauSQL`
   * Dans `Utilisateur.php` : importez la classe `Trajet` dans `Utilisateur.php`
   (utilisé au niveau du PHPDoc du getter et du setter de l'attribut `trajetsCommePassager`).

5. Créez une vue `src/vue/trajet/liste.php` similaire à celle des utilisateurs
   (en commentant les liens pour l'instant).  
   Idem pour `trajet/erreur.php`.

1. Créez un contrôleur `controleur/ControleurTrajet.php` similaire à celui
   des utilisateurs qui reprend les méthodes `afficherListe()`, `afficherVue()` et
   `afficherErreur()` (et commente éventuellement les autres méthodes).  
   Importez les classes nécessaires.

   **Astuce :** Vous pouvez utiliser la fonction de remplacement (`Ctrl+R` sous
     PHPStorm) pour remplacer tous les `utilisateur` par `trajet`. En cochant
     `Préserver la casse` (`Preserve case`), vous pouvez faire en sorte de
     respecter les majuscules lors du remplacement.

6. **Testez** votre action en appelant l'action `afficherListe` du contrôleur
   `Trajet` (qui est accessible dans la barre de menu de votre site
   normalement).

</div>

## Modèle générique

L'implémentation du CRUD pour les trajets est un code très
similaire à celui pour les utilisateurs. Nous pourrions donc copier/coller le code
des utilisateurs et changer les (nombreux) endroits nécessaires, mais cela contredirait
le principe [DRY](https://fr.wikipedia.org/wiki/Ne_vous_r%C3%A9p%C3%A9tez_pas)
que vous connaissez depuis l'an dernier.

### Création d'un modèle générique

Pour éviter la duplication de code et la perte d'un temps conséquent à
développer le CRUD pour chaque nouveau type d'objet, nous allons mettre en commun le
code autant que possible. Commençons par abstraire les 2 classes métiers `Utilisateur` et `Trajet`.

<img alt="Diagramme de classe"
src="https://www.plantuml.com/plantuml/png/SoWkIImgAStDuN9CAYufIamkSKaiIVHFoafDBb6mgT7LLGWfIinABS4f7LgIcPDPd5YIMbh4vP2Qbm8q2W00" style="margin-left:auto;margin-right:auto;display:block;">

<div class="exercise">

Créer une classe abstraite `AbstractDataObject` dans le dossier `DataObject`.
Faites hériter les autres classes de ce répertoire de `AbstractDataObject` pour
correspondre au diagramme de classe ci-dessus (mot clé `extends` comme en Java).

</div>

Également, nous allons abstraire les classes *Repository* de façon à obtenir le schéma suivant :   

<img alt="Diagramme de classe"
src="https://www.plantuml.com/plantuml/png/SoWkIImgAStDuN9CAYufIamk2Kejo2_EBCalgbImgT7LLGWfIinAHHB5gJ2q93CdipYn9BMq24crGsfU2j1u0000" style="margin-left:auto;margin-right:auto;display:block;">

Nous allons détailler ces changements dans les prochaines sections.

Déplaçons de `UtilisateurRepository` vers un modèle générique `AbstractRepository`
toutes les requêtes SQL qui ne sont pas spécifiques aux utilisateurs.

<!-- 

TODO : rewrite l'an prochain. Le nouveau factoring marche mieux mais émet des messages de warning

1. recupererUtilisateurs plus statiques
   4 changements dans Contr (Ctrl+R ou Alt+J)
   Pour pouvoir utiliser héritage
   
1. recupererUtilisateurParLogin plus statique
   2 changements dans Contr (Ctrl+R ou Alt+J)
   Pour pouvoir utiliser héritage

1. public static function construireDepuisTableauSQL
   plus statique
   2 change Repo: $this-> 
   1 change Contr: new UtilisateurRepos->
   créer interface avec type de retour AbstractDataObject
   
1. getNomTable
   interface + implémentation + utilisation dans recupererUtilisateurs

2. recupererUtilisateurs -> abstract recuperer
   Pull member Up (skip le message de warning)

 -->

<div class="exercise">

Commençons par la fonction `recupererUtilisateurs()` de `UtilisateurRepository`. Les seules
différences entre `recupererUtilisateurs()` et `recupererTrajets()` sont le nom de la table
et le nom de la classe des objets en sortie. Voici donc comment nous allons
faire pour avoir un code générique :

1. Créez une nouvelle classe *abstraite* `abstract class AbstractRepository` et
   faites hériter la classe `UtilisateurRepository` de `AbstractRepository`.

1. Pour qu'on puisse migrer la fonction `recupererUtilisateurs()` de `UtilisateurRepository` vers
   `AbstractRepository`, il faudrait que cette dernière puisse accéder au nom de la table.
   Pour cela, elle va demander à toutes ses classes filles de posséder une méthode `getNomTable()`.  
   Ajoutez donc une méthode abstraite `getNomTable()` dans `AbstractRepository`
   ```php
   protected abstract function getNomTable(): string;
   ```
   et une implémentation de `getNomTable()` dans `UtilisateurRepository`.

   **Question** : pourquoi la visibilité de cette fonction est `protected` ?  
   **Réponse (surlignez le texte caché à droite):**
   <span style="color:#FCFCFC">
   Pour rendre accessible cette méthode uniquement à la classe *AbstractRepository* et à ses classes filles.
   </span>

   <!-- getNomTable n'est pas statique car PHP déconseille l'utilisation de méthode statique et abstraite (PHP émet un warning) -->

2. Déplacez la fonction `recupererUtilisateurs()` de `UtilisateurRepository` vers `AbstractRepository` en la renommant `recuperer()`.

   **Astuce** : sur PhpStorm le moyen le plus simple pour déplacer la fonction serait *Clic droit sur la déclaration de la méthode* >
   *Refactor* > *Move Members* > *Indiquer `AbstractRepository` comme classe de destination*. De même pour le renommage, pensez à utiliser le refactoring.

3. Utilisez `getNomTable()` dans la requête *SQL* de `recuperer()`. Puisque
   `getNomTable()` est une méthode dynamique, enlevez le `static` de
   `recuperer()`.

   ```php
   /**
    * @return AbstractDataObject[]
    */
   public function recuperer(): array
   ```

4. De même, `AbstractRepository` va demander à toutes ses classes filles de
   posséder une méthode `construireDepuisTableauSQL($objetFormatTableau)`.  
   * Ajoutez donc une méthode abstraite dans `AbstractRepository`
   ```php
   protected abstract function construireDepuisTableauSQL(array $objetFormatTableau) : AbstractDataObject;
   ```
   * Enlevez le `static` de la signature de la fonction `construireDepuisTableauSQL()` de `UtilisateurRepository`.
   * Passez tous les appels à `construireDepuisTableauSQL()` de
     `UtilisateurRepository` en appel de méthode d'instance (dynamique) avec  
     ```php
     new UtilisateurRepository()->construireDepuisTableauSQL($objetFormatTableau);
     ```
     Ceci construit un objet anonyme afin de pouvoir appeler les fonctions
     dynamiques de `UtilisateurRepository`.
     
   * Pensez à vérifier que l'implémentation de la méthode `construireDepuisTableauSQL()` de
     `UtilisateurRepository` déclare bien le type de retour `Utilisateur` (sous-classe
     de `AbstractDataObject`).
   <!-- * La méthode `construireDepuisTableauSQL()` devient **dynamique** et `protected` dans `UtilisateurRepository`. -->

   <!-- attention déclaration de type correspondante entre méthode et 
   implémentation -->

   <!-- construireDepuisTableauSQL($objetFormatTableau): AbstractDataObject; -->

5. Corrigez l'action `afficherListe` du `ControleurUtilisateur` pour faire appel à la
   méthode d'instance `recuperer()` de `UtilisateurRepository` avec :

   ```php
   new UtilisateurRepository()->recuperer();
   ```

   L'action `afficherListe` du contrôleur *utilisateur* doit remarcher.

   **Attention :** pour les autres actions le code ne marche plus pour l'instant car la migration des appels
   statiques vers des appels dynamiques n'est pas encore terminée...

6. Mettez à jour tous vos appels à `recupererUtilisateurs()` (ou `recuperer()` si la
   méthode `recupererUtilisateurs()` a été correctement renommé par le *refactoring* de la
   question 3).

</div>

<div class="exercise">

1. Faites de même pour `TrajetRepository` :
   * commentez `recupererTrajets()`,
   * `construireDepuisTableauSQL()` passe de `public static` à `protected`. Mettez aussi à jour ses appels.
   * implémentez `getNomTable()`,
   * `TrajetRepository` doit hériter de `AbstractRepository`.
   * l'appel à `UtilisateurRepository::construireDepuisTableauSQL(...)` n'est plus statique.

2. Corrigez l'action `afficherListe` du `ControleurTrajet` pour faire appel à la
   méthode `recuperer()` de `TrajetRepository`. L'action doit remarcher.

</div>

### Action `afficherDetail`

Pour faciliter les actions `afficherDetail` des différents contrôleurs, nous allons créer
une fonction `recupererParClePrimaire($valeurClePrimaire)` générique dans `AbstractRepository`
qui permet de faire une recherche par clé primaire dans une table.

<div class="exercise">

1. Commençons par déclarer la fonction `recupererUtilisateurParLogin` dans la
   classe `AbstractRepository` en généralisant la méthode correspondante déjà existante dans `UtilisateurRepository` :
   1. utilisez PHPStorm sur la fonction
      `UtilisateurRepository::recupererUtilisateurParLogin`, clic droit >
      *Refactor* > *Pull Members Up* : ceci aura pour effet de déplacer la
      fonction dans `AbstractRepository`.
   2. utilisez PHPStorm sur la fonction
      `AbstractRepository::recupererUtilisateurParLogin`, clic droit >
      *Refactor* > *Rename* > indiquez `recupererParClePrimaire` : ceci
      renommera la méthode ainsi que tous ses appels.
   3. enlevez le `static` de la méthode `AbstractRepository::recupererParClePrimaire`.  
      Corrigez tous les appels à la méthode avec PHPStorm : Faites `Ctlr+Maj+R`
      pour remplacer dans tous les fichiers
      `UtilisateurRepository::recupererParClePrimaire` par 
      `new UtilisateurRepository()->recupererParClePrimaire`.
   4. Testez que la page de détail d'un utilisateur marche toujours.
      
2.  Pour que la fonction `recupererParClePrimaire(string)` puisse être générique, il faut récupérer
   *nom de la clé primaire* du type effectif de `$this`. De la même manière qu'avec `getNomTable()`,
    demandez aux implémentations de `AbstractRepository` de fournir une méthode `getNomClePrimaire() : string`.

4. Transformons `recupererParClePrimaire` en une méthode générique : 
   1. Utilisez `getNomTable` et `getNomClePrimaire` pour rendre la requête générique,
   2. `construireDepuisTableauSQL` doit être appelé sur l'objet courant `$this`,
   3. Le type de retour de la méthode est `?AbstractDataObject`,
   4. Changez les noms de variables pour avoir l'air d'une méthode
      générique, par exemple `utilisateur` → `objet` et `login` → `clePrimaire`.
   5. Testez que la page de détail d'un utilisateur marche toujours.
</div>

<!-- <div class="exercise">

1. Commençons par déclarer la fonction suivante dans la classe `AbstractRepository` :
   ```php
   public function recupererParClePrimaire(string $valeurClePrimaire): ?AbstractDataObject
   ```
   
   Copiez/collez le corps de la fonction `recupererUtilisateurParLogin($login)`
   vers `recupererParClePrimaire($valeurClePrimaire)` de `AbstractRepository`. Nous allons
   le *refactoriser* dans les questions suivantes pour qu'il devienne générique.

2. Ajoutez la méthode suivante dans `AbstractRepository`
   ```php
   protected abstract function getNomClePrimaire(): string;
   ```
   et une implémentation de `getNomClePrimaire()` dans `UtilisateurRepository`.

3. Utilisez `getNomTable()` et `getNomClePrimaire()` pour construire la requête
   *SQL* de `recupererParClePrimaire()`.

4. Finissez de corriger `recupererParClePrimaire()` :
   * Changez les valeurs dans le tableau donné à `execute()`
   * Corrigez l'appel à `construireDepuisTableauSQL()` qui est une méthode dynamique maintenant.

5. Corrigez l'action `afficherDetail` du `ControleurUtilisateur` pour faire appel à la méthode
   `recupererParClePrimaire()` de `UtilisateurRepository`. L'action doit remarcher.

</div> -->

<div class="exercise">

Faites de même pour les trajets.

1. Implémentez la méthode `getNomClePrimaire()` de `TrajetRepository`.

2. Créez l'action `afficherDetail` du `ControleurTrajet` en vous basant sur celle de
   `ControleurUtilisateur`.

   **Rappel :** Utilisez le remplacement `Ctrl+R` en préservant la casse pour vous faciliter le travail.

3. Créer la vue associée `detail.php` en repartant de l'ancien code de
   `Trajet::toString()`. Ajouter les liens vers la vue de détail dans
   `liste.php` en spécifiant bien `controleur=trajet` dans le *query string*.  
   L'action `afficherDetail` doit maintenant fonctionner.

5. *Question innocente :* Avez-vous pensé à échapper vos variables dans vos vues
   pour le HTML et les URL ?  
   Ayez toujours un utilisateur et un trajet avec des caractères spéciaux pour
   le HTML (par ex. `<h1>Hack`) et les URL (par ex. `a&b=c`) dans votre base de
   données. Comme ça, vous pourrez tester plus facilement que vous avez sécurisé
   cet aspect.

**Remarque :** Observez que lors de l'appel du constructeur de `Trajet` dans la fonction `construireDepuisTableauSQL`
de `TrajetRepository`, vous passez en paramètres la référence obtenue à partir de `recupererParClePrimaire()`.
La fonction `recupererParClePrimaire()` est "générique" et retourne un objet de type `AbstractDataObject` ou `null`.
Or, la signature du constructeur de `Trajet` demande une référence de type `Utilisateur` et pas n'importe quel `AbstractDataObject` !
À l'exécution ce code fonctionne, car la liaison dynamique fait que le type effectif retourné par `recupererParClePrimaire()` est bel et bien
`Utilisateur`. Mais la vérification de type ne peut pas être garantie par votre IDE en amont et vous pouvez obtenir un warning.
On touche là aux limites d'un langage non fortement typé : la vérification que les types sont correctement définis et respectés est une
tâche du développeur, contrairement aux langages fortement typés où cette vérification est faite davantage lors de la phase de compilation.



</div>


### Action `supprimer`

Pas de nouveautés.

<div class="exercise">

1. Nous vous laissons migrer la fonction `supprimerParLogin($login)` de
   `UtilisateurRepository` vers `AbstractRepository` en la renommant
   `supprimer($valeurClePrimaire)`. La méthode devient dynamique. Adapter sa
   requête *SQL*.  
   La suppression d'un utilisateur doit continuer à marcher après la modification. 

2. Créez l'action `supprimer` du contrôleur *trajet*, ainsi que
   sa vue associée `trajetSupprime.php` et son lien dans `liste.php`.  
   Testez que la suppression d'un trajet marche dorénavant.

</div>

### Actions `afficherFormulaireCreation` et `creerDepuisFormulaire`

Commençons par rendre générique la méthode de création d'entités. Pour
reconstituer la requête
```sql
INSERT INTO utilisateur (login,  nom,  prenom) VALUES (:loginTag, :nomTag, :prenomTag)
```
il est nécessaire de pouvoir lister les champs de la table `utilisateur`. De même, il sera nécessaire de lister
les champs de la table `trajet`. Nous allons factoriser le code nécessaire dans `AbstractRepository`.

<div class="exercise">

1. Déplacez la fonction `ajouter($utilisateur)` de
   `UtilisateurRepository` vers `AbstractRepository`. Changez la signature
   de la fonction par
   ```php
   public function ajouter(AbstractDataObject $objet): bool
   ```

2. Ajoutez une méthode abstraite `getNomsColonnes()` dans
   `AbstractRepository`
   ```php
   /** @return string[] */
   protected abstract function getNomsColonnes(): array;
   ```
   et une implémentation de `getNomsColonnes()` dans `UtilisateurRepository`
   ```php
   /** @return string[] */
   protected function getNomsColonnes(): array
   {
       return ["login", "nom", "prenom"];
   }
    ```

3. Utilisez `getNomTable()` et `getNomsColonnes()` pour
   construire la requête *SQL* de `ajouter()` : 
   ```sql
   INSERT INTO utilisateur (login,  nom,  prenom) VALUES (:loginTag, :nomTag, :prenomTag)
   ```

   **Aide :**
   * La [fonction `join(string $separator, array
     $array)`](https://www.php.net/manual/fr/function.join.php) pourrait vous
     faire gagner du temps. Elle concatène les éléments de `$array` en insérant
     `$separator` entre chaque case. 
   * N'hésitez pas à afficher la requête générée pour vérifier votre code.

4. Pour les besoins de `execute()`, nous devons transformer l'objet
   `Utilisateur $utilisateur` en un tableau 
   ```php
   array(
       "loginTag" => $utilisateur->getLogin(),
       "nomTag" => $utilisateur->getNom(),
       "prenomTag" => $utilisateur->getPrenom(),
   );
   ```

   Ajoutez une méthode abstraite `formatTableauSQL()` dans `AbstractRepository`
   ```php
   protected abstract function formatTableauSQL(AbstractDataObject $objet): array;
   ```
   Implémentez cette fonction dans `UtilisateurRepository` avec
   ```php
   protected function formatTableauSQL(AbstractDataObject $utilisateur): array
   {
       /** @var Utilisateur $utilisateur */
       return array(
           "loginTag" => $utilisateur->getLogin(),
           "nomTag" => $utilisateur->getNom(),
           "prenomTag" => $utilisateur->getPrenom(),
       );
   }
   ```

5. Utilisez `formatTableauSQL()` dans `ajouter()` pour obtenir le tableau donné à
   `execute()`.

6. Corrigez l'action `creerDepuisFormulaire` du `ControleurUtilisateur` pour faire appel aux
   méthodes de `UtilisateurRepository`. L'action doit remarcher.
</div>

Passons à la création de trajet. Grâce à l'exercice précédent, la méthode
`ajouter` de `TrajetRepository` est quasiment fonctionnelle. Finissons cette
méthode.


<div class="exercise">

1. Implémentez la méthode `getNomsColonnes` dans `TrajetRepository`. Indiquez
   bien tous les champs, même `id`. 
   
   PHPStorm peut vous générer le squelette de la méthode avec Clic droit dans la
   classe `TrajetRepository` > *Generate* > *Implement Methods* >
   `getNomsColonnes`.
2. Implémentez la méthode `formatTableauSQL` dans `TrajetRepository` en vous
   basant sur le tableau de valeurs de la requête de création de trajets du TD3
   qui se trouvait dans `Trajet::ajouter()`.  
   Ajoutez aussi une case `"idTag" => $trajet->getId()` dans le tableau renvoyé.

</div>

Mais il reste à gérer les actions de contrôleur et les vues de création.
Démarrons par le formulaire de création.

<div class="exercise">

1. Créez la vue `vue/trajet/formulaireCreation.php` en vous basant sur votre
   formulaire de création de trajets du TD3.  
   Modifiez l'`action` de `<form>` et rajoutez deux `<input type="hidden">` pour
   indiquer le contrôleur et l'action souhaités (inspirez-vous du formulaire de
   création des utilisateurs).
2. Créez l'action `afficherFormulaireCreation` dans `ControleurTrajet` en vous
   inspirant du MVC *utilisateur*.
3. Rajoutez dans `vue/trajet/liste.php` un lien vers le formulaire de création.
4. Testez que le lien vous amène bien vers un formulaire de création de trajet.

</div>

Passons à l'action de création de trajet.

<div class="exercise">

1. Créez l'action `creerDepuisFormulaire` dans `ControleurTrajet` en vous
   inspirant du script `creerTrajet.php` du TD3, et de l'action similaire des utilisateurs.

   Ne traitez pas spécialement les cas d'erreur pour l'instant. Donnez un identifiant `null` au trajet.
2. Créez la vue `vue/trajet/trajetCree.php` similaire à celle des utilisateurs.
3. Testez la création d'un trajet à partir du formulaire.

   **Aide :** Si vous avez une erreur 
   ```text
   Fatal error: Uncaught TypeError: ...\Trajet::getId(): Return value must be of type int, null returned
   ```
   il faut modifier le type de retour de `Trajet::getId()` avec `?int`, ce qui
   acceptera la valeur `null`.
   <!-- Supprimer cet aide  l'an prochain car j'ai corrigé Trajet.php du TD3 -->
   
</div>

Maintenant que cela marche enfin et que vous vous êtes autocongratulé,
comprenons pourquoi la création d'un nouveau trajet en BDD nécessite un
identifiant `null`. La raison est que MySQL génère la valeur auto-incrémentée
d'une colonne (déclarée `NOT NULL`) si on lui donne la valeur `null`. Pratique !


### Actions `afficherFormulaireMiseAJour` et `mettreAJour`

Commençons par rendre générique la méthode de mise à jour des données. 

<div class="exercise">

1. Déplacez la fonction `mettreAJour($utilisateur)` de
   `UtilisateurRepository` vers `AbstractRepository`. Changez la signature de la fonction par
   ```php
   public function mettreAJour(AbstractDataObject $objet): void
   ```

2. Utilisez `getNomTable()`, `getNomClePrimaire()` et `getNomsColonnes()` pour
   construire la requête *SQL* de `mettreAJour()` : 
   ```sql
   UPDATE utilisateur SET nom= :nomTag, prenom= :prenomTag, login= :loginTag WHERE login= :loginTag;
   ```

   **Aide :** N'hésitez pas à afficher la requête générée pour vérifier votre
   code.

3. Utilisez `formatTableauSQL()` dans `mettreAJour()` pour obtenir le tableau donné à
   `execute()`.

4. Corrigez l'action `mettreAJour` du `ControleurUtilisateur` pour faire appel aux
   méthodes de `UtilisateurRepository`. L'action doit remarcher.

</div>

Passons à la mise à jour de trajet. Grâce à l'exercice précédent, la méthode
`mettreAJour` de `TrajetRepository` est directement fonctionnelle ! Mais il reste à
gérer les actions de contrôleur et les vues de mise à jour. Démarrons par le
formulaire de mise à jour.

<div class="exercise">

1. Créez la vue `vue/trajet/formulaireMiseAJour.php` en vous basant sur votre
   formulaire de création des trajets. Modifiez le `<input type="hidden">`
   correspondant à l'action pour transmettre l'action de mise à jour.

2. On souhaite que le formulaire de mise à jour des trajets soit prérempli,
   comme c'est le cas pour celui des utilisateurs. Inspirez-vous de ce dernier.

   **Notes :**
   * la valeur d'un `<input type="date">` doit être une date au format "Y-m-d",
   * on peut cocher un `<input type="checkbox">` en lui ajoutant l'attribut `checked`.
3. Rajoutez un `<input type="hidden">` pour transmettre l'`id` du trajet.
4. Créez l'action `afficherFormulaireMiseAJour` dans `ControleurTrajet` en vous
   inspirant du MVC *utilisateur*.
5. Rajoutez dans `vue/trajet/liste.php` un lien vers le formulaire de mise à jour.
6. Testez que le lien vous amène bien vers un formulaire de mise à jour de trajet prérempli.
7. *Question innocente* 😇 : Avez-vous pensé à échapper vos variables dans vos
   vues pour le HTML et les URL ? Avez-vous testé avec un trajet contenant des
   caractères spéciaux pour le HTML et les URL ?

   *Rappel :* Les attributs HTML, comme la *value* d'un `<input>`, doivent être
   échappés par rapport aux caractères spéciaux du HTML.

</div>

Passons à l'action de mise à jour de trajet. Cette action va commencer par créer
un `Trajet` à partir des données transmises par le formulaire. Ce code est
identique au début de l'action `creerDepuisFormulaire`, donc nous allons
l'isoler dans une méthode pour ne pas le dupliquer.

<div class="exercise">

1. PHPStorm permet d'isoler le code dans une méthode automatiquement : surlignez
   les lignes complètes de `ControleurTrajet::creerDepuisFormulaire` qui lisent
   `$_GET` et construisent le trajet, puis Clic droit > *Refactor* > *Extract
   Method*. Indiquez `construireDepuisFormulaire` comme nom de méthode. Modifiez
   sa signature par 
   ```php
   private static function construireDepuisFormulaire(array $tableauDonneesFormulaire): Trajet
   ```
   où `$tableauDonneesFormulaire` jouera le rôle de `$_GET`.
2. Actuellement, le trajet créé par `construireDepuisFormulaire` a un
   identifiant `null`, ce qui va bien pour la création mais pas pour la mise à
   jour d'un trajet. Initialisez l'`id` du trajet pour qu'il contienne
   `$tableauDonneesFormulaire["id"]`, ou `null` si cette case n'existe pas dans
   le tableau.

   **Astuce :** PHP fournit [une syntaxe
   raccourcie](https://www.php.net/manual/fr/migration70.new-features.php#migration70.new-features.null-coalesce-op)
   pour donner une valeur par défaut si une variable n'existe pas. Pour nos
   besoins, nous pourrons utiliser
   ```php
   $id = $tableauDonneesFormulaire["id"] ?? null;
   ```
3. Créez de la même manière la méthode `construireDepuisFormulaire` dans
   `ControleurUtilisateur`. Cette méthode doit être utilisée deux fois : dans
   `mettreAJour` et dans `creerDepuisFormulaire`.

   **Remarque :** Cette méthode semble peu utile pour les utilisateurs
   actuellement. Elle prendra toute son importance au TD8 quand la création de
   l'utilisateur se complexifiera avec un mot de passe, une adresse email
   qui doit être vérifiée...
4. Créez l'action `mettreAJour` dans `ControleurTrajet` en vous basant sur
   l'action similaire des utilisateurs.
5. Créez la vue `vue/trajet/trajetMisAJour.php` similaire à `trajetCree.php`.
6. Testez la mise à jour d'un trajet à partir du formulaire.
   
</div>

<!-- 
Limiter les contrôleurs aux actions autant que possible
 -->

### Diagramme de classe final de la partie `Repository`

<img alt="Diagramme de classe"
src="https://www.plantuml.com/plantuml/png/vLJ1hjem4BpxArRgeQaG4hrMY890bLfLBItq0pPXYqpjE5glAr7AlzUD2KHA0eVtRe-BpNfsD3ixojmBiWHhbF-bomePBPHkHvugU3kPgDTmgnS6lL-8iCw3qCV2bHlzXs2Y5EPU60j945XS_dwdodajZeymdJQOsUoa0E0Ld9hA6VOaNvpTOcueU_CEObcN-m7Kqj2QjKNDZx5-wOmhI_B_aSYCnmumJX6l8RAjg0hQro8mRBvzpke6SFc1v8DZYt9vYrpDX2iK_1e1XNI8VpOj3Lst1rnzjBMDWAa85J5nDb1V8xSzI0R0RpGKsW-n-ts_p17WmGKXxf5qLPGxPnBOaWZJufCBV6U6XFMXgbXRuc5PYHhKMQMmR1aFr8vAYiUTJ3mEmltjF-_AdxpdDNgFUsAV9Ij0wgD1Nutw8TfeZqA1Nx1RoQCerbfgdCjQra2utID5T4_rVOx-ZiVTvDM_8NY__sfEvIvOymy0" style="margin-left:auto;margin-right:auto;display:block;">


## Bonus

### Contrôleur passager

On voudrait pouvoir inscrire et désinscrire des passagers aux trajets (*cf.
TD3*). La page de détail d'un trajet listerait la liste des passagers avec un
lien de désinscription par passager, ainsi qu'un formulaire pour inscrire un
passager à partir de son login.

Ces actions seraient traitées par un MVC *passager* qui aurait deux actions :
inscrire et désinscrire. 

Le modèle générique fournit directement l'inscription via la méthode `ajouter`.
Par contre, il est nécessaire d'adapter la méthode générique `supprimer` pour
pouvoir gérer une clé primaire constituée d'un couple.

Les vues *passagers* affichent un bref message et fournissent un lien pour
retourner au détail du trajet modifié.

### Autres idées

<!-- * Faire en sorte que la méthode d'erreur prenne en argument un message d'erreur. Chaque appel à cette méthode doit maintenant fournir un message d'erreur personnalisé. -->
<!-- * Factoriser le code des contrôleurs dans un contrôleur générique, au moins pour
  la méthode `afficherVue()`  -->
* Faire en sorte que les formulaires de création et de mise à jour d'un trajet
  ne propose que les logins des conducteurs existants, via un champ `<select>`.
* `construireDepuisFormulaire` devrait gérer ses erreurs avec un `throw new
  Exception("message personnalisé")`. L'action du contrôleur aurait donc un
  `try` / `catch` qui appellerait `afficherErreur` en cas d'exception. Les
  erreurs possibles sont des données manquantes dans
  `$tableauDonneesFormulaire`, ou le `conducteurLogin` qui ne correspond pas à
  un conducteur existant.
* Gérer que la méthode générique `ajouter` renvoie l'identifiant auto-généré
  s'il en existe un (*cf.* exercice bonus TD3 avec `lastInsertId`).

<!-- * Violation de SRP : le contrôleur frontal et le routeur devrait être séparés -->
