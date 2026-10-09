---
title: Compléments sur les cookies et les sessions
subtitle: 
layout: tutorial
lang: fr
---

## Quelques informations supplémentaires sur les cookies

Pour bien comprendre en profondeur les cookies, il faut savoir que tout est basé
sur deux mécanismes assez indépendants :

1. le serveur peut enregistrer/modifier un cookie chez le client avec une ligne
   `Set-Cookie` dans la réponse HTTP (commande PHP `setcookie`).
1. les cookies sont envoyés à chaque requête par le client au serveur. PHP
   traite les cookies en remplissant la variable en lecture seule `$_COOKIE`.
   
**Quiz de compréhension :**

1. **Question :** Est-ce que `$_COOKIE` se met à jour après un `setcookie()` ?
   Pourquoi ?   
   <details markdown="0">
      <summary><strong>Réponse (cliquez pour afficher) :</strong></summary>
      <p markdown="1">
         Non car `$_COOKIE` contient toujours le
         cookie déposé la fois d'avant.  
         En particulier, la première fois qu'on dépose un cookie, on n'y a pas accès
         tout de suite dans `$_COOKIE` car le cookie
         est seulement déposé sur l'ordinateur du client. Mais si le client revient
         sur la page, il enverra le cookie avec sa requête et 
         `$_COOKIE` contiendra enfin le cookie.
      </p>
   </details>
   
1. **Question :** Est-ce que l'on peut écrire un cookie en changeant la variable
   `$_COOKIE` ?  
   <details markdown="0">
      <summary><strong>Réponse (cliquez pour afficher) :</strong></summary>
      <p markdown="1">
         Non, écrire sur `$_COOKIE` n'a pas d'effet sur les cookies du
         client.  
         Attention à la confusion avec les sessions :
         `$_SESSION` a le comportement inverse et il faut écrire dans
         cette variable pour créer/mettre-à-jour une variable de session.
      </p>
   </details>
   
1. **Question :** Supposons qu'un cookie `TestCookie` contenant la valeur `"OK"`
   a été déposé chez le client. Faut-il faire à nouveau 
   `setcookie("TestCookie","OK")` pour que le cookie reste chez le client ?  
   <details markdown="0">
      <summary><strong>Réponse (cliquez pour afficher) :</strong></summary>
      <p markdown="1">
         Non, si on ne fait pas `setcookie()` alors aucune action
         d'écriture/mise-à-jour n'a lieu sur le cookie. Les cookies ne sont pas
         nécessairement réécrits à chaque fois et ils restent donc sur
         l'ordinateur du client jusqu'à leur expiration.
      </p>
   </details>


## Quelques informations supplémentaires sur les sessions

Le TD7 détaille le cycle de vie d'une session (voir le schéma de séquence de la
partie *Où sont stockées les sessions ?*). Résumons les deux moments clés :

1. Que fait `session_start()` ?  
   Si aucun cookie `PHPSESSID=xyz` n'a été envoyé par le client, il génère un
   nouvel identifiant, dépose le cookie correspondant chez le client et
   initialise `$_SESSION=array()`.  
   Si un cookie `PHPSESSID=xyz` a été envoyé par le client, il lit le fichier
   local correspondant `sess_xyz` et recopie son contenu dans la variable `$_SESSION`.
   
1. Quand est-ce que le contenu de `$_SESSION` est écrit dans le fichier local
   `sess_xyz` ?  
   Si le mécanisme de session est toujours actif (pas de `session_destroy()`),
   alors après la fin de votre script, PHP recopie le contenu de `$_SESSION`
   dans le fichier local `sess_xyz`.
   

### Le cas particulier des sessions en hébergement mutualisé

