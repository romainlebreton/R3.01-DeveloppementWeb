---
title: TD8 &ndash; Authentification & validation par email
subtitle: Sécurité des mots de passe
layout: tutorial
lang: fr
---

<!-- Parler des nouvelles fonctions de PHP pour les mots de passe ?
http://php.net/manual/fr/book.password.php -->

<!-- Màj le TD pour le fait d'être connecté pour valider le mail -->

Ce TD vient à la suite du [TD7 -- cookies &
sessions]({{site.baseurl}}/tutorials/tutorial7.html) et prendra donc comme
acquis l'utilisation des cookies et des sessions. Dans ce TD, nous allons :

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

À la réception du mot de passe, le serveur pourrait le chiffrer et stocker ce
chiffré dans la base de données.

**Problème** : L'administrateur du site pourrait toujours lire les mots de
passe. En effet, il peut lire la clé secrète sur le serveur et peut donc
déchiffrer les mots de passe.

#### Idée 2 : Hachage

Utilisons une fonction de hachage cryptographique, c'est-à-dire une fonction qui
vérifie notamment les propriétés suivantes (source :
[Wikipedia](https://fr.wikipedia.org/wiki/Fonction_de_hachage_cryptographique)):
* la valeur de hachage d'un message se calcule « facilement » ;
* il est extrêmement difficile, pour une valeur de hachage donnée, de construire un message
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


**Explication :** Ce site annonce qu'il stocke le haché de `15 183 605 161 ≃
10^10` mots de passe communs. Si votre mot de passe est l'un de ceux-là, sa
sécurité est compromise.  
Heureusement il existe beaucoup plus de mot de passe possible ! Par exemple,
rien qu'en utilisant des mots de passe de longueur 10 écrits à partir des 64
caractères `0,1,...,9,A,B,...,Z,a,...,z,+,/`, vous avez `(64)^10 = 2^60 ≃ 10^18`
possibilités.

#### Idée 3 : Saler et hacher

Comme une *rainbow table* est dépendante d'un algorithme de hachage, nous allons
hacher différemment chaque mot de passe. Pour ceci, nous allons concaténer une
chaîne aléatoire, appelée *sel*, au début de chaque mot de passe avant de le
hacher. 

Dans le scénario où deux utilisateurs ont un même mot de passe, l'utilisation
d'un sel aléatoire, donc différent, permet que leurs mots de passe salés/hachés
respectifs soient différents.

La base de données doit stocker un sel et un haché pour chaque mot de
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
être stocké dans la base de données. Ainsi, si la base de données est compromise,
l'attaquant n'apprend rien sur les mots de passe, car il ne connaît pas le
poivre. En effet, le poivre est nécessaire pour tester un mot de passe.

En pratique, nous stockerons un unique poivre par site, qui est choisi aléatoirement :

```php
$poivre = "M7UKGv9fkptxwbSmZvlr1U";
// Le client envoie son mot de passe en clair au serveur
$mdpClair = 'apple';
// Le serveur transforme le mot de passe à l'aide d'un secret appelé poivre
$mdpPoivre = hash_hmac("sha256", $mdpClair, $poivre);
// Le mot de passe poivré peut alors être salé/haché avant d'être enregistré en BDD
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

1. Nous allons modifier la structure de données *utilisateur* :
   1. Modifiez la table utilisateur en lui ajoutant une colonne `VARCHAR(256)
mdpHache` stockant son mot de passe.
   1. Mettez à jour la classe métier `Utilisateur` (dossier `src/Model/DataObject`) :
      1. ajoutez un attribut `private string $mdpHache`,
      1. mettez à jour le constructeur, 
      2. rajoutez un getter et un setter,
      3. mettez à jour la méthode `formatTableau` (qui fournit les données des
         requêtes SQL préparées).
   2. Mettez à jour la classe de persistance `UtilisateurRepository` :
      1. mettez à jour `construireDepuisTableau` (qui permet de construire un utilisateur à partir de la sortie d'une requête SQL),
      2. mettez à jour `getNomsColonnes`.

   *Note* : L'utilisation d'un framework PHP professionnel nous éviterait ces
   tâches répétitives.

</div>

Nous allons modifier la création d'un utilisateur.

<div class="exercise">

1. Modifier la vue `utilisateur/formulaireCreation.php` pour ajouter deux champs *password* au formulaire
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

1. Modifiez l'action `creerDepuisFormulaire` du contrôleur *utilisateur* :
   1. rajoutez la condition que les deux champs mot de passe doivent coïncider
      avant de sauvegarder l'utilisateur. En cas d'échec, appelez à l'action d'erreur `afficherErreur` avec un message *Mots de passe distincts*.

   2. Nous allons changer la manière de construire un objet métier
      *utilisateur* à partir des données `$_GET` du formulaire. Jusqu'à
      présent, nous appelions `Utilisateur::__construct()` ou de manière
      équivalente `UtilisateurRepository::construireDepuisTableau()`. Mais ces méthodes
      sont faites pour prendre en entrée un résultat SQL (sous forme de
      tableau). À cause du mot de passe qui est en clair dans le formulaire,
      mais haché dans la BDD, il faut changer le code.

      * Créez une méthode 
      ```php
      public function construireDepuisFormulaire (array $tableauFormulaire) : Utilisateur
      ```
      dans la classe `Utilisateur`. Elle appelle le constructeur de
      `Utilisateur` en hachant d'abord le mot de passe.
      * Mettez à jour l'action `creerDepuisFormulaire` pour appeler `construireDepuisFormulaire()`.

2. Rajoutons au menu de notre site un lien pour s'inscrire. Dans le menu de la
   vue générique `vueGenerale.php`, rajoutez une icône cliquable ![icône
   inscription](../assets/TD8/add-user.png)[^nbpicon] qui pointe vers l'action
   `creerDepuisFormulaire` (contrôleur utilisateur).

3. Testez l'inscription d'un utilisateur avec mot de passe.

</div>

[^nbpicon]: <a href="https://www.flaticon.com/" title="icones">Les icônes proviennent du site Flaticon</a>

Rajoutons des mots de passe dans la mise à jour d'un utilisateur.

<div class="exercise">

1. Modifier la vue `formulaireMiseAJour.php` pour ajouter trois champs *password* : l'ancien mot de passe, le nouveau qu'il faut écrire 2 fois pour ne pas se tromper.
2. Modifiez l'action `mettreAJour` :
   * vérifiez que les 2 nouveaux mots de passe coïncident. En cas d'échec,
     appelez à l'action d'erreur `afficherErreur` avec un message *Mots de
     passe distincts*.
   * Vérifiez que l'ancien mot de passe est correct. En cas d'échec, appelez à
     l'action d'erreur `afficherErreur` avec un message *Ancien mot de passe
     erroné*.
   * Le cas échéant, mettez à jour votre utilisateur en appelant les *setter*.
     N'oubliez pas de hacher le mot de passe. Enfin, effectuez la mise à jour
      dans la base de données.
3. Testez la mise à jour du mot de passe d'un utilisateur.
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

       public static function connecter(string $loginUtilisateur): void
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
   * La connexion enregistre le login d'un utilisateur en session dans le champ
    `$cleConnexion`.
   * Le client est connecté si et seulement si la session contient un enregistrement associé à la clé `$cleConnexion`.
   * La déconnexion consiste à supprimer cet enregistrement de la session.  
   * `getLoginUtilisateurConnecte()` renvoie `null` si le client n'est pas connecté.
   
1. Rajoutons au menu de notre site un lien pour se connecter. Dans le menu de la
   vue générique `vueGenerale.php`, rajoutez une icône cliquable
   ![connexion]({{site.baseurl}}/assets/TD8/enter.png) qui pointe vers la future
   action `afficherFormulaireConnexion` (contrôleur *utilisateur*).  
   Ce lien, ainsi que le lien d'inscription ![icône
   inscription](../assets/TD8/add-user.png), ne doivent s'afficher que si aucun
   utilisateur n'est connecté (utiliser une méthode de la classe
   `ConnexionUtilisateur`). 
   
   *Note* : Il est autorisé de mettre un `if` dans la vue `vueGenerale.php`.

1. Créons une vue pour afficher un formulaire de connexion :

   1. Créer une vue `utilisateur/formulaireConnexion.php` qui comprend un formulaire avec
   deux champs, l'un pour le login, l'autre pour le mot de passe. Ce formulaire
   appelle la future action `connecter` du contrôleur *utilisateur*.
   1. Ajouter une action `afficherFormulaireConnexion` qui affiche ce formulaire.


1. Créons enfin l'action `connecter()` du contrôleur *utilisateur* :
   1. Commençons par les vérifications à faire avant de se connecter. La
      première vérification est qu'un login et un mot de passe sont transmis dans le
      *query string*. Sinon, appelez `afficherErreur` avec le message *Login et/ou mot de passe manquant*.
   2. Puis, il faut récupérer l'utilisateur ayant le login transmis. Ceci
      permettra de vérifier que ce login existe bien et que le mot de passe est
      transmis correct (utiliser une méthode de la classe `MotDePasse`). Sinon,
      appelez `afficherErreur` avec le message *Login inconnu*.
   3. Enfin, vous pouvez connecter l'utilisateur (utiliser une méthode de la
      classe `ConnexionUtilisateur`). 
      <!-- ICI TODO Afficher la vue utilisateurConnecte ! -->
      Affichez une nouvelle vue `utilisateur\utilisateurConnecte.php` qui écrit
      un message *Utilisateur connecté* puis appelle la vue `liste.php` pour
      lister les utilisateurs. Cette vue est similaire à `utilisateurCree.php`.

