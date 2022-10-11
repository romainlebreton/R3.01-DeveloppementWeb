---
title: TD6 &ndash; Architecture MVC avancée 2/2
subtitle: Vues modulaires, filtrage, formulaires améliorés
layout: tutorial
lang: fr
---

<!-- Rajouter des fonctions de sécurité/contrôle avec isset($_GET) et les
htmlspecialchars quand on écrit dans du HTML et URLencode quand on écrit dans
une URL -->

<!-- XSS et protection de l'écriture html -->

<!--
Rajouter dispatcher
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

On veut rajouter un comportement par défaut pour la page d'accueil ; nous allons
faire en sorte qu'un utilisateur qui arrive sur `frontController.php` voit la même page
que s'il était arrivé sur `frontController.php?action=readAll`.

#### Action par défaut

<div class="exercise">

1. Si aucun paramètre n'est donné dans l'URL, initialisons la variable `action`
   avec la chaîne de caractères `readAll` dans `frontController.php`.
   Utilisez la fonction `isset($_GET['action'])` qui teste si la variable
   `$_GET['action']` a été initialisée, ce qui est le cas si et seulement si une
   variable `action` a été donnée dans l'URL.

1. Testez votre site en appelant `frontController.php` sans action.

**Note :** De manière générale, il ne faut jamais lire un `$_GET['action']`
  avant d'avoir vérifié s'il était bien défini avec un `isset(...)` sous peine
  d'avoir des erreurs `Undefined index : action ...`.

</div>

Désormais, la page
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD6/web/frontController.php](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD6/web/frontController.php)
doit marcher sans paramètre.

