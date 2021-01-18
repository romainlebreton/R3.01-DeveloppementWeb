---
title: TD8 &ndash; Authentication & email validation
subtitle: Encryption of passwords
layout: tutorial
---

This tutorial follows 
[tutorial 7 -- cookies & sessions]({{site.baseurl}}/tutorials/tutorial7-en.html), 
so we expect that you are able to use session variables.

This week, we will see how to:

1. setup authentication using passwords for the users of the website;
2. Restrict the access to certain webpages or actions to certain users. For
   instance, a user should only be able to modify his information.
3. Setup email validation during the sign in process.

## Password authentication

### Preparing the database and adapting the inscription form

<div class="exercise-en">

1. Change the `utilisateur` database table and add a field `VARCHAR(64) mdp`
   which will store passwords.
   
   **More explanations:** We will ultimately store encrypted passwords, and the
   size of encrypted messages is 64 characters for the hash function SHA-256
   (`256 bits = 64 char` since `1 char = 1 Byte = 8 bits`).
   
1. Modify the view `create.php` (or `update.php` if you merged both forms as
   told in TD6) to add two `<input type="password">` fields: one for the
   password and one to confirm it.

1. Modify the actions `created` and `updated` of controller
   `ControllerUtilisateur.php` to save the password in the database. Check
   beforehand that both fields contain the same password.

</div>

### First encryption

As told before, we should never save the password as is in the database, but
only its encrypted version:

```php
<?php
function chiffrer($texte_en_clair) {
  $texte_chiffre = hash('sha256', $texte_en_clair);
  return $texte_chiffre;
}

$mot_passe_en_clair = 'apple';
$mot_passe_chiffre = chiffrer($mot_passe_en_clair);
echo $mot_passe_chiffre;
//affiche '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b'
?>
```

<div class="exercise-en">

1. Copy the `chiffrer` above function in a file `lib/Security.php`. We advise
   you to create a `Security` class around this function.
2. Modify actions `create` and `updated` of controller
   `ControllerUtilisateur.php` to save the encrypted password in the database.  

**Note:** We say that SHA-256 is a hash function. Hash functions are meant to
encrypt, but give no way to decrypt. Whereas encryption functions are meant to
encrypt and to let someone with the key decrypt.

</div>

The other views and actions of `ControllerUtilisateur.php` do not change since
the password is not meant to be displayed.

### More security

If the password is not very original, there exists an attack called *dictionary
attack* that can find the password from its encryption.

<div class="exercise-en">

Let's play with the *dictionary attack* in order to understand it.

