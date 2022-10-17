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

À la fin de cette séance vous devrez donner à votre encadrant la liste des
membres de votre groupe ainsi que le thème de votre site (quels produits votre
site vend-il ? ).

## Modalités

Le projet est dimensionné pour des groupes de 3 étudiants. Ponctuellement les
groupes de 2 sont autorisés (mais ils seront notés comme un groupe de 3). 

<!-- Les groupes de 4 sont aussi ponctuellement autorisés, mais seront évalués de
manière plus stricte et l'on attendra 1/3 de boulot en plus. -->

<!-- Les soutenances de projet auront lieu entre le jeudi 9 et le mercredi 15
décembre, à votre créneau de TD habituel.  -->

La note de ce projet Web interviendra pour moitié, l'autre moitié sera donnée
par l'examen final sur papier (pas de code à écrire, questions de
compréhension).

Le jour de la soutenance, **le site devra être déployé sur `webinfo`** sous l'un
de vos comptes. Le code source du site doit être accessible à votre enseignant :
ajouter votre professeur de PHP à votre dépôt Git, et lui donner au moins le
rôle développeur. Il n'y a pas de date de rendu : votre site Web devront juste
être disponibles au moment de la soutenance. **Attention** cependant aux
modifications de dernière minute qui ont tendance à casser le site !

**Emploi du temps prévisionnel :**

1. Semaine du lundi 24 octobre 2022 -- Séance projet
1. Semaine du lundi 7 novembre 2022 -- TD 7 -- Cookies & Sessions puis projet
1. Semaine du lundi 14 novembre 2022 -- TD 8 -- Authentification & Validation par email
1. Semaine du lundi 21 novembre 2022 -- Projet
1. Semaine du lundi 2 janvier 2023 -- Évaluation Projet
1. Semaine du lundi 9 janvier 2023 -- Examen final écrit


### Critères de notation

Le but pédagogique de ce projet est de mettre en application toutes les
techniques que vous avez apprises lors des TDs. **Important :** Voici donc
[**les critères sur lesquels vous serez
notés**](https://docs.google.com/spreadsheets/d/1oUd7fe0K8WZhI2TPRRvgZ2xPZf5H22CUvlpcXEMD3Ao/edit#gid=0).

Il n'y a **pas** de rapport à écrire, ni de présentation à préparer. Vous devrez
juste répondre à une série de questions sur votre code qui nous permettra
d'évaluer ce qui a été implémenté.

## Par où commencer ?

1. Définir les produits que vous souhaitez vendre.
1. Créer la table SQL correspondante.  
   **Conseil:** Préfixez vos noms de tables de projet, e.g. `p_utilisateur`,
   `p_produit`, pour vous y retrouver dans PHPMyAdmin.
1. La première séance doit vous permettre d'implémenter quelques actions du MVC
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

### Où héberger ce site? Comment partager votre code PHP ? Comment travailler à distance de l'IUT ?

Pour travailler à distance, vous pouvez soit installer un serveur Web sur votre
ordinateur (cf. [la fin du
TD1](http://romainlebreton.github.io/R3.01-DeveloppementWeb/tutorials/tutorial1.html#installez-un-serveur-apache-chez-vous))
ou envoyer vos fichiers à l'IUT en FTP avec FileZilla par exemple ou utiliser SSH
(cf. [instructions sur l'intranet Côté Technique > Accès au Réseau > Depuis chez
vous](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-a-distance/)).

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
Git](https://gitlabinfo.iutmontp.univ-montp2.fr/valicov/tutoGit1ereAnnee/blob/master/README.md).

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
