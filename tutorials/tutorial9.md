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

## Application des sessions : Redirection HTTP & messages flash

### Cahier des charges

<!--  
Mettre un joli carousel
https://getbootstrap.com/docs/3.4/javascript/#carousel
-->

Le client est sur le formulaire de création d'une voiture

![VoitureCreate]({{site.baseurl}}/assets/TD7/VoitureCreate.png){: .blockcenter}

S'il rentre une immatriculation existante, le site le redirige vers le
formulaire de création avec un message d'avertissement

![VoitureCreatedWarning]({{site.baseurl}}/assets/TD7/VoitureCreatedWarning.png){: .blockcenter}

De même, s'il oublie un champ du formulaire (ce qui ne devrait *normalement* pas
arriver puisque les `<input>` ont l'attribut `required`), le site le redirige vers le
formulaire de création avec un message de danger

![VoitureCreatedDanger]({{site.baseurl}}/assets/TD7/VoitureCreatedDanger.png){: .blockcenter}

Quand le formulaire est valide, le client est redirigé vers la vue qui liste
toutes les voitures avec un message de succès

![VoitureCreatedSuccess]({{site.baseurl}}/assets/TD7/VoitureCreatedSuccess.png){: .blockcenter}

Ce message ne s'affiche qu'une fois ; si le client rafraîchit la page (`F5`),
alors le message disparait

![VoitureReadAll]({{site.baseurl}}/assets/TD7/VoitureReadAll.png){: .blockcenter}

<div class="exercise">

1. **À l'aide des indications de la section suivante**, implémentez un système de message flash.

1. Utilisez les messages flash pour enlever toutes les vues qui affichaient un
   message puis appelaient une autre vue. En particulier, supprimez les vues
   désormais inutiles `utilisateurCree.php`, `utilisateurMisAJour.php` et
   `utilisateurSupprime.php`. Faites de même pour les vues de voiture.

   *Note* : Par exemple, en cas de succès de création d'un utilisateur, on
   pourrait ajouter un message flash de succès *L'utilisateur a bien été créé*
   puis rediriger dans l'action `afficherListe` du contrôleur `utilisateur`.
   
1. De plus, l'action `enregistrerPreference()` peut maintenant rediriger
   l'action par défaut du contrôleur par défaut, que l'on obtient sans indiquer
   d'action ni de contrôleur dans l'URL, avec un message flash *La préférence de
   contrôleur est enregistrée !*.

</div>


### Indications techniques

1.  Pour la redirection, nous allons utiliser le code suivant (à encapsuler dans
    une méthode `redirectionVersURL` du contrôleur générique)
    ```php
    header("Location: $url");
    exit();
    ```

    En effet, quand un navigateur reçoit l'en-tête de réponse
    [`Location`](https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Location),
    il doit effectuer une redirection temporaire sur l'URL indiquée. Enfin,
    `exit()` termine l'exécution du script courant. 

    *Note :* L'utilisation de `exit()` est optionnelle. Nous vous le mentionnons
    car généralement le script n'a plus rien à faire après avoir demandé une
    redirection.

1. Le principe d'un message flash est qu'il est détruit quand il est lu. Du
   coup, le message ne sera affiché qu'une fois.

1.  Vos messages flash doivent supporter 4 types de messages *success* (vert),
    *info* (jaune), *warning* (orange) et *danger* (rouge). Chaque type peut
    comporter plusieurs messages.

1. Ces messages seront stockés en session pour pouvoir être écrits lors d'une
   requête et lus lors de la requête de redirection suivante.

1. Les messages flash peuvent s'afficher sur n'importe quelle page qui utilise
   la vue générique `vueGenerale.php`. Il faudra donc mettre à jour `vueGenerale.php` pour
   afficher tous les messages flash existants. Il faudra aussi penser à ce
   qu'une variable contenant les messages flash soit donné en paramètre lors de
   l'affichage de la vue.

1.  Vous devriez coder une classe pour les messages flash. Nous vous proposons
    l'interface suivante pour le fichier `src/Lib/MessageFlash.php`

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

1.  Pour le CSS des messages d'alerte, vous pouvez reprendre le [composant
    d'alerte du framework CSS Bootstrap](https://getbootstrap.com/docs/3.4/components/#alerts)
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

    On obtient alors un bloc de succès avec le code
    ```html
    <div class="alert alert-success">...</div>
    ```

1.  (Optionnel) Pour des formulaires plus jolis, vous pouvez utiliser les [`Input add-ons`
    de *Solved by
    Flexbox*](https://philipwalton.github.io/solved-by-flexbox/demos/input-add-ons/)
    ```css
    /* https://philipwalton.github.io/solved-by-flexbox/demos/input-add-ons/ */
    .InputAddOn {
        display: flex;
        margin-bottom: 1.5em;
    }

    .InputAddOn-field {
        flex: 1;
    }
    .InputAddOn-field:not(:first-child) {
        border-left: 0;
    }
    .InputAddOn-field:not(:last-child) {
        border-right: 0;
    }

    .InputAddOn-item {
        background-color: rgba(147, 128, 108, 0.1);
        color: #666666;
        font: inherit;
        font-weight: normal;
    }

    .InputAddOn-field,
    .InputAddOn-item {
        border: 1px solid rgba(147, 128, 108, 0.25);
        padding: 0.5em 0.75em;
    }
    .InputAddOn-field:first-child,
    .InputAddOn-item:first-child {
        border-radius: 2px 0 0 2px;
    }
    .InputAddOn-field:last-child,
    .InputAddOn-item:last-child {
        border-radius: 0 2px 2px 0;
    }
    ```

    Un champ de formulaire s'obtient par exemple avec 
    ```html
    <p class="InputAddOn">
        <label class="InputAddOn-item" for="immat_id">Immatriculation&#42;</label>
        <input class="InputAddOn-field" type="text" placeholder="Ex : 256AB34" name="immatriculation" id="immat_id" required>
    </p>
    ```


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

