---
title: TD8 &ndash; Authentification & validation par email
subtitle: Sécurité des mots de passe
layout: tutorial
lang: fr
---

<!-- Pour 27-28 : Mailpit déjà disponible sous Docker donc changer les instructions  -->

<!-- Parler des nouvelles fonctions de PHP pour les mots de passe ?
http://php.net/manual/fr/book.password.php -->

<!-- Màj le TD pour le fait d'être connecté pour valider le mail -->

Ce TD vient à la suite du [TD7 -- cookies &
sessions]({{site.baseurl}}/tutorials/tutorial7.html) et prendra donc comme
acquis l'utilisation des cookies et des sessions. Dans ce TD, nous allons :

1. mettre en place l'authentification par mot de passe des utilisateurs du site ;
2. mettre en place une validation par email de l'inscription des utilisateurs ;
3. verrouiller l'accès à certaines pages ou actions à certains utilisateurs. Par
   exemple, un utilisateur ne peut modifier que ses données. Ou encore,
   l'administrateur a tous les droits sur les utilisateurs.

## Authentification par mot de passe

### Stockage sécurisé de mot de passe

Nous allons stocker le mot de passe d'un utilisateur dans la base de données.
Cependant, on ne stocke jamais le mot de passe en clair (de manière directement
lisible) pour plusieurs raisons :