<!-- **Note :** que vous pouvez aussi y accéder avec l'adresse
[http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/](http://webinfo.iutmontp.univ-montp2.fr/~votre_login/TD5/) :
Apache ouvre directement les pages `index.html` ou `frontController.php` d'un répertoire
si elles existent. -->

#### Vérification de l'action

<div class="exercise">

On souhaite que le routeur vérifie que `action` est le nom d'une méthode de
`ControllerVoiture.php` avant d'appeler cette méthode et renvoyer vers une page
d'erreur le cas échéant.

1. Créez une action `error(string $errorMessage)` qui affiche une vue d'erreur
   `src/view/voiture/error.php` contenant le message d'erreur *Problème avec la voiture : `$errorMessage`*.

1. **Modifiez** le code du routeur pour implémenter la vérification de l'action.
   Si l'action n'existe pas, appelez l'action `error`.

   **Notes :** 
   * Vous pouvez récupérer le tableau des méthodes d'une classe avec
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
   use App\Covoiturage\Controller\ControllerVoiture;
   echo ControllerVoiture::class
   // Affiche App\Covoiturage\Controller\ControllerVoiture
   ``` -->

</div>

## Séparation des données et de leur persistance

Une bonne pratique lors de la programmation orientée objet est de suivre des
principes de conception, notamment *SOLID* dont vous avez entendu parler l'an
dernier en cours de *Développement Orienté Objet* et que vous allez également
aborder dans le cours *Qualité de développement*. Le `S` de *SOLID* signifie
*Single responsibility principle* (ou principe de responsabilité unique en
français) : chaque classe doit faire une seule tâche.

Actuellement, notre classe `ModelVoiture` gère 2 tâches : la gestion des
voitures et leur persistance dans une base de donnée. Ceci est contraire aux
principes *SOLID*. Plus concrètement, si on veut enregistrer une voiture
différemment plus tard (dans une session, dans un fichier ou via un appel
d'API), cela impliquera beaucoup de réécriture de code.

Voici le diagramme de classe modifié :

<img alt="Diagramme de classe"
src="https://www.plantuml.com/plantuml/png/XPCnJ_im4CNtV8eRK_txhyhQ0RKgIuS2eeYfKdLnJf4XiODzhbIgVdTCuf3KW29bYExk_TxpELbQHiEkAXFx9bMD1YjGEYTBDTpCvuEgAD7Q5REHcMFQ2ArsyeDWdYGAAx8r2e9LNU_N-gWbEuC5xRUULExlaF4XUoN1S4u04cXPyDBCKLFy1m27WuTQDavmAgiAlPLm9RBKQWeLcdT7Kn3QbUJC55IsarIGdNZrVm2850lm9AaAQDj17rS3BIvtx0L8nH3Y5SJtePvEcaveMEBDjNaSVz8ZrgsZ9mJF3jAtGgXEP0U-tuVkGyNUFHbwmBOvVTekOP0cr8TXBibb_4gVgDPMiZQdNwzqs0vcPyl8Kbo-NCDKiqOq1a_nZ4Ltf09DJYODmz1682_nR_dVr4SqOxUnw7B6bF3zIKDfi7l6h2HqLnA_7_-CBMRsSnUpsz4_f5CbIrAvgyfF" style="margin-left:auto;margin-right:auto;display:block;">

Notez que :
* `ModelVoiture` est scindé en deux classes `VoitureRepository` et `Voiture`.
* `VoitureRepository` et `Voiture` ont changés de dossier et de `namespace` par
  rapport à `ModelVoiture`.
* `sauvegarder` est maintenant une méthode statique qui prend une `Voiture` en
  argument.



<div class="exercise">

1. Créez deux dossiers `DataObject` et `Repository` dans `Model`.

   *Note :* Le dossier `Repository` gère la persistance des données. Le nom
   `Repository` est le nom du patron de conception que l'on utilise et que l'on retrouve dans les outils professionnels (*ORM Doctrine* par exemple).

1. Créez une classe `VoitureRepository` dans le dossier `Repository` avec le `namespace`
   correspondant (`App\Covoiturage\Model\Repository`). Déplacez les méthodes suivantes
   de `ModelVoiture` dans `VoitureRepository` :
   * `getVoitures`
   * `getVoitureParImmat`
   * `sauvegarder`
   * `construire`
   * `supprimerParImmatriculation` pour ceux qui avaient fait l'exercice 10 optionnel du [TD4](tutorial4.html)
   
   Pour la méthode `construire`, changez si nécessaire le corps de la fonction afin qu'un objet
   `Voiture` soit correctement retourné. Pensez également à adapter le code des autres fonctions
   de la classe `VoitureRepository` afin qu'elles appellent correctement la méthode `construire`.

1. Renommez la classe `Model` en `DatabaseConnection` et la classe
   `ModelVoiture` en `Voiture`.     
   Utilisez le *refactoring* de PhpStorm : Clic droit sur le nom de la classe >
   *Refactor* > *Rename*.

1. Déplacer `Voiture` dans le dossier `DataObject` et `DatabaseConnection` dans
   `Repository`. 
   
   **Attention** si vous utilisez le drag & drop de PhpStorm, vous allez
   avoir des mauvaises surprises car les `namespace` risquent de ne pas se mettre à jour correctement...  
   La façon correcte de le faire : Clic droit sur le nom de la classe > *Refactor* > *Move Class* > Indiquer le `namespace` correspondant.

1. Faites remarcher les actions une par une :
   * `readAll` : 
     * `getVoitures` appartient à la classe `VoitureRepository` désormais.
   * `read` : 
     * `getVoitureParImmat` appartient à la classe `VoitureRepository`.
   * `created` :
     * `sauvegarder` et `getVoitures` appartiennent à la classe `VoitureRepository` désormais.
     * `sauvegarder` sera maintenant statique et prendra en argument un objet de
       la classe `Voiture` ; les getters de `Voiture` serviront à construire la requête SQL.
     <!-- * la classe `Voiture` doit implémenter une nouvelle méthode `formatTableau`
       pour créer le tableau qui sera donné à `execute` -->

</div>

## CRUD pour les voitures

CRUD est un acronyme pour *Create/Read/Update/Delete*, qui sont les quatre
opérations de base de toute donnée. Nous allons compléter notre site pour qu'il
implémente toutes ces fonctionnalités. Lors des TDs précédents, nous avons
implémenté nos premières actions :

1. afficher toutes les voitures : action `readAll`
2. afficher les détails d'une voiture : action `read`
3. afficher le formulaire de création d'une voiture : action `create`
4. créer une voiture dans la BDD : action `created`
5. suppression d'une voiture dans la BDD : action `delete` (juste ceux d'entre
   vous qui avaient fait l'exercice 10 optionnel du [TD4](tutorial4.html))

Nous allons compléter ces opérations avec la mise à jour et une version
améliorée de la suppression.

#### Action `delete`

<div class="exercise">

Nous souhaitons rajouter l'action `delete` aux voitures. Pour cela :

1. Écrivez dans `VoitureRepository` une méthode statique
   `supprimerParImmatriculation($immatriculation)` qui prend en entrée l'immatriculation à
   supprimer (pensez à utiliser les requêtes préparées de `PDO`).

1. Créez une vue `src/view/voiture/deleted.php` qui affiche *"La voiture
   d'immatriculation `$immatriculation` a bien été supprimée*", suivi de la liste des
   voitures en appelant la vue `list.php` (de la même manière que
   `created.php`).

1. Écrivez (ou modifiez pour ceux qui ont fait l'exercice 10 du
   [TD4](tutorial4.html)) l'action `delete` du contrôleur de voiture pour que

   1. il supprime la voiture dont l'immatriculation est passée en paramètre dans
      l'URL,
   1. il affiche la vue `deleted.php` en utilisant le mécanisme de vue
      générique, et en donnant en paramètres les variables nécessaires dans la vue.  

1. Enrichissez la vue `list.php` pour ajouter des liens HTML qui permettent de
   supprimer une voiture.

   **Aide :** Procédez par étape. Écrivez d'abord un lien *fixe* dans votre vue,
   puis la partie qui dépend de la voiture.
   <!-- Erreur tentante : utiliser $ROOT_FOLDER dans les liens. On pourrait leur faire faire
   du $ROOTWEB -->

1. Testez le tout. Quand la fonctionnalité marche, appréciez l'instant.

</div>

<!--

Il semble que l'on puisse coder un $ROOTWEB portable à base de
$_SERVER['HTTP_HOST'] qui donne l'hôte et $_SERVER['REQUEST_URI'] qui donne le
chemin dans le serveur (?)

-->

#### Action `update` et `updated`

<div class="exercise">

Nous souhaitons rajouter l'action `update` aux voitures qui affiche le
formulaire de mise à jour. Pour cela :

1. Créez une vue `src/view/voiture/update.php` qui affiche un formulaire
   identique à celui de `create.php`, mais qui sera prérempli par les données
   de la voiture courante. Nous ne passerons que l'immatriculation de la voiture
   *via* l'URL ; les autres informations seront récupérées dans la BDD. Voici
   quelques points à prendre en compte avant de se lancer :

   1. L'attribut `value` de la balise `<input>` permet de préremplir un
   champ du formulaire. Notez aussi que l'attribut `readonly` de `<input>`
   permet d'afficher l'immatriculation sans que l'internaute puisse le changer.

   1. On pourra se servir dans le contrôleur de `getVoitureParImmat` pour
      récupérer l'objet voiture de la bonne immatriculation. La vue devra alors
      remplir le formulaire avec les attributs de cet objet.

   1. Pensez bien à échapper vos variables PHP avant de les écrire dans l'HTML
     et dans les URLs.

   1. Rappel : Vous souhaitez envoyer l'information `action=updated` en plus des
      informations saisies lors de l'envoi du formulaire. La bonne façon de faire
      pour un formulaire de méthode `GET` est de rajouter un champ caché `<input
      type='hidden' name='action' value='updated'>`.

      <!-- 
      Si vous avez un formulaire en méthode POST et que vous voulez transmettre l'action en méthode GET,
      vous pouvez rajouter l'information dans l'URL avec

      ```html?start_inline=1
      <form method="post" action='frontController.php?action=created'>
      ```
      -->

1. Écrivez l'action `update` du contrôleur de voiture pour qu'il affiche le
   formulaire prérempli. **Vérifiez** que l'action `update` affiche bien le formulaire.

1. Maintenant, passons à l'action `updated` qui effectue la mise à jour dans la
   BDD.

   Créez la vue `src/view/voiture/updated.php` pour qu'elle affiche *"La
   voiture d'immatriculation `$immatriculation` a bien été mise à jour*". Affichez
   en dessous de ce message la liste des voitures mise à jour (à la manière de
   `deleted.php` et `created.php`).

1. Rajoutez à `VoitureRepository` une méthode statique `mettreAJour(Voiture
   $voiture)`. Cette méthode est proche de `sauvegarder(Voiture $voiture)`, à
   ceci près qu'elle ne renvoie pas de booléen. En effet, on va considérer
   qu'une mise à jour se passe toujours correctement.

1. Complétez l'action `updated` du contrôleur de voiture pour qu'il mette à
   jour la voiture dont l'immatriculation passée en paramètre dans l'URL, puis
   qu'il affiche la vue `src/view/voiture/updated.php` après l'avoir correctement
   initialisée.

1. Testez le tout. Quand la fonctionnalité marche, appréciez de nouveau
   l'instant.


1. Rajoutons les liens manquants. Enrichissez la vue `list.php` pour ajouter des
   liens HTML qui permettent de mettre à jour une voiture. Ces liens pointent
   donc vers le formulaire de mis-à-jour prérempli.

   *Oubli des TDs précédents :* Rajoutez aussi un lien *Créer une voiture* vers l'action `created` dans `list.php`.

1. Astuce optionnelle : La vue `update` peut être raccourcie en utilisant la
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



</div>


## Gérer plusieurs contrôleurs

Maintenant que notre site propose une gestion minimale des voitures (*Create /
Read / Update / Delete*), notre objectif est d'avoir une interface similaire
pour les utilisateurs et les trajets. Dans ce TD, nous allons dans un premier
temps rendre notre MVC de voitures plus générique. Cela nous permettra de
l'adapter plus facilement aux utilisateurs et trajets dans un second temps.

### Dans le routeur

Pour l'instant, nous n'avons travaillé que sur le contrôleur *voiture*. Nous
souhaitons maintenant rajouter les contrôleurs *utilisateur* et *trajet*. Pour
gérer tous les contrôleurs à partir de notre page d'accueil unique `frontController.php`,
nous avons besoin d'appeler le bon contrôleur dans le routeur.

Désormais, nous devons donc spécifier le contrôleur demandé dans le *query
string*. Par exemple, l'ancienne page `frontController.php?action=readAll` du contrôleur
*voiture* devra s'obtenir avec `frontController.php?controller=voiture&action=readAll`.

<div class="exercise">

1. Définissez une variable `controller` dans `frontController.php` en récupérant sa
valeur à partir de l'URL, et en mettant le contrôleur *voiture* par défaut.

   **Aide :** Ce bout de code est similaire à celui concernant `action` dans
  `frontController.php`.

2. On souhaite créer le nom de la classe à partir de `controller`. Par exemple,
   quand `$controller="voiture"`, nous souhaitons créer une variable
   `controller_class` qui vaut `"ControllerVoiture"`.
   **Créez** la variable `controller_class` à l'aide de la fonction
   [`ucfirst`](http://php.net/manual/fr/function.ucfirst.php) (UpperCase
   FIRST letter) qui sert à mettre en majuscule la première lettre d'une chaîne
   de caractère.

3. Testez si la classe de nom `controller_class` existe à l'aide de la fonction
   [`class_exists`](http://php.net/manual/fr/function.class-exists.php) et
   appelez l'action `action` de la classe `controller_class` le cas
   échéant. Autrement appelez l'action `error` de `ControllerVoiture`.

3. Testez votre code en appelant vos anciennes pages du contrôleur *voiture*.

</div>

### Début du nouveau contrôleur

Maintenant que notre routeur est en place, nous pouvons créer de nouveaux
contrôleurs. Pour avoir un aperçu de l'étendu du travail, commençons par créer
l'action `readAll` de `Utilisateur`.

<div class="exercise">

1. Créez un contrôleur `controller/ControllerUtilisateur.php` similaire à celui
   des voitures qui reprend les méthodes `readAll()`, `afficheVue()` et
   `error()`.

   **Astuce :** Vous pouvez utiliser la fonction de remplacement (`Ctrl+R` sous
     PHPStorm) pour remplacer tous les `voiture` par `utilisateur`. En cochant
     `Préserver la casse` (`Preserve case`), vous pouvez faire en sorte de
     respecter les majuscules lors du remplacement.

2. Créez une classe `DataObject/Utilisateur.php` basé sur votre classe
   `Utilisateur` des TDs 2 & 3. Ce modèle ne contiendra que les *getter*, les
   *setter* et le constructeur.
   
1. Créez une classe `Repository/UtilisateurRepository.php` qui reprend la
   fonction `getUtilisateurs()` et `construire($utilisateurTableau)` de votre
   ancienne classe `Utilisateur`.

   Corrigez les erreurs : `Model` est devenu `DatabaseConnection` et il manque un alias avec `use` pour la classe `Voiture`.

3. Créez une vue `src/view/utilisateur/list.php` similaire à celle des
   voitures (sans nécessairement de lien pour l'instant).

4. **Testez** votre action en appelant l'action `readAll` du contrôleur
   `Utilisateur` (qui est accessible dans la barre de menu de votre site
   normalement).

</div>

## Modèle et contrôleur générique

L'implémentation du CRUD pour les utilisateurs et les trajets est un code très
similaire à celui pour les voitures. Nous pourrions donc copier/coller le code
des voitures et changer les (nombreux) endroits nécessaires.

Pour éviter de perdre un temps conséquent à développer le CRUD pour chaque
nouvel objet, nous allons mettre en commun le code autant que possible.

### Création d'un modèle générique

Nous allons déplacer de `VoitureRepository` vers un modèle générique
`AbstractRepository` toutes les requêtes SQL qui ne sont pas spécifiques aux
voitures.

<div class="exercise">

Commençons par la fonction `getVoitures()` de `VoitureRepository`. Les seules
différences entre `getVoitures()` et `getUtilisateurs()` sont le nom de la table
et le nom de la classe des objets en sortie. Voici donc comment nous allons
faire pour avoir un code générique :

1. Déplacez la fonction `getVoitures()` de `VoitureRepository` vers une nouvelle
   classe *abstraite* `AbstractRepository` en la renommant `selectAll()`.

1. Faites que la classe `VoitureRepository` hérite de `AbstractRepository` (mot
   clé `extends` comme en Java).

1. Pour que `AbstractRepository` accède au nom de la table, elle va demander à
   toutes ses classes filles de posséder une méthode `getNomTable()`.  
   Rajoutez donc une méthode abstraite `getNomTable()` dans `AbstractRepository`
   ```php
   protected abstract function getNomTable(): string;
   ```
   et une implémentation de `getNomTable()` dans `VoitureRepository`.

   <!-- getNomTable n'est pas statique car PHP déconseille l'utilisation de méthode statique et abstraite (PHP émet un warning) -->

1. Utilisez `getNomTable()` dans la requête *SQL* de `selectAll()`. Puisque
   `getNomTable()` est une méthode dynamique, enlevez le `static` de
   `selectAll()`.

1. De même, `AbstractRepository` va demander à toutes ses classes filles de
   posséder une méthode `construire($objetFormatTableau)`.  
   * Rajoutez donc une méthode abstraite dans `AbstractRepository`
   ```php
   protected abstract function construire(array $objetFormatTableau);
   ```
   * Enlevez le `static` du `construire()` de `VoitureRepository`.
   * Mettez à jour l'appel à `construire()` de `selectAll()`.

   <!-- attention déclaration de type correspondante entre méthode et 
   implémentation -->

   <!-- construire($objetFormatTableau): AbstractDataObject; -->

1. Corrigez l'action `readAll` du `ControllerVoiture` pour faire appel à la
   méthode `selectAll()` de `VoitureRepository`. L'action `readAll` du
   contrôleur *voiture* doit remarcher.

</div>

<div class="exercise">

1. Faites de même pour `UtilisateurRepository` :
   * commentez `getUtilisateurs()`,
   * enlevez le `static` de `construire()`,
   * implémentez `getNomTable()`,
   * `UtilisateurRepository` doit hériter de `AbstractRepository`.

1. Corrigez l'action `readAll` du `ControllerUtilisateur` pour faire appel à la
   méthode `selectAll()` de `UtilisateurRepository`. L'action doit remarcher.

</div>

### Action `read`

Pour faciliter les actions `read` des différents contrôleurs, nous allons créer
une fonction `select($valeurClePrimaire)` générique dans `AbstractRepository`
qui permet de faire une recherche par clé primaire dans une table. Cette
fonction a besoin de connaître le *nom de la clé primaire*. Nous allons donc
demander aux implémentations de `AbstractRepository` de fournir une méthode
`getNomClePrimaire()`.

<div class="exercise">

Commençons par la fonction `select($valeurClePrimaire)`. Dans cette requête
*SQL*, le nom de la table et la condition `WHERE` varie.

1. Déplacez la fonction `getVoitureParImmat($immatriculation)` de
   `VoitureRepository.php` vers `AbstractRepository` en la renommant
   `select($valeurClePrimaire)`. Enlevez son attribut `static` et son type de retour.

1. Rajoutez donc une méthode abstraite `getNomClePrimaire()` dans
   `AbstractRepository`
   ```php
   protected abstract function getNomClePrimaire(): string;
   ```
   et une implémentation de `getNomClePrimaire()` dans `VoitureRepository`.

1. Utilisez `getNomTable()` et `getNomClePrimaire()` pour construire la requête
   *SQL* de `select()`.

1. Finissez de corriger `select()` :
   * Changez les valeurs dans le tableau donné à `execute()`
   * Corrigez l'appel à `construire()` qui est une méthode dynamique maintenant.

1. Corrigez l'action `read` du `ControllerVoiture` pour faire appel à la méthode
   `select()` de `VoitureRepository`. L'action doit remarcher.
</div>

<div class="exercise">

1. Faites de même pour `UtilisateurRepository` : implémentez
   `getNomClePrimaire()`.

1. Créez l'action `read` du `ControllerUtilisateur` en vous basant sur celle de
   `ControllerVoiture`.

   **Rappel :** Utilisez le remplacement `Ctrl+R` en préservant la casse pour vous faciliter le travail.

1. Il ne vous reste plus qu'à créer la vue associée `detail.php` et à rajouter
   les liens vers la vue de détail dans `list.php`. L'action `read` doit maintenant fonctionner.

</div>


### Action `delete`

Pas de nouveautés.

<div class="exercise">

Nous vous laissons adapter la requête *SQL* `supprimer($valeurClePrimaire)` de
`AbstractRepository`, l'action `delete` des contrôleurs *voiture* et
*utilisateur*, ainsi que leur vue associée `delete.php` et à rajouter les liens
pour supprimer dans `list.php`.
</div>

### Action `create` et `update`

Pas de nouveautés.

<!-- Les vues `create.php` et `update.php` sont quasiment identiques : elles
affichent le même formulaire, et le préremplissent ou non. Nous allons donc
fusionner `create.php` et `update.php` en une unique page.

<div class="exercise">

1. Supprimez la vue `create.php` et modifiez le contrôleur de sorte que
   l'action `create` appelle la vue `update.php`.

   **Attention :** quand on arrive sur la vue `update.php` depuis l'action
   `create`, les variables d'immatriculation, de couleur et de marque ne sont
   pas renseignées. Penser à les initialiser à chaîne vide dans le contrôleur.

1. Le champ `immatriculation` du formulaire doit être :

   * `required` si l'action est `create` ou
   * `readonly` si l'action est `update` (on ne peut pas modifier la clé
      primaire d'un tuple).

   Utilisez une variable dans le contrôleur pour permettre l'adaptation de la
   vue à ces deux actions.

1. Enfin, le champ `action` du formulaire doit être `created` si l'action est
   `create` ou `updated` si l'action est `update`. Là aussi, utiliser une
   variable spécifique.
-->

   <!-- Mettre à jour le contrôleur en conséquence.\\ -->
   <!-- **Indice :** `<input ... placeholder='Exemple' value='$val'>` affichera
   'Exemple' en grisé si `val` est la chaîne de caractère vide, et pré-remplira
   avec la valeur de `val` autrement. -->

<!--

1. Testez que votre nouvelle vue fusionnée marche.

1. Rajoutez un champ `controller` dans le formulaire en prévision de la
   suite. Vous pouvez soit écrire en dur que le contrôleur est `voiture`, soit
   le récupérer avec l'attribut `static::$object` du contrôleur.

</div> -->

<div class="exercise">

Nous vous laissons adapter les actions `create` et `update` de
`ControllerUtilisateur`, leurs vues associées `create.php` et `update.php` et à
rajouter les liens pour mettre à jour un utilisateur ou une voiture dans
`detail.php`.

</div>

### Action `created` et `updated`

Pour ces dernières actions, il faut un peu plus travailler pour créer la
fonction correspondante dans le modèle générique. 

#### Action `updated`

Pour reconstituer la requête
```sql
UPDATE voiture SET marque= :marque, couleur= :couleur, immatriculation= :immatriculation WHERE id= :id;
```
il est nécessaire de pouvoir lister les champs de la table `voiture`.

<div class="exercise">

1. Déplacez la fonction `mettreAJour($immatriculation)` de
   `VoitureRepository.php` vers `AbstractRepository` en la renommant
   `update($valeurClePrimaire)`. Enlevez son attribut `static` et son type de retour.

1. Rajoutez donc une méthode abstraite `getNomsColonnes()` dans
   `AbstractRepository`
   ```php
   protected abstract function getNomsColonnes(): array;
   ```
   et une implémentation de `getNomsColonnes()` dans `VoitureRepository`.

1. Utilisez `getNomTable()`, `getNomClePrimaire()` et `getNomsColonnes()` pour
   construire la requête *SQL* de `select()`.

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

   Nous allons demander à tous les `DataObject` d'implémenter une méthode `formatTableau()` qui fait celà :
   1. Créer une classe abstraite `AbstractDataObject` dans le dossier
      `DataObject`.
   1. `Voiture` et `Utilisateur` doivent hériter de `AbstractDataObject`.
   1. `AbstractDataObject` définit une méthode abstraite 
      ```php
      public abstract function formatTableau(): array;
      ```
      que vous implémenterez dans `Voiture` et `Utilisateur`.

1. Utilisez `formatTableau()` dans `update()` pour obtenir le tableau donné à
   `execute()`.

1. Corrigez l'action `updated` du `ControllerVoiture` pour faire appel aux
   méthodes de `VoitureRepository`. L'action doit remarcher.

1. Grâce à la classe `AbstractDataObject`, vous pouvez rajouter des déclarations
   de type dans `AbstractRepository` :
   * type de retour de `select`,
   * type d'entrée de `update`.
</div>

<div class="exercise">

Implémentez l'action `updated` du contrôleur *utilisateur*.

</div>



#### Action `created`

<div class="exercise">

Répétez la question précédente avec la fonction `sauvegarder()` des différents modèles.

</div>

## Bonus

### Contrôleur trajet

Adaptez chacune des actions de `ControllerTrajet.php` et les tester une à
une. Nous vous conseillons de faire dans l'ordre les actions `read`, `delete`,
`create`, `update`, `sauvegarder` et `updated`.

Vous pouvez aussi rajouter des actions pour afficher la liste des passagers pour
un trajet, et inversement la liste des trajets pour un passager (table de
jointure `passager`, cf. fin TD3).

### Autres idées

* Faire en sorte que la méthode d'erreur prenne en argument un message d'erreur. Chaque appel à cette méthode doit maintenant fournir un message d'erreur personnalisé.
* Factoriser le code des contrôleurs dans un contrôleur générique, au moins pour
  la méthode `afficheVue()` 
* Faites hériter `Voiture`, `Utilisateur` et `Trajet` d'une classe abstraite
  `AbstractDataObject`. Ceci permet de compléter les déclarations de type dans le modèle générique.
* Rajouter les actions spécifiques aux requêtes SQL `getTrajets()` et
  `supprimerPassager()` du TD3 non utilisées :
  * qui liste les trajets d'un utilisateur,
  * qui désinscrit un passager d'un trajet.

<!-- * Violation de SRP : le contrôleur frontal et le routeur devrait être séparés -->