1. Create a fake user using [one of the most used passwords in
   2017](https://www.google.fr/search?q=most+used+password), let's say
   `password`.
2. Go in the database and read the encryption of this users' password.
3. Use a website such as [md5decrypt](http://md5decrypt.net/Sha256/) to retrieve
   the original password.  
   <!--  http://reverse-hash-lookup.online-domain-tools.com/ -->

**Explanation:** The website [md5decrypt](http://md5decrypt.net/Sha256/) stores
the encryption of the `3 771 961 285 ≃ 4*10^9` most common passwords. If your password is
one of them, its security is compromised.  
But there are way more possible passwords! If you just use a string of length 16
using the 16 characters `0,1,...,9,A,B,C,D,E,F`, you get `2^64 ≃ 10^18`
possibilities (hexadecimal code with `16` digits).

</div>

So to avoid dictionary attacks, we must use original passwords, for example
*random* passwords. To do so, we will concatenate a random string at the
beginning of each password. Therefore, even if the user password is very common
like `apple`, we will encrypt for instance `DhuRXYdEkJapple` which is less
common!

<div class="exercise-en">

1. Copy the following code inside the `Security` class. This code stores a
   random string accessible via `Security::getSeed()`.

   ```php?start_inline=1
   private static $seed = 'votre chaine aleatoire fixe';

   static public function getSeed() {
      return self::$seed;
   }
   ```

1. Replace your seed `seed` by a random string, which you can obtain using
   [https://www.random.org/strings/](https://www.random.org/strings).

1. Modify the `chiffrer` method to concatenate the seed before hashing.

**Note:** Concatenating a seed before the password is called *salting* the
password. Be careful that if your salt were discovered, the dictionary attack
would become efficient again to discover your user's passwords.

</div>

## Securing a webpage using session variables

To access a restricted webpage, a user should first sign in. Then the user
should be able to access all his restricted webpages without retyping his
password. We must therefore store the information that the user is
authenticated, and we will use session variables to do so.

### Connection page

<div class="exercise-en">

Let's proceed in steps:

1. Create a view that displays a connection form:

   1. Create a view `connect.php` containing a form with 2 fields: one for the
   login, one for the password. This form will call the action `connected` of
   `ControllerUtilisateur`.
   1. Add an action `connect` in `ControllerUtilisateur.php` which displays this
   form.

1. If not done during the last tutorial, start the session mechanism at the
   beginning of `index.php`.

1. Finally, check the login/password and connect the user if they are valid:

   1. Create a function
      `ModelUtilisateur::checkPassword($login,$mot_de_passe_chiffre)` which
      return `true` if one pair login/password exists in the database, and
      `false` otherwise.

   1. Add an action `connected` in `controllerUtilisateur`, which will check the
   password and, if valid, write the user login in a session variable. Then
   display the detail view of corresponding to this user

   **Help:** 
   1. The `detail` view needs a variable `$u` to be initialized before calling it.
   1. Do not forget to hash your password before comparing it.
   
</div>

<div class="exercise-en">

Add an action `deconnect` in `controllerUtilisateur`, which destroys the current
session. One disconnected, we redirect the user to the homepage of the website.

</div>

<div class="exercise-en">

1. Modify the `header` of your website (*a priori* in `view.php`) so as to add:

   * a link to the connection webpage when the user is not connected (no `login`
     session variable),
   * a welcome message with the login of the user if he is connected, and a link
     to sign out.

1. Test the sign in/sign out mechanism with both a valid and an incorrect
   login/password.

</div>

### Restrict the access to a webpage

We wish to restrict the actions related to update and deletion to only the
connected user.

<div class="exercise-en">

Modify the detail view so that it displays links to the update and deletion page
only for the user whose login is written in the `login` session variable.

**Hint:** To do things properly, we advise you to create a file
`lib/Session.php` containing the following function `is_user()`. You should
include this file right after the `session_start()`.

```php?start_inline=1
class Session {
    public static function is_user($login) {
        return (!empty($_SESSION['login']) && ($_SESSION['login'] == $login));
    }
}
```

</div>

<div class="exercise-en">

**Attention:** Removing the link is not enough because a smart guy could still
access some other guy's update page by typing the correct URL.

1. "Hack" the website and access some other guy's update page by typing the correct URL.

1. Modify the action `update` of controller `Utilisateur` so that if the
   `login` session variable does not match with the user given in the URL, we
   redirect to the connection page.

</div>

<div class="exercise-en">

**Attention:** Restricting the access to the update page is not enough because a smart guy could still
update some other guy's info by requesting the `updated` action.

1. "Hack" the website and update some other guy's info without touching the PHP code[^nbp].

1. Modify the action `updated` of controller `Utilisateur` so that if the
   `login` session variable does not match with the user given in the URL, we
   redirect to the connection page.

1. Also secure the access to the action `delete`.

</div>

**Important general note:** The most important page to secure is the webpage
whose script really perform the update or the delete action, *e.g.* actions
`updated` and `delete`.  
More generally, you should **never trust the client**; only a verification on
the server side is safe.

[^nbp]: But you can change the HTML code with the dev tools because you can do
    it on the client's side.


### Super user 

We wish to give admin rights to some users.

<div class="exercise-en">

1. Add a field `admin` of type `boolean` in the `utilisateur` database table. 

1. Modify the action `connected` of `ControllerUtilisateur.php` to store in a session variable 
   whether the current user has admin rights or not using

   ```php?start_inline=1
   $_SESSION['admin'] = true; // ou false
   ```

1. Modify the action `update` of `ControllerUtilisateur.php` so that an admin
   user can access any actions of any other user.

   **Advice:** For the sake of clarity, we advise you to complete the file
   `lib/Session.php` with the following function `is_admin`:
   
   ```php?start_inline=1
   public static function is_admin() {
       return (!empty($_SESSION['admin']) && $_SESSION['admin']);
   }
   ```

</div>

We wish to add a way for an admin to promote another user as admin.

<div class="exercise-en">

1. Add a `checkbox` button "Administrateur ?" to the update form, but only if
   the current user is an admin.  
   We let you change both the action `update` and the view `update.php`. 
   
1. Modify the action `updated` to take into account the `checkbox` button and
   update the `admin` field of the `utilisateur` database table.

   **Attention:** Don't forget that the most important page to secure is the 
   action `updated` because it is this page who performs the update.
   
</div>

## Registration with email verification

It is important to know if the user is real in many websites. To do so, we could
check his cell phone number, his credit card number, ... Here we will use email
verification.

<div class="exercise-en">
1. In your user creation form, verify the email address on the client side with for instance
[le champ `type="email"` du HTML5](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input).

1. Remember that you should **never trust the client**. The previous check may
   improve user-friendliness but not the security.  
   **Hack** your website by registering with an invalid email address.

1. In the `create` action of `ControllerUtilisateur`, verify the email address
   format. To do so, you can use for instance
   [`filter_var()`](http://php.net/manual/en/function.filter-var.php) with the
   filter
   [`FILTER_VALIDATE_EMAIL`](http://www.php.net/manual/en/filter.filters.validate.php).

</div>

At this stage, the email address should have a valid format. Let's now check
that it really exists and that the user can access it. We will therefore send it
an email with a secret. We will know that the user accessed this email address
and we will validate him only if he can tell the secret.

<div class="exercise-en">

Here is how we will proceed. When we create a user, we will associate with him a
secret, that is a random string called 
[cryptographic nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce),
and store this in a `nonce` field in the database. Then we send the nonce to the
email address. Finally the user has to give this nonce to the website to get
validated (we will set `nonce` to `NULL` in the database to say that).

Let's do it:

1. Add a field `nonce` of type `VARCHAR[32]` to the table `utilisateur`.

1. Modify the action `connect` of `ControllerUtilisateur` so as to accept the
   connection only if `nonce` is `NULL`.

1. Add an action `validate` to `ControllerUtilisateur` which retrieves using
   `GET` two values `login` and `nonce`. If the user exists in the database and
   the nonce matches, set the `nonce` to `NULL`.
   
1. It remains to initialize this nonce with a random string during the user
   creation:

   * Copy the following function `generateRandomHex()` in `Security.php` which
     generates a random string of length `32` using letters
     `0,1,...,9,A,B,C,D,E,F`

     ```php?start_inline=1
     function generateRandomHex() {
       // Generate a 32 digits hexadecimal number
       $numbytes = 16; // Because 32 digits hexadecimal = 16 bytes
       $bytes = openssl_random_pseudo_bytes($numbytes); 
       $hex   = bin2hex($bytes);
       return $hex;
     }
     ```

   * In the `create` action of `ControllerUtilisateur`, generate a random string
   using `generateRandomHex()` and store it in the field `nonce` of the
   database.


1. Finally, we have to send an email to the address that needs to be
   checked. This email will contain a link that will send the nonce to the
   website:

   1. Write in a variable `$mail` an HTML email containing a link to the action
      `validate` with the login and the nonce in the URL.  
	  **Test** your link now to prevent further problems.

   1. Send this email using
      [PHP function `mail()`](http://php.net/manual/en/function.mail.php).

      **Do not make an excessive use of this function or you could be punished
      for violating the IUT's computer resources guideline!**
      
      To avoid being blacklisted by email servers, you should only send emails
      to the domain name `yopmail.com`. Note that an email sent to
      `bob@yopmail.com` can be read immediately on the webpage
      [http://bob.yopmail.com](http://bob.yopmail.com).

</div>

## Other securing

### Form in method `post`

As we speak, the password can be read directly in the URL. A first improvement
would be to switch our forms to the method `post` with the website in production
mode, and keep method `get` for development mode (following for instance [the
variable `Conf::getDebug()` of TD2](tutorial2-en#error-management-continued)).

### Advances security

Note that even if they are sent using method `post`, passwords are still visible
to everyone that listens to the communication between you and the server. You
can for instance see them using the dev tools (`F12`), tab Network.

Encrypting passwords (or credit card numbers) in the database prevents someone
who has access to the database to learn the passwords.

The only reliable way to secure passwords is to encrypt all HTTP communications
between the server and the client, using addresses in `https` which call the
secure transport layer `TLS` (see upcoming "Réseaux" course). Setting up an
`https` server is getting [less and less complicated](https://letsencrypt.org/),
but it would be the subject of another course.