1. l'utilisateur souhaite que personne ne connaisse son mot de passe, y compris
   l'administrateur du site Web. C'est une recommandation de la CNIL (Commission
   nationale de l'informatique et des libertés) qui veille à la protection des
   données personnelles.
2. un attaquant qui arriverait à se connecter à la base de données apprendrait
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
  ayant cette valeur (résistance à la préimage).

Ainsi, si un site Web stocke les mots de passe hachés dans sa base de données,
l'administrateur du site ne pourra pas lire ces mots de passe.

```php
$mdpClair = 'apple';
echo hash('sha256', $mdpClair); // SHA-256 est un algorithme de hachage
// Affiche '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b'
```
(*Une manière simple d'exécuter ce code est d'ouvrir un interpréteur PHP
interactif en exécutant `php -a` dans le terminal de votre conteneur Docker. Il suffit alors de
couper/coller le code PHP dans l'interpréteur. Dans Docker Desktop, ouvrez l'onglet **Containers**, sélectionnez le conteneur `web-1`, puis **Exec** pour ouvrir un terminal ; commencez par exécuter `bash` pour retrouver votre shell classique.*)

Cependant, le site peut quand même vérifier un mot de passe
```php
$mdpClair = 'apple';
$mdpHache = '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b';
var_dump($mdpHache === hash('sha256', $mdpClair));
// Renvoie true
``` 

**Problèmes** :
* L'administrateur du site peut facilement voir si deux utilisateurs ont le
  même mot de passe.
* [*Rainbow table*](https://fr.wikipedia.org/wiki/Rainbow_table) : En gros,
  c’est une structure de données qui permet de retrouver des mots de passe avec
  un bon compromis stockage/temps. Cette technique est surtout utile pour
  essayer d'attaquer de nombreux mots de passe à la fois, par exemple tous
  ceux des utilisateurs d'un site Web.
* Si le mot de passe est trop commun (par exemple, un mot du dictionnaire), il
  est très facile de le retrouver à l'aide d'un site dédié (prochain exercice).

<div class="exercise">

   Créez à partir du code précédent le haché `SHA-256` d'un mot du dictionnaire
   français (placez par exemple le code dans un fichier PHP temporaire et accédez-y 
   via le navigateur). 
   Utilisez un site comme [dcode](https://www.dcode.fr/sha256-hash)
   pour retrouver le mot de passe originel à partir de son haché.
   <!-- http://reverse-hash-lookup.online-domain-tools.com/ -->

</div>


**Explication :** Ce site stocke les hachés de mots de passe communs. 
Si votre mot de passe est l'un de ceux-là, sa sécurité est compromise.  
Heureusement, il existe beaucoup plus de mots de passe possibles ! Par exemple,
rien qu'en utilisant des mots de passe de longueur 10 écrits à partir des 64
caractères `0,1,...,9,A,B,...,Z,a,...,z,+,/`, vous avez `(64)^10 = 2^60 ≃ 10^18`
possibilités.

#### Idée 3 : Saler et hacher

Comme une *rainbow table* est précalculée pour une fonction de hachage donnée,
nous allons hacher différemment chaque mot de passe. Pour ceci, nous allons concaténer une
chaîne aléatoire, appelée *sel*, au début de chaque mot de passe avant de le
hacher. 

Dans le scénario où deux utilisateurs ont un même mot de passe, l'utilisation
d'un sel aléatoire, donc différent, permet que leurs mots de passe salés/hachés
respectifs soient différents.

La base de données doit stocker un sel et un haché pour chaque mot de
passe. En effet, la connaissance du sel est nécessaire pour tester un mot de
passe.

Nous allons utiliser l'implémentation en PHP de la fonction de hachage
`bcrypt` qui a la particularité d'intégrer automatiquement un sel aléatoire.
Ainsi, nous n'aurons besoin d'ajouter qu'un seul champ à notre BDD qui
contiendra à la fois le sel et le haché.

```php
$mdpClair = 'apple';
// PASSWORD_DEFAULT est une constante PHP qui permet de spécifier l'algorithme
// utilisé par défaut dans le hachage : actuellement c'est l'algorithme bcrypt
var_dump(password_hash($mdpClair, PASSWORD_DEFAULT));
// Le hachage d'un même mot de passe donne des résultats différents
var_dump(password_hash($mdpClair, PASSWORD_DEFAULT));
```

Le code précédent affiche par exemple :
```
$2y$12$VZxpwQN8.vVc5UkJy.dBh.n2yRC4Uh9dqrHxvyC.SlSlyDaZKPzQW
```

La sortie contient plusieurs informations (source :
[Wikipedia](https://en.wikipedia.org/wiki/Bcrypt#Description)):
* `2y` : 
  * `2` correspond à l'algorithme de hachage, ici `bcrypt`,
  * `y` correspond à la version de l'algorithme
* `12` : coût de l'algorithme. Augmenter le coût de 1 double le temps de calcul
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

L'utilisation d'un sel résout le problème "*L’administrateur peut voir si deux
utilisateurs ont le même mot de passe*". En effet, les hachés de deux
utilisateurs ayant le même mot de passe sont différents parce qu'ils utilisent
des sels différents (car tirés au hasard). 

**Problème** :
* Si un attaquant arrive à lire la base de données (en utilisant une injection
  SQL par exemple), il peut toujours effectuer les attaques suivantes sur les
  mots de passe hachés :
  * attaque par force brute : L'attaquant essaye tous les mots de passe
    possibles en commençant par ceux de petite taille.
  * attaque par dictionnaire : L'attaquant essaye les mots de passe les plus
    courants, par exemple les mots du dictionnaire, ou en trouvant une liste des
    mots de passe les plus communs.

#### Idée 4 : Poivrer, saler et hacher

L'idée finale est de rajouter une autre chaîne aléatoire, appelée *poivre*, dans
le hachage du mot de passe. La particularité du poivre est qu'il ne doit pas
être stocké dans la base de données. Ainsi, si la base de données est compromise (par
exemple par une injection SQL) sans que le serveur ne le soit, l'attaquant ne
peut pas tester de mots de passe, car il ne connaît pas le
poivre. En effet, le poivre est nécessaire pour tester un mot de passe.

En pratique, nous stockerons un unique poivre par site, qui est choisi aléatoirement :

```php
$poivre = "M7UKGv9fkptxwbSmZvlr1U";
// Le client envoie son mot de passe en clair au serveur
$mdpClair = 'apple';
// Le serveur hache le mot de passe une première fois puis le transforme à l'aide d'un secret appelé poivre
$mdpPoivre = hash_hmac("sha256", $mdpClair, $poivre);
// Le mot de passe poivré peut alors être salé/haché avec l'algorithme BCRYPT avant d'être enregistré en BDD
$mdpHache = password_hash($mdpPoivre, PASSWORD_DEFAULT);
var_dump($mdpHache);
```

*Explication* : Dans l'esprit, la fonction `hash_hmac` permet d'appliquer un
salage/hachage en spécifiant le *sel*. Nous l'utiliserons en spécifiant le *sel*
`$poivre`. En effet, le poivre joue le même rôle qu'un sel, sauf qu'il n'est pas
stocké en BD et qu'il est unique au site (il ne change pas à chaque hachage de
mot de passe). 

### Mise en place de la BDD et des formulaires

On vous donne la classe `MotDePasse` qui reprend les explications précédentes.
Prenez le temps de bien comprendre les deux fonctions `hacher` et `verifier`.

Notez que la méthode `getPoivre()` lit le poivre une fois dans le fichier `ConfigurationBaseDeDonnees.ini` et le stocke dans l'attribut statique `$poivre`.

```php
namespace App\Covoiturage\Lib;

class MotDePasse
{
    private static ?string $poivre = null;

    public static function getPoivre(): string
    {
        if (is_null(MotDePasse::$poivre)) {
            $configurationSite = parse_ini_file(
                __DIR__ . '/../Configuration/ConfigurationBaseDeDonnees.ini',
                false,
                INI_SCANNER_RAW
            );
            MotDePasse::$poivre = $configurationSite["poivre"] ?? "";
        }
        return MotDePasse::$poivre;
    }

    public static function hacher(string $mdpClair): string
    {
        $mdpPoivre = hash_hmac("sha256", $mdpClair, MotDePasse::getPoivre());
        $mdpHache = password_hash($mdpPoivre, PASSWORD_DEFAULT);
        return $mdpHache;
    }

    public static function verifier(string $mdpClair, string $mdpHache): bool
    {
        $mdpPoivre = hash_hmac("sha256", $mdpClair, MotDePasse::getPoivre());
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

1. Copiez/collez dans un nouveau dossier `TD8` tous les fichiers du dossier `TD7`.  
   **Attention :** vérifiez que les fichiers cachés `.htaccess` ont bien
   été copiés. Ce sont eux qui empêchent de télécharger les données sensibles comme
   `ConfigurationBaseDeDonnees.ini`, qui contiendra bientôt
   votre poivre.

2. Copiez le code de la classe présentée au-dessus dans le fichier `src/Lib/MotDePasse.php`.

3. Ouvrez un terminal dans votre conteneur Docker : dans Docker Desktop, ouvrez
   votre conteneur, puis cliquez sur l'onglet `Exec`. Dans le terminal qui
   apparaît, tapez `bash` pour retrouver votre shell habituel. Via ce terminal,
   rendez-vous dans le dossier `tds-php/TD8/src/Lib`. 

4. Décommentez la dernière ligne du fichier `MotDePasse.php`, puis, dans le terminal (sous
   Docker), exécutez ce fichier : 

   ```bash
   php MotDePasse.php
   ``` 
   
   Puis copiez le résultat dans le fichier `ConfigurationBaseDeDonnees.ini` en n'oubliant pas les guillemets autour du poivre. Recommentez la dernière ligne.

5. Nous allons modifier la structure de données *utilisateur* :
   1. Modifiez la table utilisateur en lui ajoutant une colonne `VARCHAR mdpHache (taille 256)` non `null` stockant son mot de passe.
   2. Mettez à jour la classe métier `Utilisateur` (dossier `src/Modele/DataObject`) :
      1. ajoutez un attribut `private string $mdpHache`,
      2. mettez à jour le constructeur, 
      3. rajoutez un getter et un setter.
   3. Mettez à jour la classe de persistance `UtilisateurRepository` :
      1. mettez à jour `getNomsColonnes`,
      2. mettez à jour `construireDepuisTableauSQL` (qui permet de construire un utilisateur à partir de la sortie d'une requête SQL),
      3. mettez à jour la méthode `formatTableauSQL` (qui fournit les données des
         requêtes SQL préparées).

   *Note* : L'utilisation d'un framework PHP professionnel nous éviterait ces
   tâches répétitives.

</div>

Nous allons modifier la création d'un utilisateur.

<div class="exercise">

1. Modifiez la vue `utilisateur/formulaireCreation.php` pour ajouter deux champs *password* au formulaire
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

2. Modifiez l'action `creerDepuisFormulaire` du *utilisateur* :
   1. rajoutez la condition que les deux champs mot de passe doivent coïncider
      avant de sauvegarder l'utilisateur. En cas d'échec, appelez l'action d'erreur `afficherErreur` avec un message *Mots de passe distincts*.

   2. Modifiez la méthode `ControleurUtilisateur::construireDepuisFormulaire`
      qui construit un objet métier *utilisateur* à partir d'un tableau `$tableauDonneesFormulaire`
      (voir fin du [TD6]({{site.baseurl}}/tutorials/tutorial6.html)) pour qu'elle appelle le constructeur de `Utilisateur` en hachant d'abord le mot de passe.

3. Rajoutons au menu de notre site un lien pour s'inscrire. Dans le menu de la
   vue générique `vueGenerale.php`, rajoutez une icône cliquable ![icône
   inscription]({{site.baseurl}}/assets/TD8/add-user.png)[^nbpicon] qui pointe vers l'action
   `afficherFormulaireCreation` (contrôleur utilisateur).

4. Testez l'inscription d'un utilisateur avec mot de passe (vérifiez la ligne correspondant au mot de passe dans la base de données).

</div>

[^nbpicon]: <a href="https://www.flaticon.com/" title="icones">Les icônes proviennent du site Flaticon</a>

Rajoutons des mots de passe dans la mise à jour d'un utilisateur.

<div class="exercise">

1. Modifiez la vue `formulaireMiseAJour.php` pour ajouter trois champs *password* : l'ancien mot de passe, le nouveau qu'il faut écrire 2 fois pour ne pas se tromper.
2. Testez la mise à jour du mot de passe d'un utilisateur (qui doit marcher car elle appelle `construireDepuisFormulaire` que nous avons mis à jour).  
   **Note :** Nous ferons prochainement les vérifications de l'ancien mot de passe et de l'égalité des 2 nouveaux mots de passe.

   <!-- L'utilisation des setter pour modifier l'utilisateur aurait permis que le formulaire ne renvoie pas toutes les données -->
</div>

## Sécurisation d'une page avec les sessions

Pour accéder à une page réservée, un utilisateur doit s'authentifier. Une fois
authentifié, un utilisateur peut accéder à toutes les pages réservées sans avoir
à retaper son mot de passe. Il faut donc faire circuler l'information "s'être
authentifié" de pages en pages : nous allons utiliser les sessions.

<!-- On pourrait faire ceci grâce à un champ caché dans un formulaire, mais ça ne -->
<!-- serait absolument pas sécurisé. -->

### Connexion d'un utilisateur

<div class="exercise">

Procédons en plusieurs étapes :

1. Nous allons regrouper les méthodes liées à la connexion d'un utilisateur dans
   la classe purement statique `ConnexionUtilisateur`. Créez cette classe dans
   le fichier `src/Lib/ConnexionUtilisateur.php` à partir du code suivant et
   complétez-la pour que :

   * La connexion enregistre le login d'un utilisateur en session (avec la classe
     `Session` du TD7) dans le champ `$cleConnexion`.
   * Le client est connecté si et seulement si la session contient un enregistrement associé à la clé `$cleConnexion`.
   * La déconnexion consiste à supprimer cet enregistrement de la session.  
   * `getLoginUtilisateurConnecte()` renvoie le login de l'utilisateur connecté ou `null` si le client n'est pas connecté.

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
   
2. Rajoutons au menu de notre site un lien pour se connecter. Dans le menu de la
   vue générique `vueGenerale.php`, rajoutez une icône cliquable
   ![connexion]({{site.baseurl}}/assets/TD8/enter.png) qui pointe vers la future
   action `afficherFormulaireConnexion` (contrôleur *utilisateur*).  
   Ce lien, ainsi que le lien d'inscription ![icône
   inscription]({{site.baseurl}}/assets/TD8/add-user.png), ne doivent s'afficher que si aucun
   utilisateur n'est connecté (utilisez une méthode de la classe
   `ConnexionUtilisateur`). 
   
   *Notes* : 
   * Il est autorisé de mettre un `if` dans la vue `vueGenerale.php`.
   * La syntaxe `<?php if(...): ?> ... <?php endif; ?>` peut être plus lisible dans les vues.

3. Créons une vue pour afficher un formulaire de connexion :

   1. Créez une vue `utilisateur/formulaireConnexion.php` qui comprend un formulaire avec
   deux champs, l'un pour le login, l'autre pour le mot de passe. Ce formulaire
   appelle la future action `connecter` du contrôleur *utilisateur*.
   2. Ajoutez une action `afficherFormulaireConnexion` qui affiche ce formulaire.

4. Créons enfin l'action `connecter()` du contrôleur *utilisateur* :

   1. Commençons par les vérifications à faire avant de se connecter. La
      première vérification est qu'un login et un mot de passe sont transmis dans le
      *query string*. Sinon, appelez `afficherErreur` avec le message *Login et/ou mot de passe manquant*.
   2. Puis, il faut récupérer l'utilisateur ayant le login transmis. Ceci
      permettra de vérifier que ce login existe bien et que le mot de passe
      transmis est correct (utilisez une méthode de la classe `MotDePasse`).
      Sinon, appelez `afficherErreur` avec le message *Login et/ou mot de passe incorrect*.
   3. Enfin, vous pouvez connecter l'utilisateur (utiliser une méthode de la
      classe `ConnexionUtilisateur`). Affichez une nouvelle vue `utilisateur/utilisateurConnecte.php` 
      qui écrit un message *Utilisateur connecté* puis appelle la vue `detail.php` pour
      afficher les informations de l'utilisateur connecté.

5. Tentez de vous connecter et vérifiez que le menu de navigation s'affiche correctement 
   (sans les boutons de connexion et d'inscription).

</div>

Codons maintenant la déconnexion.

<div class="exercise">

1. Ajoutez au menu de navigation de la vue générique `vueGenerale.php` deux icônes,
   **seulement visibles quand l'utilisateur est connecté** : 
   * la première contient une icône cliquable
     ![user]({{site.baseurl}}/assets/TD8/user.png) qui renvoie vers la vue de
     détail de l'utilisateur connecté.
   * puis une deuxième case avec une icône cliquable
   ![deconnexion]({{site.baseurl}}/assets/TD8/logout.png) qui pointe vers la
   future action `deconnecter` (contrôleur *utilisateur*). 

2. Ajoutez une action `deconnecter` qui déconnecte l'utilisateur (utilisez une
   méthode de la classe `ConnexionUtilisateur`). Affichez une nouvelle vue
   `utilisateur/utilisateurDeconnecte.php` qui affiche le message *Utilisateur
   déconnecté* puis la liste des utilisateurs.

   *Note :* Toutes les vues `utilisateurConnecte.php`,
   `utilisateurDeconnecte.php`, `utilisateurCree.php`, `utilisateurMisAJour.php`
   et `utilisateurSupprime.php` sont bien sûr redondantes. Nous résoudrons ce problème lors du TD9 sur les messages Flash.

3. Testez qu'un clic sur vos deux nouvelles icônes
   ![user]({{site.baseurl}}/assets/TD8/user.png) et
   ![deconnexion]({{site.baseurl}}/assets/TD8/logout.png) marche bien.

   *Question innocente* 👼 : Est-ce que le clic sur ![user]({{site.baseurl}}/assets/TD8/user.png) pour un utilisateur de login `&a=b` marche bien ?

</div>

### Sécurisation d'une page à accès réservé

On souhaite restreindre les actions de mise à jour et de suppression à
l'utilisateur actuellement authentifié. Commençons par limiter les liens.

<div class="exercise">

1. Faites en sorte que la vue `utilisateur/liste.php` n'affiche que les liens vers
   la vue de détail des utilisateurs, mais pas les liens de modification ou de suppression.
   Gardez le code HTML des liens pour la question suivante.

2. Modifiez la vue de **détail** pour qu'elle affiche les liens vers la mise à
jour ou la suppression de l'utilisateur seulement si le login de l'utilisateur 
concorde avec celui stocké en session.

   Pour vous aider dans cette tâche, rajoutez la méthode suivante à
   `ConnexionUtilisateur` :
   ```php
   public static function estUtilisateur(string $login): bool
   ```
   qui doit vérifier si un utilisateur est connecté et que son login correspond à celui passé en argument de la fonction. 

</div>

**Attention :** Supprimer le lien n'est pas suffisant, car un petit malin
pourrait accéder au formulaire de mise à jour d'un utilisateur quelconque en
rentrant manuellement l'action `afficherFormulaireMiseAJour` dans l'URL.

<div class="exercise">

1. « Hackez » votre site en accédant à la page de mise à jour d'un utilisateur
   quelconque (qui n'est pas vous) en manipulant le query string.

2. Modifiez l'action `afficherFormulaireMiseAJour` du contrôleur *utilisateur* 
   de sorte que l'accès au formulaire soit restreint à l'utilisateur connecté.
   En cas de problème, utilisez `afficherErreur` pour afficher un message *La
   mise à jour n'est possible que pour l'utilisateur connecté*.

   *Note :* la succession des `if`, `else`, `if` pourrait être évitée en
   utilisant des `return;` dans chaque cas d'erreur. Ce style de codage est plus
   lisible et plus sûr, car on identifie plus facilement le cas dans lequel on se
   trouve. Par exemple :

   ```php
   if(!isset($_GET["attribut"])) {
      //Cas d'erreur 1
      Controleur::afficherErreur("...");
      return;
   }
   if(!Service::verification()) {
      //Cas d'erreur 2
      Controleur::afficherErreur("...");
      return;
   }
   //Traitement normal
   ```

3. Vérifiez qu'il n'est plus possible d'accéder à la page de mise à jour d'un
   autre utilisateur.

</div>

**Attention :** Restreindre l'accès au formulaire de mise à jour n'est toujours pas 
suffisant, car un petit malin pourrait exécuter une mise à jour en demandant manuellement
l'action `mettreAJour`.

<div class="exercise">

1. « Hackez » votre site en effectuant une mise à jour d'un utilisateur
   quelconque sans changer de code PHP[^nbp].  
   **Note :** Ce « hack » sera bien plus simple à réaliser si le formulaire de
   mise à jour et sa page de traitement communique par la méthode `GET`, car il suffit alors de modifier l'URL.

2. Mettez à jour l'action `mettreAJour` du contrôleur *utilisateur* pour qu'elle
   effectue toutes les vérifications suivantes, avec `afficherErreur` en cas
   de problème :
   * Vérifiez que tous les champs obligatoires du formulaire ont été transmis ;
   * Vérifiez que le login existe ;
   * Vérifiez que les 2 nouveaux mots de passe coïncident ;
   * Vérifiez que l'ancien mot de passe est correct ;
   * Vérifiez que l'utilisateur mis à jour correspond à l'utilisateur connecté. 

3. Sécurisez de manière similaire l'accès à l'action `supprimer` d'un utilisateur.

4. Vérifiez qu'il n'est plus possible de "hacker" le site comme dans la première question.

</div>

[^nbp]: Mais vous pouvez changer le code HTML avec les outils de développement (clic droit puis inspecter un élément, ou bien `F12`) car cette manipulation se fait du côté client.


**Note générale importante :** les seules pages qu'il est vital de sécuriser
sont celles dont le script modifie vraiment des données, *c.-à-d.* pour
l'instant les actions `mettreAJour` et `supprimer` (et plus loin dans ce TD
`creerDepuisFormulaire` pour le rôle administrateur, et `validerEmail`). Les autres
sécurisations (liens masqués, accès aux formulaires) sont surtout pour améliorer
l'ergonomie du site.  
De manière générale, il ne faut **jamais faire confiance au client** ; seule une
vérification **côté serveur** est sûre.

### Rôle administrateur

Jusqu'au début de ce TD, le site était codé comme si tout le monde avait le rôle
d'administrateur. Maintenant, nous allons différencier ceux qui ont ce rôle des
autres utilisateurs. Nous souhaitons donc pouvoir avoir des comptes
administrateur sur notre site.

Commençons par rajouter un attribut `estAdmin` à notre classe métier
`Utilisateur` et à son stockage `UtilisateurRepository`.

<div class="exercise">

1. Ajoutez un champ `estAdmin` de type `BOOLEAN` (ou `TINYINT(1)`) non `NULL` à la table
   `utilisateur`.

2. Mettez à jour la classe métier `Utilisateur` (dossier `src/Modele/DataObject`) :
   1. ajoutez un attribut `private bool $estAdmin`,
   2. mettez à jour le constructeur, 
   3. rajoutez un getter et un setter,

3. Mettez à jour la classe de persistance `UtilisateurRepository` :
   1. mettez à jour `getNomsColonnes`,
   2. mettez à jour la méthode `formatTableauSQL` (qui fournit les données des
      requêtes SQL préparées).

      **Rappel** : SQL stocke différemment les booléens que PHP (*cf.*
      `nonFumeur` des trajets). En SQL, on encode `false` avec l'entier `0` et
      `true` avec l'entier `1`. Il faut donc que votre méthode
      `formatTableauSQL` renvoie `0` ou `1` pour le champ `estAdminTag`.
   3. mettez à jour `construireDepuisTableauSQL` (qui permet de construire un
      utilisateur à partir de la sortie d'une requête SQL).

      **Note :** Pas besoin ici de convertir le booléen SQL (0 ou 1) vers un
      booléen PHP car PHP le fait automatiquement.

</div>


#### Rôle administrateur lors de la création d'un utilisateur

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
2. Mettez à jour `construireDepuisFormulaire` de `ControleurUtilisateur`.

   **Rappel** : Les formulaires transmettent le booléen associé à une
   `checkbox` de manière spécifique (*cf.* `nonFumeur` des trajets). Si la
   case est cochée, alors `estAdmin=on` sera transmis. Si la case n'est pas
   cochée, aucune donnée n'est transmise (on vérifie donc avec la fonction `isset`).

3. Testez la création d'utilisateurs administrateurs puis vérifiez dans phpMyAdmin que la colonne
`estAdmin` vaut bien 1 (true) pour ces utilisateurs.
</div>

#### Rôle administrateur lors de la mise à jour d'un utilisateur

Passons au processus de mise à jour.

<div class="exercise">

1. Rajoutez un bouton `checkbox` au formulaire de mise à jour
   ```html
   <p class="InputAddOn">
         <label class="InputAddOn-item" for="estAdmin_id">Administrateur</label>
         <input class="InputAddOn-field" type="checkbox" placeholder="" name="estAdmin" id="estAdmin_id">
   </p>
   ``` 
   Faites en sorte que le bouton soit pré-coché ([attribut
   `checked`](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input/checkbox#attr-checked))
   si l'utilisateur est déjà administrateur.

2. Vérifiez que la mise à jour fonctionne.

</div>

Bien sûr, nous allons bientôt renforcer la sécurité du site afin que seul un administrateur puisse 
donner le rôle d'administrateur à un autre utilisateur.

#### Sécurisation du rôle administrateur

Nous allons modifier la sécurité de notre site pour qu'un *administrateur* ait
tous les droits.

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

Nous pouvons maintenant coder la logique d'autorisation d'accès.

<div class="exercise">

1. Processus de création :
   1. Le champ *Administrateur* du formulaire de création ne doit apparaître
   que si l'utilisateur connecté est administrateur.

      *Note* : Vous pouvez mettre un `if` dans la vue.

   2. Plus important, l'action `creerDepuisFormulaire` ne doit créer des administrateurs que si
      l'utilisateur connecté est administrateur.

      *Aide* : si l'utilisateur connecté n'est pas administrateur, forcez
      l'utilisateur créé à ne pas être administrateur, indépendamment de la
      valeur reçue par le formulaire.


2. Processus de mise à jour : 
   1. Vue `detail.php` : Les liens de mise à jour d'un utilisateur doivent
      apparaître quand un administrateur est connecté (utilisez
      `ConnexionUtilisateur::estAdministrateur()`).
   2. Action `afficherFormulaireMiseAJour` : 
      * L'accès au formulaire de mise à jour d'un utilisateur est autorisé 
        si il existe bien un utilisateur avec ce login, et soit
        si c'est l'utilisateur connecté, soit si l'utilisateur connecté est
        administrateur.  
        En cas d'accès refusé, affichez le message d'erreur *Login inconnu* si
        un admin est connecté ou *La mise à jour n'est possible que pour
        l'utilisateur connecté ou un administrateur* sinon.
      * Le champ *Administrateur* du formulaire de mise à jour ne doit
         apparaître que si l'utilisateur connecté est administrateur.
   3. Action `mettreAJour` : 
      * L'accès à l'action `mettreAJour` d'un utilisateur est autorisé 
        si il existe bien un utilisateur avec ce login, et soit
        si c'est l'utilisateur connecté, soit si l'utilisateur connecté est
        administrateur.  
        En cas d'accès refusé, affichez le message d'erreur *Login inconnu* si
        un admin est connecté ou *La mise à jour n'est possible que pour
        l'utilisateur connecté ou un administrateur* sinon. 
      * On ne vérifie pas l'ancien mot de passe si un admin est connecté.
      * Plus important, l'action `mettreAJour` ne doit modifier le rôle
        *administrateur* que si l'utilisateur connecté est administrateur.  
        Pour appliquer cette règle, nous allons changer la manière dont nous
        créons l'objet *utilisateur* modifié. Plutôt que de le construire à
        partir des données du formulaire, nous allons récupérer l'utilisateur
        courant de la base de données puis le modifier avec des mutateurs
        (*setters*). Cette façon de faire facilite les logiques plus complexes,
        comme modifier l'attribut `estAdmin` sous condition, et plus tard la
        validation de l'adresse email.
  
        **Modifiez** donc l'action `mettreAJour` pour appeler des mutateurs
        plutôt que `construireDepuisFormulaire`. N'oubliez pas de hacher le mot
        de passe avant de le modifier. Changez le statut administrateur que si
        l'utilisateur connecté est administrateur (faites attention à la manière
        de lire la case à cocher du formulaire).

3. Processus de suppression :
   1. Vue `detail.php` : Les liens de suppression d'un utilisateur doivent
      apparaître quand un administrateur est connecté.
   2. Action `supprimer` : 
      * L'accès à l'action `supprimer` d'un utilisateur est autorisé 
        si il existe bien un utilisateur avec ce login, et soit
        si c'est l'utilisateur connecté, soit si l'utilisateur connecté est
        administrateur.    
        En cas d'accès refusé, affichez le message d'erreur *Login inconnu* si
        un admin est connecté ou *La suppression n'est possible que pour
        l'utilisateur connecté ou un administrateur* sinon.
      * Si l'utilisateur supprimé est l'utilisateur connecté, déconnectez-le.

4. Vérifiez que tout fonctionne comme attendu. Vérifiez notamment que l'administrateur
   peut bien réaliser toutes les actions (et qu'il voit bien les liens de mise à jour
   et de suppression sur la page détaillant les utilisateurs) et qu'un utilisateur qui
   n'est pas administrateur ne puisse toujours pas "hacker" le site en effectuant
   les actions de modification et de suppression sur un autre utilisateur que lui-même.

</div>

Il est courant qu'un site Web sépare ses interfaces administrateur et
utilisateur. Vous avez tous les outils pour le mettre en place si vous le
souhaitez. Le défi est de limiter la duplication du code entre les 2 interfaces. 

Dans un site professionnel, l'administrateur ne pourrait pas modifier
directement le mot de passe d'un utilisateur. En effet, l'administrateur ne doit
pas connaître les mots de passe. Le site fournirait plutôt un bouton
"*Réinitialiser le mot de passe*" à l'administrateur. Ce bouton générerait un mot
de passe aléatoire qui serait envoyé par mail à l'utilisateur.

Aussi, dans une application plus avancée, on pourrait modifier certaines
informations de l'utilisateur sans avoir besoin d'envoyer toutes les informations.
Par exemple, le fait de passer un utilisateur administrateur se ferait plutôt
par une action dédiée, sans toucher au reste du profil. Ou aussi, l'utilisateur
ne devrait pas avoir à modifier son mot de passe chaque fois qu'il souhaite
éditer son profil.

## Enregistrement avec une adresse email valide

Dans beaucoup de sites Web, il est important de savoir si un utilisateur est
bien réel. Pour ce faire, on peut utiliser une vérification de son numéro de
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
par email à l'adresse indiquée. La connaissance de ce nonce sert de preuve que
l'adresse email existe et que l'utilisateur y a accès. Il suffit alors à
l'utilisateur de renvoyer le nonce au site pour que ce dernier valide l'adresse
email.

Aussi, en cas de changement
d'adresse mail, nous souhaitons garder l'ancienne adresse mail en mémoire tant
que la nouvelle n'a pas été validée. Nous aurons donc une donnée `emailAValider`
en plus.

Le diagramme suivant résume la procédure, ainsi que l'évolution des champs
`email`, `emailAValider` et `nonce` dans la base de données :

<div class="centered">
<object data="{{site.baseurl}}/assets/TD8/validation-email.svg" type="image/svg+xml">
  Schéma de séquence : à la création, l'email est à valider et un nonce est envoyé par mail ; le clic sur le lien de validation recopie l'email à valider dans l'email et remet les autres champs à NULL. Votre navigateur ne supporte pas les SVG.
</object>
</div>

Commençons par mettre à jour notre classe métier `Utilisateur`. Nous allons
rajouter des données `nonce`, `email` et `emailAValider`. 

<div class="exercise">

1. Ajoutez trois champs à la table `utilisateur` : 
   * `email` de type `VARCHAR` (taille **256**) pouvant être `NULL` et de
   valeur par défaut `NULL` : l'email validé, `NULL` tant
     qu'aucun email n'a été validé,
   * `emailAValider` de type `VARCHAR` (taille **256**) pouvant être `NULL` et de
   valeur par défaut `NULL` : l'email en attente de
     validation, `NULL` s'il n'y en a pas,
   * `nonce` de type `VARCHAR` (taille **32**) pouvant être `NULL` et de
   valeur par défaut `NULL` : `NULL` s'il n'y a pas d'email
     en attente de validation.

2. Mettez à jour la classe métier `Utilisateur` (dossier `src/Modele/DataObject`) :
   1. ajoutez les attributs, de type `?string` puisqu'ils peuvent valoir `null`,
   2. mettez à jour le constructeur, les *getters* et les *setters*.

3. Mettez à jour la classe de persistance `UtilisateurRepository` :
   1. mettez à jour `construireDepuisTableauSQL` (qui permet de construire un utilisateur à partir de la sortie d'une requête SQL),
   2. mettez à jour `getNomsColonnes`,
   3. mettez à jour la méthode `formatTableauSQL` (qui fournit les données des requêtes SQL préparées).

4. Modifiez la vue `detail.php` pour afficher l'adresse email de l'utilisateur.

   **Attention :** depuis PHP 8.1, `htmlspecialchars(null)` déclenche un
   avertissement *Deprecated*. Comme `getEmail()` peut renvoyer `null`,
   écrivez plutôt `htmlspecialchars($utilisateur->getEmail() ?? "")`.

</div>

Créons maintenant une classe utilitaire `src/Lib/VerificationEmail.php`. Cette
classe n'enverra pas encore de mail pour l'instant, mais affichera le contenu du
mail sur la page Web.

<div class="exercise">

1. Dans le fichier de configuration `ConfigurationSite.ini`, ajoutez une ligne 
   qui contient l'URL de votre site, par exemple :
   ```ini
   url_absolue = "http://localhost/tds-php/TD8/web/controleurFrontal.php"
   ```

2. Créez la classe `src/Lib/VerificationEmail.php` avec le code suivant, que 
   nous compléterons plus tard :

   ```php
   namespace App\Covoiturage\Lib;

   use App\Covoiturage\Modele\DataObject\Utilisateur;

   class VerificationEmail
   {
       public static function envoiEmailValidation(Utilisateur $utilisateur): void
       {
           $destinataire = $utilisateur->getEmailAValider();
           $sujet = "Validation de l'adresse email";
           // Pour envoyer un email contenant du HTML
           $enTete = "MIME-Version: 1.0\r\n";
           $enTete .= "Content-type:text/html;charset=UTF-8\r\n";
   
           // Corps de l'email
           $loginURL = rawurlencode($utilisateur->getLogin());
           $nonceURL = rawurlencode($utilisateur->getNonce());
           $configurationSite = parse_ini_file(
               __DIR__ . '/../Configuration/ConfigurationSite.ini',
               false,
               INI_SCANNER_RAW
           );
           $URLAbsolue = $configurationSite["url_absolue"];
           $lienValidationEmail = "$URLAbsolue?action=validerEmail&controleur=utilisateur&login=$loginURL&nonce=$nonceURL";
           $corpsEmailHTML = "<a href=\"$lienValidationEmail\">Validation</a>";
   
           // Temporairement avant d'envoyer un vrai mail
           $destinataireHTML = htmlspecialchars($destinataire);
           echo "Simulation d'envoi d'un mail<br> Destinataire : $destinataireHTML<br> Sujet : $sujet<br> Corps : <br>$corpsEmailHTML";
   
           // Quand vous aurez configuré l'envoi de mail via PHP
           // mail($destinataire, $sujet, $corpsEmailHTML, $enTete);
       }
 
       public static function traiterEmailValidation(string $login, string $nonce): bool
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

3. Dans votre formulaire de création d'un utilisateur, rajoutez un champ pour
   l'adresse email
   ```php
   <p class="InputAddOn">
         <label class="InputAddOn-item" for="email_id">Email&#42;</label>
         <input class="InputAddOn-field" type="email" value="" placeholder="toto@yopmail.com" name="email" id="email_id" required>
   </p>
   ```

4. Pour faire fonctionner l'action `creerDepuisFormulaire` :
   1. il faut que l'utilisateur créé avec `construireDepuisFormulaire` soit
      correct :   
      Mettez à jour la méthode `construireDepuisFormulaire` pour
      qu'elle donne la valeur `null` à l'email, qu'elle stocke l'adresse mail du
      formulaire dans `emailAValider`, et qu'elle crée un nonce aléatoire de 32 caractères à
      l'aide de `MotDePasse::genererChaineAleatoire(32)`.
   2. il faut envoyer l'email de validation en cas de succès de la sauvegarde :
      appelez la fonction `VerificationEmail::envoiEmailValidation`.
   3. vérifiez aussi qu'un email a été fourni dans le query string.

5. Faisons en sorte que le lien envoyé par mail valide bien l'adresse mail :
   Codez la méthode `traiterEmailValidation()` de `VerificationEmail` :    
   Si le login correspond à un utilisateur présent dans la base et que le
   `nonce` passé en paramètre correspond au `nonce` de la BDD, alors coupez/collez
   l'email à valider dans l'email, puis passez à `NULL` les champs
   `emailAValider` et `nonce` de la BDD et renvoyez `true`. Sinon renvoyez `false`.

   **Attention :** un `nonce` `NULL` signifie qu'il n'y a pas d'email à valider.
   Comparez donc les nonces avec l'égalité stricte `===`. Sinon, en PHP, `"" == null`
   vaut `true`, et n'importe qui pourrait alors, en envoyant un nonce vide, vider
   l'email d'un utilisateur déjà validé.
   
6. Ajoutez une action `validerEmail` au contrôleur `Utilisateur` qui récupère
   en `GET` deux valeurs `login` et `nonce` (si elles existent, sinon on appelle
   `afficherErreur`) et appelle `VerificationEmail::traiterEmailValidation()`
   avec ces valeurs. En cas de succès, on affiche la page de détail de cet
   utilisateur. En cas d'échec, on appelle `afficherErreur`.

7. Testez que la validation de l'email marche bien après la création d'un
   utilisateur en cliquant sur le lien de validation (qui, pour le moment, 
   apparaît sur la page web après la création de l'utilisateur). Vérifiez 
   dans la BDD que les données évoluent bien à chaque étape.

</div>

Nous allons maintenant pouvoir nous servir de la validation de l'email ailleurs
dans le site.

<div class="exercise">

1. Modifiez l'action `connecter` du contrôleur *utilisateur* de sorte à accepter
la connexion uniquement si l'utilisateur a validé un email. 
   * Pour ceci, appelez la méthode `VerificationEmail::aValideEmail()`.
   * Codez cette méthode pour qu'elle regarde si l'utilisateur a un email
     différent de `null`.
   * Faites cette vérification **après** celle du mot de passe, avec un message
     d'erreur spécifique (*Adresse email non validée*). Dans l'ordre inverse, ce
     message révélerait à n'importe qui que le login existe, sans même connaître
     le mot de passe.

2. Dans l'action `creerDepuisFormulaire` du contrôleur *utilisateur*, vérifiez que l'adresse
   email envoyée par l'utilisateur en est bien une. Pour cela, vous pouvez par
   exemple utiliser la fonction
   [`filter_var`](https://www.php.net/manual/fr/function.filter-var.php) avec le
   filtre
   [`FILTER_VALIDATE_EMAIL`](https://www.php.net/manual/fr/filter.filters.validate.php).
   Cette fonction renverra `false` si la donnée passée en paramètre ne valide pas le filtre spécifié.


3. Mise à jour d'un utilisateur : 
   * rajoutez un champ *Email* prérempli avec l'email validé actuel.  

   * dans l'action `mettreAJour`, si l'email du formulaire est différent de
     l'email validé actuel, vérifiez le format de l'email puis
     écrivez-le dans le champ `emailAValider`. Créez aussi un nouveau nonce
     aléatoire et envoyez le mail de validation. L'email validé actuel reste
     inchangé tant que le nouveau n'a pas été validé.

4. Testez que la mise à jour de l'email marche bien après le clic sur le lien 
   de validation. Vérifiez dans la BDD que les données évoluent bien à chaque étape.

</div>

**Remarque :** Notre système de validation d'email reste simplifié. Dans un
vrai site, il faudrait aussi :

* **Garantir qu'un email validé n'appartient qu'à un seul utilisateur.**
  Idéalement, on ajouterait une contrainte `UNIQUE` sur la colonne `email`. Les
  valeurs `NULL` ne posent pas de problème : plusieurs lignes peuvent avoir
  `email` à `NULL` sans violer la contrainte. C'est d'ailleurs une des raisons
  pour lesquelles nous avons choisi `NULL` plutôt que `""` pour représenter
  l'absence d'email.  
  Cette contrainte ne dispense pas de vérifier l'unicité dans le code PHP, afin
  d'afficher un message d'erreur clair plutôt que de laisser remonter une
  `PDOException`. Il faudrait par exemple une méthode
  `UtilisateurRepository::recupererParEmail()`, appelée :
  * à la création d'un utilisateur et à la mise à jour de son email, pour
    refuser une adresse déjà validée par un autre utilisateur ;
  * au moment de la validation (`traiterEmailValidation()`), car deux
    utilisateurs peuvent avoir la même adresse en attente dans `emailAValider` :
    seul le premier à valider doit réussir.
* **Limiter la durée de validité du nonce**, en stockant sa date de création et
  en refusant les nonces trop anciens (par exemple plus de 24 heures).
* **Permettre de renvoyer le mail de validation**, si l'utilisateur ne l'a pas
  reçu ou si le nonce a expiré.
{% comment %}
* **Comparer les nonces en temps constant** avec
  [`hash_equals`](https://www.php.net/manual/fr/function.hash-equals.php)
  plutôt qu'avec `===` (après avoir vérifié que le nonce de la BDD n'est pas
  `null`, car `hash_equals` n'accepte que des chaînes), pour éviter qu'un attaquant devine le nonce caractère
  par caractère en mesurant le temps de réponse du serveur (*timing attack*).
{% endcomment %}

{% comment %}
Si l'utilisateur fait une faute de frappe dans l'email, le nonce sera envoyé à
la mauvaise adresse et donc il ne faut pas qu'un autre utilisateur puisse
valider le mail avec le nonce. En pratique, nous demanderons donc à
l'utilisateur d'être connecté pour pouvoir valider une adresse email grâce au
nonce.

Donc il faut un champ email_validated dans la session qui fait que quand on est
connecté sans avoir validé, alors on ne peut que valider son email.
{% endcomment %}

### Configuration pour l'envoi de mail

L'envoi d'email par PHP nécessite une configuration. Voici diverses options possibles.

#### Sur `webinfo`

Si vous déployez votre site sur le serveur web de l'IUT `webinfo` (*cf.* [Cours
1]({{site.baseurl}}/classes/class1.html#serveur-web-webinfo-de-liut)), la
fonction `mail()` est déjà configurée.

Cela vous servira notamment dans le cadre du site web développé dans la **SAE**
(pour le parcours `RACDV`) ou pour le projet (pour le parcours `DACS` et `IAMSI`),
où le site devra être déployé sur `webinfo`, à terme.

Pour éviter que le serveur mail de l'IUT ne soit blacklisté par les serveurs de
mail, vous n'avez l'autorisation d'envoyer des emails que vers le domaine
`yopmail.com`, dont le fonctionnement est le suivant : un mail envoyé à
`bob@yopmail.com` est immédiatement lisible sur
[https://yopmail.com/fr/?"bob"](https://yopmail.com/fr/?"bob"). Si le lien
précédent ne marche pas, allez sur la page https://yopmail.com/fr/ et saisissez le
nom du mail jetable "bob" en haut à gauche.

#### Sous Docker

Dans le cadre du TD, nous allons mettre en place un client et un serveur **SMTP** en local, 
dans le conteneur docker qui fait tourner notre serveur web.

Nous allons utiliser 2 outils : 
* [MSMTP](https://marlam.de/msmtp/) : un client de mail (SMTP) qui permet de demander à un serveur SMTP
  d'envoyer des mails en ligne de commande. PHP appellera cette ligne de commande.
* [Mailpit](https://mailpit.axllent.org/) : un serveur de mail (SMTP) simpliste et une interface Web pour
  voir les mails envoyés. Le serveur de mail n'enverra pas vraiment de mail au
  destinataire, mais permettra de les afficher via son interface web.

<div class="exercise">

1. Ouvrez un terminal dans votre conteneur Docker : dans Docker Desktop, ouvrez
   votre conteneur, puis cliquez sur l'onglet `Exec`. Dans le terminal qui
   apparaît, tapez `bash` pour retrouver votre shell habituel. Enfin, exécutez les commandes suivantes : 
   
   ```bash
   # Mise à jour des paquets
   apt-get update

   # Installer msmtp
   DEBIAN_FRONTEND=noninteractive apt install -y msmtp
   
   # Configuration de msmtp
   echo "account default
   host host.docker.internal
   port 1025
   from ton_adresse@example.com
   auth off" > /var/www/html/.msmtprc
   
   # Configuration de PHP
   echo "sendmail_path = \"/usr/bin/msmtp -C /var/www/html/.msmtprc -t\"" >> /usr/local/etc/php/conf.d/php.ini
   ```

   Remarques : 1025 est le port du serveur SMTP (*cf.* plus bas),
   `host.docker.internal` est le nom d'hôte de votre machine depuis un conteneur
   Docker.  

2. Redémarrez votre conteneur serveur Web pour qu'Apache recharge le fichier de configuration de PHP.

3. Dans votre machine hôte (pas sous Docker), ouvrez un terminal et exécutez la
   commande suivante pour créer un nouveau conteneur Docker qui contiendra Mailpit.

   ```bash
   docker run -d --name=mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit
   ``` 

4. Modifiez `VerificationEmail::envoiEmailValidation` pour envoyer le lien de validation par mail (décommentez la ligne `mail(...)`) 
   au lien de l'écrire dans la page web. 

5. Testez l'envoi du lien de validation par mail en créant un nouvel utilisateur.
   Vous trouverez le mail envoyé en ouvrant votre navigateur à l'URL
   [http://localhost:8025/](http://localhost:8025/) pour accéder à l'interface Web
   du serveur de mail Mailpit.
</div>

<!-- docker run -d --name serveurTestMSMTP2 -p 8081:80 --volume /home/lebreton/public_html:/var/www/html serveur.web.docker.iut -->

#### Alternative : une bibliothèque PHP

Une solution professionnelle serait d'utiliser une bibliothèque PHP, comme le
[composant `Mailer` du framework
Symfony](https://symfony.com/doc/current/mailer.html), ou
[`PHPMailer`](https://github.com/PHPMailer/PHPMailer).

La façon la plus simple de les installer est d'utiliser le gestionnaire de
bibliothèques PHP `composer`, que nous verrons au semestre 4 pour le parcours `RACDV`.

À noter que PHPMailer propose aussi une façon de s'installer sans `composer`.

## Autres sécurisations

### Passage des formulaires en `post`

<!-- Prévoir formulaire en POST si site en production et en GET sinon ? -->

À l'heure actuelle, le mot de passe transite en clair dans l'URL. Vous
conviendrez facilement que ce n'est pas idéal. 

Nous allons donc faire dépendre la méthode de transmission des formulaires d'un
booléen `debug` de configuration du site :
* en mode **production** (`debug` vaut `false`), les formulaires seront envoyés
  avec la méthode `POST`, pour que leurs données n'apparaissent plus dans l'URL ;
* en mode **debug** (`debug` vaut `true`), les formulaires seront envoyés avec
  la méthode `GET`, ce qui reste pratique pendant le développement pour voir
  directement dans l'URL les données transmises.

Il faudra donc modifier l'attribut `method` de nos formulaires pour qu'il
dépende de la valeur de ce booléen.

Côté contrôleur, les données d'un formulaire peuvent donc désormais arriver soit
dans `$_GET`, soit dans `$_POST`. De plus, nos liens internes, tels que
'Détails' ou 'Mettre à jour', transmettent forcément leurs informations dans le
*query string* de l'URL, c'est-à-dire en `GET`, quel que soit le mode du site.
Il faut donc que le contrôleur lise les informations à la fois dans `$_GET` et
dans `$_POST`, en donnant la priorité à `$_POST` en cas de conflit. C'est
exactement le rôle de la variable `$_REQUEST`.

<div class="exercise">

1. Dans le fichier de configuration `ConfigurationSite.ini`, ajoutez une ligne 
   ```ini
   ; true pour mode debug, false pour mode production
   debug = true
   ```
   qui va servir à indiquer si le site est en mode **debug** ou non (mode production).

2. Pour que toutes les vues aient accès à la valeur de `debug`, modifiez la
   méthode `afficherVue` de `ControleurGenerique` pour qu'elle lise cette valeur
   dans `ConfigurationSite.ini` et la stocke dans une variable `$debug` avant de
   charger la vue :

   ```php
   protected static function afficherVue(string $cheminVue, array $parametres = []): void
   {
       extract($parametres); // Crée des variables à partir du tableau $parametres
       // Récupère la variable debug dans le fichier de configuration, ou false si elle n'y est pas
       $debug = parse_ini_file(
           __DIR__ . '/../Configuration/ConfigurationSite.ini',
           false,
           INI_SCANNER_RAW
       )["debug"] ?? false;

       // Pour transformer la chaine de caractères "false" en le booléen false
       // Et de même pour "true" → true
       $debug = filter_var($debug, FILTER_VALIDATE_BOOLEAN);
       require __DIR__ . "/../vue/$cheminVue"; // Charge la vue
   }
   ```

   **Explications :** 
   * Comme pour les autres lectures de fichiers `.ini`, le mode `INI_SCANNER_RAW`
     renvoie la valeur telle qu'elle est écrite, c'est-à-dire la chaîne de
     caractères `"true"` ou `"false"`. La fonction `filter_var` avec le filtre
     `FILTER_VALIDATE_BOOLEAN` la convertit en booléen.
   * La variable `$debug` est aussi accessible dans les vues incluses par
     `vueGenerale.php` (comme les formulaires), car un `require` partage la
     portée des variables du code qui l'appelle.

3. Remplacez tous les `$_GET` par `$_REQUEST`.

   **Aide :** Utilisez la fonction de remplacement globale avec `Ctrl+Shift+R`
   (sur tous les fichiers du dossier `TD8`) pour vous aider.

4. Modifiez les vues contenant des formulaires pour que
   la méthode `post` soit utilisée si `$debug` vaut `false`, et la méthode `get`
   sinon.

   Pour que votre IDE connaisse le type de `$debug`, ajoutez en haut
   de ces vues le commentaire `/** @var bool $debug */`.

5. Vérifiez que tout fonctionne toujours en utilisant un des formulaires du
   site, puis en changeant la valeur de `debug` dans `ConfigurationSite.ini`.
   Vérifiez notamment que quand `debug = false`, la méthode `POST` est bien
   utilisée (pas de données du formulaire dans le *query string*...).

</div>

### Sécurité avancée (optionnel)

Remarquez que les mots de passe envoyés en POST sont toujours visibles, car envoyés
en clair. Vous pouvez par exemple les voir dans l'onglet réseau des outils de
développement (raccourci `F12`) dans la section paramètres sous Firefox (ou Form
data sous Chrome).

Le fait de hacher les mots de passe dans la
base de données évite qu'un accès en lecture à la base (suite à une faille de
sécurité) ne permette à l'attaquant de récupérer les mots de passe de tous
les utilisateurs.

On pourrait aussi hacher le mot de passe côté client, et n'envoyer que le mot
de passe haché au serveur. Dans le cas d'une attaque de l'homme du milieu (où
quelqu'un écoute vos communications avec le serveur), l'attaquant n'obtiendra
que le mot de passe haché et pas le mot de passe en clair. Mais cela ne
l'empêchera pas de pouvoir s'authentifier puisque l'authentification repose sur
le mot de passe haché qu'il a récupéré.

La seule façon fiable de protéger les communications d'une application web est le recours au
chiffrement de l'ensemble des communications entre le client (navigateur) et le
serveur, via l'utilisation du protocole `TLS` sur `http`, à savoir
`https`. Cependant, la mise en place de cette infrastructure était jusqu'à présent
compliquée. Même si
[elle s'est simplifiée considérablement récemment](https://letsencrypt.org/),
cela dépasse le cadre de notre cours.

### Notes techniques supplémentaires (optionnel)

Malgré nos protections, il est toujours possible pour un attaquant d'essayer des
couples login / mot de passe en passant par notre interface de connexion. Un
site professionnel devrait donc implémenter une limite au nombre d'échecs
d'authentification consécutifs lié à chaque login. En cas de trop nombreux
échecs, le site pourrait verrouiller le compte (déverrouillage avec l'adresse
mail validée), ou rajouter une temporisation.

Listons d'autres protections de l'authentification par mot de passe,
indispensables dans un site professionnel :
* longueur minimale de 15 caractères si le mot de passe est le seul facteur
  d'authentification (8 caractères s'il est combiné à un second facteur), sans
  imposer de règles de composition (majuscule, chiffre...) ni de changement
  périodique,
* interdire les mots de passe communs, attendus ou compromis,
* ne pas utiliser de question de rappel (nom de votre chien, ...),
* proposer l'authentification à deux facteurs, qui protège notamment du
  *phishing* (un faux site qui vous invite à saisir vos identifiants).

Notre site reste aussi vulnérable aux [attaques
CSRF](https://fr.wikipedia.org/wiki/Cross-site_request_forgery) (*Cross-Site
Request Forgery*). Le navigateur envoie le cookie de session avec toute requête
vers notre site, même si cette requête est déclenchée par un site tiers. Par
exemple, si un administrateur connecté visite une page malveillante contenant
```html
<img src="http://localhost/tds-php/TD8/web/controleurFrontal.php?controleur=utilisateur&action=supprimer&login=bob">
```
alors son navigateur demande la suppression de `bob` avec sa session
d'administrateur, et toutes nos vérifications côté serveur sont satisfaites.
De même, une page malveillante peut soumettre automatiquement un formulaire vers
l'action `mettreAJour`.

La parade consiste à :
* ne jamais modifier de données via une requête `GET` (lien) : la suppression
  devrait passer par un formulaire `POST`, et les actions de modification
  devraient lire `$_POST` plutôt que `$_REQUEST` ;
* ajouter dans **chaque formulaire qui modifie des données** (création, mise à
  jour, suppression, mais aussi connexion) un champ caché contenant un *jeton*
  aléatoire, stocké en session et vérifié côté serveur
  avant toute modification. Un site tiers ne connaît pas ce jeton et ne peut
  donc pas forger de requête valide ;
* en complément, utiliser l'attribut
  [`SameSite`](https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value)
  `Lax` ou `Strict` sur le cookie de session.

Enfin, notre connexion est vulnérable à la [fixation de
session](https://owasp.org/www-community/attacks/Session_fixation) : un
attaquant qui aurait imposé à la victime un identifiant de session connu à
l'avance se retrouverait connecté avec le compte de la victime dès qu'elle
s'authentifie, puisque l'identifiant de session ne change pas à la connexion.
La parade consiste à appeler
[`session_regenerate_id(true)`](https://www.php.net/manual/fr/function.session-regenerate-id.php)
dans `ConnexionUtilisateur::connecter()`, juste avant d'enregistrer le login en
session, pour attribuer un nouvel identifiant de session.

**Sources :**
* [Recommandations du NIST (SP 800-63B-4)](https://pages.nist.gov/800-63-4/sp800-63b.html#password)
* [Recommandation de la CNIL relative aux mots de passe (2022)](https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite)
* [Recommandations de l'ANSSI relatives à l'authentification multifacteur et aux mots de passe](https://cyber.gouv.fr/publications/recommandations-relatives-lauthentification-multifacteur-et-aux-mots-de-passe)
* Fiches de recommandations OWASP :
  * [Stockage des mots de passe](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  * [Authentification](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
  * [Gestion des sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
  * [Prévention des attaques CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
  * [Réinitialisation de mot de passe oublié](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
* [FAQ de PHP sur le hachage sécurisé des mots de passe](https://www.php.net/manual/fr/faq.passwords.php)

{% comment %}
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
{% endcomment %}