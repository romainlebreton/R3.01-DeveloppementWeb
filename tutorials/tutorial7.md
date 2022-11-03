---
title: TD7 &ndash; Cookies & sessions
subtitle: Panier et préférences
layout: tutorial
lang: fr
---

<!--
Explication au tableau :
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
-->

<!--
On peut se faire passer pour quelqu'un si on connait son PHPSESSID
=> HTTPS et paramétrisation des cookies par nom de domaine et chemin
=> Fixation de session si session_id par query string ou faille XSS

-->

HTTP est un protocole de communication avec lequel chaque requête-réponse est
indépendante l'une de l'autre. Du coup, le serveur n'a pas de moyen de
reconnaître un client particulier, et donc n'a pas de moyen d'enregistrer
d'informations liées à un client spécifique. Par exemple, avec le HTTP de base,
si vous allez plusieurs fois sur Facebook, le réseau social ne sait pas
reconnaître vos requêtes parmi toutes les requêtes qu'il reçoit. Donc il ne
peut pas vous connecter, afficher votre page personnelle...

Pour remédier à cela, HTTP prévoit le mécanisme des cookies qui permet
d'enregistrer des informations sur l'ordinateur du client. De plus, en utilisant
des cookies pour identifier ses clients, les serveurs PHP peuvent stocker côté
serveur des informations spécifiques à un client : c'est le mécanisme des
sessions.