</div>

Codons maintenant la déconnexion.

<div class="exercise">

1. Quand un utilisateur est connecté, ajoutez au menu de la vue générique
   `vueGenerale.php` deux cases : 
   * la première contient une icône cliquable
     ![user]({{site.baseurl}}/assets/TD8/user.png) qui renvoie vers la vue de
     détail de l'utilisateur connecté.
   * puis une deuxième case avec une icône cliquable
   ![deconnexion]({{site.baseurl}}/assets/TD8/logout.png) qui pointe vers la
   future action `deconnecter` (contrôleur *utilisateur*). 

2. Ajouter une action `deconnecter` qui déconnecte l'utilisateur (utiliser une
   méthode de la classe `ConnexionUtilisateur`). Affichez une nouvelle vue
   `utilisateur\utilisateurDeconnecte.php` similaire à
   `utilisateurConnecte.php`, mais avec le message *Utilisateur déconnecté*.

   *Note :* Toutes les vues `utilisateurConnecte.php`,
   `utilisateurDeconnecte.php`, `utilisateurCree.php`, `utilisateurMisAJour.php`
   et `utilisateurSupprime.php` sont bien sûr redondantes. Nous résoudrons ce problème lors du TD9 sur les messages Flash.

</div>

### Sécurisation d'une page à accès réservé

