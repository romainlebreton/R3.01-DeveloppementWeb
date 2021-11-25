---
title: TD8 &ndash; Authentification & validation par email
subtitle: Sécurité des mots de passe
layout: tutorial
---

<!-- Parler des nouvelles fonctions de PHP pour les mots de passe ?
http://php.net/manual/fr/book.password.php -->

<!-- Màj le TD pour le fait d'être connecté pour valider le mail -->

Ce TD vient à la suite du
[TD7 -- cookies & sessions]({{site.baseurl}}/tutorials/tutorial7.html) et
prendra donc comme acquis l'utilisation de cookies et des sessions. Cette
semaine, nous allons :

1. mettre en place l'authentification par mot de passe des utilisateurs du site ;
2. verrouiller l'accès à certaines pages ou actions à certains utilisateurs. Par
   exemple, un utilisateur ne peut modifier que ses données. Ou encore,
   l'administrateur a tous les droits sur les utilisateurs ;
3. mettre en place une validation par email de l'inscription des utilisateurs.

## Authentification par mot de passe

### Mise en place dans la BDD et les formulaires

<div class="exercise">

1. Nous allons commencer par modifier la table utilisateur en lui ajoutant une
colonne `VARCHAR(64) mdp` stockant son mot de passe.

   **Plus d'explications :** Étant donné que nous allons utiliser une fonction
   de hachage pour stocker ce mot de passe, vous devez prévoir une taille de
   champ correspondant à la taille du mot de passe haché (64 caractères pour
   SHA-256 et comme 1 octet se code en hexadécimal sur 2 caractères e.g. `1F`,
   cela donne `32 octets = 256 bits`) et non de la taille du mot de passe
   lui-même.

1. Modifier la vue `create.php` (ou `update.php` si vous aviez fusionné les deux
vues dans le TD6) pour ajouter deux champs `<input type="password">` au
formulaire.  Le deuxième champ mot de passe sert à valider le premier.

   <!-- Erreur commune : oubli input type=''password'' laisse value='$m' -->

1. Après avoir vérifié que les deux champs coïncident, modifier les actions
created puis updated du contrôleur ControllerUtilisateur.php pour sauver dans la
base le mot de passe de l’utilisateur.

</div>

### Premier hachage

Comme mentionné ci-dessus, on ne stocke jamais le mot de passe en clair dans la
base, mais sa version hachée:

```php
<?php
class Security {
	public static function hacher($texte_en_clair) {
		$texte_hache = hash('sha256', $texte_en_clair);
		return $texte_hache;
	}
}

$mot_passe_en_clair = 'apple';
$mot_passe_hache = Security::hacher($mot_passe_en_clair);
echo $mot_passe_hache;
//affiche '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b'
?>
```

<div class="exercise">

1. Copier la fonction `hacher` ci-dessus dans un fichier
  `lib/Security.php`. Pour faire les choses plus proprement, créez une classe
  `Security` englobant la fonction.
2. Modifier les actions `created` puis `updated` du contrôleur
`ControllerUtilisateur.php` pour sauver dans la BDD le mot de passe
haché. N'oubliez pas de faire un `require_once` de `Security.php` pour pouvoir
appeler la fonction.

**Note :** On dit que SHA-256 est une fonction de hachage. Les fonctions de
hachage cryptographiques ont la particularité qu'on ne peut pas retrouver le mot
de passe à partir de son haché. Il existe aussi des fonctions de chiffrement qui
permettent de chiffrer, mais aussi de déchiffrer si on connaît la clé.  
Pour un site Web, mieux vaut une fonction de hachage qu'une fonction de
chiffrement. En effet,

* les fonctions de hachage suffisent à nos besoins car pour tester si un mot de
  passe est le bon, il suffit de comparer les hachés.
* il est plus sage pour un site Web de ne pas pouvoir découvrir les mots de
  passe de ses utilisateurs.

</div>

Les autres vues et actions du contrôleur ne sont pas impactées par la
modification car le mot de passe n'a pas vocation à être affiché.

