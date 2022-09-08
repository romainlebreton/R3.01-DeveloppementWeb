---
title: TD1 &ndash; Quelques compléments et rappels
subtitle: Encodage, serveur HTTP, URL, Git
layout: tutorial
---

## Encodage des caractères

**Un problème avec les accents ?**  
Cela provient sûrement de l'encodage des caractères. Comme indiqué dans le TD,
l'encodage d'une page Web se déclare dans son en-tête avec `<meta
charset="utf-8" />` si le fichier est encodé en UTF-8.

Sous linux, les fichiers sont encodés en UTF8 (ou ASCII) par défaut. 
Le problème vient comme souvent de Windows qui tend encore à utiliser l'encodage
ISO-8859-15.

Sous linux, on peut utiliser la commande 
`file nom_du_fichier`
pour détecter l'encodage des caractères.

La commande `iconv` est utile pour changer l'encodage des caractères d'un fichier.  
**Exemple :** `iconv -f ISO-8859-15 -t UTF-8 < input.txt > output.txt`


<!--
% Créer un dossier WebServeur dans public-HTML puis un sous-dossier TD1
% Tuto NetBeans
-->


## Comment faire pour qu'une page Web soit servie par le serveur HTTP sur webinfo ?

On écrit une page Web dans le dossier **public_html** de son répertoire personnel et
on donne les droits au serveur HTTP Apache (utilisateur www-data) de lire les
pages Web (bit r--) et de traverser les dossiers menant à la page Web (bit de
permission --x).

Dans le TD, nous vous avons indiqué la commande

```bash
setfacl -m u:www-data:r-x nom_du_fichier ou nom_du_répertoire
```

En pratique, faites
```bash
# On modifie (-m) récursivement (-R) les droits r-x
# de l'utilisateur (u:) www-data
setfacl -R -m u:www-data:r-x ~/public_html
# On fait de même avec des droits par défaut (d:)
# (les nouveaux fichiers prendront ces droits)
setfacl -R -m d:u:www-data:r-x ~/public_html
```

Cette commande donne les droits `r-x` à l'utilisateur `www-data`. Les ACL
permettent d'avoir des droits spécifiques à plusieurs utilisateurs et à
plusieurs groupes quand les droits classiques sont limités à un utilisateur et un
groupe.

**Note :**  
Si on a activé le module Apache `mod_dir` qui permet de lister le
contenu d'un dossier, il faut donner la permission de lecture sur les dossiers à
Apache pour qu'il puisse lister leur contenu.

{% comment %}
## Short tag `echo`

`<?= $var_name ?>`  est équivalent à `<?php echo $var_name ?>`.
{% endcomment %}

## Note sur les URLs

### Les URL en `http://` et `https://`

**Exemple :** http://webinfo.iutmontp.univ-montp2.fr/~rletud/index.html 

Ici, la 1ère partie de l'URL `http://` correspond toujours au protocole de
communication, qui est bien sûr le Hypertext Transfer Protocol dans notre cas.
En 2ème partie, nous avons désormais l'hôte `webinfo.iutmontp.univ-montp2.fr`
qui décrit la machine à qui s'adresser. Enfin la 3ème partie
`/~rletud/index.html` correspond au chemin complet de la page Web pour le serveur.  
**Référence :** [Les URL](https://fr.wikipedia.org/wiki/Uniform_Resource_Locator)

<!--
Pour les formulaires, il faut définir la query string

Parler d'URL relative ? 

En général 
scheme:[//[user:password@]domain[:port]][/]path[?query][#fragment]
Nous reviendrons plus tard en particulier sur la partie query et fragment.
-->

### Les URL en `file://`

**Exemple :** file:///home/lebreton/public_html/index.html

L'URL (Uniform Ressource Locator "localisateur uniforme de ressource") est un
format d'adresse qui permet de localiser des pages Web. La 1ère partie
`file://` correspond au protocole de communication (ici un fichier sur votre
disque dur). La 2ème partie est le chemin absolu du fichier Web
`/home/lebreton/public_html/index.html`  
**Référence :** [Schéma d'URI 'file'](https://en.wikipedia.org/wiki/File_URI_scheme)


Pour nous, une adresse commençant par `file://` est à proscrire. En effet, une
telle adresse signifie que nos pages PHP ne passent pas par le serveur HTTP
(Apache). Et donc que le PHP n'est pas interprété.


*Note culturelle (optionelle):* En fait, `file://` est un schéma d'URI (Uniform Ressource
Identifier) qui est un schéma plus général et qui identifie pleins d'autres
objets que des pages Web.
Les schémas d'URI "http://" et "https:" correspondent à ce que l'on appelle
les URL.

## Configuration des clés SSH

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

  1. **Si et seulement si** vous avez déjà cloné votre dépôt Git en mode HTTPs, 
     il faut changer l'adresse du dépôt distant sur Github. En effet les
     adresses commencant par `https` nécessitent une authentification alors que
     celles commencant par `git@` correspondent à SSH :
	 
     ```bash
     # Supprimer l'ancienne adresse du dépôt distant
	 git remote remove origin
	 # La recréer avec la bonne adresse en git@...
	 git remote add origin git@gitlabinfo.iutmontp.univ-montp2.fr:xxx/yyy.git
     ```
	 
## Installer PhpStorm sur sa machine

Si vous utilisez votre propre machine :
* sur Ubuntu le plus simple pour installer l'IDE c'est d'utiliser _Snap_, qui est un système de distribution de logiciels simplifié et qui est pré-installé sur toutes les versions récentes d'Ubuntu. À partir d'un terminal tapez :

    ```bash
    sudo snap install phpstorm --classic
    ```

* sur Windows, Mac OS, ou Linux on peut faire l'installation depuis un exécutable. Suivez les instructions de la 
[documentation de PhpStorm](https://www.jetbrains.com/help/phpstorm/installation-guide.html#standalone).

Pour Linux, la documentation vous dit 
* de [télécharger l'archive](https://www.jetbrains.com/phpstorm/download/),
* de l'extraire dans un endroit qui va bien (dans votre `$HOME` par exemple)    
    ```bash
    tar -xzf PhpStorm-***.tar.gz --directory ~/
    ```
* et de lancer l'exécutable se trouvant dans le répertoire `PhpStorm-***.tar.gz/bin/`. Depuis un terminal :
    ```bash
    cd ~/PhpStorm-***/bin/
    ./phpstorm.sh
    ```
