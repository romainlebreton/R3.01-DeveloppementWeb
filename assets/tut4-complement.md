---
title:  Autres compléments
subtitle: 
layout: tutorial
---

## Upload de fichiers ou d'images de profil

### Changement dans le formulaire

Premièrement, il faut changer la propriété `enctype` à `multipart/form-data` de
votre formulaire pour autoriser l'envoi de fichier, et bien mettre la méthode à POST :

```html
<form method="post" action="." enctype="multipart/form-data">
```

Référence : [Mozilla Developer Network](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Form)

Le champ permettant d'envoyer un fichier est le suivant :

```html
<input type="file" name="nom-du-fichier">
```

### Traitement du fichier reçu

Référence générale : [PHP.net](http://www.php.net/manual/fr/features.file-upload.post-method.php)

Globalement, on récupère les informations sur le fichier reçu avec la variable
`$_FILES['nom-du-fichier']`. Remarquez que le `nom-du-fichier` correspond au
`name` de l'`input` précédent.

Avant toute chose, il faut vérifier que le fichier a bien été uploadé avec

```php?start_inline=1
if (!empty($_FILES['nom-du-fichier']) && is_uploaded_file($_FILES['nom-du-fichier']['tmp_name'])) {
   ... 
}
```


Le fichier est uploadé dans un dossier temporaire. Pour qu'il ne soit pas
supprimé à la fin de l'exécution du script, vous devez le déplacer manuellement
avec par exemple la fonction
[move_uploaded_file()](http://php.net/manual/en/function.move-uploaded-file.php)

```php?start_inline=1
$name = $_FILES['nom-du-fichier']['name'];
$pic_path = ROOT . "upload/$name";
if (!move_uploaded_file($_FILES['nom-du-fichier']['tmp_name'], $pic_path)) {
  echo "La copie a échoué";
}
```

**Attention :** il faut donner les droits en écriture à Apache (utilisateur
`www-data`) sur le dossier où vous souhaitez déplacer vos images.


On peut aussi restreindre les extensions autorisés pour le fichier avec la
fonction
[is_uploaded_file()](http://php.net/manual/en/function.is-uploaded-file.php)

```php?start_inline=1
$allowed_ext = array("jpg", "jpeg", "png");
if (!in_array(end(explode('.',$_FILES['nom-du-fichier']['name'])), $allowed_ext)) {
  echo "Mauvais type de fichier !";
}
```

