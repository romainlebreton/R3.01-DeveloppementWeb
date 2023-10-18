---
title: TD9 &ndash; Messages Flash
subtitle: Une autre application des sessions
layout: tutorial
lang: fr
---

<!-- 
Découper l'exercice ?
* D'abord l'affichage des messages dans la vue générique avec une variable globale
* puis la redirection et les messages en session ?
 -->

<!-- 

Faire un dessin représentant les communications HTTP, la redirection, 
l'état de la session

-->

<!-- Pas de static::redirection -->

## Ajouter des messages à une vue

### Bandeau de messages

Au lieu de créer une vue spécifique comme `utilisateurCree.php` pour ajouter un
message flash en haut d'une vue existante, nous allons intégrer un système de message
à nos pages.

Les messages pourront être de 4 types : *success* (vert),
*info* (jaune), *warning* (orange) et *danger* (rouge). Chaque type peut
comporter plusieurs messages. Voici 2 exemples : 

<div style="
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
">

![VoitureCreatedSuccess]({{site.baseurl}}/assets/TD7/VoitureCreatedSuccess.png){: .blockcenter}

![VoitureCreatedWarning]({{site.baseurl}}/assets/TD7/VoitureCreatedWarning.png){: .blockcenter}

</div>

Pour stocker les messages flash, nous utiliserons des tableaux de tableaux de
`string`, par exemple :
```php?start_inline=1
$messagesFlash = [
    "success" => [
        0 => "Message succès"
    ],
    "danger" => [
        0 => "Message danger 1",
        1 => "Message danger 2"
    ]
];
```

<div class="exercise">

1. Les messages peuvent s'afficher sur n'importe quelle page qui utilise
   `vueGenerale.php`, que nous allons mettre à jour pour afficher tous les
   messages existants. 

   Dans `vueGenerale.php`, rajouter le `<div>` suivant juste après le `<nav>`
   dans le `<header>`.

   ```php
   <div>
       <?php
       /** @var string[][] $messagesFlash */
       foreach($messagesFlash as $type => $messagesFlashPourUnType) {
           // $type est l'une des valeurs suivantes : "success", "info", "warning", "danger"
           // $messagesFlashPourUnType est la liste des messages flash d'un type
           foreach ($messagesFlashPourUnType as $messageFlash) {
               echo <<< HTML
               <div class="alert alert-$type">
                  $messageFlash
               </div>
               HTML;
           }
       }
       ?>
   </div>
   ```
   
2. Dans `ControleurGenerique::afficherVue()`, récupérez les messages dans une variable `$messagesFlash` à partir de l'URL (si présente dans l'URL), juste avant de `require` la vue :
   ```php
   // Avec le if/else ternaire
   $messagesFlash = isset($_REQUEST["messagesFlash"]) ? $_REQUEST["messagesFlash"] : [];
   // Ou de manière équivalent avec l'opérateur "null coalescent"
   // https://www.php.net/manual/fr/migration70.new-features.php#migration70.new-features.null-coalesce-op
   // $messagesFlash = $_REQUEST["messagesFlash"] ?? [];
   ```