On souhaite restreindre les actions de mise à jour et de suppression à
l'utilisateur actuellement authentifié. Commençons par limiter les liens.

<div class="exercise">

1. Assurez-vous que la vue `utilisateur/liste.php` n'affiche que les liens vers
   la vue de détail, pas les liens de modification ou de suppression.

1. Modifier la vue de détail pour qu'elle n'affiche les liens vers la mise à
jour ou la suppression que si le login de l'utilisateur concorde avec celui
stocké en session.

   Pour vous aider dans cette tâche, rajoutez la méthode suivante à
   `ConnexionUtilisateur`
   ```php
   public static function estUtilisateur($login): bool
   ```
   qui doit vérifier si un utilisateur est connecté et que son login correspond à celui passé en argument de la fonction. 

</div>

**Attention :** Supprimer le lien n'est pas suffisant car un petit malin
pourrait accéder au formulaire de mise à jour d'un utilisateur quelconque en
rentrant manuellement l'action `afficherFormulaireMiseAJour` dans l'URL.

<div class="exercise">

1. « Hacker » votre site en accédant à la page de mise à jour d'un utilisateur
   quelconque.

2. Modifier l'action `afficherFormulaireMiseAJour` du contrôleur `Utilisateur`
   de sorte que l'accès au formulaire soit restreint à l'utilisateur connecté.
   En cas de problème, utiliser `afficherErreur` pour afficher un message *La
   mise à jour n'est possible que pour l'utilisateur connecté*.

   *Note* : Votre action `afficherFormulaireMiseAJour` doit aussi vérifier que le login donné existe
   bien ; sinon utiliser `afficherErreur` pour afficher un message *Login inconnu*.

