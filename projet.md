---
title:  Démarrage du projet Web
subtitle: Planning et cahier des charges 
layout: tutorial
lang: fr
---

## Sujet

Vous devez réaliser un site de e-commerce. Les produits que vous devez vendre
sont laissés à votre entière appréciation (y compris humoristique). Il n'y a pas
de restriction particulière. Pensez néanmoins que ce projet Web fait partie de
vos réalisations qui pourraient être mises en avant lors d'un entretien pour un
stage, par exemple.

À la fin de la première séance de la semaine du lundi 7 octobre, vous devrez
donner à votre encadrant : 
* la liste des membres de votre groupe, 
* le thème de votre site (quels produits votre site vend-il ?),
* et le lien vers un dépôt Git sur le GitLab de l'IUT.

Le projet est dimensionné pour des groupes de 3 étudiants. Ponctuellement les
groupes de 2 sont autorisés (mais ils seront notés comme un groupe de 3). Les
groupes de 4 peuvent être exceptionnellement autorisés par votre enseignant, mais
seront évalués de manière plus stricte et l'on attendra 1/3 de boulot en plus.

## Modalités

### Rendu

**Date de rendu du projet :** samedi 23 novembre à 23h59.

Le projet sera à rendre [sur
Moodle](https://moodle.umontpellier.fr/course/view.php?id=27615). Un seul membre
du trinôme dépose une archive zip nommée selon le format :
`NomPrenomMembre1-NomPrenomMembre2-NomPrenomMembre3.zip`.

Cette archive devra contenir :
* Les sources de votre projet,
* l'URL où le site est déployé sur `webinfo`,
* Un fichier README qui contient :
  * Le lien du dépôt git où le code source de l’application est hébergé.
  * Un pourcentage et un récapitulatif de l’investissement de chaque membre du groupe dans le projet (globalement, qui a fait quoi).


### Soutenance

**Date de *soutenance* des projets** : mercredi 27 novembre 

Le jour de la soutenance, **le site devra être déployé sur `webinfo`** sous l'un
de vos comptes. Le code source du site doit être accessible à votre enseignant :
**ajouter votre professeur de PHP à votre dépôt Git** (de préférence le GitLab
de l'IUT), et lui donner le rôle *maintainer* ou *owner*. 

Il n'y a **pas** de rapport à écrire, ni de présentation à préparer. Vous devrez
juste répondre à une série de questions sur votre code qui nous permettra
d'évaluer ce qui a été implémenté.

<!-- Il n'y a pas de date de rendu : votre site Web devront juste
être disponibles au moment de la soutenance. **Attention** cependant aux
modifications de dernière minute qui ont tendance à casser le site ! -->

<!-- **Emploi du temps prévisionnel :**

1. Semaine du lundi 24 octobre 2022 -- Séance projet
2. Semaine du lundi 7 novembre 2022 -- TD 7 -- Cookies & Sessions puis projet
3. Semaine du lundi 14 novembre 2022 -- TD 8 -- Authentification & Validation par email
4. Semaine du lundi 21 novembre 2022 -- Projet
5. Semaine du lundi 2 janvier 2023 -- Évaluation Projet
6. Semaine du lundi 9 janvier 2023 -- Examen final écrit -->


### Critères de notation

Le but pédagogique de ce projet est de mettre en application toutes les
techniques que vous avez apprises lors des TDs.  

**Important :** Voici donc [**les critères sur lesquels vous serez
notés**](https://docs.google.com/spreadsheets/d/1oUd7fe0K8WZhI2TPRRvgZ2xPZf5H22CUvlpcXEMD3Ao/edit#gid=0).
Pour simplifier le projet, vous n'avez pas à gérer de quantité pour les achats
de produits.

La note de ce projet Web interviendra pour environ moitié, l'autre moitié sera
donnée par l'examen final sur papier (pas de code à écrire, questions de
compréhension), sans oublier l'interrogation de fin de TD3 qui comptera moins.

## Informations techniques 

### Git 

Maintenez un dépôt Git propre pour que l'enseignant puisse évaluer la
contribution de chacun en regardant l'historique des *commits*. 

Ces dépôts nous permettront entre autres de suivre l'activité des différents membres de l'équipe. Pour ceci, il faut que vos identités soient propres et identiques sur chaque machine que vous utilisez pour soumettre des commits. Pour ceci, il faut exécuter
```bash
git config --global user.name "Prenom Nom"
git config --global user.email prenom.nom@etu.umontpellier.fr
```

### Héberger le site sur `webinfo`

Vous disposez de votre propre *home* sur les serveurs de l'IUT. Ce *home* contient un dossier `public_html`. Tout ce que vous déposez dans ce dossier est automatiquement servi par le serveur à l'adresse suivante (si votre login était `mon_login_IUT` et votre fichier était `page.html`):
[http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page.html](http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page.html)

Pour pouvoir accéder à votre *home* à distance et y déposer des fichiers, il faudra d'abord trouver vos identifiants de connexion login et mot de passe (vous les utilisez probablement déjà pour vous connecter à d'autres services de l'IUT).

Vous pourrez utiliser FileZilla (il faudra certainement l'installer) pour déposer vos fichiers dans votre dossier `~/public_html` sur le serveur de l'IUT. Pour vous connecter, il faudra choisir comme protocole `SFTP`, comme hôte `ftpinfo.iutmontp.univ-montp2.fr` et vous devrez utiliser votre login et mot de passe. Vous pouvez alors facilement déplacer des fichiers de votre machine vers votre `home`.

Il se peut que tout fonctionne immédiatement, mais il faudra certainement donner les droits au serveur Apache de lire vos fichiers. Pour cela vous pouvez vous connecter en SSH au serveur ce qui vous donnera accès à un terminal. Sous Linux, la commande vous permettant de vous connecter au serveur est la suivante (en remplaçant `mon_login_IUT` par votre login)

```sh
ssh mon_login_IUT@162.38.222.93 -p 6666
```

Il faudra ensuite entrer votre mot de passe et répondre "yes" à la question "Are you sure you want to continue connecting". Vous êtes alors connectés en `ssh` et les commandes que vous tapez sont exécutées sur la machine cible. Il ne vous reste plus qu'à entrer les deux commandes suivantes :

```sh
   # On modifie (-m) récursivement (-R) les droits r-x
   # de l'utilisateur (u:) www-data
   setfacl -R -m u:www-data:r-x ~/public_html
   # On fait de même avec des droits par défaut (d:)
   # (les nouveaux fichiers prendront ces droits)
   setfacl -R -m d:u:www-data:r-x ~/public_html
```

Votre page devrait maintenant être accessible à l'adresse [http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/](http://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/).


Des sources complémentaires sur comment se connecter en FTP et en SSH à `public_html` (pour y déposer des fichiers) :

* [https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/votre-espace-de-travail/](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/votre-espace-de-travail/)
* [https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-aux-serveurs/](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-aux-serveurs/)
* [https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/partager-public_html/](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/partager-public_html/)
* [https://docs.google.com/document/d/1rLb4QWt0uOxE8IuLqeUxjZTivMIA6KbLzieNvsSa_p0/edit#heading=h.l1xavd57lfgb](https://docs.google.com/document/d/1rLb4QWt0uOxE8IuLqeUxjZTivMIA6KbLzieNvsSa_p0/edit#heading=h.l1xavd57lfgb)

## Par où commencer ?

1. Définir les produits que vous souhaitez vendre.
1. Créer la table SQL correspondante.  
   **Conseil:** Préfixez vos noms de tables de projet, e.g. `p_utilisateur`,
   `p_produit`, pour ne pas mélanger vos tables MySQL de projet et celles des TDs.
2. La première séance doit vous permettre d'implémenter quelques actions du MVC
   Produit.

### Ce que ce projet n'est pas :

* Un site vitrine joli avec beaucoup d'images par exemple. Vous n'aurez pas de
  point sur cet aspect. Par contre, vous êtes autorisés à repartir de votre
  projet de HTML/CSS de l'an dernier.
* Un site réaliste qui implémente `X` fois la même fonctionnalité. Le but est de
  réaliser correctement un maximum de fonctionnalités différentes des [critères
  de notation](https://docs.google.com/spreadsheets/d/1oUd7fe0K8WZhI2TPRRvgZ2xPZf5H22CUvlpcXEMD3Ao/edit#gid=0) (cf. plus haut).

### Que garder pour plus tard ?

Dans la suite de ce cours, plusieurs séances seront consacrées à

* la gestion des utilisateurs,
* la gestion des paniers, 
* la sécurisation de votre site Web

En conséquence, ne pas attaquer ces parties pour le moment. 

<!-- ### Où héberger ce site? Comment partager votre code PHP ? Comment travailler à distance de l'IUT ?

Pour travailler à distance, vous pouvez soit installer un serveur Web sur votre
ordinateur (cf. [la fin du
TD1](http://romainlebreton.github.io/R3.01-DeveloppementWeb/tutorials/tutorial1.html#installez-un-serveur-apache-chez-vous))
ou envoyer vos fichiers à l'IUT en FTP avec FileZilla par exemple ou utiliser SSH
(cf. [instructions sur l'intranet Côté Technique > Accès au Réseau > Depuis chez
vous](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-aux-serveurs/)).

Lors de la soutenance, le site devra être hébergé dans le répertoire de l'un des
membres de votre groupe. Par exemple
[http://webinfo.iutmontp.univ-montp2.fr/~mon_login/eCommerce/](http://webinfo.iutmontp.univ-montp2.fr/~mon_login/eCommerce/)

Pour partager votre code PHP, créez un projet Git commun sur le [Gitlab de
l'IUT](https://gitlabinfo.iutmontp.univ-montp2.fr). Puis chacun
`clone` le projet dans son `public_html` pour avoir une copie du dépôt sur son
compte. 

Établissez clairement qui écrit dans quel fichier : si 2 personnes modifient la
même partie de code, ils risquent d'avoir des conflits lors du `git pull`. Une
bonne pratique est d'utiliser le système de branches de Git à chaque fois que
l'on veut développer une nouvelle fonctionnalité.

Pour plus d'informations sur Git, la création d'une clé SSH, les commandes `git
pull/add/commit/push` et autres `git log/status`, la gestion des conflits, je
vous renvoie sur le [tutoriel d'introduction à
Git](https://gitlabinfo.iutmontp.univ-montp2.fr/valicov/tutoGit1ereAnnee/blob/master/README.md). -->

<!-- #### Répertoire partagé à l'IUT

L'étudiant 1 doit donc créer le répertoire `eCommerce` dans son dossier `public_html`
puis donner les droits aux autres étudiants de son groupe sur ce répertoire :

* `setfacl -m u:loginetudiant2:x /home/ann2/loginetudiant1` (droit de
     lister le répertoire personnel)
* `setfacl -m u:loginetudiant2:x /home/ann2/loginetudiant1/public_html` (droit de
     lister le répertoire `public_html`)
* `setfacl -R -m u:loginetudiant2:rwx eCommerce` (donne récursivement les droits
à tous les fichiers inclus dans `eCommerce`)
* `setfacl -R -m d:u:loginetudiant2:rwx eCommerce` (défini des droits par
défaut : les nouveaux fichiers créés prendront ces droits)

**Rappel du TD 1 :** Les ACL permettent d'avoir des droits spécifiques à
   plusieurs utilisateurs et à plusieurs groupes quand les droits classiques
   sont limités à un utilisateur et un groupe. Pour lire les droits ACL d'un
   fichier ou dossier, on tape `getfacl nom_du_fichier`.

**Référence :**
  [La page Côté Technique > Site Web > Partager public_html de intradepinfo](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/partager-public_html/) -->
