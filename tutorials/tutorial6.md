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

Aujourd'hui nous continuons de développer notre site-école de covoiturage. Au
fur et à mesure que le projet grandit, nous allons bénéficier du modèle MVC qui
va nous faciliter la tâche de conception. En attendant de pouvoir gérer les
sessions d'utilisateur, nous allons développer l'interface "administrateur" du
site.

Le but des TDs 5 & 6 est donc d'avoir un site qui propose une gestion minimale
des voitures, utilisateurs et trajets proposés en covoiturage.

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

Désormais, la page
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD6/web/controleurFrontal.php](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD6/web/controleurFrontal.php)
doit marcher sans paramètre.

<!-- **Note :** que vous pouvez aussi y accéder avec l'adresse
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `controleurFrontal.php` d'un répertoire
si elles existent. -->

#### Vérification de l'action

<div class="exercise">

On souhaite que le routeur vérifie que `action` est le nom d'une méthode de
`ControleurVoiture.php` avant d'appeler cette méthode. Sinon, nous renverrons
vers une page d'erreur.

1. Créez une action `afficherErreur(string $messageErreur = "")` dans le contrôleur
   *voiture* qui affiche une vue d'erreur `src/vue/voiture/erreur.php` contenant
   le message d'erreur *Problème avec la voiture : `$messageErreur`*, ou juste
   *Problème avec la voiture* si le message est vide.

