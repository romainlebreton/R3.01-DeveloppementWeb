---
title: Upload de fichiers
subtitle: Envoyer une image de profil depuis un formulaire
layout: tutorial
lang: fr
---

Cette note explique comment permettre à un utilisateur d'envoyer un fichier (par
exemple une image de profil) au serveur. Elle s'appuie sur l'architecture MVC
des TDs (contrôleur frontal, dossier `ressources`, ...) et peut vous servir pour
votre projet.

## Changement dans le formulaire

Premièrement, il faut changer la propriété `enctype` de votre formulaire à
`multipart/form-data` pour autoriser l'envoi de fichier, et bien mettre la
méthode à `post` :

```html
<form method="post" action="controleurFrontal.php" enctype="multipart/form-data">
    <!-- Comme pour les autres formulaires des TDs -->
    <input type="hidden" name="controleur" value="utilisateur">
    <input type="hidden" name="action" value="creerDepuisFormulaire">
    <!-- ... -->
    <input type="file" name="photoProfil" accept="image/png, image/jpeg">
    <!-- ... -->
</form>
```

L'attribut `accept` ne fait que filtrer les fichiers proposés par le navigateur :
il ne protège de rien, car un client peut envoyer n'importe quel fichier. Toutes
les vérifications doivent donc être faites côté serveur.

Référence : [Mozilla Developer Network](https://developer.mozilla.org/fr/docs/Web/HTML/Element/input/file)

## Traitement du fichier reçu

Référence générale : [PHP.net](https://www.php.net/manual/fr/features.file-upload.post-method.php)

On récupère les informations sur le fichier reçu avec la variable
`$_FILES['photoProfil']`. Remarquez que `photoProfil` correspond au `name` de
l'`input` précédent. Il s'agit d'un tableau associatif contenant notamment :
* `$_FILES['photoProfil']['name']` : le nom du fichier **sur l'ordinateur du client** ;
* `$_FILES['photoProfil']['tmp_name']` : le chemin du fichier temporaire sur le serveur ;
* `$_FILES['photoProfil']['size']` : la taille en octets ;
* `$_FILES['photoProfil']['error']` : un code d'erreur, qui vaut `UPLOAD_ERR_OK` si tout s'est bien passé.

**Attention :** Le nom `name`, l'extension du fichier et le type
`$_FILES['photoProfil']['type']` sont choisis par le client : il ne faut **jamais**
leur faire confiance. Sinon, un attaquant pourrait par exemple envoyer un fichier
`piratage.php`, puis l'exécuter en allant à son URL, ou bien utiliser un nom comme
`../../index.php` pour écraser un fichier de votre site.

Voici donc les étapes à suivre, par exemple dans l'action
`creerDepuisFormulaire` de `ControleurUtilisateur` :

```php?start_inline=1
// 1. Vérifier que le fichier a bien été reçu
if (!isset($_FILES['photoProfil']) || $_FILES['photoProfil']['error'] !== UPLOAD_ERR_OK) {
    ControleurUtilisateur::afficherErreur("Erreur lors de l'envoi du fichier");
    return;
}
$fichier = $_FILES['photoProfil'];

// 2. Limiter la taille (ici 2 Mo)
if ($fichier['size'] > 2 * 1024 * 1024) {
    ControleurUtilisateur::afficherErreur("Fichier trop volumineux");
    return;
}

// 3. Déterminer le vrai type du fichier en lisant son contenu
//    (\finfo car nous sommes dans un espace de noms)
$typesAutorises = ["image/jpeg" => "jpg", "image/png" => "png"];
$typeMime = (new \finfo(FILEINFO_MIME_TYPE))->file($fichier['tmp_name']);
if (!array_key_exists($typeMime, $typesAutorises)) {
    ControleurUtilisateur::afficherErreur("Seules les images JPEG et PNG sont acceptées");
    return;
}

// 4. Générer un nom de fichier aléatoire, avec une extension choisie par nous
$nomFichier = bin2hex(random_bytes(16)) . "." . $typesAutorises[$typeMime];

// 5. Déplacer le fichier temporaire vers le dossier ressources/img/profils
$cheminDestination = __DIR__ . "/../../ressources/img/profils/$nomFichier";
if (!move_uploaded_file($fichier['tmp_name'], $cheminDestination)) {
    ControleurUtilisateur::afficherErreur("La copie du fichier a échoué");
    return;
}

// 6. Enregistrer $nomFichier en base de données (par ex. dans une colonne
//    photoProfil de la table utilisateur)
```

Quelques explications :
* Le fichier est reçu dans un dossier temporaire et il est supprimé à la fin de
  l'exécution du script. Il faut donc le déplacer avec la fonction
  [`move_uploaded_file()`](https://www.php.net/manual/fr/function.move-uploaded-file.php).
  Cette fonction vérifie aussi que le fichier provient bien d'un upload.
* La classe [`finfo`](https://www.php.net/manual/fr/class.finfo.php) détermine
  le type du fichier à partir de son contenu, et non à partir de son nom. Un
  fichier PHP renommé en `image.png` sera par exemple détecté comme `text/x-php`
  et donc refusé.
* Comme le nom du fichier est généré par nous, avec une extension `jpg` ou `png`,
  il n'est pas possible d'écraser un fichier existant ni de déposer un fichier
  `.php` exécutable.
* Le dossier de destination doit être dans `ressources` pour que les images
  soient accessibles depuis le navigateur (rappelez-vous que le `.htaccess` du
  TD5 interdit l'accès au reste du site). Par exemple, dans une vue :
  ```php
  <img src="../ressources/img/profils/<?php echo rawurlencode($nomFichier); ?>" alt="Photo de profil">
  ```

## Configuration du serveur

* **Droits d'écriture :** il faut donner les droits en écriture à Apache
  (utilisateur `www-data`) sur le dossier de destination, par exemple
  ```bash
  setfacl -m u:www-data:rwx chemin/vers/ressources/img/profils
  ```
* **Taille maximale :** PHP limite la taille des fichiers envoyés avec les
  directives `upload_max_filesize` (taille d'un fichier) et `post_max_size`
  (taille de toute la requête) de `php.ini`. Si `upload_max_filesize` est
  dépassé, `$_FILES['photoProfil']['error']` vaut `UPLOAD_ERR_INI_SIZE`. Si
  `post_max_size` est dépassé, `$_POST` et `$_FILES` sont entièrement vides !
  Vous pouvez connaître ces valeurs avec `phpinfo()`.
