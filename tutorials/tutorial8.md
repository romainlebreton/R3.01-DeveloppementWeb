---
title: TD8 &ndash; Authentification & validation par email
subtitle: Sécurité des mots de passe
layout: tutorial
lang: fr
---

<!-- Parler des nouvelles fonctions de PHP pour les mots de passe ?
http://php.net/manual/fr/book.password.php -->

<!-- Màj le TD pour le fait d'être connecté pour valider le mail -->

Ce TD vient à la suite du
[TD7 -- cookies & sessions]({{site.baseurl}}/tutorials/tutorial7.html) et
prendra donc comme acquis l'utilisation des cookies et des sessions. Cette
semaine, nous allons :

1. mettre en place l'authentification par mot de passe des utilisateurs du site ;
3. mettre en place une validation par email de l'inscription des utilisateurs ;
2. verrouiller l'accès à certaines pages ou actions à certains utilisateurs. Par
   exemple, un utilisateur ne peut modifier que ses données. Ou encore,
   l'administrateur a tous les droits sur les utilisateurs.

## Authentification par mot de passe

### Stockage sécurisé de mot de passe

Nous allons stocker le mot de passe d'un utilisateur dans la base de données.
Cependant, on ne stocke jamais le mot de passe en clair (de manière directement
lisible) pour plusieurs raisons :
1. l'utilisateur souhaite que personne ne connaisse son mot de passe, y compris
   l'administrateur du site Web. De plus, c'est une règle de la CNIL.
1. Un attaquant qui arriverait à se connecter à la base de données apprendrait
   directement tous les mots de passe.

#### Idée 1 : Chiffrement

Le serveur pourrait stocker les mots de passes chiffrés.  

**Problème** : L'administrateur du site pourrait toujours lire les mots de passe. En
effet, il possède la clé secrète et peut donc déchiffrer les mots de passe.

#### Idée 2 : Hachage

