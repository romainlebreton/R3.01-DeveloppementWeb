---
title: TD7 &ndash; Cookies & sessions
subtitle: Panier et préférences
layout: tutorial
---

<!--
Mettre à jour le TD: En 2016-2017, il n'étaient pas assez avancé ni sur le TD ni
sur le projet pour faire les exercices correspondants
-->

<!--
Attention, si tout le monde fait session_start à l'IUT
alors tout le monde écrit le cookie PHPSESSID
et il peut poser des conflits entre les différents sites
-->

<!--
2ème explication :
stockage client et serveur (session non perm ou BDD)

schéma avec ce que fait le PHP avant d'exécuter le fichier


techniques : 2 actions lire et écrire/màj/supprimer (sans garantie)

scénarios:
- 1ère écriture cookie, pas dans $_COOKIE
- màj cookie, pas màj dans $_COOKIE


Rq: 
- décalage dans le temps
- peut stocker plusieurs cookies
- écrire sur $_COOKIE n'a aucun effet
- stocker tableau
- Si je ne refait pas de setcookie, est-ce que le cookie reste chez l'utilisateur ?
  Oui, car pas de setcookie = pas d'action sur le cookie (sauf si expiration)

---------------

Remarque : $_SESSION est écrit dans le fichier de session par du code PHP après
l'exécution de notre fichier


Rajouter schéma sur les cookies et les sessions ?

Si ils n'en sont pas à la question qui implémente plusieurs contrôleurs dans le
TD6 alors faire juste

Exo 1
ecrire cookie
lire cookie
lire cookie avec dev tools
supprimer cookier

Exo 2
Ecrire un tableau dans un cookie
lire cookie avec dev tools
Lire le tableau stocké dans le cookie

Exo 3
Démarrer une session
écrire une variable de session
lire une variable de session
Supprimer complètement une session (déconnecter)
Je leur ai fait un schéma au tableau pour réexpliquer les cookies (cf photo en pièce jointe)
Parmi les questions que j'ai essayé de soulever :

    est-ce que $_COOKIE se met à jour juste après un setcookie => non
    car $_COOKIE contient toujours le cookie déposé la fois d'avant
    En particulier, la première fois qu'on dépose un cookie, on y a pas accès dans $_COOKIE
    $_COOKIE peut contenir plusieurs champsi implémente plusieurs contrôleurs dans le TD6 alors faire juste

Rq :

Ecrire sur $_COOKIE n'a aucun effet

Les cookies restent d'un appel de page à l'autre car ils restent
stockés chez le client 
En particulier, ils ne sont pas réécrit à chaque fois.
L'action de setcookie est précisément de générer le SetCookie de
l'en-tête de la réponse.

Dire que les  deux actions sont séparées
envoi du cookie utilisateur par cookie dans GET et récupération
enregistrement/màj d'un cookie par SetCookie et setcookie

-->

<!--
Explication sur les sessions

session 
stocke où ?
à quoi sert le cookie
commande PHP 
- session_start()
  Si cookie PHPSESSID=xxx reçu alors lance la session pour cet id
  Sinon crée un cookie PHPSESSID=xxx (setcookie) et lance le mécanisme de session
- $_SESSION en lecture et écriture
  au moment du session_start charge $_SESSION avec le fichier sess_xxx
  Derrière les rideaux, après vos fichiers PHP, écris le contenu de $_SESSION dans le ficher sess_xxx

sécurité: donnée modifiable que par le serveur
pas de limite de taille

On peut se faire passer pour quelqu'un si on connait son PHPSESSID
=> HTTPS et paramétrisation des cookies par nom de domaine et chemin

Durée de vie par défaut des sessions

Suppression des sessions en 3 étapes. Attention: session_destroy() casse le
mécanisme de session. Pour accéder à nouveau aux variables de session, la
fonction session_start() doit être appelée de nouveau.

-->

## Les cookies

Un cookie est utilisé pour stocker une information spécifique à un utilisateur
comme :