Les prochains TDs nécessitent que votre contrôleur utilisateur puisse créer,
lire, mettre à jour et supprimer des utilisateurs. Il faut donc finir d'abord le
[TD6]({{site.baseurl}}/tutorials/tutorial6). Si vous bloquez sur la section
[*Modèle générique* du
TD6]({{site.baseurl}}/tutorials/tutorial6#modèle-et-contrôleur-générique), vous
pouvez soit demander de l'aide à votre enseignant, soit adapter
`VoitureRepository` pour que `UtilisateurRepository` fonctionne. 

## Les cookies

Un *cookie* est utilisé pour stocker quelques informations spécifiques à un
utilisateur comme :

* ses préférences sur un site (personnalisation de l'interface, ...),
* le contenu de son panier d'achat électronique,
* son identifiant de session (voir la suite du TD).

Les informations sont envoyées par le site (serveur HTTP) en même temps que la page
Web. Le client stocke ces informations sur sa machine dans un fichier appelé
*cookie* : il s'agit d'une table d'associations
nom/valeur.  

**Attention** : il ne faut pas stocker de données critiques dans les cookies, car
elles sont stockées telles quelles sur le disque dur du client !

 
### Déposer un cookie

Les cookies sont des informations stockées sur l'ordinateur du client à
l'initiative du serveur.

#### Comment déposer un cookie en PHP ?

D'un point de vue pratique en PHP, on dépose un cookie à l'aide de la fonction
[`setcookie`](http://php.net/manual/fr/function.setcookie.php). Par exemple, la
ligne ci-dessous crée un cookie nommé `TestCookie` contenant la valeur `"OK"`
et qui expire dans 1h.

```php?start_inline=1
setcookie("TestCookie", "OK", time() + 3600);  
/* expire dans 1 heure = 3600 secondes */
```


#### Que fait `setcookie` ? Comment fait le serveur pour demander au client d'enregistrer un cookie ?

D'un point de vue technique, voici ce qui se passe au niveau du protocole HTTP
(dont nous avons notamment parlé lors 
[du cours 1]({{site.baseurl}}/classes/class1.html#protocole-de-communication--http)).
Pour stocker des informations dans un cookie chez le client, le serveur écrit
des lignes `Set-Cookie` dans l'en-tête de sa réponse HTTP

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

Remarquons que le serveur écrit une ligne `Set-Cookie` par paire nom/valeur. Ici
nous avons un cookie `"TestCookie1"` de valeur `"valeur1"` et un cookie
`"TestCookie2"` de valeur `"valeur2"`.



<div class="exercise">

1. Créez une action `deposerCookie` dans le contrôleur *utilisateur*. Cette action
   doit déposer un cookie de votre choix.

1. Vous allez inspecter la réponse HTTP de votre serveur pour observer l'explication
   précédente : 
   
   * Allez dans les outils développeurs (avec `F12`) &#8594; Onglet Réseau (ou
   Network). 
   * Rechargez votre page Web qui enregistre un cookie. 
   * En cliquant sur la requête de `frontController.php`, vous pouvez voir [les
   en-têtes (ou Headers) de la
   réponse](https://developer.chrome.com/docs/devtools/network/reference/#headers)
   et y observer la ligne `Set-Cookie: ...`.

1. Observez le cookie déposé chez le client :

   * sous Firefox, allez dans les outils développeurs (avec `F12`) &#8594; Onglet
     Stockage (ou Application) &#8594; Cookies.
   * sous Chrome, allez dans les outils développeurs (avec `F12`) &#8594; Onglet
     Ressources (ou Application) &#8594; puis Storage et Cookies.

   Note : Il existe aussi un [sous-onglet de *Réseau* pour voir les
   cookies](https://developer.chrome.com/docs/devtools/network/reference/#cookies)
   correspondants à une requête.

</div>

### Récupérer un cookie

Après le dépôt par le serveur d'un cookie chez le client, le navigateur du
client envoie les informations du cookie à chaque requête HTTP.

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

Le PHP traite la requête pour rendre le cookie 
disponible dans la variable
[`$_COOKIE`](http://php.net/manual/fr/reserved.variables.cookies.php), de la même
manière de `$_GET` récupère l'information dans l'URL et que `$_POST` récupère
l'information dans le corps de la requête (*cf.* [le cours
1]({{site.baseurl}}/classes/class1.html#protocole-de-communication--http)).

Par exemple,

```php?start_inline=1
echo $_COOKIE["TestCookie1"];
```

devrait afficher `valeur1`.

<div class="exercise">

1. Créez une action `lireCookie` dans le contrôleur *utilisateur*. Cette action
   doit lire le cookie précédemment déposé et l'afficher.

1. Inspectez la requête HTTP de votre client pour observer l'explication
   précédente. Dans l'onglet *Réseau* des outils développeurs, regarder [les
   en-têtes (ou Headers) de la requête](https://developer.chrome.com/docs/devtools/network/reference/#headers) et y observer la ligne `Cookie: ...`.

</div>

### Notes techniques 

1. Les cookies ne peuvent contenir que des valeurs `string`, donc *a priori* pas
   des objets PHP. Il faut donc convertir en chaîne de caractères les autres
   variables PHP avant de les stocker :

   * La fonction
   [`serialize`](http://php.net/manual/fr/function.serialize.php)
   permet de transformer une variable en chaîne de caractère.
   
   * Inversement, il faut appliquer
   [`unserialize`](http://php.net/manual/fr/function.unserialize.php) pour
   récupérer la variable PHP à partir de sa chaîne de caractère *sérialisée*. On
   applique donc `unserialize` lorsque l'on récupère la valeur stockée dans le
   cookie.
   
   **Avertissement** : La fonction `unserialize` peut poser des [problèmes de
   sécurité](https://www.php.net/manual/fr/function.unserialize#refsect1-function.unserialize-description).
   Il ne faut donc pas l'utiliser telle quelle dans un site professionnel. 

   <!-- Solutions :
   * signer le cookie utilisateur
   * json_encode / json_decode mais problèmes (cf plus bas)
   * autre sérialiseur, e.g. celui de symfony
   https://symfony.com/doc/current/components/serializer.html -->

   <!-- Faille de sécurité sur unserialize :
   https://www.php.net/manual/fr/function.unserialize.php#120399 -> 
   https://media.ccc.de/v/33c3-7858-exploiting_php7_unserialize -->

   <!-- Pb avec json_encode / json_decode :
   * seules les propriétés visibles publiquement d'un objet seront incluses. Une classe peut également implémenter JsonSerializable pour contrôler la façon dont ses valeurs sont sérialisées en JSON.
   * json_decode ne reconstruit que des objets de la classe stdClass
   -->

1. Si vous ne spécifiez pas le temps d'expiration d'un cookie (3ème paramètre de
   `setcookie`) ou que vous le mettez à `0` alors le cookie sera supprimé à la
   fin de la session (lorsque le navigateur sera fermé).

<div class="exercise">

Nous allons regrouper toutes les fonctionnalités des cookies dans une classe.

1. Créez la classe `Cookie` dans le fichier `src/Model/HTTP/Cookie.php` en y indiquant le bon espace de nom.
1. Codez la méthode
```php
public static function enregistrer(string $cle, mixed $valeur, ?int $dureeExpiration = null): void;
```

   Note :
   * Pour pouvoir stocker tout type de valeur, transformez la toujours en chaîne
     de caractères avant de la stocker.
   * `$dureeExpiration` indique dans combien de secondes est-ce que le cookie doit expirer.
   * Il faut traiter séparément le cas où `$dureeExpiration` vaut `null` qui
     indique que l'on veut une expiration à la fin de la session.

1. Coder la méthode
```php
public static function lire(string $cle): mixed;
```

1. Testez vos méthodes, en particulier l'enregistrement d'une valeur qui n'est
   pas un `string`, et l'expiration des cookies. 

1. Coder la méthode
```php
public static function contient($cle) : bool;
```

   Note : Un cookie existe si le tableau `$_COOKIE` contient une case à son nom.
   Vous pouvez tester ceci de deux manières équivalentes
```php
array_key_exists("nomCookie", $_COOKIE);
isset($_COOKIE["nomCookie"]);
```

</div>


### Effacer un cookie

Enfin pour effacer un cookie,
* on efface le cookie lu par PHP
```php
unset($_COOKIE["TestCookie"]);
```

* on le supprime chez le client en le faisant expirer, c-à-d en lui mettant une
date d'expiration passée. Comme la date d'expiration `0` a une signification
particulière (vous souvenez-vous laquelle ?), on propose d'utiliser 
```php?start_inline=1
setcookie ("TestCookie", "", 1);
```

<div class="exercise">

1. Codez et testez la méthode suivante de la classe `Cookie` :
```php
public static function supprimer($cle) : void;
```

1. Nettoyez le contrôleur *utilisateur* en commentant les actions
   `deposerCookie` et `lireCookie`.

</div>

### Notes techniques 

1. La taille d'un cookie est limité à 4KB (car les en-têtes HTTP doivent être <4KB).

1. **Attention :** la fonction `setcookie()` doit être appelée avant tout écriture
   de la page HTML. Le protocole HTTP impose cette restriction.  

   **Pourquoi ?** Le Set-Cookie est une information envoyée dans
   l'en-tête de la réponse. Le corps de la réponse HTTP, c'est-à-dire la page
   HTML, doit être envoyée après son en-tête. Or PHP écrit et envoie la page HTML
   dans le corps de la réponse HTTP au fur et à mesure.

   **Astuce :** Une erreur classique est d'avoir un fichier PHP qui contient un
   espace ou un saut de ligne après la balise de fermeture PHP `?>`. Cet espace
   indésirable peut faire dysfonctionner les cookies.  
   Pour éviter ce problème, on évite de placer la balise de fermeture à la fin
   d'un fichier qui ne contient que du code PHP.

1. C'est le navigateur qui stocke (ou pas) le cookie sur l'ordinateur du client.
   De manière générale, le serveur n'a **aucune garantie sur le comportement du
   client** : le cookie pourrait ne pas être enregistré (cookie désactivé chez
   l'utilisateur), ou être altéré (valeur modifiée, date d'expiration changée
   ...).   

   De même, c'est alors le navigateur du client qui se charge (normalement) de supprimer
   les cookies périmés chez le client. Encore une fois, le serveur n’a aucune
   garantie sur le comportement du client.

2. Nous avons précédemment dit que le client envoie ses cookies à chaque requête
   HTTP. Mais heureusement le navigateur n'envoie pas tous ses cookies à tous
   les sites. Déjà, le nom de domaine du site est enregistré en même temps que
   les cookies pour se souvenir de leur provenance. Le comportement normal d'un
   navigateur est **d'envoyer tous les cookies provenant des sous-domaines** du
   domaine de la page Web qu'il demande.

   Par exemple, un cookie enregistré à l'initiative d'un site hébergé sur
   `webinfo.iutmontp.univ-montp2.fr` (nom de domaine `univ-montp2.fr`) sera
   disponible à tous les sites ayant ce nom de domaine, en particulier aux
   pages de `*.univ-montp2.fr`,  mais pas aux autres domaines tels que `google.fr`.

   Il est possible de préciser ce comportement en donnant plus de paramètres (nom
   de domaine, chemin) à la fonction
   [`setcookie`](http://php.net/manual/fr/function.setcookie.php).

<!-- The Max-Age attribute defines the lifetime of the  cookie, in seconds. -->
<!-- The Expires attribute indicates the maximum lifetime of the cookie, -->
<!-- represented as the date and time at which the cookie expires. -->
**Référence :** [La RFC des cookies](https://tools.ietf.org/html/rfc6265)

### Exercice sur l'utilisation des cookies

Dans le site de covoiturage, vous avez défini que c'est le contrôleur *voiture*
qui est affiché par défaut. Dans cet exercice, nous allons permettre à chaque
visiteur du site de configurer son contrôleur par défaut.

**Note importante :** Cet exercice nécessite d'avoir codé plusieurs contrôleurs
au TD précédent. Si ce n'est pas le cas, changez l'exercice pour personnaliser
l'action par défaut plutôt que le contrôleur par défaut.

<div class="exercise">

1. Créez une action `formulairePreference` dans le contrôleur *utilisateur*, qui doit 
   afficher une vue `src/view/utilisateur/formulairePreference.php`.
   
1. Créez cette vue et complétez-la avec un formulaire 
   * renvoyant vers la future action `enregistrerPreference` du contrôleur
   *utilisateur*, 
   * contenant des *boutons radio* permettant de choisir `voiture`, `trajet` ou `utilisateur` comme
   contrôleur par défaut
```html
<input type="radio" id="voitureId" name="controleur_defaut" value="voiture">
<label for="voitureId">Voiture</label>
<input type="radio" id="utilisateurId" name="controleur_defaut" value="utilisateur">
<label for="utilisateurId">Utilisateur</label>
<input type="radio" id="trajetId" name="controleur_defaut" value="trajet">
<label for="trajetId">Trajet</label>
```

1. Afin de pouvoir gérer les préférences de contrôleur, créez une classe
   `src/Lib/PreferenceControleur.php` avec le bon espace de nom et le contenu
   ```php
   class PreferenceControleur {
      private static string $clePreference = "preferenceControleur";

      public static function enregistrer(string $preference) : void
      {
         Cookie::enregistrer(self::$clePreference, $preference);
      }

      public static function lire() : string
      {
         // À compléter
         return "";
      }

      public static function existe() : bool
      {
         // À compléter
      }

      public static function supprimer() : void
      {
         // À compléter
      }
   }
   ```

4. Écrire l'action `enregistrerPreference` qui 
   * récupère la valeur `controleur_defaut` du formulaire,
   * l'enregistre dans un cookie en utilisant la classe `PreferenceControleur`,
   * appelle une nouvelle vue `src/view/utilisateur/enregistrerPreference.php`
     qui affiche *La préférence de contrôleur est enregistrée !*, puis la vue
     qui liste tous les utilisateurs.

5. Vérifier que ce cookie a bien été déposé à l'aide des outils de développement.

2. Dans votre menu, qui doit se trouver dans l'en-tête commun de chaque page,
   ajouter une icône cliquable ![coeur]({{site.baseurl}}/assets/TD7/heart.png)
   qui pointe vers l'action `formulairePreference`.

   Note : Stockez vos images et votre CSS dans un dossier `assets` accessible
   sur internet

   ![assets]({{site.baseurl}}/assets/TD7/assets.png){: .blockcenter}

3. Dans le contrôleur frontal, le contrôleur par défaut est `voiture`. Faites en
   sorte d'utiliser la préférence de contrôleur par défaut si elle existe.

5. Testez le bon fonctionnement de cette personnalisation de la page d'accueil en
choisissant autre chose que `voiture` dans le formulaire.

1. On souhaite que le formulaire de préférence soit déjà coché si la préférence
   existe déjà. Implémentez cette fonctionnalité. Vous utiliserez l'attribut
   `checked` pour cocher un `<input type="radio">`.

</div>

## Les sessions 

Les sessions sont un mécanisme basé sur les cookies qui permet de stocker des
informations non plus du côté du client mais sur le serveur. Le principe des
sessions est d'identifier les clients pour que le serveur puisse stocker des
informations liées à chacun d'entre eux.

Pour faire ceci, la seule information stockée chez le client dans les cookies
est un identifiant unique (par défaut dans la variable nommée `PHPSESSID`).
Lorsqu'il demande une page, le client envoie son cookie contenant son
identifiant (dans sa requête HTTP).

Le serveur stocke de son côté des informations liées à chaque client. En
utilisant le cookie contenant l'identifiant, le serveur peut reconnaître quel
client est en train de demander une page Web et ainsi récupérer les informations
propres à ce client.

<div class="centered">
<img alt="Schéma des sessions" src="{{site.baseurl}}/assets/session.png" width="700">
</div>

### Opérations sur les sessions

On peut stocker presque tout dans une variable de session : un chiffre, un
texte, voir un tableau ou un objet. Contrairement aux cookies, il n'est même pas
nécessaire d'utiliser `serialize()` pour convertir tous les types en texte.

Présentons maintenant les opérations fondamentales sur les sessions :

*  **Initialiser les sessions**

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

### Notes techniques

#### Avantages des sessions

Par rapport aux cookies, les sessions offrent plusieurs avantages. Il n'y a plus
de limite de taille sur les données stockées côté client. 

Mais surtout, l'utilisateur ne peut plus tricher en éditant lui-même le contenu
du cookie. Imaginons par exemple que l'on note si l'utilisateur est
administrateur dans la variable `isAdmin` d'un cookie. Alors rien n'empêche
l'utilisateur de modifier son cookie en passant le champ `isAdmin` à la valeur
`true`. Cependant, avec le mécanisme de sessions, l'utilisateur n'a pas accès
aux données qui lui sont associées.


#### Expiration des sessions

1. **Durée de vie d'une session :**

   Par défaut, une session est supprimée à la fermeture du navigateur. Ceci est dû
   au délai d'expiration du cookie de l'identifiant unique `PHPSESSID` qui est par
   défaut `0`. Or nous avons vu dans la section sur les cookies que cela entraîne
   l'expiration du cookie à la fermeture du navigateur.

	Vous pouvez changer cela en modifiant la variable de configuration
	`session.cookie_lifetime` qui gère le délai d'expiration du cookie. La
	fonction
	[`session_set_cookie_params()`](http://php.net/manual/en/function.session-set-cookie-params.php)
	permet de régler facilement cette variable.

	Ceci peut être utile si vous souhaitez que votre panier stocké avec des
	sessions soit conservé disons 30 minutes, même en cas de fermeture du
	navigateur.

1. **Comment rajouter un timeout sur les sessions :**

	La durée de vie d'une session est liée à deux paramètres. D'une part, le
	délai d'expiration du cookie permet d'effacer l'identifiant unique côté
	client (sans garantie). D'autre part, une variable de PHP permet de définir
	un délai d'expiration aux fichiers de session (`session.gc_maxlifetime`) qui
	dira que le fichier **peut** être supprimé à partir d'un certain
	délai. Cependant, aucune de ces techniques n'offre de réelle garantie de
	suppression de la session après le délai imparti.

	La seule manière sûre de bien gérer la durée de vie d'une session est de
	stocker la date de dernière activité dans la session :
	
    ```php?start_inline=1
    if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > (30*60))) {
        // if last request was more than 30 minutes ago
        session_unset();     // unset $_SESSION variable for the run-time 
        session_destroy();   // destroy session data in storage
    } else {
        $_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
    }
    ```

	Nous recommandons de mettre un délai d'expiration correspondant au
    `session.cookie_lifetime` (si celui-ci est non nul).
    
    **Référence :** [Stackoverflow](http://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes)

<!--
Note technique :

Si les cookies ne sont pas utilisés, le PHPSESSID peut être passé en GET (et en
POST ?)
Alors il y a un risque plus important de "session fixation"
cf http://defeo.lu/aws/lessons/session-fixation
-->

#### Où sont stockées les sessions ?

Les sessions sont stockées sur le disque dur du serveur web, par exemple avec
LAMP dans le dossier `/var/lib/php/sessions` (il faut être `root` pour y
accéder). Reportez-vous à la partie `session` de la fonction `phpinfo()` pour
connaître ce chemin.

**Exemple :** Si mon identifiant de session est `PHPSESSID=aapot` et si mon code
PHP est le suivant

```php?start_inline=1
session_start();
$_SESSION['login'] = "rlebreton";
$_SESSION['isAdmin'] = "1";
```

alors le fichier `/var/lib/php/sessions/sess_aapot` contient

```
login|s:9:"rlebreton";isAdmin|s:1:"1";
```


### Exercice sur les sessions

<div class="exercise">

Créez un nouveau fichier PHP et vérifiez votre compréhension en implémentant les
fonctionnalités suivantes :

1. Démarrer une session,
1. Écrire des variables de session de différents types (chaînes de caractères,
   tableaux, objets, ...),
1. Lire une variable de session,
1. Supprimer une variable de session,
1. Supprimer complètement une session

</div>

## Mise en application sur le site de covoiturage

<div class="exercise">

Dans votre site de projet, utilisez les cookies pour stocker le panier actuel du
visiteur.

</div>


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
   délai sera d'abord de 10 secondes à des fins de test puis passez-le à 10 minutes
   quand cela marche.

</div>

Pour approfondir votre compréhension des cookies et des sessions, vous avez
aussi accès aux [notes complémentaires à ce
sujet]({{site.baseurl}}/assets/tut7-complement).

# (Optionnel) Au-delà des cookies et des sessions

Nécessite l'exécution de JavaScript côté client

* localStorage
* webStorage
* indexedDB

Des données que l'utilisateur ne veut pas nécessairement partager avec le
serveur (contrairement aux cookies et aux sessions).

## Cas d'utilisation classique

* panier d'un utilisateur non connecte
* session pour utilisateur connecte
* puis enregistrement en BDD