2. **Modifiez** le code du routeur pour implémenter la vérification de l'action.
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
   use App\Covoiturage\Controleur\ControleurVoiture;
   echo ControleurVoiture::class
   // Affiche App\Covoiturage\Controleur\ControleurVoiture
   ``` -->

</div>

## Séparation des données et de leur persistance

Une bonne pratique de la programmation orientée objet est de suivre des
principes de conception, notamment *SOLID* dont vous avez entendu parler l'an
dernier en cours de *Développement Orienté Objet* et que vous allez également
aborder dans le cours *Qualité de développement*. Le `S` de *SOLID* signifie
*Single responsibility principle* (ou principe de responsabilité unique en
français) : chaque classe doit faire une seule tâche.

Actuellement, notre classe `ModeleVoiture` gère 2 tâches : la gestion des
voitures et leur persistance dans une base de donnée. Ceci est contraire aux
principes *SOLID*. Plus concrètement, si on veut enregistrer une voiture
différemment plus tard (dans une session, dans un fichier, via un appel d'API,
ou avec une classe *mock* pour des tests), cela impliquera beaucoup de
réécriture de code.

Nous allons séparer les méthodes gérant la persistance des données des autres méthodes
propres aux voitures (méthodes métiers). Voici le diagramme de classe UML modifié que
nous allons obtenir à la fin de cette section :

<img alt="Diagramme de classe"
src="http://www.plantuml.com/plantuml/png/ZLF1hjem4BpxA_QOg1JHAuSA11SEj5MfUa926xEAJ1qxjTULAEBVwoPs4zBtn9DoySpkp7WtNdb6nw7HmlzGfaM73HXx9ayjV5WiHgZKwFsQsQagCEsaDGVrcs0XXC66V8kIODssnutzPHK7XpKTzr59qt6BZ9-h2qc6cm0Gq8l1zwwGEl0T09nEKTMp2v8BrJGOlMJGoCgQ6JJeVWQQWRH1Kt0pCDL1KKs-503l0M3IiGGVJwQ6daxz4pIhJU6ilGHb65AyclXJmekoOnBXYNUFvjFuvI2nwHsBCdiE8fbAeShCZ7p_NNe8DVKUb64Gs7UtB_eX36aoFWvp5_StxFGhjTOhjkxwuax7T7AxUOxvvFslRL_Lpn6Tm-kq1YysCBaY5KBlJx6yibQ_hlW5tRDLB7F6gKhw-PIZBRL1-MzOQS9G9EzqVEYFauhVqn7D_v_A_EFprvBRn8hCEJJw3m00" style="margin-left:auto;margin-right:auto;display:block;">

Notez que dans le schéma UML ci-dessus :
* `ModeleVoiture` est scindé en deux classes `VoitureRepository` et `Voiture`.
* `VoitureRepository` et `Voiture` ont changés de dossier et de `namespace` par
  rapport à `ModeleVoiture`.
* `ajouter` est maintenant une méthode statique qui prend une `Voiture` en
  argument.
* La classe `VoitureRepository` dépend de `Voiture`, mais pas l'inverse
(d'où la direction du lien de dépendance entre les deux classes).

En termes de fichiers, nous aurons l'arborescence suivante après nos modifications :

<img alt="Nouvelle organisation du dossier Modele"
src="{{site.baseurl}}/assets/TD6/listeFichiers.png" style="margin-left:auto;margin-right:auto;display:block;" width=400>


Le dossier `Repository` gère la persistance des données. Le nom `Repository` est
le nom du patron de conception que l'on utilise et que l'on retrouve dans les
outils professionnels (*ORM Doctrine* par exemple).

<div class="exercise">

1. Renommez la classe
   `ModeleVoiture` en `Voiture`.     
   Utilisez le *refactoring* de PhpStorm : Clic droit sur le nom de la classe >
   *Refactor* > *Rename*.

2. Créez deux dossiers `DataObject` et `Repository` dans `Modele`.

3. Créez une classe `VoitureRepository` dans le dossier `Repository` avec le `namespace`
   correspondant (`App\Covoiturage\Modele\Repository`). Déplacez les méthodes suivantes
   de `Voiture` dans `VoitureRepository` :
   * `getVoitures`
   * `getVoitureParImmatriculation`
   * `ajouter`
   * `construireDepuisTableau`
   
   Pour la méthode `construireDepuisTableau`, changez si nécessaire le corps de la fonction afin qu'un objet
   `Voiture` soit correctement retourné. Pensez également à adapter le code des autres fonctions
   de la classe `VoitureRepository` afin qu'elles appellent correctement la méthode `construireDepuisTableau`.
   
   Transformez la méthode `ajouter` en une méthode statique prenant en paramètre un objet de type `Voiture`.
   Cet objet sera la voiture à ajouter. Utilisez donc les getters de cette `Voiture`
   afin de retrouver les données à insérer dans la requête SQL de la méthode `ajouter`.

4. Déplacer `Voiture` dans le dossier `DataObject` et `ConnexionBaseDeDonnees` dans
   `Repository`. 
   
   **Attention** si vous utilisez le drag & drop de PhpStorm, vous allez
   avoir des mauvaises surprises car les `namespace` risquent de ne pas se mettre à jour correctement...  
   La façon correcte de le faire : Clic droit sur le nom de la classe > *Refactor* > *Move Class* > Indiquer le `namespace` correspondant.
   
   Vérifiez que votre code correspond à celui indiqué dans le diagramme de classe évoqué précédemment.

5. Faites remarcher les actions une par une :
   * `afficherListe` : 
     * `getVoitures` appartient à la classe `VoitureRepository` désormais.
   * `afficherDetail` : 
     * `getVoitureParImmatriculation` appartient à la classe `VoitureRepository`.
   * `creerDepuisFormulaire` :
     * `ajouter` et `getVoitures` appartiennent à la classe `VoitureRepository` désormais.
     * `ajouter` sera maintenant statique et prendra en argument un objet de
       la classe `Voiture` ; les getters de `Voiture` servent à construire la requête SQL.
     <!-- * la classe `Voiture` doit implémenter une nouvelle méthode `formatTableau`
       pour créer le tableau qui sera donné à `execute` -->

</div>

## CRUD pour les voitures

CRUD est un acronyme pour *Create/Read/Update/Delete*, qui sont les quatre
opérations de base de toute donnée. Nous allons compléter notre site pour qu'il
implémente toutes ces fonctionnalités. Lors des TDs précédents, nous avons
implémenté nos premières actions :

1. *Read* -- afficher toutes les voitures : action `afficherListe`
2. *Read* -- afficher les détails d'une voiture : action `afficherDetail`
3. *Create* -- afficher le formulaire de création d'une voiture : action `afficherFormulaireCreation`
4. *Create* -- créer une voiture dans la BDD : action `creerDepuisFormulaire`

Nous allons compléter ces opérations avec la mise à jour et une version
améliorée de la suppression.

#### Action `supprimer`

<div class="exercise">

Nous souhaitons ajouter l'action `supprimer` aux voitures. Pour cela :

1. Écrivez dans `VoitureRepository` une méthode statique
   `supprimerParImmatriculation($immatriculation)` qui prend en entrée l'immatriculation à
   supprimer (pensez à utiliser les requêtes préparées de `PDO`).

1. Créez une vue `src/vue/voiture/voitureSupprimee.php` qui affiche *"La voiture
   d'immatriculation `$immatriculation` a bien été supprimée*", suivi de la liste des
   voitures en appelant la vue `liste.php` (de la même manière que
   `voitureCreee.php`).

2. Écrivez l'action `supprimer` du contrôleur de voiture pour que

   1. il supprime la voiture dont l'immatriculation est passée en paramètre dans
      l'URL,
   2. il affiche la vue `voitureSupprimee.php` en utilisant le mécanisme de vue
      générique, et en donnant en paramètres les variables nécessaires dans la vue.  

3. Enrichissez la vue `liste.php` pour ajouter des liens HTML qui permettent de
   supprimer une voiture.

   **Aide :** Procédez par étape. Écrivez d'abord un lien *fixe* dans votre vue,
   puis la partie qui dépend de la voiture.
   <!-- Erreur tentante : utiliser $ROOT_FOLDER dans les liens. On pourrait leur faire faire
   du $ROOTWEB -->

4. Testez le tout. Quand la fonctionnalité marche, appréciez l'instant.

</div>

<!--

Il semble que l'on puisse coder un $ROOTWEB portable à base de
$_SERVER['HTTP_HOST'] qui donne l'hôte et $_SERVER['REQUEST_URI'] qui donne le
chemin dans le serveur (?)

-->

#### Action `afficherFormulaireMiseAJour` et `mettreAJour`

<div class="exercise">

Nous souhaitons ajouter l'action `afficherFormulaireMiseAJour` aux voitures qui affiche le
formulaire de mise à jour. Pour cela :

1. Créez une vue `src/vue/voiture/formulaireMiseAJour.php` qui affiche un formulaire
   identique à celui de `formulaireCreation.php`, mais qui sera prérempli par les données
   de la voiture courante. Nous ne passerons que l'immatriculation de la voiture
   *via* l'URL ; les autres informations seront récupérées dans la BDD. Voici
   quelques points à prendre en compte avant de se lancer :

   1. L'attribut `value` de la balise `<input>` permet de préremplir un champ du
   formulaire. Utilisez l'attribut HTML `readonly` de `<input>` pour que 
   l'internaute ne puisse pas changer l'immatriculation.

   1. On pourra se servir dans le contrôleur de `getVoitureParImmatriculation` pour
      récupérer l'objet voiture de la bonne immatriculation. La vue devra alors
      remplir le formulaire avec les attributs de cet objet.

   1. Pensez bien à échapper vos variables PHP avant de les écrire dans l'HTML
     et dans les URLs.

   1. Rappel : Vous souhaitez envoyer l'information `action=mettreAJour` en plus des
      informations saisies lors de l'envoi du formulaire. La bonne façon de faire
      pour un formulaire de méthode `GET` est d'ajouter un champ caché `<input
      type='hidden' name='action' value='mettreAJour'>`.

      <!-- 
      Si vous avez un formulaire en méthode POST et que vous voulez transmettre l'action en méthode GET,
      vous pouvez rajouter l'information dans l'URL avec

      ```html?start_inline=1
      <form method="post" action='controleurFrontal.php?action=creerDepuisFormulaire'>
      ```
      -->

1. Écrivez l'action `afficherFormulaireMiseAJour` du contrôleur de voiture pour qu'il affiche le
   formulaire prérempli. **Vérifiez** que l'action `afficherFormulaireMiseAJour` affiche bien le formulaire.


1. Ajoutons les liens manquants. Enrichissez la vue `liste.php` pour ajouter des
   liens HTML qui permettent de mettre à jour une voiture. Ces liens pointent
   donc vers le formulaire de mis-à-jour prérempli.

2. Astuce optionnelle : La vue `afficherFormulaireMiseAJour` peut être raccourcie en utilisant la
   syntaxe 
   ```php
   <?= $immatriculationHTML ?>
   ```
   qui est équivalente à
   ```php
   <?php echo $immatriculationHTML; ?>
   ```

</div>

<div class="exercise">

1. Maintenant, passons à l'action `mettreAJour` qui effectue la mise à jour dans la
   BDD.

   Créez la vue `src/vue/voiture/voitureMiseAJour.php` pour qu'elle affiche *"La
   voiture d'immatriculation `$immatriculation` a bien été mise à jour*". Affichez
   en dessous de ce message la liste des voitures mise à jour (à la manière de
   `voitureSupprimee.php` et `voitureCreee.php`).

1. Ajoutez à `VoitureRepository` une méthode statique `mettreAJour(Voiture $voiture)`. 
   Cette méthode est proche de `ajouter(Voiture $voiture)`, à
   ceci près qu'elle ne renvoie pas de booléen. En effet, on va considérer
   qu'une mise à jour se passe toujours correctement.

2. Créez l'action `mettreAJour` du contrôleur de voiture pour qu'il mette à
   jour la voiture dont l'immatriculation est passée en paramètre dans l'URL, puis
   qu'il affiche la vue `src/vue/voiture/voitureMiseAJour.php` après l'avoir correctement
   initialisée.

3. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.

</div>

## Gérer plusieurs contrôleurs

Maintenant que notre site propose une gestion minimale des voitures (*Create /
Read / Update / Delete*), notre objectif est d'avoir une interface similaire
pour les utilisateurs et les trajets. Dans ce TD, nous allons dans un premier
temps rendre notre MVC de voitures plus générique. Cela nous permettra de
l'adapter plus facilement aux utilisateurs et trajets dans un second temps.

### Dans le routeur du contrôleur frontal

Pour l'instant, nous n'avons travaillé que sur le contrôleur *voiture*. Nous
souhaitons maintenant ajouter les contrôleurs *utilisateur* et *trajet*. Pour
gérer tous les contrôleurs à partir de notre page d'accueil unique `controleurFrontal.php`,
nous avons besoin d'appeler le bon contrôleur dans le routeur.

Désormais, nous devons donc spécifier le contrôleur demandé dans le *query
string*. Par exemple, l'ancienne page `controleurFrontal.php?action=afficherListe` du contrôleur
*voiture* devra s'obtenir avec `controleurFrontal.php?controleur=voiture&action=afficherListe`.

<div class="exercise">

1. Définissez une variable `controleur` dans `controleurFrontal.php` en récupérant sa
valeur à partir de l'URL, et en mettant le contrôleur *voiture* par défaut.

   **Aide :** Ce bout de code est similaire à celui concernant `action` dans
  `controleurFrontal.php`.

2. On souhaite créer le nom de la classe à partir de `controleur`. Par exemple,
   quand `$controleur="voiture"`, nous souhaitons créer une variable
   `$nomDeClasseControleur` qui vaut `"App\Covoiturage\Controleur\ControleurVoiture"`.  
   **Créez** la variable `$nomDeClasseControleur` à l'aide de la fonction
   [`ucfirst`](http://php.net/manual/fr/function.ucfirst.php) (UpperCase
   FIRST letter) qui sert à mettre en majuscule la première lettre d'une chaîne
   de caractère.

3. Testez si la classe de nom `$nomDeClasseControleur` existe à l'aide de la
   fonction [`class_exists`](http://php.net/manual/fr/function.class-exists.php)
   et appelez l'action `action` de la classe `$nomDeClasseControleur` le cas
   échéant. Autrement appelez l'action `afficherErreur` de `ControleurVoiture`.

3. Testez votre code en appelant vos anciennes pages du contrôleur *voiture*.

</div>

### Début du nouveau contrôleur

Maintenant que notre routeur dans le contrôleur frontal est en place, nous
pouvons créer de nouveaux contrôleurs. Pour avoir un aperçu de l'étendu du
travail, commençons par créer l'action `afficherListe` de `Utilisateur`.

<div class="exercise">

1. Créez un contrôleur `controleur/ControleurUtilisateur.php` similaire à celui
   des voitures qui reprend les méthodes `afficherListe()`, `afficherVue()` et
   `afficherErreur()`.

   **Astuce :** Vous pouvez utiliser la fonction de remplacement (`Ctrl+R` sous
     PHPStorm) pour remplacer tous les `voiture` par `utilisateur`. En cochant
     `Préserver la casse` (`Preserve case`), vous pouvez faire en sorte de
     respecter les majuscules lors du remplacement.

2. Créez une classe `DataObject/Utilisateur.php` basé sur votre classe
   `Utilisateur` des TDs 2 & 3. Ce modèle ne contiendra que les *getter*, les
   *setter* et le constructeur.
   
1. Créez une classe `Repository/UtilisateurRepository.php` qui reprend la
   fonction `getUtilisateurs()` et `construireDepuisTableau($utilisateurTableau)` de votre
   ancienne classe `Utilisateur`.

   Corrigez l'erreur : il manque un alias avec `use` pour la classe `Utilisateur`.

2. Créez une vue `src/vue/utilisateur/liste.php` similaire à celle des voitures
   (sans nécessairement de lien pour l'instant).  
   Idem pour `utilisateur/erreur.php`.

3. **Testez** votre action en appelant l'action `afficherListe` du contrôleur
   `Utilisateur` (qui est accessible dans la barre de menu de votre site
   normalement).

</div>

## Modèle générique

L'implémentation du CRUD pour les utilisateurs et les trajets est un code très
similaire à celui pour les voitures. Nous pourrions donc copier/coller le code
des voitures et changer les (nombreux) endroits nécessaires. Et cela contredit
le principe [DRY](https://fr.wikipedia.org/wiki/Ne_vous_r%C3%A9p%C3%A9tez_pas)
que vous connaissez depuis l'an dernier.

### Création d'un modèle générique

Pour éviter la duplication de code et la perte d'un temps conséquent à
développer le CRUD pour chaque nouvel objet, nous allons mettre en commun le
code autant que possible. Commençons par abstraire les 3 classes métiers
`Voiture`, `Utilisateur` et `Trajet`.

<img alt="Diagramme de classe"
src="http://www.plantuml.com/plantuml/png/SoWkIImgAStDuN9CAYufIamkSKaiIVHFoafDBb6mgT7LLGZBpomfBKh5AHzIb9YLMe9JEhGaCoUpEB4ajRI8oo4rBmLe5G00" style="margin-left:auto;margin-right:auto;display:block;">

<div class="exercise">

Créer une classe abstraite `AbstractDataObject` dans le dossier `DataObject`.
Faites hériter les autres classes de ce répertoire de `AbstractDataObject` pour
correspondre au diagramme de classe ci-dessus.

</div>

Également, nous allons abstraire les classes *Repository* de façon à obtenir le schéma suivant :   

<img alt="Diagramme de classe"
src="http://www.plantuml.com/plantuml/png/SoWkIImgAStDuN9CAYufIamk2Kejo2_EBCalgbImgT7LLGZBpomfBKf52EDK6LAKc9LQGeJ2q9BCdCpYn9BKqY8arGwfUIb0Xm00" style="margin-left:auto;margin-right:auto;display:block;">

Nous allons détailler ces changements dans les prochaines sections.

Déplaçons de `VoitureRepository` vers un modèle générique `AbstractRepository`
toutes les requêtes SQL qui ne sont pas spécifiques aux voitures.

<!-- 

TODO : rewrite l'an prochain. Le nouveau factoring marche mieux mais émet des messages de warning

1. getVoitures plus statiques
   4 changements dans Contr (Ctrl+R ou Alt+J)
   Pour pouvoir utiliser héritage
   
1. getVoitureParImmatriculation plus statique
   2 changements dans Contr (Ctrl+R ou Alt+J)
   Pour pouvoir utiliser héritage

1. public static function construireDepuisTableau
   plus statique
   2 change Repo: $this-> 
   1 change Contr: new VoitureRepos->
   créer interface avec type de retour AbstractDataObject
   
1. getNomTable
   interface + implémentation + utilisation dans getVoitures

2. getVoitures -> abstract recuperer
   Pull member Up (skip le message de warning)

 -->

<div class="exercise">

Commençons par la fonction `getVoitures()` de `VoitureRepository`. Les seules
différences entre `getVoitures()` et `getUtilisateurs()` sont le nom de la table
et le nom de la classe des objets en sortie. Voici donc comment nous allons
faire pour avoir un code générique :

1. Créez une nouvelle classe *abstraite* `abstract class AbstractRepository` et
   faites hériter la classe `VoitureRepository` de `AbstractRepository` (mot
   clé `extends` comme en Java).

1. Pour qu'on puisse migrer la fonction `getVoitures()` de `VoitureRepository` vers
   `AbstractRepository`, il faudrait que cette dernière puisse accèder au nom de la table.
   Pour cela elle va demander à toutes ses classes filles de posséder une méthode `getNomTable()`.  
   Ajoutez donc une méthode abstraite `getNomTable()` dans `AbstractRepository`
   ```php
   protected abstract function getNomTable(): string;
   ```
   et une implémentation de `getNomTable()` dans `VoitureRepository`.

   **Question** : pourquoi la visibilité de cette fonction est `protected` ?

   <!-- getNomTable n'est pas statique car PHP déconseille l'utilisation de méthode statique et abstraite (PHP émet un warning) -->

1. Déplacez la fonction `getVoitures()` de `VoitureRepository` vers `AbstractRepository` en la renommant `recuperer()`.

   **Astuce** : sur PhpStorm le moyen le plus simple pour déplacer la fonction serait *Clic droit sur la déclaration de la méthode* >
   *Refactor* > *Move Members* > *Indiquer `AbstractRepository` comme classe de destination*. De même pour le renommage, pensez à utiliser le refactoring.

1. Utilisez `getNomTable()` dans la requête *SQL* de `recuperer()`. Puisque
   `getNomTable()` est une méthode dynamique, enlevez le `static` de
   `recuperer()`.

   ```php
   /**
    * @return AbstractDataObject[]
    */
   public function recuperer(): array
   ```

2. De même, `AbstractRepository` va demander à toutes ses classes filles de
   posséder une méthode `construireDepuisTableau($objetFormatTableau)`.  
   * Ajoutez donc une méthode abstraite dans `AbstractRepository`
   ```php
   public abstract function construireDepuisTableau(array $objetFormatTableau) : AbstractDataObject;
   ```
   * Enlevez le `static` du `construireDepuisTableau()` de `VoitureRepository`.
   * Mettez à jour l'appel à `construireDepuisTableau()` de `recuperer()`.
   * Pensez à vérifier que l'implémentation de la méthode `construireDepuisTableau()` de
     `VoitureRepository` déclare bien le type de retour `Voiture` (sous-classe
     de `AbstractDataObject`).
   * La méthode `construireDepuisTableau()` devient `protected` dans les classes filles.

   <!-- attention déclaration de type correspondante entre méthode et 
   implémentation -->

   <!-- construireDepuisTableau($objetFormatTableau): AbstractDataObject; -->

3. Corrigez l'action `afficherListe` du `ControleurVoiture` pour faire appel à la
   méthode `recuperer()` de `VoitureRepository`. Ici nous vous conseillons pour
   le moment de construire un objet anonyme afin de pouvoir appeler les
   fonctions dynamiques de `VoitureRepository`. Par exemple, si vous souhaitez
   appeler la fonction `recuperer`, vous pouvez faire ceci :

   ```php
   (new VoitureRepository())->recuperer();
   ```

   L'action `afficherListe` du contrôleur *voiture* doit remarcher.

4. Mettez à jour tous vos appels à `getVoitures()` (ou `recuperer()` si la
   méthode `getVoitures()` a été correctement renommé par le *refactoring* de la
   question 3).

</div>

<div class="exercise">

1. Faites de même pour `UtilisateurRepository` :
   * commentez `getUtilisateurs()`,
   * enlevez le `static` de `construireDepuisTableau()`,
   * implémentez `getNomTable()`,
   * `UtilisateurRepository` doit hériter de `AbstractRepository`.

1. Corrigez l'action `afficherListe` du `ControleurUtilisateur` pour faire appel à la
   méthode `recuperer()` de `UtilisateurRepository`. L'action doit remarcher.

</div>

### Action `afficherDetail`

Pour faciliter les actions `afficherDetail` des différents contrôleurs, nous allons créer
une fonction `recupererParClePrimaire($valeurClePrimaire)` générique dans `AbstractRepository`
qui permet de faire une recherche par clé primaire dans une table. Cette
fonction a besoin de connaître le *nom de la clé primaire*. Nous allons donc
demander aux implémentations de `AbstractRepository` de fournir une méthode
`getNomClePrimaire()`.

<div class="exercise">

1. Commençons par déclarer la fonction suivante dans la classe `AbstractRepository` :
   ```php
   public function recupererParClePrimaire(string $valeurClePrimaire): ?AbstractDataObject
   ```
   
   Copiez/collez le corps de la fonction `getVoitureParImmatriculation($immatriculation)`
   vers `recupererParClePrimaire($valeurClePrimaire)` de `AbstractRepository`. Nous allons
   le *refactoriser* dans les questions suivantes pour qu'il devienne générique.

1. Ajoutez la méthode suivante dans `AbstractRepository`
   ```php
   protected abstract function getNomClePrimaire(): string;
   ```
   et une implémentation de `getNomClePrimaire()` dans `VoitureRepository`.

1. Utilisez `getNomTable()` et `getNomClePrimaire()` pour construire la requête
   *SQL* de `recupererParClePrimaire()`.

1. Finissez de corriger `recupererParClePrimaire()` :
   * Changez les valeurs dans le tableau donné à `execute()`
   * Corrigez l'appel à `construireDepuisTableau()` qui est une méthode dynamique maintenant.

1. Corrigez l'action `afficherDetail` du `ControleurVoiture` pour faire appel à la méthode
   `recupererParClePrimaire()` de `VoitureRepository`. L'action doit remarcher.

</div>

<div class="exercise">

1. Faites de même pour `UtilisateurRepository` : implémentez
   `getNomClePrimaire()`.

1. Créez l'action `afficherDetail` du `ControleurUtilisateur` en vous basant sur celle de
   `ControleurVoiture`.

   **Rappel :** Utilisez le remplacement `Ctrl+R` en préservant la casse pour vous faciliter le travail.

1. Il ne vous reste plus qu'à créer la vue associée `detail.php` et à ajouter
   les liens vers la vue de détail dans `liste.php`. L'action `afficherDetail` doit maintenant fonctionner.

</div>


### Action `supprimer`

Pas de nouveautés.

<div class="exercise">

Nous vous laissons migrer la fonction
`supprimerParImmatriculation($immatriculation)` de `VoitureRepository` vers
`AbstractRepository` en la renommant `supprimer($valeurClePrimaire)` et adapter
sa requête *SQL*. Adaptez également l'action `supprimer` des contrôleurs
*voiture* et *utilisateur*, ainsi que leur vue associée `voitureSupprimee.php` et
`utilisateurSupprime.php`. 
</div>

### Action `afficherFormulaireCreation` et `afficherFormulaireMiseAJour`

Pas de nouveautés.

<div class="exercise">

Nous vous laissons adapter les actions `afficherFormulaireCreation` et `afficherFormulaireMiseAJour` de
`ControleurVoiture` (et `ControleurUtilisateur`), leurs vues associées `formulaireCreation.php` et
`formulaireMiseJour.php` et à ajouter les liens pour mettre à jour un utilisateur ou une voiture dans
`detail.php`.

</div>

### Action `creerDepuisFormulaire` et `mettreAJour`

Pour ces dernières actions, il faut un peu plus travailler pour créer la
fonction correspondante dans le modèle générique. 

#### Action `mettreAJour`

<!-- 

TODO : À changer l'an prochain

Faire déjà les changements dans VoitureRepository pour la rendre générique et que cela marche

Après on la déplacera dans AbstractRepository

 -->

Pour reconstituer la requête
```sql
UPDATE voiture SET marque= :marqueTag, couleur= :couleurTag, immatriculation= :immatriculationTag WHERE immatriculation= :immatriculationTag;
```
il est nécessaire de pouvoir lister les champs de la table `voiture`. De même, il sera nécessaire de lister
les champs des tables `utilisateur` et `trajet`. Nous allons factoriser le code nécessaire dans `AbstractRepository`.

<div class="exercise">

1. Déplacez la fonction `mettreAJour($immatriculation)` de
   `VoitureRepository.php` vers `AbstractRepository` en la renommant
   ```php
   public function mettreAJour(AbstractDataObject $object): void
   ```

1. Ajoutez une méthode abstraite `getNomsColonnes()` dans
   `AbstractRepository`
   ```php
   protected abstract function getNomsColonnes(): array;
   ```
   et une implémentation de `getNomsColonnes()` dans `VoitureRepository`
   ```php
   protected function getNomsColonnes(): array
   {
       return ["immatriculation", "marque", "couleur", "nbSieges"];
   }
    ```

1. Utilisez `getNomTable()`, `getNomClePrimaire()` et `getNomsColonnes()` pour
   construire la requête *SQL* de `mettreAJour()` : 
   ```sql
   UPDATE voiture SET marque= :marqueTag, couleur= :couleurTag, immatriculation= :immatriculationTag WHERE immatriculation= :immatriculationTag;
   ```

   **Aide :** N'hésitez pas à afficher la requête générée pour vérifier votre
   code.

1. Pour les besoins de `execute()`, nous avons besoin de transformer l'objet
   `Voiture $voiture` en un tableau 
   ```php
   array(
       "immatriculationTag" => $voiture->getImmatriculation(),
       "marqueTag" => $voiture->getMarque(),
       "couleurTag" => $voiture->getCouleur(),
       "nbSiegesTag" => $voiture->getNbSieges(),
   );
   ```

   Nous allons demander à tous les `AbstractDataObject` d'implémenter une
   méthode `formatTableau()` qui transforme un `AbstractDataObject` en tableau, qui pourrait
   être utilisé dans les différents appels à `execute()`.
   Ainsi, nous pouvons imposer cette méthode directement par contrat dans
   `AbstractDataObject` : 
   ```php
   public abstract function formatTableau(): array;
   ```
   Implémentez cette fonction dans `Voiture` avec
   ```php
   public function formatTableau(): array
   {
       return array(
           "immatriculationTag" => $this->immatriculation,
           "marqueTag" => $this->marque,
           "couleurTag" => $this->couleur,
           "nbSiegesTag" => $this->nbSieges,
       );
   }
   ```

1. Utilisez `formatTableau()` dans `mettreAJour()` pour obtenir le tableau donné à
   `execute()`.

1. Corrigez l'action `mettreAJour` du `ControleurVoiture` pour faire appel aux
   méthodes de `VoitureRepository`. L'action doit remarcher.

<!-- 1. Grâce à la classe `AbstractDataObject`, vous pouvez ajouter des déclarations
   de type dans `AbstractRepository` :
   * type de retour de `mettreAJour`,
   * type d'entrée de `mettreAJour`.-->
</div>

<div class="exercise">

Implémentez l'action `mettreAJour` du contrôleur *utilisateur*.

</div>



#### Action `creerDepuisFormulaire`

<div class="exercise">

Répétez la question précédente avec la fonction `ajouter()` des différents
modèles. Ajoutez l'action `creerDepuisFormulaire` dans le contrôleur
*utilisateur*.

</div>

## Bonus

### Contrôleur trajet

Adaptez chacune des actions de `ControleurTrajet.php` et les tester une à
une. Nous vous conseillons de faire dans l'ordre les actions `afficherDetail`, `supprimer`,
`afficherFormulaireCreation`, `afficherFormulaireMiseAJour`, `creerDepuisFormulaire` et `mettreAJour`.

Vous pouvez aussi ajouter des actions pour afficher la liste des passagers pour
un trajet, et inversement la liste des trajets pour un passager (table de
jointure `passager`, cf. fin TD3).

### Autres idées

<!-- * Faire en sorte que la méthode d'erreur prenne en argument un message d'erreur. Chaque appel à cette méthode doit maintenant fournir un message d'erreur personnalisé. -->
* Factoriser le code des contrôleurs dans un contrôleur générique, au moins pour
  la méthode `afficherVue()` 
* Ajouter les actions spécifiques aux requêtes SQL `getTrajets()` et
  `supprimerPassager()` du TD3 non utilisées :
  * qui liste les trajets d'un utilisateur,
  * qui désinscrit un passager d'un trajet.

<!-- * Violation de SRP : le contrôleur frontal et le routeur devrait être séparés -->
