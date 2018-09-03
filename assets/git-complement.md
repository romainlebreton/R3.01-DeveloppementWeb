---
title: Introduction au gestionnaire de version Git
subtitle: Sauvegarde & travail collaboratif
layout: tutorial
---

Git et Gitlab/GitHub sont aujourd'hui des outils incontournables dans le
processus de développement de logiciels.

GitLab workflow 
https://gitlabinfo.iutmontp.univ-montp2.fr/

Savoir où on en est, revenir en arrière, travailler collaborativement, maintenir
plusieurs versions d'un logiciel, écrire du code expérimental et l'intégrer (ou
non) dans le logiciel final. Indispensable en entreprise.

## Git-it

Pour les exercices mais lié à GitHub. Bien mais pas indspensable

## Git

### Commandes de base

Créer
sauvegarder
pousser (publier)
tirer (récupérer)

ajout d'un dossier / fichier (git add -p)

git status

Fork, pull request

D'abord HTTPS (git clone https://lebreton@gitlabinfo.iutmontp.univ-montp2.fr/lebreton/PHP-mon-premier-depot-git.git pour ne pas avoir à taper son mot de passe à chaque fois)

puis SSH (génératiion de clé...)

Lier avec gitlab iut
Gitg

Cours RObin passama et petru valicov

### Invite bash différent

Pour que votre invite bash vous indique que vous êtes dans un dépôt Git et sur
quelle branche vous êtes, il faut remplacer dans votre `.bashrc` la partie suivante

```bash
if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
```

par le code suivant

```bash
parse_git_branch() {
     git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(parse_git_branch)\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
```

**
Ou plutôt selon Petru

```
parse_git_dirty (){
  [[ $(git status 2> /dev/null | tail -n1) != "rien à valider, la copie de travail est propre" ]] && echo "*"
}

parse_git_branch () {
  git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e "s/^..\(.*\)/(\1$(parse_git_dirty))/"
}

# Prompt simple pour afficher la branche git courante
PS1="\[\033[01;34m\]\w\[\033[00m\]" 
PS1="$PS1 \[\033[01;31m\]\$(parse_git_branch)\[\033[00m\]"
PS1="$PS1\$ "
```


<img alt="Capture d'écran de GitG"
src="{{site.baseurl}}/assets/Gitg-example.png" style="float:right;width:20em;">

### Interface graphique GitG

Une interface graphique simple de Git appelée `GitG` est installé sur les
machines de l'IUT. Elle vous permet entre autre de voir vos commits, vos
changements actuels, de choisir quelles modifications enregistrer, de faire des
commits, ...

<div style="clear:both;"></div>

## GitLab à l'IUT

Au premier abord, [GitLab](https://gitlabinfo.iutmontp.univ-montp2.fr/) est une
interface Web à des dépôts Git à l'IUT.  Wikis, issue tracker, mattermost

graphique

https://gitlabinfo.iutmontp.univ-montp2.fr/

https://gitlabinfo.iutmontp.univ-montp2.fr/help

### Fonctionnalités de bases

#### Première connexion

Lors de votre première connexion à
[GitLab](https://gitlabinfo.iutmontp.univ-montp2.fr/), vous aurez à remplir vos
informations personnelles (email, langue, ...). Vos identifiants et mots de
passe sont ceux de l'IUT.

#### Créer des projets

En cliquant sur l'onglet `Projets > Vos projets`, vous pourrez créer un projet
GitLab (= un dépôt Git).

Vous pouvez aussi créer un projet associé à un groupe de personnes en commençant
par créer un groupe (Onglet `Groups` en haut de la page)

#### Se connecter par SSH

Se connecter par SSH à vos dépots Git a deux principaux avantages : vous n'aurez
pas à retaper vos mots de passe et c'est plus sécurisé. 

Vous pouvez vous aider des documentations (en anglais) de [GitHub (plus
simple)](https://help.github.com/articles/connecting-to-github-with-ssh/) pour
générer la clé et de celle de
[GitLab](https://gitlabinfo.iutmontp.univ-montp2.fr/help/ssh/README.md) pour
savoir où la copier dans GitLab.




### Fonctionnalités avancées

Les fonctionnalités suivantes sont propres à GitLab et ne font pas partie de Git.

<!-- ### Fourcher des projets -->

#### Issues / Tickets

#### Pull Request

#### Mattermost à l'IUT

Intégration de Mattermost à GitLab
https://gitlabinfo.iutmontp.univ-montp2.fr/lebreton/PHP-mon-premier-depot-git/settings/integrations



%%%%%%%%%%%%%%%%%%%%%

Gitlab IUT première connexion, email validation
   
git clone https://lebreton@gitlabinfo.iutmontp.univ-montp2.fr/lebreton/PHP-mon-premier-depot-git.git

**Quel éditeur de texte pour Git commit à l'IUT ???**
https://help.github.com/articles/associating-text-editors-with-git/

h
ttp://mattermostinfo.iutmontp.univ-montp2.fr/signup_user_complete/?id=8oqq8nggk7ft7m85a7f1cew64c
