---
title: Entrée / Sortie avec le système de fichiers Linux
subtitle: Accès bas niveau aux fichiers
layout: tutorial
---


## Introduction

Chaque programme en exécution (un processus) possède 3 fichiers qui lui sont
associés.  Ces fichiers sont identifiés par des descripteurs. Un descripteur de
fichier est un entier qui permet d’accéder au fichier.

Au démarrage d’un processus, voici les 3 descripteurs qui lui sont
automatiquement associés :

* 0 : entrée standard
* 1 : sortie standard
* 2 : sortie d’erreurs

On peut avoir d’autres descripteurs en ouvrant des fichiers avec la fonction `open`.

## Écriture / lecture dans un fichier

### La fonction `write`

La signature de la fonction `write` est :

```c
#include <unistd.h>
size_t write(int fildes, const void *buf, size_t nbytes);
```

Cette fonction va écrire `nbytes` à partir de l’adresse `buf` dans le fichier
identifié par le descripteur `filedes`. Cette fonction retourne le nombre de
bytes (octets) effectivement écrits. Si 0 est retourné alors aucun octet n’a été
écrit ; un retour de -1 indique une erreur et la description de l’erreur se
trouvera dans la variable globale `errno`.

### la fonction `write` : premier exercice

Objectif : savoir compiler un programme C

```c
#include <unistd.h>
#include <stdlib.h>
int main() {
  if ((write(1, "Bonjour\n", 8)) != 8)
    write(2, "Erreur sur le descripteur 1\n",28);
  exit(0);
}
```

<div class="exercise">

Compilez et testez ce programme ! 

Prenez l'habitude de nommer proprement vos exécutables à l'aide de l'option `-o`
de `gcc`.

</div>

### La fonction `read`

```c
#include <unistd.h>
size_t read(int fildes, void *buf, size_t nbytes);
```

La fonction `read` va lire `nbytes` octets du fichier indiqué par le descripteur
`fildes` et copier ces octets à l’adresse indiquée par `buf`. La fonction
renvoie le nombre de bytes effectivement lus, qui peut-être inférieur à `nbytes`
par exemple si on arrive en fin de fichier. 

<div class="exercise">

Pour retrouver ces informations sur `read` et d'autres, le bon réflexe est
d'ouvrir le manuel `man read`. Prenons un exemple d'information manquante :  
Il peut arriver que le nombre de bytes effectivement lus soit inférieur à
`nbytes` et que l'on ne soit pas en fin de fichier. **Trouvez** à l'aide du
manuel comment `read` indique avec certitude qu'il est à la fin du fichier.

<!-- Renvoie 0 -->

</div>


<div class="exercise">

Veuillez saisir et compiler le programme suivant :

```c
#include <unistd.h>
#include <stdlib.h>
int main() {
  char buffer[32];
  int nread;
  nread = read(0, buffer, 32);
  if (nread == -1)
    write(2, "Erreur\n", 7);
  if ((write(1,buffer,nread)) != nread)
    write(2, "Erreur\n",7);
  exit(0);
}
```

Testez ce programme :

* Que se passe-t-il si je tape plus de 32 caractères dans l'entrée standard ?
* Que fait la commande suivante ?  
  ```bash
  echo "ceci est un test" | ./mon_programme
  ```
* Et si vous créez un fichier `fichier_test.txt` avec du texte dedans et que
  vous faites  
  ```bash
  ./mon_programme < fichier_test.txt
  ```
  que se passe-t-il et comment  l'expliquez-vous ?

</div>

## Ouvrir et fermer des fichiers

### La fonction `open`

```c
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>
int open(const char *path, int oflags);
int open(const char *path, int oflags, mode_t mode);
```

La fonction `open` rend un service assez simple mais très utile : elle
transforme un chemin d’un fichier en un descripteur manipulable par les
fonctions C.

Si cette transformation est réussie, le descripteur du fichier est retourné. Le
descripteur de fichier retourné est unique et cette valeur ne peut pas être
partagée donc avec d’autre processus en cours d’exécution. Si deux processus
ouvrent le même fichier, ils auront deux valeurs distinctes de descripteurs.

Le chemin du fichier est spécifié dans la variable `path` tandis que `oflags`
indique les actions à entreprendre à l’ouverture du fichier. On spécifie ces
actions avec une combinaison d’actions obligatoires et d’autres optionnelles.

Les actions obligatoires concernent le type d’ouverture :

* `O_RDONLY` : ouvre le fichier en lecture seulement
* `O_WRONLY` : ouvre le fichier en écriture seulement
* `O_RDWR` : ouvre le fichier en écriture et lecture

Les actions optionnelles sont :
* `O_APPEND` : les données écrites sont placées à la fin du fichier
* `O_TRUNC` : la longueur du fichier est mise à zéro
* `O_CREAT` : création du fichier si c’est nécessaire. Les permissions initiales
  sont indiquées par la variable mode.
* `O_EXCL` : utilisé avec `O_CREAT` pour assurer que l’appel de la fonction va
  effectivement créer le fichier.