</div>

**Attention :** Restreindre l'accès au formulaire de mise à jour n'est pas suffisant
car un petit malin pourrait exécuter une mise à jour en demandant manuellement
l'action `mettreAJour`.

<div class="exercise">

1. « Hacker » votre site en effectuant une mise à jour d'un utilisateur
   quelconque sans changer de code PHP[^nbp].  
   **Note :** Ce « hack » sera bien plus simple à réaliser si le formulaire de
   mise à jour est en méthode `GET`, et pareil pour sa page de
   traitement. Passez temporairement votre formulaire en cette méthode si
   nécessaire.

2. Mettez à jour l'action `mettreAJour` du contrôleur `Utilisateur` pour qu'il
   effectue toutes les vérifications suivantes, avec "redirection flash" en cas
   de problème :
   * vérifiez que tous les champs obligatoires du formulaire ont été transmis.
   * Vérifiez que le login existe ;
   * Vérifiez que les 2 nouveaux mots de passe coïncident ;
   * Vérifiez que l'ancien mot de passe est correct ;
   * Vérifiez que l'utilisateur mis-à-jour correspond à l'utilisateur connecté. 

3. Sécurisez de manière similaire l'accès à l'action `delete` d'un utilisateur. 

</div>

[^nbp]: Mais vous pouvez changer le code HTML avec les outils de développement
    car cette manipulation se fait du côté client.


**Note générale importante :** Les seules pages qu'il est vital de sécuriser
sont celles dont le script effectue vraiment l'action de mise à jour ou de
suppression, *c.-à-d.* les actions `mettreAJour` et `delete`. Les autres sécurisations
sont surtout pour améliorer l'ergonomie du site.  
De manière générale, il ne faut **jamais faire confiance au client** ; seule une
vérification côté serveur est sûre.

### Super administrateur

Jusqu'au début de ce TD, le site était codé comme si tout le monde avait le rôle
d'administrateur. Maintenant, nous allons différencier ceux qui ont ce rôle des
autres utilisateurs. Nous souhaitons donc pouvoir avoir des comptes
administrateur sur notre site.

Commençons par rajouter un attribut `estAdmin` à notre classe métier
`Utilisateur` et à son stockage `UtilisateurRepository`.

<div class="exercise">

1. Ajouter un champ `estAdmin` de type `BOOLEAN` (ou `TINYINT(1)`) à la table
   `utilisateur`.

1. Mettez à jour la classe métier `Utilisateur` (dossier `src/Model/DataObject`) :
   1. ajoutez un attribut `private bool $estAdmin`,
   1. mettez à jour le constructeur, 
   1. rajoutez un getter et un setter,
   1. mettez à jour la méthode `formatTableau` (qui fournit les données des
      requêtes SQL préparées).

      **Attention** : SQL stocke différemment les booléens que PHP. En SQL, on
      encode `false` avec l'entier `0` et `true` avec l'entier `1`. Il faut donc
      que votre méthode `formatTableau` renvoie `0` ou `1` pour le champ
      `estAdminTag`.
   1. Nous mettrons à jour `construireDepuisFormulaire` plus tard.

