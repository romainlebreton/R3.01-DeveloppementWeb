---
title:  Démarage du projet Web
subtitle: Planning et cahier des charges 
layout: tutorial
---

<!-- Dire modalités évaluation sans dossier ni présentation, déposer le site sur infolimon -->

## Sujet

Vous devrez réaliser un site de e-commerce. Les produits que vous devez vendre
sont laissés à votre entière apréciation (y compris humoristique). Il n'y a pas
de restriction particulière.  Pensez néanmoins que ce projet Web fait partie de
vos réalisations qui pourraient être mises en avant lors d'un entretien pour un
stage, par exemple.

A la fin de cette séance vous devrez donner à votre encadrant la liste des
membres de votre groupe ainsi que le thème de votre site (quels produits votre
site vend il ? ).

## Modalités

Le projet est dimensionné pour des groupes de 3 étudiants.  Ponctuellement les
groupes de 2 sont autorisés (mais ne bénéficieront pas d'un bonus pour effectif
réduit).  Les groupes de 4 sont aussi ponctuellement autorisés, mais seront
évalués de manière plus stricte.

Le projet commence la semaine du 19 Octobre.

Les soutenances de projet auront lieu la semaine du 14 Décembre.  La note de ce
projet Web interviendra pour moitié dans la note de l'UE 'Programmation Web côté
serveur'. L'autre moitié sera donnée par l'examen final sur papier (pas de code
à écrire, questions de compréhension).

Le jour de la soutenance, **le site devra être déployé sur `infolimon`** sous
l'un de vos comptes. Les sources du site devront être accessible dans un fichier
`sources.zip` à la racine de votre site.

**Emploi du temps prévisionnel :**

1. 19 Oct - Début projet
1. 26 Oct - Pas de TDs : Congé IUT
1. 2  Nov - 3h projet
1. 9  Nov - Pas de TDs : Partiels IUT
1. 16 Nov - Cookie & session + 1h projet + 1h projet
1. 23 Nov - Authentification & validation par email + 1h projet
1. 30 Nov - 3h projet
1. 7  Déc - 3h projet
1. 14 Déc - soutenances


## Ce que ce projet n'est pas :

* Un site vitrine joli avec beaucoup d'images par exemple. 
* Un site réaliste qui implémente `X` fois la même fonctionnalité.  Le but est
de réaliser correctement un maximum de fonctionnalités différentes.

## Que garder pour plus tard ?

Dans la suite de ce cours, plusieurs séances seront consacrées à: 

* la gestion des utilisateurs,
* la gestion des paniers, 
* la sécurisation de votre site web

En conséquence, ne pas attaquer ces parties pour le moment. 

## How to start ?

1. Définir les produits que vous souhaitez vendre.  
Vous devez éventuellement prévoir des extensions, par exemple des accessoires
pour vos produits.  S'agit-il d'une association "un vers plusieurs" ou
"plusieurs vers plusieurs" ?

2. Créer les 2-3 tables correspondantes en SQL. Si votre schéma de Base de
Données contient des clés étrangères (ce qui est probable), pensez à utiliser le
format de stockage InnoDB. Se reporter au
[TD 3](http://romainlebreton.github.io/ProgWeb-CoteServeur/tutorials/tutorial3.html)
pour plus de détails.

3. Cette première séance est consacrée à implémenter le Modèle, le Controleur et
   les premières vues spécifiques à vos produits.

### Ou héberger ce site? comment partager un répertoire ?

Le site à rendre sera à héberger dans le repertoire de l'un des membres de votre groupe. 
Par exemple [http://infolimon.iutmontp.univ-montp2.fr/~mon_login/eCommerce/](http://infolimon.iutmontp.univ-montp2.fr/~mon_login/eCommerce/)

L'étudiant 1 doit donc créer le répertoire `eCommerce` dans son dossier `public_html`
puis donner les droits aux autres étudiants de son groupe sur ce répertoire:

* `setfacl -m u:loginetudiant2:x /home/ann2/loginetudiant1` (droit de
     lister le repertoire personnel)
* `setfacl -m u:loginetudiant2:x /home/ann2/loginetudiant1/public_html` (droit de
     lister le repertoire public_html)
* `setfacl -R -m u:loginetudiant2:rwx eCommerce` (donne récursivement les droits
à tout les fichiers inclus dans eCommerce)
* `setfacl -R -m d:u:loginetudiant2:rwx eCommerce` (défini des droits par
défaut : les nouveaux fichiers créés prendront ces droits)

**Rappel du TD 1 :** Les ACL permettent d'avoir des droits spécifiques à
   plusieurs utilisateurs et à plusieurs groupes quand les droits classiques
   sont limités à un utilisateur et un groupe. Pour lire les droits ACL d'un
   fichier ou dossier, on tape `getfacl nom_du_fichier`.

**Référence :**
  [La page Côté Technique > Site Web > Partager public_html de intradepinfo](https://iutdepinfo.iutmontp.univ-montp2.fr/index.php/cote-technique/site-web/partager-publichtml)

## Critères de notation

La liste ci-dessous n'est pas définitive et sera mise à jour début Novembre. Il
n'y a **pas** de rapport à écrire, ni de présentation à préparer. Vous devrez
juste répondre à une série de questions sur votre code qui nous permettra
d'évaluer ce qui a été implémenté.

[Grille évaluation Projet Prog Web 2015](https://docs.google.com/spreadsheets/d/1CSC5-27rFoJRAlEbQCamBMf3vY6FASgEtcxIKipgwxk/edit#gid=0)

[Planning des soutenances](https://docs.google.com/spreadsheets/d/1XTz2e8liq8Gzs_ZJTGaZiFozNHHhjwY547SLj12NZiU/edit?usp=sharing)

<!--
### Front-Office 

**Rappel:** le projet portant sur la programmation côté serveur, la partie de la note correspondante au design HTML/CSS est faible. 

1. HTML / CSS valides et séparés
3. Problème d’encodage: problème avec les accents dans les textes fixes ou issues de la BD.
4. W3C (plus de 10 erreurs  / 1-2 erreurs / aucune erreur)
5. Factorisation code (aucune / include header+footer / include content)

Pourquoi les items suivants ?
3. utilisation de `<div>` pour la mise en page
2. CSS responsive


### Gestion des formulaires Formulaire (de contacts ou autre)

2. Vérification des données en HTML5 ou Javascript
3. Vérification des données en PHP
4. Re-Remplissage du formulaire en cas d'erreur de saisie.


### Gestion des  utilisateurs

1. mail confirmation pour l'inscription

2. différents niveaux: admin/users

### Gestion du panier 
1. Cookie 

### Back-office

1. Utilisation des sessions: 
2. Message bienvenue
3. Sécurisation de quelques pages (manuellement)
4. Sécurisation de toutes les pages (automatisé via le controleur)

### CRUD

Produits:
Ajout / Suppression  / Modification

Relations annexes nécesitant une jointure (genre accesoires):
Ajout / Suppression  / Modification

### MVC 

1. Vues liste / liste paginée / détail 

2. Critères visant à évaluer la qualité de votre MVC: (to be completed)

Aucun code HTML hors des vues

Aucun SQL hors du modèle 

### Qualité de la démonstration 

-->