Dans le cas d'un hébergement mutualisé, comme sur le serveur `webinfo` de l'IUT
où vous pourrez déployer votre projet, deux répertoires différents, par exemple
[http://webinfo.iutmontp.univ-montp2.fr/~mon_login](http://webinfo.iutmontp.univ-montp2.fr/~mon_login)
et
[http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin)
sont vus comme un seul site web, alors qu'il s'agit en réalité de deux sites web
différents. En effet :
* le cookie de session est déposé par défaut avec le chemin `path: "/"`, donc le
  navigateur l'envoie à tous les sites de `webinfo` ;
* tous les sites stockent leurs fichiers de session `sess_xyz` dans le même
  dossier du serveur.

De ce fait, si vous utilisez exactement le même nom de variable de session (par
exemple `$_SESSION['utilisateurConnecte']`), il est possible que s'authentifier sur
[http://webinfo.iutmontp.univ-montp2.fr/~mon_login](http://webinfo.iutmontp.univ-montp2.fr/~mon_login)
vous permette de contourner l'authentification de
[http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin).

**Remarque :** Le même phénomène se produit sur votre serveur Docker entre
`http://localhost/tds-php` et votre projet s'il est aussi servi par
`localhost`.

Afin d'éviter ces désagréments, deux solutions complémentaires, à mettre en
place **avant** l'appel à `session_start()` (dans le constructeur de la classe
`Session` du TD7) :

1. utiliser un nom de cookie de session différent avec l'instruction
   `session_name("chaineUniqueInventeParMoi");`. Cela a pour effet de
   remplacer le nom du cookie `PHPSESSID` par
   `chaineUniqueInventeParMoi` et d'éviter les conflits.
   
1. restreindre le chemin pour lequel le navigateur envoie le cookie de session
   avec la fonction
   [`session_set_cookie_params()`](https://www.php.net/manual/fr/function.session-set-cookie-params.php)
   (et non `setcookie()`, car c'est `session_start()` qui dépose ce cookie) :
   ```php?start_inline=1
   session_set_cookie_params(["path" => "/~mon_login/"]);
   ```
   Le paramètre `path` fonctionne comme celui de `setcookie()`, expliqué dans le TD7.

**Attention :** Ces solutions évitent les conflits accidentels, mais elles ne
protègent pas d'un voisin malveillant. Sur `webinfo`, tous les sites s'exécutent
sous le même utilisateur `www-data` : le script PHP d'un voisin peut donc lire et
écrire vos fichiers de session (et même lire vos fichiers PHP, dont la
configuration de la base de données). Il n'existe pas de protection complète sur
ce type d'hébergement mutualisé. Un hébergement professionnel isole chaque site
en l'exécutant sous un utilisateur différent.

   
### Sessions et sécurité

Comme vous l'aurez deviné, on peut se faire passer pour quelqu'un si on connaît
son cookie `PHPSESSID`. Il est donc important que l'on essaye de protéger cette
information. Or, comme on peut le voir avec les outils de développement, onglet
Réseau, l'information des cookies passe sur le réseau sans être cachée.

Plusieurs mesures permettent de protéger le cookie de session :
* sécuriser le canal de communication avec HTTPS, pour que personne ne puisse
  écouter nos échanges avec le serveur Web, et n'envoyer le cookie que sur
  HTTPS (paramètre `secure`) ;
* empêcher le JavaScript de la page de lire le cookie (paramètre `httponly`), ce
  qui limite les vols de cookie par une faille XSS ;
* limiter l'envoi des cookies à certains noms de domaine et chemins (paramètres
  `domain` et `path`, voir ci-dessus) ;
* ne pas envoyer le cookie lors de requêtes provenant d'autres sites
  (paramètre `samesite`), ce qui protège des attaques CSRF présentées au TD8.

Ces paramètres se règlent tous avec `session_set_cookie_params()`, par exemple
```php?start_inline=1
session_set_cookie_params([
    "secure" => true,       // Seulement si votre site est en HTTPS
    "httponly" => true,
    "samesite" => "Lax",
]);
```

Enfin, il existe une technique par laquelle un attaquant peut forcer un client
HTTP à prendre un `PHPSESSID` particulier. L'attaquant n'a plus qu'à attendre
que le client s'identifie sur le site, puis il réutilise ce `PHPSESSID` pour
usurper l'identité du client. Cette attaque s'appelle en anglais *session
fixation*. La parade principale, mise en place dans le
[TD8]({{site.baseurl}}/tutorials/tutorial8.html), consiste à changer
l'identifiant de session au moment de la connexion avec
`session_regenerate_id(true)`. Il est aussi conseillé de toujours vérifier
l'identité du client (en redemandant le mot de passe) avant toute opération
sensible.

**Référence :** [Cours "Applications web et sécurité" de Luca De Feo](https://defeo.lu/aws/lessons/session-fixation)