### Plus de sécurité

Si le mot de passe n'est pas très original, il existe une attaque appelée
*attaque par dictionnaire* qui permet de retrouver un mot de passe à partir de
son haché.

<div class="exercise">

Expérimentons un peu *l'attaque par dictionnaire* pour comprendre son
fonctionnement.

1. Créez un utilisateur bidon dont [le mot de passe est l'un des plus courant en
   2019](https://www.google.fr/search?q=most+used+password), par exemple `password`.
2. Allez lire dans la base de donnée le haché du mot de passe de cet
   utilisateur.
3. Utilisez un site comme [md5decrypt](http://md5decrypt.net/Sha256/) pour
   retrouver le mot de passe originel.
   <!-- http://reverse-hash-lookup.online-domain-tools.com/ -->

**Explication :** Ce site stocke le haché de `3 771 961 285 ≃ 4*10^9` mots de
passe communs. Si votre mot de passe est l'un de ceux là, sa sécurité est
compromise.  
Heureusement il existe beaucoup plus de mot de passe possible ! Par exemple,
rien qu'en utilisant des mots de passe de longueur 16 écrits à partir des 16
caractères `0,1,...,9,A,B,C,D,E,F`, vous avez `2^64 ≃ 10^18` possibilités (code
hexadécimal à `16` chiffres).

</div>

Donc pour éviter les attaques par dictionnaire, nous devons utiliser des mots de
passes originaux, par exemple aléatoire. Pour ceci, nous allons concaténer une
chaîne aléatoire au début de chaque mot de passe. Ainsi, même si l'utilisateur
utilise un mot de passe très commun comme `apple`, nous allons hacher par
exemple `DhuRXYdEkJapple` ce qui est nettement moins commun.

Pour remédier à ce problème, nous allons rajouter une chaîne aléatoire fixe au
début de nos mots de passes en clair pour qu'aucun ne soit plus "classique".

<div class="exercise">

1. Rajoutez un attribut statique `seed` dans la classe `Security` :

   ```php?start_inline=1
   private static $seed = 'votre chaine aleatoire fixe';
   ```

1. Changez votre graine `seed` par une chaîne aléatoire, obtenue par exemple
   grâce au site [https://www.random.org/strings/](https://www.random.org/strings/).

1. Modifier la fonction `hacher` pour qu'elle concatène la graine aléatoire
`$seed` au mot de passe avant de le hacher.

**Explication :** Concaténer une graine (`seed` en anglais) au début d'un mot de
  passage s'appelle *saler le mot de passe*. Grâce au salage, les mots de passe
  concaténés sont moins communs et résistent à une attaque par
  dictionnaire. Attention tout de même que si votre `seed` est dévoilée, alors
  l'attaque par dictionnaire redevient efficace contre votre site.

</div>

## Sécurisation d'une page avec les sessions

Pour accéder à une page réservée, un utilisateur doit s'authentifier.  Une fois
authentifié, un utilisateur peut accéder à toutes les pages réservées sans avoir
à retaper son mot de passe.  Il faut donc faire circuler l'information "s'être
authentifié" de pages en pages et nous allons donc utiliser les sessions.

<!-- On pourrait faire ceci grâce à un champ caché dans un formulaire, mais ça ne -->
<!-- serait absolument pas sécurisé. -->

### Page de connexion

<div class="exercise">

Procédons en plusieurs étapes :

1. Créons une vue pour afficher un formulaire de connexion :

   1. Créer une vue `connect.php` qui comprend un formulaire avec deux
   champs, l'un pour le login, l'autre pour le mot de passe. Ce formulaire appelle
   l'action `connected` du contrôleur de Utilisateur.
   1. Ajouter une action `connect` qui affiche ce formulaire dans
   `ControllerUtilisateur.php`.

1. Si ce n'est déjà fait lors du TD précédent, démarrez la session au début de `index.php`.

1. Enfin il faut vérifier le login/mot de passe de l'utilisateur et le connecter le cas échéant :

   1. Créez une fonction
      `ModelUtilisateur::checkPassword($login,$mot_de_passe_hache)` qui
      cherche dans la BDD les couples (login / mot de passe haché)
      correspondants. Cette fonction doit renvoyer `true` si il n'y a qu'un tel
      couple, et `false` sinon.

   1. Ajouter une action `connected` dans `ControllerUtilisateur`, qui vérifie
   que le couple (login / mot de passe) donné est valide et qui, le cas échéant,
   met le login de l'utilisateur en session. Puis affichez la vue de détail de
   l'utilisateur qui vient de se connecter.

   **Aide :** 
  
   <!-- 1. Utilisez la fonction `ModelUtilisateur::selectWhere($data)` qui fait un -->
   <!--   select sur les champs de `$data` (ici 'login' et 'mdp'). En effet, la -->
   <!--   fonction de base `ModelUtilisateur::select($data)` ne sert qu'à récupérer un -->
   <!--   utilisateur étant donné son login. -->
   <!-- 1. Notez que `ModelUtilisateur::selectWhere($data)` renvoie un **tableau -->
   <!--   d'utilisateurs**. Il faudra donc tester si le tableau est vide avec -->
   <!--   `count()`. De plus, -->
   1. La vue `detail` a besoin que l'on initialise une variable d'utilisateur
     `$u` contenant l'utilisateur.
   1. N'oubliez pas de hacher le mot de passe convenablement.

</div>

<div class="exercise">

Ajouter une action `deconnect` dans `controllerUtilisateur`, qui détruit la
session en cours.  Une fois déconnecté, on renvoie l'utilisateur sur la page
d'accueil du site.

</div>

<div class="exercise">

1. Modifier le `header` de votre site (*a priori* dans `view.php` à moins que
vous n'ayez créé un `header.php`) de sorte à ajouter:

   * un lien vers la page de connexion, quand l'utilisateur n'est pas connecté (pas
      présent en session).
   * un message de bienvenu, quand l'utilisateur est connecté, et un lien vers
     l'action de déconnexion.

1. Tester la connexion/déconnexion avec un couple login/password correct et un
incorrect.

</div>

### Sécurisation d'une page à accès réservé

On souhaite restreindre les actions de mise à jour et de suppression à
l'utilisateur actuellement authentifié.

<div class="exercise">

Modifier la vue de détail pour qu'elle n'affiche les liens vers la mise à jour
ou la suppression que pour l'utilisateur dont le login concorde avec celui
stocké en session.

**Conseil :** Pour faciliter la lecture du code, nous vous conseillons de créer
une fonction `is_user()`. Pour faire les choses proprement, on va créer un
fichier `lib/Session.php` contenant le code suivant que l'on inclura au
moment de `session_start()`.

```php?start_inline=1
class Session {
    public static function is_user($login) {
        return (!empty($_SESSION['login']) && ($_SESSION['login'] == $login));
    }
}
```

</div>

<div class="exercise">

**Attention :** Supprimer le lien n'est pas suffisant car un petit malin
pourrait accéder au formulaire de mise à jour d'un utilisateur quelconque en
rentrant manuellement l'action `update` dans l'URL.

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
suppression, *c-à-d* les actions `updated` et `delete`. Les autres sécurisations
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
portable, de sa carte bancaire, etc...  Nous allons ici nous baser sur la
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

À ce stade vous savez que votre utilisateur a saisi une adresse email d'un
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

1. Ajoutez une action `validate` au contrôleur `Utilisateur` qui récupère en GET
deux valeurs `login` et `nonce`.  Si le login correspond à un utilisateur
présent dans la base et que le `nonce` passé en GET correspond au `nonce`
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
fonctionnent en passant les variables dans l'URL comme un formulaire GET.  Nous
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
`https`. Cependant, la mise en place de cet infrastructure était jusqu'à présent
compliqué. Même si
[elle s'est simplifié considérablement récemment](https://letsencrypt.org/),
cela dépasse le cadre de notre cours.

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
