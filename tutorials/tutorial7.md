---
title: TD7 &ndash; Cookies & sessions
subtitle: Panier ?
layout: tutorial
---

<!--## Idées pour le TD

EDT prévisionnel :

* 2  Nov - Cookie & session + 1h projet
* 16 Nov - authentification back-office +  projet
* 23 Nov - email +  projet

Ajouter une note sur l'upload de fichiers par formulaire comme une image de
profil par exemple le 23 Nov ?

Idées pour développer un TD sur cookies sessions :

* formulaire de préférence pour choix par défaut du contrôleur et de l'action

* panier pour leur site marchand
-->

<!--## Notes de Romain

**Explications techniques :** Certaines sont à rajouter, d'autres à laisser en
  commentaires pour nous

Rajouter plus d'explications générales sur les cookies et les sessions :
-->

## Les cookies

Un cookie est utilisé pour stocker une information spécifique sur l'utilisateur,
comme les préférences d'un site ou, dans certains cas, le contenu d'un panier
d'achat électronique.  Le cookie est un fichier qui est stocké directement sur
la machine de l'utilisateur, il s'agit d'associations nom/valeur. Attention : il
ne faut pas stocker de données critiques dans les cookies car elles sont
stockées à la vue de tous chez le client !


Les utilisations les plus classiques visent à maintenir une information liée à
l'utilisateur/visiteur entre ses différentes visites sur le site:
   
* stockage de son panier courant, 
* personnalisation de l'interface,
* mécanisme de session (voir la section suivante) ...

 
<!--  
>Common uses include session tracking, maintaining data across multiple visits,
>holding shopping cart contents, storing login details, and more.
-->

### Déposer un cookie

Les cookies sont des informations stockées sur l'ordinateur du client à
l'initiative du serveur.

