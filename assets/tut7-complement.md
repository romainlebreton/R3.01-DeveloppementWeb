---
title: Compléments sur les cookies et les sessions
subtitle: 
layout: tutorial
---

## Quelques informations supplémentaires sur les cookies

Pour bien comprendre en profondeur les cookies, il faut savoir que tout est basé
sur deux mécanismes assez indépendants:

1. le serveur peut enregistrer/modifier un cookie chez le client avec une ligne
   `Set-Cookie` dans la réponse HTTP (commande PHP `setcookie`).
1. les cookies sont envoyés à chaque requête par le client au serveur. PHP
   traite les cookies en remplissant la variable en lecture seule `$_COOKIE`.
   
**Quizz de compréhension:**

1. **Question :** Est-ce que `$_COOKIE` se met à jour après un `setcookie()` ?
   Pourquoi ?   
   **Réponse :** 
   <span style="color:#FCFCFC">
   Non car <code style="color:#FCFCFC">$_COOKIE</code> contient toujours le
   cookie déposé la fois d'avant.  
   En particulier, la première fois qu'on dépose un cookie, on n'y a pas accès
   tout de suite dans <code style="color:#FCFCFC">$_COOKIE</code> car le cookie
   est seulement déposé sur l'ordinateur du client. Mais si le client revient
   sur la page, il enverra le cookie avec sa requête et 
   <code style="color:#FCFCFC">$_COOKIE</code> contiendra enfin le cookie.
   </span>
   
1. **Question :** Est-ce que l'on peut écrire un cookie en changeant la variable
   `$_COOKIE` ?  
   **Réponse :**
   <span style="color:#FCFCFC">
   Non, écrire sur  <code style="color:#FCFCFC">$_COOKIE</code> n'a pas d'effet sur 
   les cookies du client.  
   Attention à la confusion avec les sessions : 
   <code style="color:#FCFCFC">$_SESSION</code> a le comportement inverse et il 
   faut écrire dans cette variable pour créer/mettre-à-jour une variable de session.
   </span>
   
1. **Question :** Supposons qu'un cookie `TestCookie` contenant la valeur `"OK"`
   a été déposé chez le client. Faut-il faire à nouveau 
   `setcookie("TestCookie","OK")` pour que le cookie reste chez le client ?  
   **Réponse :**
   <span style="color:#FCFCFC">
   Non, si on ne fait pas <code style="color:#FCFCFC">setcookie()</code> alors aucune
   action d'écriture/mise-à-jour n'a lieu sur le cookie. Les cookies ne sont pas 
   nécessairement réécrits à chaque fois et ils restent donc sur l'ordinateur du client 
   jusqu'à leur expiration.  
   </span>


## Quelques informations supplémentaires sur les sessions

Soyons plus précis sur le mécanisme de sessions :

1. Que fait `session_start()` ?  
   Si aucun cookie `PHPSESSID=xyz` n'a été envoyé par le client, il crée le
   cookie, crée le fichier local correspondant `sess_xyz` et initialise
   `$_SESSION=array()`.  
   Si un cookie `PHPSESSID=xyz` a été envoyé par le client, il lit le fichier
   local correspondant `sess_xyz` et le recopie dans la variable `$_SESSION`.
   
1. Quand est-ce que le contenu de `$_SESSION` est écrit le fichier local
   `sess_xyz` ?  
   Si le mécanisme de session est toujours actif (pas de `session_destroy()`),
   alors après la fin de votre script, PHP recopie le contenu de `$_SESSION`
   dans le fichier local `sess_xyz`.
   

### Le cas particulier des sessions en hébergement mutualisé

Dans le cas d'un hébergement mutualisé, (comme à l'IUT) deux répertoires
différents par exemple
[http://webinfo.iutmontp.univ-montp2.fr/~mon_login](http://webinfo.iutmontp.univ-montp2.fr/~mon_login)
et
[http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin)
sont vus comme un seul site web, alors qu'il s'agit en réalité de deux sites web
différents.  De ce fait, si vous utilisez exactement le même nom de variable de
session, il est possible que s'authentifier sur
[http://webinfo.iutmontp.univ-montp2.fr/~mon_login](http://webinfo.iutmontp.univ-montp2.fr/~mon_login)
vous permette de contourner l'authentification de
[http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin](http://webinfo.iutmontp.univ-montp2.fr/~le_login_du_voisin).

Afin d'éviter ces désagréments, deux solutions :

1. utiliser un nom de variable de session différent avec l'instruction
   `session_name("chaineUniqueInventeParMoi");` que vous appellerez de manière
   systématique, avant chaque appel à `session_start();`. Cela a pour effet de
   remplacer le nom de la variable unique `PHPSESSID` en
   `chaineUniqueInventeParMoi` et éviter les conflits.
   
1. Dans la fonction `setcookie()`, il est possible de spécifier un chemin de
   fichier que doit satisfaire la page pour que le cookie soit envoyé. Cela
   étend le mécanisme de vérification de nom de domaine.

   
### Sessions et sécurité

Comme vous l'aurez devinez, on peut se faire passer pour quelqu'un si on connaît
son cookie `PHPSESSID`. Il est donc important que l'on essaye de protéger cette
information. Or, comme on peut le voir avec les outils de développement, onglet
Réseaux, l'information des cookies passent sur le réseau sans être cachée.

Le premier point est donc de sécuriser le canal de communication pour que
personne ne puisse écouter nos échanges avec le serveur Web (HTTPS). Il faut
aussi que le client n'envoye pas cette information à un autre site, d'où
l'importance de limiter l'envoi des cookies à certain nom de domaine, chemin de
fichier...

Enfin il existe une technique par laquelle un attaquant peut forcer un client
HTTP à prendre un `PHPSESSID` particulier. L'attaquant n'a plus qu'à attendre
que le client s'identifie sur le site, puis il réutilise ce `PHPSESSID` pour
usurper l'identité du client. Cette attaque s'appelle en anglais *session
fixation*. Une parade consiste à renouveller régulièrement l'identifiant de
session des clients et à toujours vérifier l'identité du client (en redemandant
le mot de passe) avant toute opération sensible.

**Référence :** [Cours "Applications web et sécurité" de Luca De Feo](http://defeo.lu/aws/lessons/session-fixation)

<!-- Explication sur les sessions

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

On peut se faire passer pour quelqu'un si on connait son PHPSESSID
=> HTTPS et paramétrisation des cookies par nom de domaine et chemin
=> Fixation de session si session_id par query string ou faille XSS

-->
