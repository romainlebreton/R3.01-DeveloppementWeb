---
title:  Démarrage du projet Web
subtitle: Planning et cahier des charges 
layout: tutorial
lang: fr
---

{% comment %}
<!-- 
TODO : fixer la date et le format de la soutenance (oral individuel ou collectif ?)
-->
{% endcomment %}

## Sujet

Vous devez réaliser un site de e-commerce. Les produits que vous devez vendre
sont laissés à votre entière appréciation (y compris humoristique). Il n'y a pas
de restriction particulière. Pensez néanmoins que ce projet Web fait partie de
vos réalisations qui pourraient être mises en avant lors d'un entretien pour un
stage, par exemple.

Le but pédagogique de ce projet est de **réappliquer ce que vous avez appris en
TD** sur un sujet proche du site de covoiturage, mais différent. Votre site doit
donc reprendre au maximum le code et l'architecture que vous avez construits
pendant les TDs, en les adaptant à votre sujet. Le projet évalue ainsi aussi le
travail que vous avez fourni sur les TDs.

À la fin de la première séance de la semaine du lundi 12 octobre, vous devrez
donner à votre encadrant : 
* la liste des membres de votre groupe, 
* le thème de votre site (quels produits votre site vend-il ?),
* et le lien vers un dépôt Git sur le GitLab de l'IUT.

Le projet est dimensionné pour des groupes de 3 étudiants. Ponctuellement les
groupes de 2 sont autorisés (mais ils seront notés comme un groupe de 3). Les
groupes de 4 peuvent être exceptionnellement autorisés par votre enseignant, mais
seront évalués de manière plus stricte et l'on attendra 1/3 de boulot en plus.

### Cahier des charges

Votre site doit proposer les fonctionnalités suivantes :

* **Catalogue** : tout visiteur peut consulter la liste des produits et le
  détail d'un produit.
* **Panier** : tout visiteur, connecté ou non, peut ajouter un produit à son
  panier, consulter son panier et en retirer un produit. Pour simplifier le
  projet, vous n'avez pas à gérer de quantité : un produit est présent au plus
  une fois dans le panier.
* **Comptes utilisateurs** : un visiteur peut s'inscrire. Son adresse email doit
  être validée avant qu'il puisse se connecter. Un utilisateur connecté peut
  consulter, modifier et supprimer son compte, et se déconnecter.
* **Commande** : un utilisateur connecté peut valider son panier. Cela crée une
  commande contenant tous les produits du panier, puis vide le panier.
* **Historique** : un utilisateur connecté peut consulter ses commandes passées
  et leur contenu.
* **Administration** : un administrateur peut créer, modifier et supprimer des
  produits. Il peut aussi gérer les comptes utilisateurs, y compris donner le
  rôle d'administrateur.

### Contraintes techniques

C'est un projet d'application des TDs : il doit **réutiliser au maximum les
techniques et le code vus dans ce cours**. En particulier :

* Votre site est écrit en PHP sans framework (pas de Laravel, Symfony…), sans
  bibliothèque externe et sans ORM, comme dans les TDs.
* Reprenez l'architecture construite en TD : contrôleur frontal, MVC, modèle
  séparé en *DataObject* et *Repository* génériques, chargement automatique des
  classes, vue générique `vueGenerale.php`, classes utilitaires de `src/Lib`…
* Le site utilise la base de données MySQL de l'IUT et le rendu final est 
  déployé sur `webinfo`. 
  Nous vous recommandons de le développer sous Docker, comme lors des TDs, avant 
  de le déployer sur `webinfo`.
* JavaScript n'est pas nécessaire. 

### Utilisation de l'IA

L'utilisation d'assistants d'IA (ChatGPT, Copilot, Claude…) est autorisée.
Cependant, **c'est vous qui êtes évalués, pas l'IA** : vous devez être capables
d'expliquer, de justifier et de modifier n'importe quelle partie du code que
vous rendez. Un code que vous auriez fait générer sans le comprendre vous
pénalisera lors des évaluations.

Indiquez dans votre `README` comment vous avez utilisé l'IA (outils utilisés,
parties du projet concernées).

## Modalités

### Rendu

**Date de rendu du projet :** samedi 28 novembre à 23h59.