Utilisons une fonction de hachage cryptographique, c'est-à-dire une fonction qui
vérifie notamment les propriétés suivantes (source :
[Wikipedia](https://fr.wikipedia.org/wiki/Fonction_de_hachage_cryptographique)):
* la valeur de hachage d'un message se calcule « facilement » ;
* il est impossible, pour une valeur de hachage donnée, de construire un message
  ayant cette valeur (résistance à la préimage) ;

Ainsi, si un site Web stocke les mots de passe hachés dans sa base de données,
l'administrateur du site ne pourra pas lire ces mots de passes.

```php
$mdpClair = 'apple';
echo hash('sha256', $mdpClair); // SHA-256 est un algorithme de hachage
// Affiche '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b'
```
(*Une manière simple d'exécuter ce code est d'ouvrir un interpréteur PHP
interactif en exécutant `php -a` dans le terminal. Il suffit alors de
couper/coller le code PHP dans l'interpréteur.*)

Cependant, le site peut quand même vérifier un mot de passe
```php
$mdpClair = 'apple';
$mdpHache = '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b';
var_dump($mdpHache == hash('sha256', $mdpClair));
// Renvoie true
``` 

**Problème** :
* L'administrateur du site peut facilement voir si deux utilisateurs ont le
  même mot de passe.
* [*Rainbow table*](https://fr.wikipedia.org/wiki/Rainbow_table) : Rapidement,
  c’est une structure de données qui permet de retrouver des mots de passe avec
  un bon compromis stockage/temps. Cette technique est surtout utile pour
  essayer de d'attaquer de nombreux mots de passes à la fois, par exemple tous
  ceux des utilisateurs d'un site Web. 

<div class="exercise">

   Créez à partir du code précédent le haché `Sha-256` d'un mot du dictionnaire
   français. Utilisez un site comme [md5decrypt](http://md5decrypt.net/Sha256/)
   pour retrouver le mot de passe originel à partir de son haché.
   <!-- http://reverse-hash-lookup.online-domain-tools.com/ -->

</div>


**Explication :** Ce site stocke le haché de `3 771 961 285 ≃ 4*10^9` mots de
passe communs. Si votre mot de passe est l'un de ceux-là, sa sécurité est
compromise.  
Heureusement il existe beaucoup plus de mot de passe possible ! Par exemple,
rien qu'en utilisant des mots de passe de longueur 10 écrits à partir des 64
caractères `0,1,...,9,A,B,...,Z,a,...,z,+,/`, vous avez `(64)^10 = 2^60 ≃ 10^18`
possibilités.

#### Idée 3 : Saler et hacher

Comme une *rainbow table* est dépendante d'un algorithme de hachage, nous allons
hacher différemment chaque mot de passe. Pour ceci, nous allons concaténer une
chaîne aléatoire, appelée *sel*, au début de chaque mot de passe avant de le
hacher. La base de donnée doit stocker un sel et un haché pour chaque mot de
passe. En effet, la connaissance du sel est nécessaire pour tester un mot de
passe.

Nous allons utiliser l'implémentation suivante de PHP de la fonction de hachage
`bcrypt` qui a la particularité d'intégrer automatiquement un sel aléatoire.
Ainsi, nous n'aurons besoin de rajouter qu'un seul champ à notre BDD qui
contiendra à la fois le sel et le haché.

```php
$mdpClair = 'apple';
// PASSWORD_DEFAULT utilise l'algorithme bcrypt actuellement
var_dump(password_hash($mdpClair, PASSWORD_DEFAULT));
// Le hachage d'un même mot de passe donne des résultats différents
var_dump(password_hash($mdpClair, PASSWORD_DEFAULT));
```

Le code précédent affiche par exemple :
```
$2y$10$VZxpwQN8.vVc5UkJy.dBh.n2yRC4Uh9dqrHxvyC.SlSlyDaZKPzQW
```

La sortie contient plusieurs informations (source :
[Wikipedia](https://en.wikipedia.org/wiki/Bcrypt#Description)):
* `2y` : 
  * `2` correspond à l'algorithme de hachage, ici `bcrypt`,
  * `y` correspond à la version de l'algorithme
* `10` : coût de l'algorithme. Augmenter le coût de 1 double le temps de calcul
  de la fonction de hachage. Ceci est utile pour limiter les capacités de
  l'attaque par force brute sachant que les ordinateurs sont de plus en plus
  rapides.
* `VZxpwQN8.vVc5UkJy.dBh.` : Les 22 premiers caractères correspondent au sel
  aléatoire.
* `n2yRC4Uh9dqrHxvyC.SlSlyDaZKPzQW` : Les 31 caractères finaux correspondent au haché 

On peut vérifier qu'un mot de passe en clair correspond bien à un mot de passe
haché :
```php
$mdpClair = 'apple';
$mdpHache1 = password_hash($mdpClair, PASSWORD_DEFAULT);
$mdpHache2 = password_hash($mdpClair, PASSWORD_DEFAULT);
var_dump(password_verify($mdpClair, $mdpHache1)); // True
var_dump(password_verify($mdpClair, $mdpHache2)); // True
```

**Problème** :
* Si un attaquant arrive à lire la base de données (en utilisant une injection
  SQL par exemple), il peut toujours effectuer les attaques suivantes sur les
  mots de passe hachés :
  * attaque par force brute : L'attaquant essaye tous les mots de passes
    possibles en commençant par ceux de petite taille.
  * attaque par dictionnaire : L'attaquant essaye les mots de passes les plus
    courants, par exemple les mots du dictionnaire, ou en trouvant une liste des
    mots de passe les plus communs.

#### Idée 4 : Poivrer, saler et hacher

L'idée finale est de rajouter une autre chaîne aléatoire, appelée *poivre*, dans
le hachage du mot de passe. La particularité du poivre est qu'il ne doit pas
être stocké dans la base de donnée. Ainsi, si la base de donnée est compromise,
l'attaquant n'apprend rien sur les mots de passe, car il ne connaît pas le
poivre. En effet, le poivre est nécessaire pour tester un mot de passe.

```php
$poivre = "M7UKGv9fkptxwbSmZvlr1U";
$mdpClair = 'apple';
$mdpPoivre = hash_hmac("sha256", $mdpClair, $poivre);
$mdpHache = password_hash($mdpPoivre, PASSWORD_DEFAULT);
var_dump($mdpHache);
```

*Explication* : Dans l'esprit, la fonction `hash_hmac` permet d'appliquer un
salage/hachage en spécifiant le sel. Dans notre cas, on commence par saler avec
notre poivre secret (*note de l'auteur* : oui cette phrase sonne étrangement
mais elle est correcte).


### Mise en place de la BDD et des formulaires

On vous donne la classe `MotDePasse` qui reprend les explications précédentes. 

```php
namespace App\Covoiturage\Lib;

class MotDePasse
{

    // Exécutez genererChaineAleatoire() et stockez sa sortie dans le poivre
    private static string $poivre = "";

    public static function hacher(string $mdpClair): string
    {
        $mdpPoivre = hash_hmac("sha256", $mdpClair, MotDePasse::$poivre);
        $mdpHache = password_hash($mdpPoivre, PASSWORD_DEFAULT);
        return $mdpHache;
    }

    public static function verifier(string $mdpClair, string $mdpHache): bool
    {
        $mdpPoivre = hash_hmac("sha256", $mdpClair, MotDePasse::$poivre);
        return password_verify($mdpPoivre, $mdpHache);
    }

    public static function genererChaineAleatoire(int $nbCaracteres = 22): string
    {
        // 22 caractères par défaut pour avoir au moins 128 bits aléatoires
        // 1 caractère = 6 bits car 64=2^6 caractères en base_64
        // et 128 <= 22*6 = 132
        $octetsAleatoires = random_bytes(ceil($nbCaracteres * 6 / 8));
        return substr(base64_encode($octetsAleatoires), 0, $nbCaracteres);
    }
}

// Pour créer votre poivre (une seule fois)
// var_dump(MotDePasse::genererChaineAleatoire());
```



<div class="exercise">

1. Copiez cette classe dans le fichier `src/Lib/MotDePasse.php`. Exécutez la commande
```php
var_dump(MotDePasse::genererChaineAleatoire());
```
et copiez-le dans l'attribut statique `$poivre` une fois pour toute.

   *Note* : Une façon simple d'exécuter la commande est de décommenter
   temporairement cette ligne dans `MotDePasse.php` puis d'exécuter la commande
   suivante dans le terminal (avec pour dossier courant `src/Lib`)
   ```bash
   php MotDePasse.php
   ``` 

1. Nous allons modifier la structure de donnée *utilisateur* :
   1. Modifiez la table utilisateur en lui ajoutant une colonne `VARCHAR(255)
mdpHache` stockant son mot de passe.
   1. Mettez à jour la classe métier `Utilisateur` (dossier `src/Model/DataObject`) :
      1. ajoutez un attribut `private string $mdpHache`,
      1. mettez à jour le constructeur, 
      1. rajoutez un getter,
      1. rajoutez un setter qui prend en entrée le mot de passe clair et le
         hache avant de l'enregistrer,
      1. mettez à jour la méthode `formatTableau` (qui fournit les données des
         requêtes SQL préparées).
   1. Mettez à jour la classe de persistance `UtilisateurRepository` :
      1. mettez à jour `construire` (qui permet de construire un utilisateur à partir de la sortie d'une requête SQL),
      1. mettez à jour `getNomsColonnes`.

   *Note* : L'utilisation d'un framework PHP professionnel nous éviterait ces
   tâches répétitives.

</div>

Nous allons modifier la création d'un utilisateur.

<div class="exercise">

1. Modifier la vue `create.php` pour ajouter deux champs *password* au formulaire
   ```html
   <p class="InputAddOn">
         <label class="InputAddOn-item" for="mdp_id">Mot de passe&#42;</label>
         <input class="InputAddOn-field" type="password" value="" placeholder="" name="mdp" id="mdp_id" required>
   </p>
   <p class="InputAddOn">
         <label class="InputAddOn-item" for="mdp2_id">Vérification du mot de passe&#42;</label>
         <input class="InputAddOn-field" type="password" value="" placeholder="" name="mdp2" id="mdp2_id" required>
   </p>
   ```

   Le deuxième champ mot de passe sert à valider le premier.

1. Modifiez l'action `created` du contrôleur *utilisateur* :
   1. rajoutez la condition que les deux champs mot de passe doivent
      coïncider avant de sauvegarder l'utilisateur. En cas d'échec, redirigez
      vers le formulaire de création avec un message flash *Mots de passe distincts*.
   1. Nous allons changer la manière de construire un objet métier
      *utilisateur* à partir des données `$_GET` du formulaire. Jusqu'à
      présent, nous appelions `Utilisateur::__construct()` ou de manière
      équivalente `UtilisateurRepository::construire()`. Mais ces méthodes
      sont faites pour prendre en entrée un résultat SQL (sous forme de
      tableau). À cause du mot de passe qui est en clair dans le formulaire,
      mais haché dans la BDD, il faut changer le code.

      * Créez une méthode 
      ```php
      public static function construireDepuisFormulaire (array $tableauFormulaire) : Utilisateur
      ```
      dans la classe `Utilisateur`. Elle appelle le constructeur de
      `Utilisateur` en hachant d'abord le mot de passe.
      * Mettez à jour l'action `created` pour appeler `construireDepuisFormulaire()`.

</div>

Rajoutons des mots de passe dans la mise à jour d'un utilisateur.

<div class="exercise">

1. Modifier la vue `update.php` pour ajouter trois champs *password* : l'ancien mot de passe, le nouveau qu'il faut écrire 2 fois pour ne pas se tromper.
1. Modifiez l'action `updated` :
   * vérifiez que les 2 nouveaux mots de passe coïncident. En cas d'échec,
      redirigez vers le formulaire de mise à jour en indiquant le login dans
      l'URL avec un message flash *Mots de passe distincts*.
   * Vérifiez que l'ancien mot de passe est correct. En cas d'échec,
      redirigez vers le formulaire de mise à jour en indiquant le login dans
      l'URL avec un message flash *Ancien mot de passe erroné*.
   * Le cas échéant, mettez à jour votre utilisateur en appelant les *setter*
      avec les données du formulaire. Enfin, effectuez la mise à jour dans la
      base de donnée.

</div>

## Sécurisation d'une page avec les sessions

Pour accéder à une page réservée, un utilisateur doit s'authentifier. Une fois
authentifié, un utilisateur peut accéder à toutes les pages réservées sans avoir
à retaper son mot de passe. Il faut donc faire circuler l'information "s'être
authentifié" de pages en pages : nous allons donc utiliser les sessions.

<!-- On pourrait faire ceci grâce à un champ caché dans un formulaire, mais ça ne -->
<!-- serait absolument pas sécurisé. -->

### Connexion d'un utilisateur

<div class="exercise">

Procédons en plusieurs étapes :

1. Nous allons regrouper les méthodes liées à la connexion d'un utilisateur dans
   la classe purement statique suivante :

   ```php
   namespace App\Covoiturage\Lib;

   class ConnexionUtilisateur
   {
       // L'utilisateur connecté sera enregistré en session associé à la clé suivante 
       private static string $cleConnexion = "_utilisateurConnecte";

       public static function connecter(Utilisateur $utilisateur): void
       {
           // À compléter
       }

       public static function estConnecte(): bool
       {
           // À compléter
       }

       public static function deconnecter(): void
       {
           // À compléter
       }

       public static function getLoginUtilisateurConnecte(): ?string
       {
           // À compléter
       }
   }
   ```

   Créez cette classe dans le fichier `src/Lib/ConnexionUtilisateur.php` et
   complétez son code. 
   
   *Indications* : 
   * La connexion enregistre un utilisateur en session dans le champ
    `$cleConnexion`.
   * Le client est connecté si et seulement si la session contient un enregistrement associé à la clé `$cleConnexion`.
   * La déconnexion consiste à supprimer cet enregistrement de la session.  
   * `getUtilisateurConnecte()` renvoie `null` si le client n'est pas connecté.
   
1. Rajoutons au menu de notre site un lien pour se connecter. Dans le menu de la
   vue générique `view.php`, rajoutez une icône cliquable
   ![connexion]({{site.baseurl}}/assets/TD8/enter.png) qui pointe vers la future
   action `formulaireConnexion` (contrôleur *utilisateur*). Ce lien ne doit
   s'afficher que si aucun utilisateur n'est connecté (utiliser une méthode de
   la classe `ConnexionUtilisateur`). 
   
   *Note* : Il est autorisé de mettre un `if` dans la vue `view.php`.

1. Créons une vue pour afficher un formulaire de connexion :

   1. Créer une vue `utilisateur/formulaireConnexion.php` qui comprend un formulaire avec
   deux champs, l'un pour le login, l'autre pour le mot de passe. Ce formulaire
   appelle la future action `connecter` du contrôleur *utilisateur*.
   1. Ajouter une action `formulaireConnexion` qui affiche ce formulaire.


1. Créons enfin l'action `connecter()` du contrôleur *utilisateur* :
   1. Commençons par les vérifications à faire avant de se connecter. La
      première vérification est qu'un login et un mot de passe sont transmis dans le
      *query string*. Sinon, redirigez vers le formulaire de connexion avec un message flash de type `danger`.
   1. Puis, il faut récupérer l'utilisateur ayant le login transmis. Ceci
      permettra de vérifier que ce login existe bien. Sinon, redirigez vers le
      formulaire de connexion avec un message flash de type `warning`.
   1. Après, il faut vérifier que le mot de passe transmis est bien celui de
      l'utilisateur (utiliser une méthode de la classe `MotDePasse`). Sinon,
      redirigez vers le formulaire de connexion avec un message flash de type
      `warning`.
   1. Enfin, vous pouvez connecter l'utilisateur (utiliser une méthode de la
      classe `ConnexionUtilisateur`). Redirigez vers l'action `read` de
      l'utilisateur connecté avec un message flash de type `success`.

</div>

Codons maintenant la déconnexion.

<div class="exercise">

1. Quand un utilisateur est connecté, ajoutez au menu de la vue générique
   `view.php` deux cases : 
   * la première contient une icône cliquable
     ![user]({{site.baseurl}}/assets/TD8/user.png) qui renvoie vers la vue de
     détail de l'utilisateur connecté.
   * puis une deuxième case avec une icône cliquable
   ![deconnexion]({{site.baseurl}}/assets/TD8/logout.png) qui pointe vers la
   future action `deconnecter` (contrôleur *utilisateur*). 

1. Ajouter une action `deconnecter` qui déconnecte l'utilisateur (utiliser une
   méthode de la classe `ConnexionUtilisateur`). Redirigez vers l'action
   `readAll` avec un message flash de type `success`.

</div>

### Sécurisation d'une page à accès réservé

On souhaite restreindre les actions de mise à jour et de suppression à
l'utilisateur actuellement authentifié. Commençons par limiter les liens.

<div class="exercise">

1. Assurez-vous que la vue `list.php` n'affiche que les liens vers la vue de
   détail, pas les liens de modifications ou de suppression.

1. Modifier la vue de détail pour qu'elle n'affiche les liens vers la mise à
jour ou la suppression que si le login de l'utilisateur concorde avec celui
stocké en session.

   Pour vous aider dans cette tâche, rajoutez la méthode suivante à
   `ConnexionUtilisateur`
   ```php
   public static function estUtilisateur($login): bool
   {
       return (ConnexionUtilisateur::estConnecte() &&
           ConnexionUtilisateur::getLoginUtilisateurConnecte() == $login);
   }
   ``` 

</div>

**Attention :** Supprimer le lien n'est pas suffisant car un petit malin
pourrait accéder au formulaire de mise à jour d'un utilisateur quelconque en
rentrant manuellement l'action `update` dans l'URL.

**Ici 18 nov**

<div class="exercise">

1. « Hacker » votre site en accédant à la page de mise à jour d'un utilisateur
   quelconque.

1. Modifier l'action `update` du contrôleur `Utilisateur` de sorte que si le
   login pour lequel une modification est demandé ne concorde pas avec celui
   stocké en session, on redirige l'utilisateur sur la page de connexion.

</div>

<div class="exercise">

**Attention :** Restreindre l'accès au formulaire de mise à jour n'est pas suffisant
car un petit malin pourrait exécuter une mise à jour en demandant manuellement
l'action `updated`.

1. « Hacker » votre site en effectuant une mise à jour d'un utilisateur
   quelconque sans changer de code PHP[^nbp].  
   **Note :** Ce « hack » sera bien plus simple à réaliser si le formulaire de
   mise à jour est en méthode `GET`, et pareil pour sa page de
   traitement. Passez temporairement votre formulaire en cette méthode si
   nécessaire.

1. Modifier l'action `updated` du contrôleur `Utilisateur` de sorte que si le
   login pour lequel une modification est demandé ne concorde pas avec celui
   stocké en session, on redirige l'utilisateur sur la page de connexion.

1. Sécuriser l'accès à l'action `delete` d'un utilisateur. 

</div>

[^nbp]: Mais vous pouvez changer le code HTML avec les outils de développement
    car cette manipulation se fait du côté client.


**Note générale importante :** Les seules pages qu'il est vital de sécuriser
sont celles dont le script effectue vraiment l'action de mise à jour ou de
suppression, *c.-à-d.* les actions `updated` et `delete`. Les autres sécurisations
sont surtout pour améliorer l'ergonomie du site.  
De manière générale, il ne faut **jamais faire confiance au client** ; seule une
vérification côté serveur est sûre.

### Super administrateur

Nous souhaitons pouvoir avoir des comptes administrateur sur notre site.

<div class="exercise">

1. Ajouter un champ `admin` de type `boolean` à la table `utilisateur`. 

1. Modifier l'action `connected` de `ControllerUtilisateur.php` pour enregistrer
dans la session si l'utilisateur est un administrateur ou non avec

   ```php?start_inline=1
   $_SESSION['admin'] = true; // ou false
   ```

1. Modifier l'action `update` de `ControllerUtilisateur.php` de sorte qu'un
utilisateur de type admin ait tous les droits sur toutes les actions de tous les
utilisateurs.

   **Conseil :** Pour faciliter la lecture du code, nous vous conseillons de
     compléter le fichier `lib/Session.php` avec la fonction `is_admin` :
   
   ```php?start_inline=1
   public static function is_admin() {
       return (!empty($_SESSION['admin']) && $_SESSION['admin']);
   }
   ```

</div>

Nous souhaitons maintenant permettre à un administrateur de facilement
promouvoir un autre utilisateur en tant qu'administrateur.

<div class="exercise">

1. On souhaite ajouter un bouton `checkbox` "Administrateur ?" au formulaire de mise à jour d'un utilisateur. Ce bouton ne doit être présent que si
   l'utilisateur authentifié est un administrateur.  
   À vous de modifier l'action `update` du contrôleur `Utilisateur` et la vue
   `update.php`. 
   <!-- **N'oubliez pas** que les vues ne doivent pas faire de calculs -->
   <!-- (donc pas de `if`). -->

1. Modifiez l'action `updated` pour prendre en compte un bouton `checkbox`
   "Administrateur ?" et mettre à jour le champ `admin` de la table
   `utilisateur`.

   **Attention :** N'oubliez pas que la page la plus importante à vérifier est
   l'action `updated` car c'est elle qui effectue vraiment la mise à jour.
   
</div>



## Enregistrement avec une adresse email valide

Dans beaucoup de sites Web, il est important de savoir si un utilisateur est
bien réel. Pour ce faire on peut utiliser une vérification de son numéro de
portable, de sa carte bancaire, etc.  Nous allons ici nous baser sur la
vérification de l'adresse email.

<div class="exercise">
1. Dans votre formulaire de création d'un utilisateur, vérifiez le format de
l'adresse email côté client, avec par exemple
[le champ `type="email"` du HTML5](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input).

1. Une fois de plus, un contrôle côté client n'est pas suffisant.  
**Hackez** votre propre site de sorte à vous inscrire avec une adresse mail non valide.

   **Remarque :** Vous devriez en conclure que les contrôles côté client (navigateur) offrent
   un confort d'affichage mais ne constituent en aucun cas une sécurisation de
   votre site !

1. Dans l'action `created` du contrôleur `Utilisateur`, vérifiez le format de
l'adresse email de l'utilisateur. Pour cela, vous pouvez par exemple utiliser la
fonction [`filter_var()`](http://php.net/manual/en/function.filter-var.php) avec
le filtre
[`FILTER_VALIDATE_EMAIL`](http://www.php.net/manual/en/filter.filters.validate.php).

</div>

À ce stade, vous savez que votre utilisateur a saisi une adresse email d'un
format valide. Nous allons maintenant vérifier que cette adresse existe
réellement et qu'elle appartient bien à notre utilisateur. Pour ce faire, nous
allons lui envoyer un mail et ne valider l'utilisateur (l'autoriser à se
connecter) que s'il a consulté le mail que nous lui avons envoyé.


<div class="exercise">

Expliquons brièvement le mécanisme de validation par adresse email que nous
allons mettre en place. À la création d'un utilisateur, nous associons à
l'utilisateur une chaîne de caractères aléatoires
([un nonce cryptographique](https://fr.wiktionary.org/wiki/nonce)) dans un champ
`nonce` de la BDD. Nous envoyons ce nonce par email à l'adresse indiqué. La
connaissance de ce nonce sert de preuve que l'adresse email existe ; le client
renverra donc le nonce au site qui validera donc l'adresse email (en mettant la
valeur du nonce à `NULL` dans notre cas).

<!--
Si l'utilisateur fait une faute de frappe dans l'email, le nonce sera envoyé à
la mauvaise adresse et donc il ne faut pas qu'un autre utilisateur puisse
valider le mail avec le nonce. En pratique, nous demanderons donc à
l'utilisateur d'être connecté pour pouvoir valider une adresse email grâce au
nonce.

Donc il faut un champ email_validated dans la session qui fait que quand on est
connecté sans avoir validé, alors on ne peut que valider son email.
-->

Mettons en place ce procédé :

1. Ajoutez un champ `nonce` de type `VARCHAR[32]` ainsi qu'un champ `email` de
   type `VARCHAR[256]` à la table `utilisateur`.

1. Modifiez l'action `connected` du contrôleur `Utilisateur` de sorte à accepter la
connexion uniquement si le champ `nonce` est `NULL`.

1. Ajoutez une action `validate` au contrôleur `Utilisateur` qui récupère en `GET`
deux valeurs `login` et `nonce`. Si le login correspond à un utilisateur
présent dans la base et que le `nonce` passé en `GET` correspond au `nonce`
de la BDD, alors passez à `NULL` le champ `nonce` de la BDD.

1. Il ne reste plus qu'à initialiser ce nonce avec une chaîne de caractères
aléatoires à la création de l'utilisateur :

   * Copiez la fonction `generateRandomHex()` suivante dans `Security.php` qui
     permet de générer des chaînes de 32 caractères aléatoires

     ```php?start_inline=1
     function generateRandomHex() {
       // Generate a 32 digits hexadecimal number
       $numbytes = 16; // Because 32 digits hexadecimal = 16 bytes
       $bytes = openssl_random_pseudo_bytes($numbytes); 
       $hex   = bin2hex($bytes);
       return $hex;
     }
     ```

   <!--
   uniqid pas top car basé sur l'horloge donc prévisible
   http://php.net/manual/fr/function.uniqid.php](http://php.net/manual/fr/function.uniqid.php
   -->

   * Dans l'action `created` du contrôleur `Utilisateur`, générez un identifiant
   unique avec la fonction `generateRandomHex()`  que vous stockerez
   dans le champ `nonce` de la table `utilisateur`.


1. Il ne reste plus qu'à envoyer un mail à l'adresse à l'adresse renseignée
contenant avec un lien qui enverra le nonce au site :

   1. Rédigez le mail en HTML dans une variable `$mail`. Ce mail doit contenir
      un lien vers l'action `validate` avec le login et le nonce dans l'URL (au
      format *query string*).  
	  **Testez** bien l'adresse de votre lien avant de passer à la question suivante.

   1. Envoyez ce mail en utilisant
      [la fonction `mail()`](http://php.net/manual/en/function.mail.php) de PHP.
	  
	  **Attention :** La fonction `mail()` n'est disponible que sur le serveur
      `webinfo` Web de l'IUT. Si vous avez installé un serveur Web local sur
      votre machine avec LAMP/MAMP/WAMP, `mail()` n'est pas configuré par
      défaut.

      **Abuser de cette fonction serait considéré comme une violation de la
      charte d'utilisation des ressources informatiques de l'IUT et vous
      exposerait à des sanctions !**
      
      Pour éviter d'être blacklistés des serveurs de mail, nous allons envoyer
      uniquement des emails dans le domaine `yopmail.com`, dont le
      fonctionnement est le suivant : un mail envoyé à `bob@yopmail.com` est
      immédiatement lisible sur
      [http://bob.yopmail.com](http://bob.yopmail.com).

</div>

## Autres sécurisations

### Passage des formulaires en `post`

<!-- Prévoir formulaire en POST si site en production et en GET sinon ? -->

À l'heure actuelle, le mot de passe transite en clair dans l'URL. Vous
conviendrez facilement que ce n'est pas top. Nous allons donc passer nos
formulaires en méthode POST si le site est en production, ou en méthode GET si
le site est en développement (selon [la variable `Conf::getDebug()` du
TD2](tutorial2.html#gestion-des-erreurs)).

Il faudrait donc maintenant récupérer les variables à l'aide de `$_POST` ou
`$_GET`. Cependant, nos liens internes, tels que 'Détails' ou 'Mettre à jour'
fonctionnent en passant les variables dans l'URL comme un formulaire GET. Nous
avons donc besoin d'être capable de récupérer les variables automatiquement dans
`$_POST` ou le cas échéant dans `$_GET`.

<div class="exercise">

1. Créer dans le routeur une fonction `myGet($nomvar)` qui retournera
   `$_GET[$nomvar]` s'il est défini, ou `$_POST[$nomvar]` s'il est défini, ou
   sinon `NULL`.

1. Remplacer tous les `$_GET` de `routeur.php`, `ControllerUtilisateur.php`
et `ControllerTrajet.php` par des appels à `myGet`.  
Remplacer les tests du type `isset($_GET['login'])` par `!is_null(myGet('login'))`.

   **Aide :** Utiliser la fonction de remplacement `Ctrl+H` de NetBeans pour vous aider.

1. Passez le formulaire de `create.php` (ou `update.php`) en méthode POST si
   `Conf::getDebug()` est `false` ou en méthode GET sinon. Faites de même avec
   les autres formulaires que vous souhaitez changer.

</div>

### Sécurité avancée

Remarquez que les mots de passe envoyés en POST sont toujours visible car envoyé
en clair. Vous pouvez par exemple les voir dans l'onglet réseau des outils de
développement (raccourci `F12`) dans la section paramètres sous Firefox (ou Form
data sous Chrome).

Le fait de hacher les mots de passe (ou les numéros de carte de crédit) dans la
base de données évite qu'un accès en lecture à la base (suite à une faille de
sécurité) ne permette à l'attaquant de récupérer toutes les données de tous
les utilisateurs.

On pourrait aussi hacher le mot de passe côté client, et n'envoyer que le mot
de passe haché au serveur. Dans le cas d'une attaque de l'homme du milieu (où
quelqu'un écoute vos communications avec le serveur), l'attaquant n'obtiendra
que le mot de passe haché et pas le mot de passe en clair. Mais cela ne
l'empêchera pas de pouvoir s'authentifier puisque l'authentification repose sur
le mot passe haché qu'il a récupéré.

La seule façon fiable de sécuriser une application web est le recours au
chiffrement de l'ensemble des communications entre le client (browser) et le
serveur, via l'utilisation du protocole `TLS` sur `http`, à savoir
`https`. Cependant, la mise en place de cette infrastructure était jusqu'à présent
compliqué. Même si
[elle s'est simplifié considérablement récemment](https://letsencrypt.org/),
cela dépasse le cadre de notre cours.

### Notes techniques supplémentaires

Attaques :
* Toujours possible 
  essayer un couple login / mdp par l'interface de connexion
  Force brute ou attaque par dictionnaire
  Limiter le nombre d'échecs d'authentification avec un login : vérouiller le compte ou rajouter une temporisation (non implem dans ce TD) 

https://cdn2.hubspot.net/hubfs/3791228/NIST_Best_Practices_Guide_SpyCloudADG.pdf
Required : 
* Set an 8-character minimum
* Limit failed login attempts
* Ban “commonly-used, expected, or compromised” passwords
* Don’t use password hints or reminders
* Don’t use knowledge-based authentication
* Encrypt passwords during transmission


Primitives cryptographiques :
* fonction de hachage cryptographique
  N'importe quel acteur ne peut que vérifier
* MAC : 1 ou 2 acteurs avec une clé secrète
  Objectif ? authentification et intégrité
  vérifier intégrité
* Chiffrement : 1 ou 2 acteurs avec clé secrète 
  Objectif : confidentialité
  vérifier ? 

Q/ Bizarre : alors pourquoi fait-on un MAC pour poivrer ? Si c'est de la
confidentialité, il faudrait plutôt chiffrer non ?  
R/ Dans l'esprit, HMAC est similaire à password_hash pour lequel on aurait
spécifié le sel (le poivre ici). Utiliser plutôt `hash_pbkdf2`

Plus d'infos dans le cours de crypto 
R3.09 - Cryptographie et sécurité
R4.B.10 - Cryptographie et sécurité que parcours B

https://www.netsec.news/summary-of-the-nist-password-recommendations-for-2021/

NIST parle plutôt de "key derivation function" 

https://crypto.stackexchange.com/questions/76430/clarification-of-nist-digital-identify-guidelines-and-pepper-in-password-hashi

https://vnhacker.blogspot.com/2020/09/why-you-want-to-encrypt-password-hashes.html
hash-then-encrypt

TODO : Parler de  vol de mdp ou phpsessid ?

<!-- Preventing session hijacking -->

<!-- When SSL is not a possibility, you can further authenticate users by storing -->
<!-- their IP address along with their other details by adding a line such as the -->
<!-- following when you store their session: -->

<!-- $_SESSION['ip'] = $_SERVER['REMOTE_ADDR']; -->

<!-- Then, as an extra check, whenever any page loads and a session is available, -->
<!-- perform the following check. It calls the function different_user if the stored -->
<!-- IP address doesn’t match the current one: -->

<!-- if ($_SESSION['ip'] != $_SERVER['REMOTE_ADDR']) different_user(); -->

<!-- What code you place in your different_user function is up to you. I recommend -->
<!-- that you simply delete the current session and ask the user to log in again due -->
<!-- to a technical error. Don’t say any more than that, or you’re giving away -->
<!-- potentially useful information. -->