3.  Pour le CSS des messages d'alerte, rajoutez le code suivant à
    `navstyles.css`. Le code provient du [composant d'alerte du framework CSS
    Bootstrap](https://getbootstrap.com/docs/3.4/components/#alerts)
    ```css
    /* Bootstrap alerts */
    /* https://getbootstrap.com/docs/3.4/components/#alerts */

    .alert {
        padding: 15px;
        margin-bottom: 20px;
        border: 1px solid transparent;
        border-radius: 4px;
    }

    .alert-success {
        color: #3c763d;
        background-color: #dff0d8;
        border-color: #d6e9c6;
    }

    .alert-info {
        color: #31708f;
        background-color: #d9edf7;
        border-color: #bce8f1;
    }

    .alert-warning {
        color: #8a6d3b;
        background-color: #fcf8e3;
        border-color: #faebcc;
    }

    .alert-danger {
        color: #a94442;
        background-color: #f2dede;
        border-color: #ebccd1;
    }
    ```

    On obtient alors par exemple un bloc de succès avec le code
    ```html
    <div class="alert alert-success">...</div>
    ```

4. Testez les messages flash. Pour ceci, appelez une vue en rajoutant le tableau des
   messages dans le *query string* de la manière suivante
   ```text
   http://webinfo.iutmontp.univ-montp2.fr/~mon_login/TD-PHP/TD8/web/controleurFrontal.php?messagesFlash[success][]=Hello+World
   ```
   ou
   ```text
   http://webinfo.iutmontp.univ-montp2.fr/~mon_login/TD-PHP/TD8/web/controleurFrontal.php?messagesFlash[danger][]=Message+de+danger+1&messagesFlash[danger][]=Message+de+danger+2
   ```

</div>

### Redirection

Il est pratique pour le site de pouvoir rediriger sur une autre page en cas
d'erreur ou de succès. Par exemple, le client est sur le formulaire de création d'une voiture

![VoitureCreate]({{site.baseurl}}/assets/TD7/VoitureCreate.png){: .blockcenter}

S'il rentre une immatriculation existante, le site le redirige vers le
formulaire de création avec un message flash d'avertissement

![VoitureCreatedWarning]({{site.baseurl}}/assets/TD7/VoitureCreatedWarning.png){: .blockcenter}

De même, s'il oublie un champ du formulaire (ce qui ne devrait *normalement* pas
arriver puisque les `<input>` ont l'attribut `required`), le site le redirige vers le
formulaire de création avec un message flash de danger

![VoitureCreatedDanger]({{site.baseurl}}/assets/TD7/VoitureCreatedDanger.png){: .blockcenter}

Quand le formulaire est valide, le client est redirigé vers la vue qui liste
toutes les voitures avec un message flash de succès

![VoitureCreatedSuccess]({{site.baseurl}}/assets/TD7/VoitureCreatedSuccess.png){: .blockcenter}

Le système de redirection est pratique car il évite la duplication de code.
Précédemment, pour que l'action `creerDepuisFormulaire` affiche la liste des
voitures en cas de succès, il fallait récupérer la liste des voitures et appeler
la vue `voitures/liste.php`. Ce code existe déjà dans l'action `afficherListe`. 

À la place, nous allons juste rediriger le client vers l'URL correspondant à
l'action `afficherListe` sans code supplémentaire.

<div class="exercise">

1.  Pour la redirection, nous allons utiliser le code suivant (à encapsuler dans
    une méthode `redirectionVersURL` du contrôleur générique)
    ```php
    header("Location: $url");
    exit();
    ```

    En effet, quand un navigateur reçoit l'en-tête de réponse
    [`Location`](https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Location),
    il effectue une redirection, c'est-à-dire qu'il lance une requête vers la
    nouvelle URL comme si on avait cliqué sur un lien. Enfin, `exit()` termine
    l'exécution du script courant. 

    *Note :* L'utilisation de `exit()` est optionnelle. Nous vous le mentionnons
    car généralement le script n'a plus rien à faire après avoir demandé une
    redirection.

2. Utilisons la redirection dans un premier scénario d'erreur. Dans
   `ControleurUtilisateur::afficherDetail`, si le `login` ne correspond à aucun
   utilisateur, utilisez la redirection précédente vers l'URL de l'action
   `afficherListe` avec le message flash de type `warning` suivant : `Login inconnu`.

3. Dans `ControleurUtilisateur::supprimer`, si l'utilisateur a bien été
   supprimé, redirigez-le vers l'action `afficherListe` avec le message flash de
   succès `L'utilisateur a bien été supprimé !`.

</div>

## Application des sessions : messages flash

<!--  
Mettre un joli carousel
https://getbootstrap.com/docs/3.4/javascript/#carousel
-->

Le client est sur le formulaire de création d'une voiture

![VoitureCreate]({{site.baseurl}}/assets/TD7/VoitureCreate.png){: .blockcenter}

Quand le formulaire est valide, le client est redirigé vers la vue qui liste
toutes les voitures avec un message flash de succès

![VoitureCreatedSuccess]({{site.baseurl}}/assets/TD7/VoitureCreatedSuccess.png){: .blockcenter}

Nous souhaitons maintenant que ce message ne s'affiche qu'une fois ; si le
client rafraîchit la page (`F5`), alors le message flash disparait

![VoitureReadAll]({{site.baseurl}}/assets/TD7/VoitureReadAll.png){: .blockcenter}

Le principe du *flash* d'un message flash est qu'il est détruit quand il est lu.
Du coup, le message ne sera affiché qu'une fois. 

Les messages flash seront stockés en session pour pouvoir être écrits lors d'une
requête et lus lors de la requête de redirection suivante. Prenons un exemple : 

   1. En cliquant sur le bouton `Envoyer` du formulaire de création de voiture,
      vous faites une requête à l'action `creerDepuisFormulaire`. Si la création
      se passe bien, vous enregistrez en session un message flash de succès,
      puis vous redirigez le client vers l'affichage des voitures.

   2. Sur la page de l'action `afficherListe`, le contrôleur va lire les
      messages flash stockés en session. Ces messages sont affichés sur la
      page. Selon le principe des messages flash, cette lecture entrainera leur
      suppression de la session.

   3. Si vous rafraichissez la page, l'action `afficherListe` va toujours lire
      les messages flash mais n'en trouvera pas. Le message disparaitra donc.

<div class="exercise">

1. Implémentez un système de message flash en complétant le squelette suivant
   dans le fichier `src/Lib/MessageFlash.php`

    ```php
    namespace App\Covoiturage\Lib;

    class MessageFlash
    {

        // Les messages sont enregistrés en session associée à la clé suivante 
        private static string $cleFlash = "_messagesFlash";

        // $type parmi "success", "info", "warning" ou "danger" 
        public static function ajouter(string $type, string $message): void
        {
            // À compléter
        }

        public static function contientMessage(string $type): bool
        {
            // À compléter
        }

        // Attention : la lecture doit détruire le message
        public static function lireMessages(string $type): array
        {
            // À compléter
        }

        public static function lireTousMessages() : array
        {
            // À compléter
        }

    }
    ```

2. Modifiez `ControleurGenerique::afficherVue()` pour lire les messages flash
   depuis cette classe avec 
   ```php
   $messagesFlash = MessageFlash::lireTousMessages();
   ```

3. Tester vos nouveaux messages flash. Pour ceci, reprenez les scénarios de
   l'exercice 2. Au lieu de passer les messages flash dans l'URL, vous les
   ajouterez dans la session avec `MessageFlash::ajouter()` avant la
   redirection.

</div>

### Utilisation des messages flash

Utilisez les messages flash pour enlever toutes les vues qui affichaient un
message puis appelaient une autre vue.

<div class="exercise">

1. En particulier, supprimez les vues désormais inutiles comme
   `utilisateurCree.php`, `utilisateurConnecte.php`,
   `utilisateurDeconnecte.php`, `utilisateurMisAJour.php` et
   `utilisateurSupprime.php`. Faites de même pour les vues de voiture.

   *Note* : Par exemple, en cas de succès de création d'un utilisateur, on
   pourrait ajouter un message flash de succès *L'utilisateur a bien été créé*
   puis rediriger dans l'action `afficherListe` du contrôleur `utilisateur`.
   
2. De plus, l'action `enregistrerPreference()` peut maintenant rediriger
   l'action par défaut du contrôleur par défaut, que l'on obtient sans indiquer
   d'action ni de contrôleur dans l'URL, avec un message flash de succès *La
   préférence de contrôleur est enregistrée !*.

</div>


Dans votre site, nous allons remplacer tous les appels `afficherErreur` à la vue
d'erreur par des redirections avec messages flash.

<div class="exercise">

1. action `creerDepuisFormulaire`, si les deux champs mot de passe ne coïncident
   pas, redirigez vers le formulaire de création avec un message flash *Mots de
   passe distincts* de type *warning*.

   *Note* : Nous réserverons les messages flash de type *danger* pour les
   erreurs qui ne sont censées se produire que si le client a essayé de hacker
   le site (accès à une page qu'on ne lui a pas proposé, donnée de formulaire
   manquante alors qu'elle était `required`), et les messages flash de type
   *warning* pour les erreurs de l'utilisateur. 

2. action `mettreAJour`: 
   * si les 2 nouveaux mots de passe ne coïncident pas, redirigez vers le
   formulaire de mise à jour en indiquant le login dans l'URL avec un message
   flash *Mots de passe distincts*.
   * si l'ancien mot de passe n'est pas correct, redirigez vers le formulaire de
   mise à jour en indiquant le login dans l'URL avec un message flash *Ancien
   mot de passe erroné*.
   <!-- * Le cas échéant, redirigez vers l'action `afficherListe` avec un message
   flash de succès *Utilisateur mis à jour*. -->

   <!-- **Aide :** Pour pouvoir rediriger vers le formulaire de mise à jour avec
    l'identifiant d'un utilisateur, modifiez la méthode `redirection` pour qu'elle ajoute
    une *query string* dans les redirections, -->

3. action `connecter()` :  
   1. Si le login ou le mot de passe ne sont pas transmis dans le *query
      string*, redirigez vers le formulaire de connexion avec un message flash
      *Login et/ou mot de passe manquant* de type `danger`.
   2. Si le login n'existe pas, redirigez vers le formulaire de connexion avec
      un message flash *Login inconnu* de type `warning`. 
   3. Si le mot de passe transmis n'est pas correct, redirigez vers le
      formulaire de connexion avec un message flash *Mot de passe incorrect* de
      type `warning`.
   <!-- 4. Enfin, vous pouvez connecter l'utilisateur (utiliser une méthode de la
      classe `ConnexionUtilisateur`). Redirigez vers l'action `read` de
      l'utilisateur connecté avec un message flash *Connexion effectuée* de type
      `success`. -->

<!-- 4. action `deconnecter` : redirigez vers l'action `readAll` avec un message
   flash de type `success`. -->

5. action `afficherFormulaireMiseAJour` : 
   * l'accès au formulaire doit être restreint à l'utilisateur connecté. En cas
   de problème, redirigez vers l'action `afficherListe` avec un message flash de
   type *danger*.
   * si l'utilisateur est inconnu, faites une redirection avec message flash *Login inconnu*.

6. action `validerEmail` : 
   * `GET` deux valeurs `login` et `nonce` existent, sinon message flash.
   * En cas de succès, "redirection flash" vers la page de détail de cet
   utilisateur. 
   * En cas d'échec, "redirection flash" vers `afficherListe`.

7. Traitez les appels à `afficherErreur` restants.

</div>

<!-- On écrit dans le champ `_messagesFlash` de la session un tableau comme suit :

```php
[
    "success" => [
        "Utilisateur enregistré"
    ],
    "info" => [],
    "warning" => [
        "Erreur dans le formulaire",
        "Mauvais mot de passe"
    ],
    // Pas de clé "danger" dans cet exemple
];
```

Les clés sont l'un des 4 types possibles : "success", "info", "warning" ou
"danger". Les valeurs sont une liste de messages. Tous les types ne sont pas
nécessairement présents. 

contientMessageDeType : true ssi il y a un tableau dans le champ `_messagesFlash` de la session qui contient une liste non vide de messages pour la clé `$type`.

ajouter : 
* lis le tableau des messages flash en session. 
* rajoute le message dans la case `$type` du tableau
* enregistre le tableau des messages flash en session

lireMessages :
* si le tableau des messages flash ne contient pas de messages du type -> []
* sinon renvoie la case `$type` du tableau
* enleve la case `$type` du tableau dans l'enregistrement en session -->

