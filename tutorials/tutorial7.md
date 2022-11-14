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

À chaque requête HTTP, le navigateur du client envoie ses cookies correspondant au site visité dans l'en-tête de la requête.

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
manière que `$_GET` récupère l'information dans l'URL et que `$_POST` récupère
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
public static function enregistrer(string $cle, mixed $valeur, ?int $dureeExpiration = null): void
```

   Note :
   * Pour pouvoir stocker tout type de valeur, transformez-la toujours en chaîne
     de caractères avant de la stocker.
   * `$dureeExpiration` indique dans combien de secondes est-ce que le cookie doit expirer.
   * Il faut traiter séparément le cas où `$dureeExpiration` vaut `null` qui
     indique que l'on veut une expiration à la fin de la session.
   * Le type de retour `mixed` nécessite la version 8 de PHP. En cas de problème, vous pouvez retirer les `mixed`.

1. Codez la méthode
```php
public static function lire(string $cle): mixed
```

1. Modifiez les actions `deposerCookie` et `lireCookie` pour utiliser la classe
   `Cookie`. Testez votre code, en particulier l'enregistrement d'une valeur
   qui n'est pas un `string`, et l'expiration des cookies. 

1. Codez la méthode
```php
public static function contient($cle) : bool
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
public static function supprimer($cle) : void
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

   Il est possible de préciser ce comportement en donnant plus de paramètres à
   la fonction [`setcookie`](http://php.net/manual/fr/function.setcookie.php). On peut ainsi restreindre l'envoi des cookies à certains noms de domaine, à certains chemins (partie après le nom d'hôte dans l'URL), ou seulement aux URL utilisant le protocole sécurisé `https`.

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

1. Pour préparer la suite de l'exercice, nous allons mettre en place un
   contrôleur générique (si vous ne l'avez pas déjà fait au TD6). En effet, la
   future action de préférence de contrôleur par défaut n'est spécifique à aucun
   contrôleur en particulier. On va donc la rendre accessible à tous les
   contrôleurs.

   * Créez une classe `src/Controller/GenericController.php`.
   * Les autres contrôleurs doivent hériter de `GenericController`.
   * Déplacez la méthode `afficheVue` commune à tous les contrôleurs dans
     `GenericController`. Sa visibilité passe de `private` à `protected` pour
     être accessible dans ses classes filles.
   * Si vous n'avez de contrôleur trajet `src/Controller/ControllerTrajet.php`,
     créez un contrôleur vide qui hérite seulement du contrôleur générique.

   *Note* : Le contrôleur générique pourrait implémenter une méthode `error()`
   générique. Cette méthode du contrôleur générique serait notamment appelée par
   le contrôleur frontal en cas de contrôleur inconnu.

2. Dans votre menu qui se trouve dans l'en-tête commun de chaque page, ajouter
   une icône cliquable ![cœur]({{site.baseurl}}/assets/TD7/heart.png) qui pointe
   vers la future action `formulairePreference` (sans contrôleur).

   Note : Stockez vos images et votre CSS dans un dossier `assets` accessible
   sur internet (avec le bon fichier `htaccess`)

   ![assets]({{site.baseurl}}/assets/TD7/assets.png){: .blockcenter}

1. Créez une action `formulairePreference` dans le contrôleur *générique*, qui
   doit afficher une vue `src/view/formulairePreference.php`.
   
1. Créez cette vue et complétez-la avec un formulaire 
   * renvoyant vers la future action `enregistrerPreference` (sans indiquer de contrôleur), 
   * contenant des *boutons radio* permettant de choisir `voiture`, `trajet` ou
   `utilisateur` comme contrôleur par défaut
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
   suivant que vous complèterez
   ```php
   class PreferenceControleur {
      private static string $clePreference = "preferenceControleur";

      public static function enregistrer(string $preference) : void
      {
         Cookie::enregistrer(static::$clePreference, $preference);
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

4. Écrire l'action `enregistrerPreference` du contrôleur générique qui 
   * récupère la valeur `controleur_defaut` du formulaire,
   * l'enregistre dans un cookie en utilisant la classe `PreferenceControleur`,
   * appelle une nouvelle vue `src/view/enregistrerPreference.php`
     qui affiche *La préférence de contrôleur est enregistrée !*.

5. Vérifier que ce cookie a bien été déposé à l'aide des outils de développement.

3. Dans le contrôleur frontal, le contrôleur par défaut est `voiture`. Faites en
   sorte d'utiliser la préférence de contrôleur par défaut si elle existe.

5. Testez le bon fonctionnement de cette personnalisation de la page d'accueil en
choisissant autre chose que `voiture` dans le formulaire.

1. Il est possible que vos anciens liens du contrôleur voiture (vues `list` et
   `detail`) et de la barre de menu (`view.php`) n'indiquait pas le contrôleur
   voiture, car c'était le contrôleur par défaut. Si nécessaire, rajoutez
   l'indication du contrôleur dans ces liens.

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

*  **Mettre une variable en session**

   ```php?start_inline=1
   $_SESSION['login'] = 'remi';
   ```

   On peut stocker presque tout dans une variable de session : un chiffre, un
   texte, voir un tableau ou un objet. Contrairement aux cookies, il n'est pas
   nécessaire d'utiliser `serialize()` pour convertir tous les types en texte.

   **Nouveauté :** Contrairement à `$_GET`, `$_POST` et `$_COOKIE`, la variable
   `$_SESSION` est aussi une variable d'écriture : elle permet d'écrire des
   informations de sessions.

*  **Lire une variable de session**

   ```php?start_inline=1
   echo $_SESSION['login'];
   ```

   À la manière de `$_GET`, `$_POST` et `$_COOKIE`, la variable `$_SESSION`
   permet de lire les informations de sessions (stockées sur le disque dur du
   serveur et liées à l'identifiant de session).

*  **Vérifier qu'une variable existe en session**

   Comme pour les cookies, vous avez 2 manières équivalentes 

   ```php?start_inline=1
   array_key_exists("login", $_SESSION);
   isset($_SESSION['login']);
   ```
   
*  **Supprimer une variable de session**

   ```php?start_inline=1
   unset($_SESSION['login']);
   ```

   Comme la variable `$_SESSION` est aussi en écriture, vider un de ses champs
   effacera la donnée de session sur le disque dur à la fin de l'exécution du
   PHP.

*  **Suppression complète d'une session**

   ```php?start_inline=1
   session_unset();     // unset $_SESSION variable for the run-time 
   session_destroy();   // destroy session data in storage
   // Il faut réappeler session_start() pour accéder de nouveau aux variables de session
   Cookie::supprimer(session_name()); // deletes the session cookie containing the session ID
   ```

   Pour le dire autrement :

   * `session_unset()` vide le tableau `$_SESSION` en faisant
   `unset($_SESSION['name_var'])` pour tous les champs `name_var` de
   `$_SESSION`,
   * `session_destroy()` supprime le fichier de données associées à la session
   courante qui étaient enregistrées sur le disque dur du serveur,
   * On demande au client de supprimer son cookie de session (sans garantie).

### Exercice sur les sessions

<div class="exercise">

1.  Dans un nouveau fichier `src/Model/HTTP/Session.php`, compléter la classe `Session` suivante
    ```php
    namespace App\Covoiturage\Model\HTTP;
    
    use Exception;

    class Session
    {
        private static ?Session $instance = null;

        /**
         * @throws Exception
         */
        private function __construct()
        {
            if (session_start() === false) {
                throw new Exception("La session n'a pas réussi à démarrer.");
            }
        }

        public static function getInstance(): Session
        {
            if (is_null(static::$instance))
                static::$instance = new Session();
            return static::$instance;
        }

        public function contient($name): bool
        {
            // À compléter
        }

        public function enregistrer(string $name, mixed $value): void
        {
            // À compléter
        }
        
        public function lire(string $name): mixed
        {
            // À compléter
        }
        
        public function supprimer($name): void
        {
            // À compléter
        }
        
        public function detruire() : void
        {
            session_unset();     // unset $_SESSION variable for the run-time
            session_destroy();   // destroy session data in storage
            Cookie::supprimer(session_name()); // deletes the session cookie
            // Il faudra reconstruire la session au prochain appel de getInstance()
            $instance = null;
        }        
    }
    ```

    *Note :* Cette classe suit le patron de conception *Singleton*, car une session
    est forcément unique. De plus, on ne peut pas se satisfaire d'une classe
    statique comme `Cookie`, car une session a deux états : démarrée ou pas.
    Notre classe dynamique nous permets de nous assurer que la session est
    démarré avec `session_start()` avant de l'utiliser. En pratique, l'appel à
    une méthode dynamique comme `enregistrer()` nécessite d'avoir construit
    l'objet précédemment, donc d'avoir appelé `session_start()`. 

1. Testez toutes les méthodes de `Session` dans une action temporaire du contrôleur *utilisateur* :
    1. Démarrer une session : observez le cookie de session avec les outils de développement,
    1. Écrire et lire des variables de session de différents types (chaînes de caractères,
        tableaux, objets, ...),
    1. Supprimer une variable de session,
    1. Supprimer complètement une session avec notamment la suppression du cookie de session.

   *Note* : Voici un exemple d'utilisation de la classe `Session`
   ```php
   $session = Session::getInstance();
   $session->enregistrer("utilisateur", "Cathy Penneflamme");
   ```

</div>

### Application : Redirection HTTP & messages flash

#### Cahier des charges

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

1. À l'aide des indications de la section suivante, implémentez un système de message flash.

1. Utilisez les messages flash pour enlever toutes les vues qui affichaient un
   message puis appelaient une autre vue. En particulier, supprimez les vues
   désormais inutiles `created.php`, `deleted.php` et `updated.php`. 

   *Note* : Par exemple, en cas de succès de création d'un utilisateur, on
   pourrait ajouter un message flash de succès *L'utilisateur a bien été créé*
   puis rediriger dans l'action `readAll` du contrôleur `utilisateur`.
   
1. De plus, l'action `enregistrerPreference()` peut maintenant rediriger
   l'action par défaut du contrôleur par défaut, que l'on obtient sans indiquer
   d'action ni de contrôleur dans l'URL, avec un message flash *La préférence de
   contrôleur est enregistrée !*.

</div>


#### Indications techniques

1.  Pour la redirection, nous allons utiliser le code suivant (à encapsuler dans
    une méthode du contrôleur générique)
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
   la vue générique `view.php`. Il faudra donc mettre à jour `view.php` pour
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

1.  **Comment rajouter un timeout sur les sessions :**

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
    if (isset($_SESSION['derniereActivite']) && (time() - $_SESSION['derniereActivite'] > ($dureeExpiration)))
        session_unset();     // unset $_SESSION variable for the run-time

    $_SESSION['derniereActivite'] = time(); // update last activity time stamp
    ```
    
    <!-- Ancien code : Problèmes : 
    * Ce qu'on écrit dans $_SESSION n'est plus enregistré après session_detroy()
      -> rajouter un session_start() ?
    * Problème aussi avec détruire : l'utilisateur qui a déjà récupéré une session avec getInstance
      se retrouve avec une session qui ne marche pas *sans le savoir*
      -> Tant pis pour lui, il le sait quand il appelle detruire ?
    ```php?start_inline=1
    if (isset($_SESSION['derniereActivite']) && (time() - $_SESSION['derniereActivite'] > (30*60))) {
        // if last request was more than 30 minutes ago
        session_unset();     // unset $_SESSION variable for the run-time 
        session_destroy();   // destroy session data in storage
    } else {
        $_SESSION['derniereActivite'] = time(); // update last activity time stamp
    }
    ``` -->

	Nous recommandons de mettre un délai d'expiration correspondant au cookie
    d'identifiant de session à l'aide de la méthode
    [`session_set_cookie_params`](https://www.php.net/manual/fr/function.session-set-cookie-params.php).
    
    **Référence :** [Stackoverflow](http://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes)

<!--
Note technique :

Si les cookies ne sont pas utilisés, le PHPSESSID peut être passé en GET (et en
POST ?)
Alors il y a un risque plus important de "session fixation"
cf http://defeo.lu/aws/lessons/session-fixation
-->

<div class="exercise">

Rajouter un mécanisme d'expiration pour les sessions. 

*Note :* La durée d'expiration est une donnée qui dépend du site. Il serait donc
judicieux de la mettre dans le fichier de configuration `Conf.php`.

</div>

<!-- Problèmes :
* changer la signature du constructeur et de getInstance ? -->


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

<!-- ## Mise en application sur le site de covoiturage

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

</div> -->


## (Optionnel) Au-delà des cookies et des sessions


Pour approfondir votre compréhension des cookies et des sessions, vous avez
aussi accès aux [notes complémentaires à ce
sujet]({{site.baseurl}}/assets/tut7-complement).

### Cas d'utilisation classique : panier sur un site marchand

* Le panier est enregistré en cookie ou en session
* Lors de la validation du panier, on demande à l'utilisateur de se connecter
* Une fois connectée, le panier validé est enregistrée en BDD dans une table *commandes*.

### Alternatives aux cookies et sessions 

Il existe des alternatives aux cookies et aux sessions. Par exemple, en
utilisant [l'API Web
Storage](https://developer.mozilla.org/fr/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
de JavaScript (langage que nous étudierons au semestre 4). 

<!-- * localStorage
* webStorage
* indexedDB -->

<!-- Des données que l'utilisateur ne veut pas nécessairement partager avec le
serveur (contrairement aux cookies et aux sessions). 
Exemple :   * formulaire sur plusieurs pages 
-->

Enfin, si l'on veut sécuriser des informations côté client (Cookie ou Web storage), une technologie
répandue est le [JSON Web Token (JWT)](https://jwt.io/).