1. Mettez à jour la classe de persistance `UtilisateurRepository` :
   1. mettez à jour `construireDepuisTableau` (qui permet de construire un utilisateur à partir de la sortie d'une requête SQL),
   1. mettez à jour `getNomsColonnes`.

</div>

Mettons à jour la classe utilitaire `ConnexionUtilisateur`.

<div class="exercise">

1. Rajoutez la méthode suivante à `ConnexionUtilisateur`
   ```php
   public static function estAdministrateur() : bool
   ```

   Cette méthode doit renvoyer `true` si un utilisateur est connecté et qu'il
   est administrateur. Les informations sur l'utilisateur devront être
   récupérées de la base de données.

   *Remarque optionnelle :* On aurait pu coder un système qui récupère une seule
   fois les données de l'utilisateur connecté à partir de la base de données, et le stocke dans un attribut statique de la classe `ConnexionUtilisateur`.

</div>

Modifions le processus de création d'un utilisateur pour intégrer cette nouvelle
donnée.

<div class="exercise">

1. Rajoutez un bouton `checkbox` au formulaire de création 
   ```html
   <p class="InputAddOn">
         <label class="InputAddOn-item" for="estAdmin_id">Administrateur</label>
         <input class="InputAddOn-field" type="checkbox" placeholder="" name="estAdmin" id="estAdmin_id">
   </p>
   ```

1. Pour que l'action `creerDepuisFormulaire` arrive à construire un utilisateur et à le
   sauvegarder en base de données, il ne manque que la mise à jour de la méthode
   `construireDepuisFormulaire`. Si la case est cochée, alors `estAdmin=on`
   sera transmis. Si la case n'est pas cochée, aucune donnée liée au `checkbox`
   n'est rajoutée.

   **Mettez à jour** la méthode `construireDepuisFormulaire` avec ces
   explications. Vérifiez dans PHPMyAdmin que vous arrivez à créer des
   utilisateurs administrateurs ou non.

</div>

Passons au processus de mise-à-jour.

<div class="exercise">

1. Rajoutez un bouton `checkbox` au formulaire de mise-à-jour. Faites en sorte
   que le bouton soit pré-coché ([attribut
   `checked`](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input/checkbox#attr-checked))
   si l'utilisateur est déjà administrateur (utilisez
   `ConnexionUtilisateur::estAdministrateur()`).

2. Dans l'action `mettreAJour`, rajoutez un appel au setter `setEstAdmin`. Vérifiez
   que la mise à jour fonctionne.

</div>

Nous allons modifier la sécurité de notre site pour qu'un *administrateur* ait
tous les droits.

<div class="exercise">

1. Processus de création :
   1. Le champ *Administrateur ?* du formulaire de création ne doit apparaître
   que si l'utilisateur connecté est administrateur.

      *Note* : Vous pouvez mettre un `if` dans la vue.

   1. Plus important, l'action `creerDepuisFormulaire` ne doit créer des administrateurs que si
      l'utilisateur connecté est administrateur.

      *Aide* : si l'utilisateur connecté n'est pas administrateur, forcez
      l'utilisateur créé à ne pas être administrateur, indépendamment de la
      valeur reçue par le formulaire.


1. Processus de mise-à-jour :
   1. Les liens de mise-à-jour d'un utilisateur doivent apparaître quand un
      administrateur est connecté.
   1. Le champ *Administrateur ?* du formulaire de mise-à-jour ne doit
   apparaître que si l'utilisateur connecté est administrateur.
   1. Plus important, l'action `mettreAJour` ne doit modifier le statut
      *administrateur* que si l'utilisateur connecté est administrateur. De
      plus, un administrateur doit pouvoir modifier n'importe quel utilisateur.

</div>

Il est courant qu'un site Web sépare ses interfaces administrateur et
utilisateur. Vous avez tous les outils pour le mettre en place si vous le
souhaitez. Le défi est de limiter la duplication du code entre les 2 interfaces. 

## Enregistrement avec une adresse email valide

Dans beaucoup de sites Web, il est important de savoir si un utilisateur est
bien réel. Pour ce faire on peut utiliser une vérification de son numéro de
portable, de sa carte bancaire, ou de la validation d'un captcha. Nous allons
ici nous baser sur la vérification de l'adresse email.

De plus, cela nous permet d'éviter des fautes de frappe dans l'email. Aussi, en
ayant associé de manière sûre un email à un utilisateur, nous pourrions nous en
servir pour une authentification à deux facteurs, ou pour renvoyer un mot de
passe oublié...

### Le nonce : un secret pour valider une adresse mail

Expliquons brièvement le mécanisme de validation par adresse email que nous
allons mettre en place. À la création d'un utilisateur, nous lui associons une
chaîne secrète de caractères aléatoires appelée [nonce
cryptographique](https://fr.wiktionary.org/wiki/nonce). Nous envoyons ce nonce
par email à l'adresse indiqué. La connaissance de ce nonce sert de preuve que
l'adresse email existe et que l'utilisateur y a accès. Il suffit alors à
l'utilisateur de renvoyer le nonce au site pour que ce dernier valide l'adresse
email (en mettant la valeur du nonce à la chaîne de caractère vide `""` dans
notre cas).

Commençons par mettre à jour notre classe métier `Utilisateur`. Nous allons
rajouter des données `nonce` et `email`. Cependant, en cas de changement
d'adresse mail, nous souhaitons garder l'ancienne adresse mail en mémoire tant
que la nouvelle n'a pas été validée. Nous aurons donc une donnée `emailAValider`
en plus.

<div class="exercise">

1. Ajouter trois champs à la table `utilisateur` : 
   * `email` de type `VARCHAR(256)`,
   * `emailAValider` de type `VARCHAR(256)`,
   * `nonce` de type `VARCHAR(32)`,

1. Mettez à jour la classe métier `Utilisateur` (dossier `src/Model/DataObject`) :
   1. ajoutez les attributs,
   1. mettez à jour le constructeur, les getter et les setter,
   1. mettez à jour la méthode `formatTableau` (qui fournit les données des
      requêtes SQL préparées),
   1. vous mettrez à jour la méthode `construireDepuisFormulaire` plus tard.

1. Mettez à jour la classe de persistance `UtilisateurRepository` :
   1. mettez à jour `construireDepuisTableau` (qui permet de construire un utilisateur à partir de la sortie d'une requête SQL),
   1. mettez à jour `getNomsColonnes`.

</div>

Créons maintenant une classe utilitaire `src/Lib/VerificationEmail.php`.

<div class="exercise">

1. Créez la classe avec le code suivant, que nous complèterons plus tard

   ```php
   namespace App\Covoiturage\Lib;

   use App\Covoiturage\Config\Conf;
   use App\Covoiturage\Model\DataObject\Utilisateur;

   class VerificationEmail
   {
      public static function envoiEmailValidation(Utilisateur $utilisateur): void
      {
         $loginURL = rawurlencode($utilisateur->getLogin());
         $nonceURL = rawurlencode($utilisateur->getNonce());
         $absoluteURL = Conf::getAbsoluteURL();
         $lienValidationEmail = "$absoluteURL?action=validerEmail&controller=utilisateur&login=$loginURL&nonce=$nonceURL";
         $corpsEmail = "<a href=\"$lienValidationEmail\">Validation</a>";

         // Temporairement avant d'envoyer un vrai mail
         MessageFlash::ajouter("success", $corpsEmail);
      }

      public static function traiterEmailValidation($login, $nonce): bool
      {
         // À compléter
         return true;
      }

      public static function aValideEmail(Utilisateur $utilisateur) : bool
      {
         // À compléter
         return true;
      }
   }
   ```

   **Rajoutez** une méthode `Conf::getAbsoluteURL` qui renvoie la base de l'URL
   de votre site, par exemple 
   ```text
   http://webinfo.iutmontp.univ-montp2.fr/~mon_login/TD-PHP/TD8/web/frontController.php
   ```

1. Dans votre formulaire de création d'un utilisateur, rajoutez un champ pour
   l'adresse email
   ```php
   <p class="InputAddOn">
         <label class="InputAddOn-item" for="email_id">Email&#42;</label>
         <input class="InputAddOn-field" type="email" value="" placeholder="toto@yopmail.com" name="email" id="email_id" required>
   </p>
   ```

1. Pour faire fonctionner l'action `creerDepuisFormulaire` :
   * il faut que l'utilisateur créé avec `construireDepuisFormulaire` soit
   correct :   
   Mettez à jour la méthode `construireDepuisFormulaire` pour
   qu'elle donne la valeur `""` à l'email, qu'elle stocke l'adresse mail du
   formulaire dans `emailAValider`, et qu'elle crée un nonce aléatoire à
   l'aide de `MotDePasse::genererChaineAleatoire()`.
   * il faut envoyer l'email de validation (qui est un message flash pour
   l'instant): appelez la fonction `VerificationEmail::envoiEmailValidation`.

1. Faisons en sorte que le lien envoyé par mail valide bien l'adresse mail. 
   * Ajoutez une action `validerEmail` au contrôleur `Utilisateur` qui récupère
   en `GET` deux valeurs `login` et `nonce` (si elle existe sinon message flash
   d'erreur) et appelle `VerificationEmail::traiterEmailValidation()` avec ces
   valeurs.  
   En cas de succès, "redirection flash" vers la page de détail de cet
   utilisateur. En cas d'échec, "redirection flash" vers `afficherListe`.
   * Codez `traiterEmailValidation()` :    
   Si le login correspond à un utilisateur présent dans la base et que le
   `nonce` passé en `GET` correspond au `nonce` de la BDD, alors coupez/collez
   l'email à valider dans l'email et passez à `""` le champ `nonce` de la BDD.

1. Testez que la validation de l'email marche bien après la création d'un
   utilisateur. Pour ceci, regarder dans la BDD que les données évoluent bien à
   chaque étape. 

1. Modifiez la fonction `VerificationEmail::envoiEmailValidation` pour qu'elle
envoie un mail à l'adresse renseignée contenant avec un lien qui
enverra le nonce au site.

   Envoyez ce mail en utilisant [la fonction
   `mail()`](http://php.net/manual/en/function.mail.php) de PHP.
   

   **Attention : Abuser de cette fonction serait considéré comme une violation
   de la charte d'utilisation des ressources informatiques de l'IUT et vous
   exposerait à des sanctions !**
   
   Pour éviter d'être blacklistés des serveurs de mail, nous allons envoyer
   uniquement des emails dans le domaine `yopmail.com`, dont le fonctionnement
   est le suivant : un mail envoyé à `bob@yopmail.com` est immédiatement lisible
   sur [http://bob.yopmail.com](http://bob.yopmail.com).

   *Note* : La fonction `mail()` n'est disponible que sur le serveur `webinfo`
   Web de l'IUT. Si vous avez installé un serveur Web local sur votre machine
   avec MAMP/XAMP, `mail()` n'est pas configuré par défaut. XAMP sur Linux
   permet d'activer l'envoie, *cf.* [leur
   FAQ](https://www.apachefriends.org/faq_linux.html).  
   La bonne solution
   multiplateforme nécessite d'installer une [bibliothèque
   PHP](https://packagist.org/packages/symfony/mailer), ce que nous apprendrons
   à faire au semestre 4. Autrement, vous pouvez rester avec des messages flash. 
</div>

Nous allons maintenant pouvoir nous servir de la validation de l'email ailleurs
dans le site.


<div class="exercise">

1. Modifiez l'action `connecter` du contrôleur `Utilisateur` de sorte à accepter
la connexion uniquement si l'utilisateur a validé un email. 
   * Pour ceci, appelez la méthode `VerificationEmail::aValideEmail()`.
   * Codez cette méthode pour qu'elle regarde si l'utilisateur a un email
     différent de `""`.

1. Dans l'action `creerDepuisFormulaire` du contrôleur `Utilisateur`, vérifiez que l'adresse
   email envoyée par l'utilisateur en est bien une. Pour cela, vous pouvez par
   exemple utiliser la fonction
   [`filter_var()`](http://php.net/manual/en/function.filter-var.php) avec le
   filtre
   [`FILTER_VALIDATE_EMAIL`](http://www.php.net/manual/en/filter.filters.validate.php).


1. Mise à jour d'un utilisateur : 
   * rajoutez un champ *Email* prérempli,
   * dans l'action `mettreAJour`, vérifiez le format de l'email puis écrivez-le dans
     le champ `emailAValider`. Créez aussi un nonce aléatoire et envoyez le mail de validation.

</div>

<!--
Si l'utilisateur fait une faute de frappe dans l'email, le nonce sera envoyé à
la mauvaise adresse et donc il ne faut pas qu'un autre utilisateur puisse
valider le mail avec le nonce. En pratique, nous demanderons donc à
l'utilisateur d'être connecté pour pouvoir valider une adresse email grâce au
nonce.

Donc il faut un champ email_validated dans la session qui fait que quand on est
connecté sans avoir validé, alors on ne peut que valider son email.
-->

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

1. La variable globale `$_REQUEST` est similaire à `$_GET` et `$_POST`, à ceci
   près qu'elle est la fusion de ces tableaux. En cas de conflit, les valeurs de
   `$_POST` écrasent celles de `$_GET`.

   Remplacez tous les `$_GET` par des appels à `$_REQUEST`.

   **Aide :** Utiliser la fonction de remplacement globale (sur tous les
   fichiers du dossier `TD8`) pour vous aider.

1. Passez les formulaires `formulaireCreation.php`, `formulaireMiseAJour.php`, `formulaireConnexion.php`
   et `formulairePreference.php` en méthode POST si `Conf::getDebug()` est
   `false` ou en méthode GET sinon.

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

Malgré nos protections, il est toujours possible pour un attaquant d'essayer des
couples login / mot de passe en passant par notre interface de connexion. Un
site professionnel devrait donc implémenter une limite au nombre d'échecs
d'authentification consécutifs lié à chaque login. En cas de trop nombreux
échecs, le site pourrait verrouiller le compte (déverrouillage avec l'adresse
mail validée), ou rajouter une temporisation.

Listons d'autres protections de l'authentification des mots de passe
indispensable dans un site professionnel : 
* minimum de 8 caractères,
* interdire les mots de passe communs, attendus ou compromis,
* ne pas utiliser de question de rappel (nom de votre chien, ...)
* utilisation d'un *token* dans le formulaire de connexion pour vérifier que
  l'utilisateur s'est bien connecté à l'aide de ce formulaire. Le but est
  d'éviter le *phishing* qui vous invite à vous connecter sur une autre
  interface dans le but de voler vos identifiants ([attaque
  CSRF](https://fr.wikipedia.org/wiki/Cross-site_request_forgery)).

Source :
* [Recommandations du NIST](https://cdn2.hubspot.net/hubfs/3791228/NIST_Best_Practices_Guide_SpyCloudADG.pdf)
* [Recommandations OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

<!-- https://cdn2.hubspot.net/hubfs/3791228/NIST_Best_Practices_Guide_SpyCloudADG.pdf


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

TODO : Parler de  vol de mdp ou phpsessid ? -->




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