Le projet sera à rendre [sur
Moodle](https://moodle.umontpellier.fr/course/view.php?id=27615). Un seul membre
du groupe dépose une archive zip nommée selon le format :
`NomPrenomMembre1-NomPrenomMembre2-NomPrenomMembre3.zip`.

Cette archive devra contenir :
* Les sources de votre projet (sans les dossiers superflus comme `.idea` ou `.git`).
* Un script SQL qui crée vos tables et les remplit avec un jeu de données de
  démonstration (utilisateurs, produits, commandes).
* Un fichier `README` qui contient :
  * le lien du site déployé sur `webinfo`,
  * le lien du dépôt Git où le code source de l'application est hébergé,
  * la répartition du travail dans l'équipe (qui a fait quoi) avec, pour chaque
    membre, une estimation en pourcentage de sa contribution au projet. Cette
    répartition doit être validée par l'ensemble du groupe,
  * la description de votre utilisation de l'IA (cf. plus haut),
  * tout autre commentaire que vous jugez pertinent.
* Un fichier `IDENTIFIANTS` qui donne les identifiants de plusieurs comptes de
  votre site déployé sur `webinfo` : au moins un administrateur et un
  utilisateur normal.
* Pour **chaque membre du groupe**, un fichier `CONTRIBUTIONS_NOM_PRENOM` qui
  indique, pour chaque fonctionnalité à laquelle il a contribué :
  * le nom de la fonctionnalité,
  * ce qu'il a personnellement réalisé,
  * les principaux fichiers concernés (contrôleurs, repositories, vues…).
    L'idée n'est pas d'être exhaustif, mais d'indiquer « si vous voulez voir
    comment j'ai réalisé cette fonctionnalité, voici où regarder ».

{% comment %}
### Soutenance

**Date de *soutenance* des projets** : communiquée ultérieurement.

Le jour de la soutenance, **le site devra être déployé sur `webinfo`** sous l'un
de vos comptes. Le code source du site doit être accessible à votre enseignant :
**ajouter votre professeur de PHP à votre dépôt Git** (de préférence le GitLab
de l'IUT), et lui donner le rôle *maintainer* ou *owner*. 

Il n'y a **pas** de rapport à écrire, ni de présentation à préparer. Vous serez
interrogés sur votre code : vous devrez être capables de retrouver le code d'une
fonctionnalité, d'expliquer son fonctionnement, de justifier vos choix et de le
faire évoluer. Les fichiers `CONTRIBUTIONS_NOM_PRENOM` serviront de base à ces
questions. Les modalités précises de la soutenance vous seront communiquées
ultérieurement.
{% endcomment %}

{% comment %}
**Référence :**
  [La page Côté Technique > Site Web > Partager public_html de intradepinfo](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/partager-public_html/) -->
{% endcomment %}

### Critères de notation

**Important :** Voici [**les critères sur lesquels vous serez
notés**](https://docs.google.com/spreadsheets/d/1oUd7fe0K8WZhI2TPRRvgZ2xPZf5H22CUvlpcXEMD3Ao/edit#gid=0).
Ces critères sont indicatifs.

La note de ce projet Web comptera pour 30 % de la note du module. L'examen final
sur papier (pas de code à écrire, questions de compréhension) comptera pour 50 %
et les deux interrogations écrites pour 20 %.

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
[https://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page.html](https://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/page.html)

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

Votre page devrait maintenant être accessible à l'adresse [https://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/](https://webinfo.iutmontp.univ-montp2.fr/~mon_login_IUT/).


Des sources complémentaires sur comment se connecter en FTP et en SSH à `public_html` (pour y déposer des fichiers) :

* [https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/votre-espace-de-travail/](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/votre-espace-de-travail/)
* [https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-aux-serveurs/](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/acces-aux-serveurs/)
* [https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/partager-public_html/](https://iutdepinfo.iutmontp.univ-montp2.fr/intranet/partager-public_html/)
* [https://docs.google.com/document/d/1rLb4QWt0uOxE8IuLqeUxjZTivMIA6KbLzieNvsSa_p0/edit#heading=h.l1xavd57lfgb](https://docs.google.com/document/d/1rLb4QWt0uOxE8IuLqeUxjZTivMIA6KbLzieNvsSa_p0/edit#heading=h.l1xavd57lfgb)

### Envoyer des emails depuis `webinfo`

Sur `webinfo`, la fonction `mail()` de PHP est déjà configurée, mais elle ne
peut envoyer des emails qu'à des adresses du domaine `yopmail.com` (adresses
jetables consultables sur [yopmail.com](https://yopmail.com)). Utilisez donc ces
adresses pour vos comptes de test (cf. [TD8]({{site.baseurl}}/tutorials/tutorial8.html)).

## Par où commencer ?

1. Définir les produits que vous souhaitez vendre.
2. Créer la table SQL correspondante.  
   **Conseil:** Préfixez vos noms de tables de projet, e.g. `p_utilisateur`,
   `p_produit`, pour ne pas mélanger vos tables MySQL de projet et celles des TDs.
3. La première séance doit vous permettre d'implémenter quelques actions du MVC
   Produit, en vous inspirant de votre MVC Trajet.

### Ce que ce projet n'est pas :

* Un site vitrine joli avec beaucoup d'images par exemple. Vous n'aurez pas de
  point sur cet aspect. Par contre, vous êtes autorisés à repartir de votre
  projet de HTML/CSS de l'an dernier.
* Un site réaliste qui implémente `X` fois la même fonctionnalité. Le but est de
  réaliser correctement un maximum de fonctionnalités différentes des [critères
  de notation](https://docs.google.com/spreadsheets/d/1oUd7fe0K8WZhI2TPRRvgZ2xPZf5H22CUvlpcXEMD3Ao/edit#gid=0) (cf. plus haut).

### Que garder pour plus tard ?

Le projet démarre après le TD6. Les TDs suivants vous apprendront ce dont vous
aurez besoin pour :

* le panier, avec les cookies et les sessions
  ([TD7]({{site.baseurl}}/tutorials/tutorial7.html)),
* l'authentification des utilisateurs et le contrôle d'accès
  ([TD8]({{site.baseurl}}/tutorials/tutorial8.html)),
* les messages flash et les redirections
  ([TD9]({{site.baseurl}}/tutorials/tutorial9.html)).

En conséquence, n'attaquez pas ces parties pour le moment : intégrez-les à votre
projet au fur et à mesure que vous avancez dans les TDs.