* ses préférences sur un site (personnalisation de l'interface, ...),
* le contenu de son panier d'achat électronique,
* son identifiant de session (voir prochain TD sur les sessions).

Le cookie est un fichier qui est stocké directement sur la machine de
l'utilisateur (client HTTP) : il s'agit d'une table d'associations
nom/valeur.  
**Attention** : il ne faut pas stocker de données critiques dans les cookies car
elles sont stockées à la vue de tous chez le client !

 
### Déposer un cookie

Les cookies sont des informations stockées sur l'ordinateur du client à
l'initiative du serveur.

#### Comment fait le serveur pour demander au client d'enregistrer un cookie ?

D'un point de vue technique, voici ce qui se passe au niveau du protocole HTTP
(dont nous avons notamment parlé lors
[du cours 1]({{site.baseurl}}/classes/class1.html#protocole-de-communication--http)). Pour
stocker des informations dans un cookie chez le client, le serveur écrit dans
l'en-tête de sa réponse HTTP ; il écrit une ligne `Set-Cookie` par paire
nom/valeur comme suit :

```http
HTTP/1.1 200 OK
Date:Thu, 22 Oct 2015 15:43:27 GMT
Server: Apache/2.2.14 (Ubuntu)
Accept-Ranges: bytes
Content-Length: 5781
Content-Type: text/html
Set-Cookie: TestCookie1=valeur1; expires=Thu, 22-Oct-2015 16:43:27 GMT; Max-Age=3600
Set-Cookie: TestCookie2=valeur2; expires=Thu, 22-Oct-2015 16:43:27 GMT; Max-Age=3600

<html><head>...
```

C'est le navigateur qui stocke (ou pas) le cookie sur l'ordinateur du client. De
manière générale, le serveur n'a aucune garantie sur le comportement du client :
le cookie pourrait ne pas être enregistré (cookie désactivé chez l'utilisateur),
ou être altéré (valeur modifiée, date d'expiration changée ...).


#### Comment déposer un cookie en PHP ?

D'un point de vue pratique en PHP, on dépose un cookie à l'aide de la fonction
[`setcookie`](http://php.net/manual/fr/function.setcookie.php) qui se chargera
d'écrire la partie correspondante de l'en-tête de la réponse. Par exemple, la
ligne ci-dessous crée un cookie nommé `TestCookie` contenant la valeur `$value`
et qui expire dans 1h.

```php?start_inline=1
setcookie("TestCookie", $value, time()+3600);  /* expire dans 1 heure = 3600 secondes */
```


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

#### Comment le client transmet-il les informations de ses cookies ?

D'un point de vue technique, voici ce qui se passe au niveau du protocole HTTP.
Le client envoie les informations de ses cookies dans l'en-tête de ses
requêtes.


```http
GET /~rletud/index.html HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr
Cookie: TestCookie1=valeur1; TestCookie2=valeur2
```

#### Comment le serveur peut-il lire en PHP les cookies envoyés par le client ?

Le PHP traite juste l'information reçue pour la rendre disponible dans la
variable `$_COOKIE` de la même manière de `$_GET` récupère l'information dans
l'URL et que `$_POST` récupère l'information dans le corps de la requête (*cf.*
[le cours 1]({{site.baseurl}}/classes/class1.html#protocole-de-communication--http)).

D'un point de vue pratique, un cookie est donc récupéré du côté serveur à l'aide de
[`$_COOKIE`](http://php.net/manual/fr/reserved.variables.cookies.php) en PHP.

Par exemple:

```php?start_inline=1
echo $_COOKIE["TestCookie"];
```

#### Les cookies sont associés à des noms de domaines

Le navigateur n'envoie pas tous ses cookies à tous les sites. Déjà, le nom de
domaine est enregistré en même temps que les cookies chez le client pour se
souvenir de leur provenance. Le comportement normal d'un navigateur est
d'envoyer tous les cookies provenant des sous-domaines du domaine de la page Web
qu'il demande.

Par exemple, un cookie enregistré à l'initiative d'un site hébergé sur
`webinfo.iutmontp.univ-montp2.fr` sera disponible à tous les sites ayant ce
nom de domaine, et aussi aux sites de domaine `iutmontp.univ-montp2.fr` ou
`univ-montp2.fr`, mais pas aux autres domaines tels que `google.fr`.

Il est possible de préciser ce comportement en donnant plus de paramètres (nom
de domaine, chemin) à la fonction
[`setcookie`](http://php.net/manual/fr/function.setcookie.php).


### Effacer un cookie

Enfin pour effacer un cookie, il suffit de le faire expirer (en lui mettant une
date d'expiration inférieure à la date courante).

```php?start_inline=1
setcookie ("TestCookie", "", time() - 1);
```

C'est alors le navigateur du client qui se charge (normalement) de supprimer les
cookies périmés chez le client. Encore une fois, le serveur n’a aucune garantie
sur le comportement du client.

### Notes techniques 

1. La taille d'un cookie est limité à 4KB (car les en-têtes HTTP doivent être <4KB).

1. **Important** : Les cookies ne peuvent contenir que du texte, donc *a priori*
   pas des objets PHP. **Cependant** la fonction
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

1. Si vous ne spécifiez pas le temps d'expiration d'un cookie (3ème paramètre de
   `setcookie`) ou que vous le mettez à `0` alors le cookie sera supprimé à la
   fermeture du navigateur.

### Exercices sur l'utilisation des cookies

Dans le site de covoiturage, vous avez mis en place une redirection dans la page
`index.php` vers l'action `viewAll` du contrôleur `voiture`. Dans cet exercice,
nous allons permettre à chaque visiteur du site de configurer sur quelle page
il souhaite arriver par défaut lorsqu'il visite le site web.

<div class="exercise">

1. Créer un formulaire `preference.html` avec un champ `preference` de type
   *bouton radio* permettant de choisir `voiture`, `trajet` ou `utilisateur` comme
   page d'accueil et qui appelle le script `personalisation.php`.

4. Écrire le script `personalisation.php` qui récupère la valeur `preference` du
   formulaire et dépose sa valeur dans un cookie en utilisant le même nom de
   variable.

5. Verifier que ce cookie a bien été déposé (*cf.* les outils de développement
   expliqués dans la section "Notes techniques").

2. Dans votre menu, qui doit se trouver dans l'en-tête commune de chaque page,
   ajouter un lien qui pointe vers le formulaire `preference.html`.

3. Dans `routeur.php`, la valeur par défaut actuelle du contrôleur est
   `voiture`. Changeons cela pour tenir compte de l'information stockée dans le
   cookie :

   1. créez avant le choix du contrôleur une variable `$controller_default`
      initialisée à `voiture`,
   1. changez la valeur par défaut du contrôleur de `voiture` vers
      `$controller_default`,
   1. Au niveau de l'initialisation de `$controller_default`, vérifiez
      l'existence d'un cookie, et la présence dans ce cookie de la variable
      `preference`. Si elle est renseignée, modifiez le contenu de la variable
      `$controller_default` avec cette valeur.

5. Testez le bon fonctionnement de cette personalisation de la page d'acceuil en
choisissant autre chose que `voiture` dans le formulaire.

**Note :** Bien sûr, nous aurions dû intégrer les pages `preference.html` et
  `personalisation.php` dans notre MVC pour avoir un site propre. Elles feraient
  partie du MVC `Utilisateur` (que nous créerons dans le prochain TD).

</div>


<div class="exercise">

Dans votre site de projet, utilisez les cookies pour stocker le panier actuel du
visiteur.

**Aide :** Si vous ne savez pas stocker un tableau dans un cookie, c'est que
  vous avez lu trop rapidement la partie "Notes techniques".

</div>

## Les sessions 

Les sessions sont un mécanisme basé sur les cookies qui permet de stocker des
informations non plus du côté du client mais sur le serveur.  Le principe des
sessions est que la seule information stockée chez le client dans les cookies
est un identifiant unique (par défaut dans la variable nommée
`PHPSESSID`).

Lorsqu'il demande une page, le client envoie son cookie contenant son
identifiant (dans sa requête HTTP). Le serveur a stocké de son côté des
informations liées à cet identifiant, et il peut donc les retrouver à partir de
l'identifiant envoyé par le client.

<div class="centered">
<img alt="Schéma des sessions" src="{{site.baseurl}}/assets/session.png" width="60%">
</div>

Cela offre plusieurs avantages. Il n'y a plus de limite de taille sur les
données stockées côté client. Mais surtout, l'utilisateur ne peut plus tricher
en éditant lui même le contenu du cookie. Imaginons par exemple que l'on note si
l'utilisateur est administrateur dans la variable `isAdmin` d'un cookie. Alors
rien n'empêche l'utilisateur de modifier son cookie en passant le champ
`isAdmin` à la valeur `true`. Cependant, avec le mécanisme de sessions,
l'utilisateur n'a pas accès aux données qui lui sont associées.

### Opérations sur les sessions

Le maniement des valeurs de sessions est assez simple en PHP, on peut stocker
presque tout dans une variable de session : un chiffre, un texte, voir un objet
(il faut utiliser `serialize($o)` lors de la mise en session de l'objet `$o`,
puis `unserialize($o)` quand on le récupère de la session comme avec les
cookies).

*  **Dans toute page qui manipule les sessions**

   ```php?start_inline=1
   session_start();
   ```

   <!-- session_name("chaineUniqueInventeParMoi");  // Optionnel : voir section 3.2 -->

   [`session_start()`](http://php.net/manual/fr/function.session-start.php)
   démarre une nouvelle session ou reprend une session existante. Cette fonction
   est donc indispensable pour se servir des sessions (et donc pouvoir utiliser
   `$_SESSION`).

   **Attention :** Il faut mettre <!-- `session_name()` avant `session_start()`
     et --> `session_start()` avant toute écriture de code HTML dans la page
     pour la même raison qu'il faut mettre `setcookie()` avant les mêmes
     écritures (on doit écrire l'en-tête HTTP avant d'envoyer le corps de la
     réponse HTTP).

*  **Lire une variable de session**

   ```php?start_inline=1
   echo $_SESSION['login'];
   ```

   À la manière de `$_GET`, `$_POST` et `$_COOKIE`, la variable `$_SESSION`
   permet de lire les informations de sessions (stockées sur le disque dur du
   serveur et liées à l'identifiant de session).

*  **Mettre une variable en session**

   ```php?start_inline=1
   $_SESSION['login'] = 'remi';
   ```

   **Nouveauté :** Contrairement à `$_GET`, `$_POST` et `$_COOKIE`, la variable
   `$_SESSION` est aussi une variable d'écriture : elle permet d'écrire des
   informations de sessions.

*  **Vérifier qu'une variable existe en session**

   ```php?start_inline=1
   if (isset($_SESSION['login'])) { /*do something*/ }
   ```
   
*  **Supprimer une variable de session**

   ```php?start_inline=1
   unset($_SESSION['login']);
   ```

   Comme la variable `$_SESSION` est aussi en écriture, alors le fait de vider
   l'un de ses champs fera que ce champ sera aussi effacé des données de session
   sur le disque dur.

*  **Suppression complète d'une session**

   ```php?start_inline=1
   session_unset();     // unset $_SESSION variable for the run-time 
   session_destroy();   // destroy session data in storage
   // Il faut réappeler session_start() pour accéder de nouveau aux variables de session
   setcookie(session_name(),'',time()-1); // deletes the session cookie containing the session ID
   ```

   Pour le dire autrement :

   * `session_unset()` vide le tableau `$_SESSION` en faisant
   `unset($_SESSION['name_var'])` pour tous les champs `name_var` de
   `$_SESSION`,
   * `session_destroy()` supprime le fichier de données associées à la session
   courante qui étaient enregistrées sur le disque dur du serveur,
   * `setcookie` demande au client de supprimer son cookie de session (sans garantie).

<!-- ### Le cas particulier des sessions en hébergement mutualisé -->

<!-- Dans le cas d'un hébergement mutualisé, (comme à l'IUT) deux répertoires -->
<!-- différents par exemple -->
<!-- [http://webinfo.iutmontp.univ-montp2.fr/~mon_login](http://webinfo.iutmontp.univ-montp2.fr/~mon_login) -->
<!-- et -->
<!-- [http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin) -->
<!-- sont vus comme un seul site web, alors qu'il s'agit en réalité de deux sites web -->
<!-- différents.  De ce fait, si vous utilisez exactement le même nom de variable de -->
<!-- session, il est possible que s'authentifier sur -->
<!-- [http://webinfo.iutmontp.univ-montp2.fr/~mon_login](http://webinfo.iutmontp.univ-montp2.fr/~mon_login) -->
<!-- vous permette de contourner l'authentification de -->
<!-- [http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin). -->

<!-- Afin d'éviter ces désagréments, il suffit d'utiliser un nom de variable de -->
<!-- session qu'on ne puisse deviner avec l'instruction -->
<!-- `session_name("chaineUniqueInventeParMoi");` que vous appellerez de manière -->
<!-- systématique, avant chaque appel à `session_start();`. Cela a pour effet de -->
<!-- remplacer le nom de la variable unique `PHPSESSID` en -->
<!-- `chaineUniqueInventeParMoi`. -->

<!-- TODO : tester que cela sépare bien les fichiers de session ! -->
<!-- DIRE que l'on peut faire des sessions sans cookie - mais pas pratique ? -->

### Où sont stockées les sessions ?

Les sessions sont stockées sur le disque dur du serveur web, par exemple avec
LAMP dans le dossier `/var/lib/php5/sessions` (il faut être `root` pour y
accéder). Reportez-vous à la partie `session` de la fonction `phpinfo()` pour
connaître ce chemin.

**Exemple :** Si mon identifiant de session est `PHPSESSID=aapot` et si mon code PHP est le suivant

```php?start_inline=1
$_SESSION['login'] = "rlebreton";
$_SESSION['isAdmin'] = "1";
```

alors le fichier `/var/lib/php5/sessions/sess_aapot` contient

```
login|s:9:"rlebreton";isAdmin|s:1:"1";
```

### Expiration des sessions

#### Durée de vie d'une session

Par défaut, une session est supprimée à la fermeture du navigateur. Ceci est dû
au délai d'expiration du cookie de l'identifiant unique `PHPSESSID` qui est par
défaut `0`. Or nous avons vu dans la section sur les cookies que cela entraîne
l'expiration du cookie à la fermeture du navigateur.

Vous pouvez changer cela en modifiant la variable de configuration
`session.cookie_lifetime` qui gère le délai d'expiration du cookie. La fonction
[`session_set_cookie_params()`](http://php.net/manual/en/function.session-set-cookie-params.php)
permet de régler facilement cette variable.

Ceci peut être utile si vous souhaitez que votre panier stocké avec des sessions
soit conservé disons 30 minutes, même en cas de fermeture du navigateur.

#### Comment rajouter un timeout sur les sessions

La durée de vie d'une session est liée à deux paramètres. D'une part, le délai
d'expiration du cookie permet d'effacer l'identifiant unique côté client (sans
garantie). D'autre part, une variable de PHP permet de définir un délai
d'expiration aux fichiers de session (`session.gc_maxlifetime`) qui dira que le
fichier **peut** être supprimé à partir d'un certain délai. Cependant, aucune de
ces techniques n'offre de réelle garantie de suppression de la session après le
délai imparti.

La seule manière sûre de bien gérer la durée de vie d'une session est de stocker
la date de dernière activité dans la session :

```php?start_inline=1
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > (30*60))) {
    // last request was more than 30 minutes ago
    session_unset();     // unset $_SESSION variable for the run-time 
    session_destroy();   // destroy session data in storage
}
$_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
```

Nous recommandons de mettre un délai d'expiration correspondant au
`session.cookie_lifetime` (si celui-ci est non nul).

Référence : [Stackoverflow](http://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes)

<!--
Note technique :

Si les cookies ne sont pas utilisés, le PHPSESSID peut être passé en GET (et en
POST ?)
Alors il y a un risque de "session fixation"
-->

### Exercice sur les sessions

<div class="exercise">

Nous souhaitons rajouter dans le cookie l'information du prix du panier en plus
du panier lui-même. Comme cette information est sensible et que nous ne voulons
pas que l'utilisateur puisse modifier le prix total de son panier, nous allons
la stocker avec des sessions.

1. Mettez en place le mécanisme de session : démarrer la session dans
   `index.php` pour que toutes les pages puissent l'utiliser et que le démarrage
   intervienne avant que l'on écrive du HTML.

1. Passez toute l'information du panier dans la session.

1. Calculez le prix du panier à chaque appel de la page et inscrivez-le dans la
   session.

1. Faites en sorte que le panier s'efface de lui-même après un temps donné. Ce
   délai sera d'abord de 1 minute à des fins de test puis passez-le à 10 minutes
   quand cela marche.

</div>
