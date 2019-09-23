---
title:  TD2 &ndash; Compléments
subtitle: NetBeans, attributs et méthodes statiques
layout: tutorial
---

## Créer un projet avec NetBeans

### Si vous commencez un projet de zéro

#### Configuration courte

1. Allez dans le menu Fichier > Nouveau Projet > PHP > PHP Application

2. Changez le dossier (.../public_html/PHP/TD2 par exemple) et le nom du projet
   (TD2 par exemple).

3. Appuyez sur Finish

#### Configuration complète

1. Allez dans le menu Fichier > Nouveau Projet > PHP > PHP Application

2. Changez le dossier et le nom du projet puis choisissez la version de PHP la plus
   élevée.

3. Appuyez sur Next

4. * Exécuter comme "Site Web local",

   * URL du projet : l'adresse de votre page Web sur `webinfo`, par exemple
   [http://webinfo/~votre_login/PHP/TD2/](http://webinfo/~votre_login/PHP/TD2/)

5. Appuyez sur Finish

### Si vous reprenez un projet en cours

Allez dans le menu Fichier > Nouveau Projet > PHP > PHP Application **with
existing sources**


### Fonctionnalités utiles

* Indentation automatique : Source > Format ou `Alt+Maj+F`
* Ouvrir la page Web : Éxécuter projet ou (`F6`).  
  Cela ouvre dans le navigateur l'URL donnée lors de la configuration complète.
* Activer/désactiver les commentaires : sélectionner une région de texte et
  taper `Ctrl+Shift+C`

## Les attributs et méthodes `static`

<!-- Compléter avec autre source de definition -->

### Attributs statiques

Un attribut d'une classe est *statique* si il ne dépend pas des instances d'une
classe mais juste de la classe. Si on pense en terme de mémoire, on peut avoir
plusieurs instances différentes d'un même objet en mémoire, mais un attribut
statique ne sera présent qu'une seule fois en mémoire.

Comme un attribut `static` ne dépend que de la classe, on l'appelle avec la
syntaxe `Classe::$nom_attribut` en PHP. Par contraste, les attributs classiques
s'accèdent par la syntaxe `$instance->attribut`.

De la même manière que `$this` renvoie sur l'instance courante lors de la
déclaration d'une classe, `self` renvoie la classe courante (uniquement lors de
la déclaration d'une classe).

### Fonctions statiques

Une fonction non statique peut se comprendre comme une fonction qui reçoit un
argument `$this` en supplément des arguments déclarés. Du coup, une fonction
statique est juste une fonction dans laquelle on n'a pas accès à `$this`.

### Utilisation

Les attributs statiques sont utiles pour créer des attributs communs à une
classe. Par exemple, la constante `Math::Pi` en Java agit un peu comme une
variable globale à la classe `Math`.

<!-- vérifier la syntaxe de Math::Pi -->

Les attributs statiques servent aussi à coder des comportements de classe. Par
exemple, on peut attribuer un identifiant unique à chaque instance d'une classe
en stockant dans une variable statique le nombre d'instances.

<!-- Choses à faire: -->
<!-- --------------- -->
<!-- - préparer squelette class avec fonction/attribut statique/non statique  -->
<!-- -> Comment appelle-t-on la fonction/attribut dedans/dehors la classe -->

## Dépôt Git accessible depuis l'extérieur
{: #tutoGitlab}

Actuellement, vos fichiers PHP sont enregistrés dans un dépôt Git local. Nous
allons le lier au Gitlab du département Informatique pour que vous puissiez y
accéder depuis l'extérieur.

Accédez à l'URL
[https://gitlabinfo.iutmontp.univ-montp2.fr/](https://gitlabinfo.iutmontp.univ-montp2.fr/)
et identifiez-vous avec vos login/mdp IUT. Dans l'onglet Projet, créez un
nouveau projet. Une fois le projet créé, trois possibilités :

  1. Vous avez déjà un dépôt à l'IUT avec des fichiers

     Suivez les instructions du paragraphe "Push an existing Git repository" pour
     lier votre dépôt local à celui du Gitlab :

     ```bash
     cd chemin_vers_votre_depot_local
     # Rajoute gitlab comme depot distant (remplacer xxx & yyy)
     git remote add origin https://gitlabinfo.iutmontp.univ-montp2.fr/xxx/yyy.git
	 # Pour anticiper une erreur due aux certificat de l'IUT
	 #              "server certificate verification failed"
	 git config --global http.sslverify false
     # Pousse votre depot local sur Gitlab
     # Plus precisement, pousse toutes les branches locales (--all)
     # en y associant par défaut le depot distant origin (-u origin)
     git push -u origin --all
     ```

  1. Vous avez déjà des fichiers à l'IUT mais pas dans un dépôt Git : Suivez les
     instructions du paragraphe "Push an existing folder".

  1. Vous n'avez pas encore de dépôt à l'IUT : Suivez les instructions du
     paragraphe "Create a new repository".

Vous pouvez accéder maintenant à ce dépôt depuis chez vous le clonant avec
l'adresse donnée dans GitLab. Pensez bien à pousser vos modifications locales
sur le dépôt distant Gitlab avant la fin de chaque séance avec la commande `git
push`.


### Configuration des clés SSH

Vous en avez assez de devoir taper votre mot de passe à chaque `git push` ou
`git pull` ? Mettez en place une identification sécurisée automatique à base de clé SSH.

  1. Créez votre clé SSH sur les machines de l'IUT.

     ```bash
     # Creer un repertoire .ssh dans votre home si necessaire
     mkdir ~/.ssh
     cd ~/.ssh
     # Creation d'une cle publique (id_rsa.pub) et privee (id_rsa)
     # Nom du fichier ou enregistrer la clé -> Entrée pour garder le nom par defaut id_rsa
     # Entrez deux fois un mot de passe
     ssh-keygen
     ```

     <!-- Besoin de ssh-agent ? ssh-add ~/.ssh/id_rsa (id_rsa optionnel) ? -->

  1. Déposez votre clé SSH sur Gitlab.  
     Sur [Gitlab Info](https://gitlabinfo.iutmontp.univ-montp2.fr/), allez dans les
     paramètres utilisateurs puis dans l'onglet latéral SSH Keys. Recopiez le contenu
     de `id_rsa.pub` (clé publique) dans le champ clé.

  1. Il faut alors changer l'adresse du dépôt distant sur Github. En effet les
     adresses commencant par `https` nécessitent une authentification alors que
     celles commencant par `git@` correspondent à SSH :
	 
     ```bash
     # Supprimer l'ancienne adresse du dépôt distant
	 git remote remove origin
	 # La recréer avec la bonne adresse en git@...
	 git remote add origin git@gitlabinfo.iutmontp.univ-montp2.fr:xxx/yyy.git
     ```
	 