Pour faire une combinaison des commandes (obligatoires et optionnelles) on
utilise l'opérateur ou binaire `|`. Par exemple
```c
O_CREAT | O_WRONLY | O_TRUNC
```

ouvre un fichier en écriture, avec création si c’est nécessaire, et met son
contenu à zéro.

<div class="exercise">

Dans cette exercice, nous allons apprendre à gérer les erreurs. Les 2 fonctions
utiles sont 

```c
#include <stdio.h>
void perror(const char *s);
```

<!-- ```c -->
<!-- #include <errno.h> -->
<!-- int errno; -->
<!-- ``` -->

1. Lisez le manuel de `perror` pour comprendre ce que fait cette fonction.

   **Attention :** `man perror` ne renvoie pas sur la bonne page du manuel. En
   effet, il renvoie sur `PERROR(1)` qui est la commande shell `perror`. En effet,
   la section 1 du manuel est celle des commandes shell et les principales sections
   du manuel sont (*cf.* `man man`)

   1. Programmes exécutables ou commandes de l'interpréteur de commandes (shell)
   1. Appels système (fonctions fournies par le noyau)
   1. Appels de bibliothèque (fonctions fournies par les bibliothèques des
              programmes)
   1. ...

   Du coup, vous pouvez soit faire `man -a perror` pour afficher succesivement
   toutes les entrées sur `perror` et finir par trouver celle que vous voulez. Ou
   si ous savez déjà que vous voulez l'appel de bibliothèque `perror`, vous pouvez
   taper `man 3 perror`.
   
1. Nous allons créer une erreur et l'afficher avec `perror` :

   ```c
   #include <fcntl.h>
   #include <sys/types.h>
   #include <sys/stat.h>
   /* int open(const char *path, int oflags); */
   
   #include <unistd.h>
   /* int close(int fildes); */
   
   #include <stdio.h>
   /* void perror(const char *s); */
   
   int main() {
     int fd = open("/tmp/fichier-qui-n-existe-pas", O_RDWR);
     if (fd == -1)
       perror("Erreur de open() :");
     close(fd);
   }
   ```

   Quel erreur se cache dans le programme précédent ? Quel est le message
   d'erreur affiché par `perror` ?

1. Créer plusieurs petits programmes qui font les erreurs suivantes et voyez les
   messages d'erreur de `perror` :
   * Ouvrir un fichier qui existe avec les drapeaux qui assurent que `open` doit
     créer le fichier.
   * Ouvrir un fichier en lecture et écrire dedans avec `write`.

Tous les appels systèmes renvoient `-1` en cas d'erreur. Vous devez dans ce TD
   et tous les prochains systématiquement récupérer ce que renvoient les appels
   systèmes et afficher le message d'erreur si nécessaire.

</div>

### Création de fichier avec des permissions initiales

On peut également spécifier les droits associés à un fichier lors de sa création. On
utilise pour cela un certain nombre d’indicateurs de droits qu’on peut combiner avec
l’opérateur |
Les indicateurs de droits sont :
* `S_IRUSR` : permission de lecture pour le propriétaire
* `S_IWUSR` : permission d’écriture pour le propriétaire
* `S_IXUSR` : permission d’exécution pour le propriétaire
* `S_IRGRP` : permission de lecture pour le groupe
* `S_IWGRP` : permission d’écriture pour le groupe
* `S_IXGRP` : permission d’exécution pour le groupe
* `S_IROTH` : permission de lecture pour les autres
* `S_IWOTH` : permission d’écriture pour les autres
* `S_IXOTH` : permission d’exécution pour les autres

Par exemple :
```c
open ("monfichier", O_CREAT, S_IRUSR | S_IXOTH );
```

Demande la création du fichier si c’est nécessaire des droits de lecture pour le propriétaire et exécution pour les autres.

### La fonction `close`

```c
#include <unistd.h>
int close(int fildes);
```

Cette fonction permet de mettre fin à l’association entre le descripteur et le fichier.
La valeur du descripteur devient alors libre et utilisable pour un autre fichier.

### La fonction `ioctl`

La fonction `ioctl` permet de contrôler le comportement des services et des
équipements en indiquant des commandes et les paramètres de ces commandes.

```c
#include <unistd.h>
int ioct(int fildes, int cmd, ...);
```

Pour avoir la liste exacte des commandes et les paramètres des commandes il faut se
reporter à la documentation de chaque service ou équipement.

## Réalisation d’un programme de copie

### Copie caractère par caractère

<div class="exercise">

Réalisez un programme copie `caractere.c` qui copie un fichier vers un autre
caractère par caractère. Le fichier source sera appelé `ficher.in` et la copie
`fichier.out`. Le fichier `fichier.out` devra avoir les droits d'écriture et
d’exécution pour l’utilisateur.

</div>

### Copie par blocs

<div class="exercise">

Réalisez un programme copie `bloc.c` qui copie un fichier vers un autre bloc par bloc.
Le bloc sera représenté par un tableau de 16 caractères 

```c
char bloc[16];
```

</div>