D'un point de vue pratique en PHP, on dépose un cookie à l'aide de la fonction
[`setcookie`](http://php.net/manual/fr/function.setcookie.php). Par exemple, la
ligne ci-dessous crée un cookie nommé `TestCookie` contenant la valeur `$value`
et qui expire dans 1h.

~~~
setcookie("TestCookie", $value, time()+3600);  /* expire dans 1 heure = 3600 secondes */
~~~
{:.php}

D'un point de vue technique, voici ce qui se passe au niveau du protocole HTTP
(dont nous avons déjà parlé lors du TD1 dans
[ses notes complémentaires]({{site.baseurl}}/assets/tut1-complement.html)). Pour
stocker des informations dans un cookie chez le client, le serveur écrit une
ligne `Set-Cookie` dans l'en-tête de sa réponse par cookie comme suit :

~~~
HTTP/1.1 200 OK
Date:Thu, 22 Oct 2015 15:43:27 GMT
Server: Apache/2.2.14 (Ubuntu)
Accept-Ranges: bytes
Content-Length: 5781
Content-Type: text/html
Set-Cookie: TestCookie1=valeur1; expires=Thu, 22-Oct-2015 16:43:27 GMT; Max-Age=3600
Set-Cookie: TestCookie2=valeur2; expires=Thu, 22-Oct-2015 16:43:27 GMT; Max-Age=3600

<html><head>...
~~~
{:.http}

<!-- The Max-Age attribute defines the lifetime of the  cookie, in seconds. -->
<!-- The Expires attribute indicates the maximum lifetime of the cookie, -->
<!-- represented as the date and time at which the cookie expires. -->

**Attention :** la fonction setcookie() doit être appelée avant tout écriture de
la page HTML. Le protocole HTTP impose cette restriction.  
**Pourquoi ?** *(Optionnel)* Le Set-Cookie est une information envoyé dans l'en-tête de la
réponse. Et le corps de la réponse HTTP, c'est-à-dire la page HTML, doit être
envoyée après son en-tête. Or PHP écrit et envoie la page HTML dans le corps de la
réponse HTTP au fur et à mesure.

Référence : [La RFC des cookies](http://tools.ietf.org/html/rfc6265)

### Récupérer un cookie

Après qu'un cookie ait été déposé chez un client par le serveur par l'opération
précédente, le navigateur du client envoie les informations du cookie à chaque
demande de page.

D'un point de vue pratique, un cookie est récupéré du côté serveur à l'aide de
[`$_COOKIE`](http://php.net/manual/fr/reserved.variables.cookies.php) en PHP.
Par exemple:

~~~
echo $_COOKIE["TestCookie"];
~~~
{:.php}

D'un point de vue technique, voici ce qui se passe au niveau du protocole HTTP.
Le client envoie les informations de ses cookies dans l'en-tête de ses
requêtes. Le PHP traite juste l'information reçue pour la rendre disponible dans
la variable `$_COOKIE` de la même manière de `$_GET` récupère l'information dans
l'URL et que `$_POST` récupère l'information dans le corps de la requête (*cf.*
[les notes complémentaires du TD1]({{site.baseurl}}/assets/tut1-complement.html)).

~~~
GET /~rletud/index.html HTTP/1.1
host: infolimon.iutmontp.univ-montp2.fr
Cookie: TestCookie1=valeur1; TestCookie2=valeur2
~~~
{:.http}

Il y a une restriction sur les cookies auquel un site peut accéder : le client
n'envoie que les cookies provenant du même nom de domaine que le serveur. Dit
autrement, un cookie envoyé par un site hébergé sur
`infolimon.iutmontp.univ-montp2.fr` ne sera accessible qu'aux sites ayant le
même nom de domaine `univ-montp2.fr`. Il est possible de préciser le nom du
serveur en donnant plus de paramètres à la fonction
[`setcookie`](http://php.net/manual/fr/function.setcookie.php).

Pour cela, le nom de domaine est enregistré en même temps que les cookies chez
le client.

### Effacer un cookie

Enfin pour effacer un cookie, il suffit de le faire expirer (en lui mettant une
date d'expiration inférieure à la date courante).

~~~
setcookie ("TestCookie", "", time() - 1);
~~~
{:.php}

C'est alors le navigateur du client qui se charge (normalement) de supprimer les
cookies périmés chez le client.

### Notes techniques 

<!-- Limitations:  -->
<!-- Pourquoi n'est ce pas une bonne idée de poser des données sensibles, telles que les données -->
<!-- liées à l'authentification de l'utilisateur dans des cookies ?  -->

<!-- * la durée de vie d'un cookie  -->

1. La taille d'un cookie est limité à 4KB (car les en-têtes HTTP doivent être <4KB).

1. Les cookies ne peuvent contenir que du texte, donc *a priori* pas des objets
   PHP. **Cependant** la fonction
   [`serialize`](http://php.net/manual/fr/function.serialize.php) de PHP permet
   de transformer n'importe quelle valeur PHP en texte que l'on pourra donc
   stocker dans le cookie. Il faudra donc appliquer l'opération inverse
   `unserialize` lorsque l'on récupère le cookie.

   <!-- http://stackoverflow.com/questions/1969232/allowed-characters-in-cookies -->
   <!-- Quels caractères peuvent contenir les cookies ? alphanumérique ? ASCII ? -->

1. Pour voir les cookies déposés sur votre navigateur, voici comment faire :

   * sous Firefox, allez dans Préférences &#8594; Vie Privé &#8594; Historique
   &#8594; Supprimer des cookies spécifiques.
   * sous Chrome, l'accès est plus simple ; allez dans les outils développeurs
   (avec `F12`) &#8594; Onglet Ressources &#8594; Cookies.


## Exercice sur l'utilisation des cookies

Dans le site de covoiturage, vous avez mis en place une redirection dans la page
`index.php` vers l'action `viewAll` du contrôleur `voiture`. Dans cet exercice,
nous allons permettre à chaque visiteur du site de configurer sur quelle page
il souhaite arriver par défaut lorsqu'il visite le site web.

<div class="exercise">

1. Créer un formulaire `preference.html` avec un champ `preference` de type
   checkbox permettant de choisir `voiture`, `trajet` ou `utilisateur` comme
   page d'accueil et qui appelle le script `personalisation.php`.

4. Écrire le script `personalisation.php` qui récupère la valeur `preference` du
   formulaire et dépose sa valeur dans un cookie en utilisant le même nom de
   variable.

5. Verifier que ce cookie a bien été déposé (*cf* la section Notes technique).

2. Dans votre menu, qui doit se trouver dans l'en-tête commune de chaque page,
   ajouter un lien qui pointe vers le formulaire `preference.html`.

3. Dans la page d'accueil du site `index.php`, créez une variable
   `$controleur_default` initialisée à `voiture`. Puis vérifiez l'existence d'un
   cookie, et la présence dans ce cookie de la variable `preference`. Si elle
   est renseignée, modifiez le contenu de la variable `$controleur_default`.  
   Enfin redirigez l'utilisateur vers la page de son choix. 

5. Testez le bon fonctionnement de cette personalisation de la page d'acceuil en
choisissant autre chose que `voiture` dans le formulaire.

**Note :** Bien sûr, nous aurions dû intégrer les pages `preference.html` et
  `personalisation.php` dans notre MVC pour avoir un site propre.

</div>


<div class="exercise">

Dans votre site de projet, utilisez les cookies pour stocker le panier actuel du
visiteur.

</div>

## Les sessions 

Les sessions sont un mécanisme basé sur les cookies qui permet de stocker des
informations non plus du côté du client mais sur le serveur.  Le principe des
sessions est que la seule information stockée chez le client dans les cookies
est un identifiant unique (par défaut dans la variable `PHPSESSID`). Lors de sa
requête, le client envoie son cookie avec son identifiant, et le serveur a
stocké de son côté des informations liés à cet identifiant.

<div class="centered">
<img alt="Schéma des sessions" src="{{site.baseurl}}/assets/session.png" width="60%">
</div>

Cela offre plusieurs avantages. Il n'y a plus de limite de taille sur les
données stockées côté client. Mais surtout, l'utilisateur ne peut plus tricher
en éditant lui même le contenu du cookie. Par exemple, imaginons que l'on note
si l'utilisateur est administrateur dans la variable `isAdmin` d'un
cookie. Alors rien n'empêche l'utilisateur de modifier son cookie en passant le
champ `isAdmin` à la valeur `true`. Cependant, avec le mécanisme de sessions,
l'utilisateur n'a pas accès aux données qui lui sont associées.

### Opérations sur les sessions

Le maniement des valeurs de sessions est assez simple en PHP, on peut stocker
presque tout dans une variable de session : un chiffre, un texte, voir un objet
(il faut utiliser `serialize($o)` lors de la mise en session de l'objet `$o`,
puis `unserialize($o)` quand on le récupère de la session comme avec les
cookies).

<!-- session_name remplace le nom de la variable du cookie qui contient l'ID
unique, qui est PHPSESSID par défaut -->

*  **Dans toute page qui manipule les sessions**

   ~~~
   session_name("chaineUniqueInventeParMoi");  // Optionnel : voir section 3
   session_start();
   ~~~
   {:.php}


   **Attention :** Il faut mettre `session_start()` avant toute écriture de code
     HTML dans la page (pour la même raison qu'il faut mettre `setcookie()` avant
     les mêmes écritures).

*  **Mettre une variable en session**

   ~~~
   $_SESSION['login'] = 'remi';
   ~~~
   {:.php}

*  **Vérifier qu'une variable existe en session**

   ~~~
   if (!empty($_SESSION['login'])) {//do something}
   ~~~
   {:.php}

*  **Destruction des variables en session**

   ~~~
   session_unset();     // unset $_SESSION variable for the run-time 
   session_destroy();   // destroy session data in storage
   ~~~
   {:.php}



### Le cas particulier des sessions en hébergement mutualisé

Dans le cas d'un hébergement mutualisé, (comme à l'IUT) deux répertoires
différents par exemple
[http://infolimon.iutmontp.univ-montp2.fr/~mon_login](http://infolimon.iutmontp.univ-montp2.fr/~mon_login)
et
[http://infolimon.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://infolimon.iutmontp.univ-montp2.fr/~le_login_du_voisin)
sont vus comme un seul site web, alors qu'il s'agit en réalité de deux sites web
différents.  De ce fait, si vous utilisez exactement le même nom de variable de
session, il est possible que s'authentifier sur
[http://infolimon.iutmontp.univ-montp2.fr/~mon_login](http://infolimon.iutmontp.univ-montp2.fr/~mon_login)
vous permette de contourner l'authentification de
[http://infolimon.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://infolimon.iutmontp.univ-montp2.fr/~le_login_du_voisin).

Afin d'éviter ces désagréments, il suffit d'utiliser un nom de variable de
session qu'on ne puisse deviner avec l'instruction
`session_name("chaineUniqueInventeParMoi");` que vous appellerez de manière
systématique, avant chaque appel à `session_start();`.

<!-- TODO : tester que cela sépare bien les fichiers de session ! -->
<!-- ICI : dire que cela remplace PHPSESSID comme nom de var dans les cookies -->
<!-- DIRE que l'on peut faire des sessions sans cookie - mais pas pratique ? -->

### Où sont stockées les sessions ?

Les sessions sont stockées sur le disque dur du serveur web, par exemple avec
LAMP dans le dossier `/var/lib/php5/sessions` (il faut être `root` pour y
accéder). Reportez-vous à la partie `session` de la fonction `phpinfo()` pour
connaître ce chemin.

**Exemple :** Si mon identifiant de session est `PHPSESSID=aapot` et si mon code PHP est le suivant

~~~
$_SESSION['login'] = "rlebreton";
$_SESSION['isAdmin'] = "1";
~~~
{:.php}

alors le fichier `/var/lib/php5/sessions/sess_aapot` contient

~~~
login|s:9:"rlebreton";isAdmin|s:1:"1";
~~~

### Comment rajouter un timeout sur les sessions

La durée de vie d'une session est liée à deux paramètres. D'une part, le délai
d'expiration du cookie permet d'effacer l'identifiant unique côté
client. D'autre part, une variable de PHP permet de définir un délai
d'expiration aux fichiers de session. Cependant, aucune de ces techniques
n'offre de réelle garantie.

La seule manière sûre de gérer la durée de vie d'une session est de stocker la
date de dernière activité dans la session :

~~~
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) {
    // last request was more than 30 minutes ago
    session_unset();     // unset $_SESSION variable for the run-time 
    session_destroy();   // destroy session data in storage
}
$_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
~~~
{:.php}

Nous recommandons de mettre un délai d'expiration correspondant au cookie avec `setcookie` (ici 1800 secondes).

Référence : [Stackoverflow](http://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes)

<!--
Note technique :

Si les cookies ne sont pas utilisés, le PHPSESSID peut être passé en GET (et en
POST ?)
Alors il y a un risque de "session fixation"
-->


--------------

<!-- sans Authentification et ni BackOffice pour le premier TD -->

## Modification du Modèle Utilisateur

<div class="exercise">

Nous allons commencer par modifier la table utilisateur en lui ajoutant une
colonne `VARCHAR(64) mdp` stockant son mot de passe.

**Plus d'explications :** Étant donné que nous allons utiliser une fonction de
cryptage pour stocker ce mot de passe, vous devez prévoir une taille de champ
correspondant à la taille du mot de passe crypté et non de la taille du mot de
passe lui-même (64 caractères pour SHA-256).

</div>

<div class="exercise">

Modifier la vue `viewCreateUtilisateur.php` pour ajouter deux champs de mot de
passe au formulaire.  Le deuxième champ mot de passe sert à valider le premier.

</div>

<!-- Erreur commune : oubli input type=''password'' laisse value='$m' -->

<div class="exercise">

Modifier les actions `save` puis `updated` du contrôleur
`ControlleurUtilisateur.php` pour sauver dans la base le mot de passe de
l'utilisateur.  Vérifier que les deux champs coïncident.

</div>

Comme mentionné ci-dessus, on ne stocke jamais le mot de passe en clair dans la
base, mais sa version cryptée:

~~~
<?php
$mot_passe_en_clair = 'apple';
$mot_passe_crypte = hash('sha256', $mot_passe_en_clair);
echo $mot_passe_crypte;  
//affiche '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b'
?>
~~~

{:.php}


Pour éviter les attaques de type dictionnaire, qui permettent de retrouver le
mot de passe original à partir de la chaîne de caractères cryptée, on va
concaténer une chaîne de caractères aléatoire fixe à la fin de notre mot de
passe.

<div class="exercise">

Recopier le code suivant dans le fichier `Conf.php`. Ce code stocke votre chaîne
aléatoire dans une variable `static` qui sera accessible par la méthode statique
`Conf::getSeed()`.

~~~
private static $seed = 'une chaine aleatoire fixe';

static public function getSeed() {
   return self::$seed;
}
~~~
{:.php}

</div>

<div class="exercise">

Modifier les actions `save` puis `updated` du contrôleur
ControlleurUtilisateur.php pour sauver dans la base la version SHA-256 de la
racine concaténée au mot de passe de l'utilisateur.

</div>

Les autres vues et actions du contrôleur ne sont pas impactées par la
modification car le mot de passe n'a pas vocation à être affiché.

À l'heure actuelle, le mot de passe transite en clair dans l'URL. Vous
conviendrez facilement que ce n'est pas top. Nous allons donc passer nos
formulaires en méthode POST.

Il faudrait donc maintenant récupérer les variables à l'aide de `$_POST` et
non `$_GET`. Cependant, nos liens internes, tels que 'Détails' ou 'Mettre à
jour' fonctionnent en passant les variables dans l'URL comme un formulaire GET.
Nous avons donc besoin d'être capable de récupérer les variables automatiquement
dans `$_POST` ou le cas échéant dans `$_GET`.

<div class="exercise">

Créer dans le dispatcher une fonction `myGet($nomvar)` qui retournera `$_GET[$nomvar]` s'il est défini, ou `$_POST[$nomvar]` s'il est défini, ou sinon `NULL`.

</div>

<div class="exercise">
Remplacer tous les `$_GET` de `dispatcher.php`, `ControllerUtilisateur.php` et `ControllerTrajet.php` par des appels à `myGet`.

Remplacer les tests du type `isset($_GET['login'])` par `!is_null(myGet('login'))`.


**Aide :** Utiliser la fonction de remplacement `Ctrl+H` de NetBeans pour vous aider.
</div>

<!-- On peut enfin changer la méthode de notre formulaire -->
<!-- `viewCreateUtilisateur.php`. -->

<div class="exercise">
Passer le formulaire de viewCreateUtilisateur.php en méthode POST.
</div>

## Sécurisation d'une page avec les sessions


Pour accéder à une page réservée, un utilisateur doit s'authentifier.
Une fois authentifié, un utilisateur peut accéder à toutes les pages
réservées sans avoir à retaper son mot de passe.

Il faut donc faire circuler l'information "s'être authentifié" de pages en pages.

On pourrait faire ceci grâce à un champ caché dans un formulaire,
mais ça ne serait absolument pas sécurisé. Nous allons donc utiliser les sessions.


### Page de connexion

<div class="exercise">

Créer une vue `viewConnectUtilisateur.php` qui comprend un formulaire avec deux
, l'un pour le login, l'autre pour le mot de passe. Ce formulaire appelle
l'action `connected` du contrôleur de Utilisateur.

Ajouter une action `connect` qui affiche ce formulaire dans
`ControlleurUtilisateur.php`.

</div>

<div class="exercise">

Démarrez la session au début du dispatcher.

</div>

<div class="exercise">

Ajouter une action `connected` dans le contrôleur de Utilisateur, qui vérifie
que le couple (login / passwd) correspond à un utilisateur existant et qui, si
oui, met le login de l'utilisateur en session. Affichons par défaut la vue de
détail de l'utilisateur qui vient de se connecter.


**Aide :** 

1. Utilisez la fonction `ModelUtilisateur::selectWhere($data)` qui fait un
   select sur les champs de `$data` (ici 'login' et 'mdp'). En effet, la
   fonction de base `ModelUtilisateur::select($data)` ne sert qu'à récupérer un
   utilisateur étant donné son login.
1. Notez que `ModelUtilisateur::selectWhere($data)` renvoie un **tableau
   d'utilisateurs**. Il faudra donc tester si le tableau est vide avec
   `count()`. De plus, la vue find a besoin que l'on initialise une variable
   d'utilisateur `$u` contenant l'utilisateur.
1. Enfin, n'oubliez pas de hasher le mot de passe convenablement.

</div>

<div class="exercise">

Ajouter une action `deconnect` dans le contrôleur de Utilisateur, qui détruit la
session en cours.  Une fois déconnecté, on renvoie l'utilisateur sur la page
d'accueil du site.

</div>

<div class="exercise">

Modifier le `header.php` de sorte à ajouter:

* un lien vers la page de connexion, quand l'utilisateur n'est pas connecté (pas
   présent en session).
* un message de bienvenu, quand l'utilisateur est connecté, et un lien vers
  l'action de déconnexion.

Tester la connexion/déconnexion avec un couple login/passwd correct et un
incorrect.

</div>

### Sécurisation d'une page à accès réservé

On souhaite restreindre les actions de mise à jour et de suppression qu'à
l'utilisateur actuellement authentifié.

<div class="exercise">

Modifier la vue de détail pour qu'elle n'affiche les liens vers la mise à jour
ou la suppression que si le login concorde avec celui stocké en session.

**Conseil :** Pour faciliter la lecture du code, nous vous conseillons de créer
une fonction `is_user()`. Pour faire les choses proprement, on va créer un
fichier `config/Session.php` contenant le code suivant que l'on inclura au
moment de `session_start()`.

~~~
class Session {
    public static function is_user($login) {
        return (!empty($_SESSION['login']) && ($_SESSION['login'] == $login));
    }
}
~~~
{:.php}

</div>

Cette modification n'est pas suffisante car un petit malin pourrait accéder à la suppression d'un utilisateur quelconque en rentrant l'action delete dans l'URL.

<div class="exercise">

Modifier les actions update et updated du contrôleur de Utilisateur de sorte que
si le login pour lequel une modification est demandé ne concorde pas avec celui
stocké en session, on redirige l'utilisateur sur la page de connexion.

</div>

<div class="exercise">

Sécuriser l'accès à l'action de suppression d'un utilisateur. 

</div>

<!--
### Super administrateur

<div class="exercise">

Ajouter un champ admin de type boolean à la table Utilisateur. 

</div>

<div class="exercise">

Modifier l'action connected de `ControllerUtilisateur.php` pour enregistrer dans
la session si l'utilisateur est un administrateur ou non.

</div>

<div class="exercise">

Modifier les actions update`ControllerUtilisateur.php` de sorte qu'un
utilisateur de type admin ait tous les droits sur toutes les actions de tous les
utilisateurs.

**Conseil :** Pour faciliter la lecture du code, nous vous conseillons de
  compléter le fichier `config/Session.php` avec la fonction `is_admin` :

~~~
public static function is_admin() {
    return (!empty($_SESSION['admin']) && $_SESSION['admin']);
}
~~~
{:.php}

</div>



<div class="exercise">

Modifier la vue de mise à jour pour que, si l'utilisateur authentifié est un
administrateur, il puisse promouvoir à l'aide d'une checkbox l'utilisateur que
l'on met à jour en administrateur.

</div>


 <div class="exercise"> 
  Modifier l'action update du contrôleur Utilisateur de sorte à rediriger sur la bonne vue viewUpdateAdminUtilisateur.php 
 ou viewUpdateUtilisateur.php selon que l'utilisateur connecté est un "admin ou non". 
  </div> 

Attention, il ne suffit pas de contrôler que l'utilisateur est un administrateur
dans les vues. Un petit malin pourrait quand même accéder au actions du
contrôleur et faire des dégâts.

<div class="exercise">

[^nbp]: vous avez donc le droit à modifier le code HTML, ce qui peut se faire côté client !

Sans toucher le code PHP[^nbp], hacker votre propre site en
permettant à un utilisateur non admin de se passer lui même en admin.

</div>

<div class="exercise">

Corriger cette faille de sécurité.

**Indice :** Modifier l'action updated dans le controlleur.

</div>



## Enregistrement avec une adresse email valide

Dans beaucoup de sites Web, il est important de savoir si un utilisateur est
bien réel. Pour se faire on peut utiliser une vérification de son numéro de
portable, de sa carte bancaire, etc...  Nous allons ici nous baser sur la
vérification de l'adresse email.

<div class="exercise">

Dans votre formulaire de création d'un utilisateur, vous vérifiez actuellement
le format de l'adresse email côté client avec du HTML5 (ou du JavaScript),
hacker votre propre site de sorte

</div>

Vous devriez en conclure que les contrôles côté client (navigateur) offrent un
confort d'affichage mais ne constituent en aucun cas, une sécurisation de votre
site !

<div class="exercise">

Dans l'action create du contrôleur Utilisateur, vérifier le format de l'adresse
email de l'utilisateur.

</div>

A ce stade vous savez que votre utilisateur a saisi une adresse email d'un
format valide. Nous allons maintenant vérifier que cette adresse existe
réellement et qu'elle appartient bien à notre utilisateur.

Pour se faire, nous allons lui envoyer un mail et ne valider l'utilisateur
(l'autoriser à se connecter) que s'il a consulté le mail que nous lui avons
envoyé.


-->
<!-- Dans le TD 2, vous avez vu comment vérifier qu'un  texte a le format d'une -->
<!-- adresse email valide.  Mais vous n'avez pas garanti que cette adresse email -->
<!-- existe réellement, ni que son propriétaire est bien la personne en train de -->
<!-- s'enregistrer sur votre site. 

<div class="exercise">

Ajouter un champs de type VARCHAR[32] à la table utilisateur.

</div>

<div class="exercise">

Modifier l'action connect du contrôleur Utilisateur, de sorte d'accepter la
connexion uniquement si ce  validation is NULL.

</div>

<div class="exercise">

Ajouter une action validate au contrôleur Utilisateur, qui récupère en GET, le
login de l'utilisateur, et une chaîne de caractère nommée "validate".  Si le
login correspond à un utilisateur présent dans la base, et que la chaîne
"validate" passée en GET correspond à celle stockée dans la base, mettre à jour
le tuple correspondant dans le la table Utilisateur en mettant à NULL le champs
'validate".

</div>

<div class="exercise">

Dans l'action create du contrôleur Utilisateur, générez un identifiant unique
avec la fonction uniqid() ( [http://php.net/manual/fr/function.uniqid.php](http://php.net/manual/fr/function.uniqid.php) )
que vous stocker en base.

Puis envoyer un email à l'adresse qu'il a renseigné, contenant dans le corps du
message le lien (avec les paramètres en GET) vers l'action validante du
contrôleur Utilisateur.

</div>

<div class="exercise">

Puis envoyez lui un mail contenant un lien de validation (utilisant cette
chaîne). vérifier le format de l'adresse email de l'utilisateur.

Pour ce faire vous aller utiliser la fonction mail() de PHP. **Abuser de cette
fonction serait considéré comme une violation de la charte d'utilisation des
ressources informatiques de l'IUT et vous exposerait à des sanctions !**.
 
Pour éviter d'être blacklistés des serveurs de mail, nous allons envoyer
uniquement des emails dans le domaine *yopmail.com*, dont le fonctionnement est
le suivant, un mail envoyé à `bob@yopmail.com` est immédiatement lisible
sur [http://bob.yopmail.com](http://bob.yopmail.com).

</div>
-->

<!--

## Autres sécurisations:

Le fait de crypter les mots de passe (ou les numéros de carte de crédit) dans la
base de données évite qu'un accès en lecture à la base (suite à une faille de
sécurité) ne permettent à l'attaquant de récupérer toutes les données de tous
les utilisateurs.

On peut aussi crypter le mot de passe sur le navigateur. Dans ce cas une attaque
du tiers-écouteur (type **Man in the middle**) ne permet pas d'obtenir le
mot de passe en clair de l'utilisateur. Mais puisque l'authentification repose
sur le mot passe crypté, le tiers peut s'authentifier avec le mot de passe
crypté, qu'il a récupéré.

La seule façon fiable de sécuriser une application web est le recours au
cryptage de l'ensemble des communications entre le client (browser) et le
serveur, via l'utilisation du protocole `ssl` sur `http`, à savoir
`https`.

-->

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


<!--   ------- FIN DU TD DE L'AN DERNIER -----------
Je me suis arreté là pour le moment, je reprends après le diner avec les italiens. 

* **authentification.php** est la page appelée par le formulaire d'authentification
 
~~~
<?php
session_start(); //premiere instruction de toute page manipulant une session
/*
 * Récupération des login/passwd en POST
 * Vérification dans la base 
 * remplissage de la variable $is_ok
 */
$is_ok = true;

if ($is_ok) {
	$_SESSION['login'] = 'remi';
	echo "Vous etes authentifie";
}
?> 
~~~
{:.php}

* **une_page_reserve.php** : Une page a accès restreint aux seuls utilisateurs
  authentifiés.

~~~
<?php
require 'est_autorise.php';  //require et pas include 

echo "Vous etes sur une page reserve</br>";
$login = $_SESSION['login'];
echo "Bonjour $login";
?>
~~~
{:.php}

* **est_autorise.php** Le script qui est requis par toutes les pages a accès réservé. 

~~~
<?php
session_start();
if ((isset($_SESSION['login'])) && (!empty($_SESSION['login']))) {
	//do nothing
}
else {
	// pas de login en session : redirection sur la page public
	header('Location: page_public.php'); 	
}
?>
~~~
{:.php}
-->

