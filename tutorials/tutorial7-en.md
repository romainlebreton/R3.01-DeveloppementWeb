---
title: TD7 &ndash; Cookies & sessions
subtitle: Cart and preferences
layout: tutorial
---

## Cookies

An HTTP cookie (or simply cookie) is used to store a small piece of data, for
instance:

* the user's preferences on a website (interface customization, ...),
* the content of its shopping cart,
* its session identifier (see next tutorial on sessions).

The data is sent by the website (HTTP server) together with the webpage and it
is stored in a file on the user's computer (HTTP client). The file contains just
a name/value associative table. Once a cookie is recorded the client will send
back this data to the website at each HTTP request.

**Attention**: Do not store critical data in cookies since they are not hidden
on the user's computer.
 
### Create a cookie

Cookies are stored on the user's computer on the initiative of the server.

#### How to create a cookie in PHP ?

To create a cookie in PHP, we use the function
[`setcookie`](http://php.net/manual/en/function.setcookie.php).  
For instance, the following code creates a cookie named `TestCookie` with value
`"OK"` which expires in an hour.

```php?start_inline=1
setcookie("TestCookie", "OK", time()+3600);  /* expires in 1 hour = 3600 seconds */
```

#### How does the server tells the client to save a cookie ?

From a technical point of view, the cookies mechanism is a part of the HTTP protocol 
([see course 1]({{site.baseurl}}/classes/class1.html#protocole-de-communication--http)).

To initiate the storage of a cookie on the client's computer, the server writes
a special line `Set-Cookie` in its HTTP response. Here is an example:


```http
HTTP/1.1 200 OK
Date:Thu, 22 Oct 2015 15:43:27 GMT
Server: Apache/2.2.14 (Ubuntu)
Accept-Ranges: bytes
Content-Length: 5781
Content-Type: text/html
Set-Cookie: TestCookie1=valeur1; expires=Thu, 22-Oct-2015 16:43:27 GMT; Max-Age=3600
Set-Cookie: TestCookie2=valeur2; expires=Thu, 22-Oct-2015 16:43:27 GMT; Max-Age=3600

<html><head>...
```

We can see that there is one `Set-Cookie` line per name/value association that
the server wants to store. In our example, one line for the cookie
`"TestCookie1"` with value `"valeur1"` and one line for the cookie
`"TestCookie2"` with value `"valeur2"`.


**Attention:** The HTTP protocol requires that the function `setcookie()` must
be called before writing anything in the HTML webpage.  
**Why?** The `Set-Cookie` in an information sent in the header of the HTTP
response. This header is sent before the body of the response which contains the
webpage. Since PHP sends the webpage as soon as it is written, all the
information of the header must be known before any line of the webpage is written.

When the browser (HTTP client) receives this response, it stores the information
(or not) in a cookie file. Be aware that the server has no guarantee on the
behavior of the client: the cookie could never be stored (if the client disabled
cookies) or could be altered (modified value, modified expiration date ...).

**Reference:** [RFC on cookies](https://tools.ietf.org/html/rfc6265)

### Retrieve a cookie

Once the cookie is saved on the client's computer, the client will send the
cookie information at every HTTP request.

#### How does the client send the cookie information ?

Once again, it happens at the HTTP protocol level, *i.e.* in the header of the HTTP request.


```http
GET /~rletud/index.html HTTP/1.1
Host: webinfo.iutmontp.univ-montp2.fr
Cookie: TestCookie1=valeur1; TestCookie2=valeur2
```

#### How can the server retrieve the cookie information in PHP ?

The PHP gives access to cookie information in the variable 
[`$_COOKIE`](http://php.net/manual/en/reserved.variables.cookies.php)
data sent in the URL could be retrieved in `$_GET` and data sent in the body of
the response is retrieved in `$_POST`
(see [course 1]({{site.baseurl}}/classes/class1.html#protocole-de-communication--http)).

For instance, 

```php?start_inline=1
echo $_COOKIE["TestCookie1"];
```

should write `valeur1`.

#### Cookies are associated to domain names

We said that the client will send cookie information at every HTTP request. But
fortunately, clients do not send all cookie information to all websites. First,
the domain name of the website is stored together with the cookie to remember
where it came from. Then most browsers will only send cookies coming from the
same domain name (or subdomains) than the webpage it is requesting.

For instance, a cookie stored by a webpage hosted on
`webinfo.iutmontp.univ-montp2.fr` (domain name `univ-montp2.fr`) will be sent to
webpages of `webinfo.iutmontp.univ-montp2.fr` or `iutmontp.univ-montp2.fr` or
`univ-montp2.fr`, but not to pages such as `google.fr`.

It is possible to refine this behavior with the optional arguments (domain name,
path, ...) of the function
[`setcookie`](http://php.net/manual/en/function.setcookie.php).

### Cookie deletion

Finally, in order to erase a cookie, you just need set an expiration date than
belongs to the past. For instance, 

```php?start_inline=1
setcookie ("TestCookie", "", time() - 1);
```

It is the client job to remove expired cookies. Once again, there is no
guarantee on the behavior of the client.

### Technical notes

1. The cookie maximal size if 4KB (because HTTP header are limited to 4KB).

1. **Important**: Cookies can only contain strings, so no PHP
   objects. **However**, the PHP function
   [`serialize`](http://php.net/manual/en/function.serialize.php) encodes any
   PHP value into text, which can then be stored in the cookie. When you
   retrieve the cookie, you will have to revert the encoding using the PHP
   function `unserialize`.

1. You can see the cookies stored on your computer:

   * on Firefox, go to Préférences &#8594; Vie privée et sécurité &#8594; Historique
   &#8594; Supprimer des cookies spécifiques.
   * on Chrome, go to the development tools
   (with `F12`) &#8594; Tab Ressources (or Application) &#8594; Cookies.

1. If you don't specify an expiration date in `setcookie` (or if you give `0`),
   then the cookie will be deleted when the browser is shut down.

### Exercise with cookies


<div class="exercise-en">

Create a new PHP file and verify your comprehension by coding the following
features:

1. Write a cookie,
1. Verify that the cookie has been well written using the dev tools,
1. Read the cookie in PHP,
1. Delete the cookie in PHP,
1. Store an array in the cookie and retrieve it.

**Help:** If you do not know how to store an array in a cookie, you may have
read the *Technical notes* section a bit too fast.

</div>

## Sessions 

Sessions are a mechanism based on cookies that allows to store data not on the
client side but on the server side. The principle of sessions is to identify
clients so that the server can store some information related to each client.

To do so, a cookie containing a unique identifier is stored on the client's
computer (cookie named `PHPSESSID` by default). When a client requests a
webpage, he sends his cookie containing his identifier (in his HTTP
request). 

The server stores information (named sessions) linked to each client. Using the
identifier cookie, the server can recognize which client is requesting a
webpage, and so can retrieve the session information of this specific client.

<div class="centered">
<img alt="Schéma des sessions" src="{{site.baseurl}}/assets/session.png" width="60%">
</div>

### Operations on sessions

One can store almost anything in session variables: numbers, strings, even
arrays and objects. Contrary to cookies, you don't even need to serialize them.

Let's now present the important operations on sessions:

*  **Initialize the session**

   ```php?start_inline=1
   session_start();
   ```

   <!-- session_name("chaineUniqueInventeParMoi");  // Optionnel : voir section 3.2 -->

   [`session_start()`](http://php.net/manual/en/function.session-start.php)
   starts new or resume existing session. You must always call this function
   before using the session mechanism (e.g. `$_SESSION`).

   **Attention :** You should call `session_start()` before writing any line of
   the webpage. This is due to the same reason than `setcookie()` (need to write
   the header of the response before starting its body). 
   
*  **Read a session variable**

   ```php?start_inline=1
   echo $_SESSION['login'];
   ```

   Just like `$_GET`, `$_POST` or `$_COOKIE`, the variable `$_SESSION` allows
   you to read sessions variables (which are stored on the server hard drive and
   linked to the session identifier).

*  **Write a session variable**

   ```php?start_inline=1
   $_SESSION['login'] = 'remi';
   ```

   **Novelty :** Contrary to `$_GET`, `$_POST` and `$_COOKIE`, the variable
   `$_SESSION` can also be written: this is how you write session variables.

*  **Verify the existence of a session variable**

   ```php?start_inline=1
   if (isset($_SESSION['login'])) { /*do something*/ }
   ```
   
*  **Delete a session variable**

   ```php?start_inline=1
   unset($_SESSION['login']);
   ```

   Since the variable `$_SESSION` can be written, you can erase one cell of this
   array to delete a session variable.
   
*  **Complete destruction of a session**

   ```php?start_inline=1
   session_unset();     // unset $_SESSION variable for the run-time 
   session_destroy();   // destroy session data in storage
   // Il faut réappeler session_start() pour accéder de nouveau aux variables de session
   setcookie(session_name(),'',time()-1); // deletes the session cookie containing the session ID
   ```

   To put it differently:

   * `session_unset()` empties the array `$_SESSION`, just like if you had done
   `unset($_SESSION['name_var'])` on very input `name_var` of `$_SESSION`,
   * `session_destroy()` deletes the local file containing the data related to
   the current session identifier.
   * `setcookie` will ask the client to delete his cookie containing the session
     identifier (no guarantee).

### Technical notes

#### Session's pros compared to cookies

This mechanism has many advantages compared to cookies. There is no maximal size
on the data to be stored. 

More importantly, the client can no longer modify the content of the session,
whereas he had total access to the cookie. For example, imagine that we store
whether a client is an admin in a cookie variable `isAdmin`. Then the client can
easily edit the cookie and obtain admin rights by setting `isAdmin` to
`true`. However, with the session mechanism, this is no longer possible because
the client does not have access to the data associated with him.


#### Sessions expiration

1. **Session lifetime:**

   By default, sessions are deleted when the browser closes. This is due to the
   expiration date (`0` by default) of the cookie `PHPSESSID` containing the
   session identifier. Yet we have seen that cookies with expiration date `0`
   are deleted on the browser closing.
   
   You can change this behavior if you wish for instance that a shopping cart
   remains valid 30 minutes, even if your client close his browser. You can do so    
   by modifying the configuration variable `session.cookie_lifetime` which
	setups the expiration date of the cookie.  The function
	[`session_set_cookie_params()`](http://php.net/manual/en/function.session-set-cookie-params.php)
	is useful to change this variable.

1. **Adding a timeout on sessions :**

	The lifetime of a session is related to two parameters. On one side, the
    expiration date of the cookie will tell when the session identifier has to
    be deleted on the client's side (no guarantee). On the other side, the PHP
    variable `session.gc_maxlifetime` sets the timeout of the server session
    files, telling that the session file **can** be deleted after a given
    time. 
	
	As we have just said, neither of these parameters is really reliable. The
    only reliable way to handle session timeout is to store the last activity
    date in the session:
	
    ```php?start_inline=1
    if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > (30*60))) {
        // if last request was more than 30 minutes ago
        session_unset();     // unset $_SESSION variable for the run-time 
        session_destroy();   // destroy session data in storage
    } else {
        $_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
    }
    ```

    We recommend to set the same expiration date than for
    `session.cookie_lifetime`.
    
    **Reference :** [Stackoverflow](http://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes)

#### Where can we find session files on the server ?

Sessions are stored on the hard drive of the server. For instance, if you are
using LAMP on Linux, they should be in `/var/lib/php/sessions` (you must be root
to access them). Otherwise, you can find the information by reading the section
`session` of the report written by `phpinfo()`.

**Example :** If my session identifier is `PHPSESSID=aapot` and my PHP code is
the following

```php?start_inline=1
session_start();
$_SESSION['login'] = "rlebreton";
$_SESSION['isAdmin'] = "1";
```

then the file `/var/lib/php/sessions/sess_aapot` should contain

```
login|s:9:"rlebreton";isAdmin|s:1:"1";
```


### Exercise with sessions

<div class="exercise-en">

Create a new PHP file and verify your comprehension by coding the following
features:

1. Start a session,
1. Write many session variables of different types (strings, arrays, objects, ...),
1. Read a session variable,
1. Delete one session variable,
1. Destroy the session.

</div>


## Mise en application sur le site de covoiturage

In the carpool website, you added a redirection to the controller `voiture` when
no controller was given to `index.php`. In this exercise, we want to allow the
user to customize which default controller he wants.

**Important note :** This exercise requires that you have coded several
controllers during last tutorial. Otherwise, change the exercise to customize
the default view `readAll` instead of the controller.

<div class="exercise-en">

1. Create a form `preference.html` with a field `preference` of type *radio
   button* allowing you to choose between `voiture`, `trajet` or `utilisateur`
   comme as default controller. Your form should call the webpage
   `personalisation.php` on submission.

4. Write `personalisation.php` so that it retrieves the value `preference` of
   the form and store this value in a cookie variable with the same name.

5. Check that this cookie has been well setup (using the dev tools).

2. In your header menu, add a link which points to the form `preference.html`.

3. In `routeur.php`, the default value of the controller is `voiture`. Change
   that to use the cookie value:

   1. create a variable `$controller_default` initialized at `voiture` before
      the call to the controller,
   1. change the fallback value of the controller from `voiture` to
      `$controller_default`,
   1. When initializing `$controller_default`, verify that the cookie named
      `preference` exists. If so, modify the value of `$controller_default`.

5. Test your customization code by choosing a different default controller.

**Note :** Of course, we should have integrated `preference.html` and
  `personalisation.php` in the MVC. They should be part of the MVC `Utilisateur`
  (which we will create during next tutorial).

</div>


<div class="exercise-en">

Use cookies to store the shopping cart of the current client.

</div>

<div class="exercise-en">

We wish to store the total price of the shopping cart in addition to the cart
itself. Since this information is sensitive and because we do not want the
client to be able to change this total price, we will store it using sessions.

1. Setup the session mechanism: start the  session in
   `index.php` so that each page can use it and there is no risk of writing 
   any line of the webpage before.
   
1. Move of the shopping cart data to session variables.

1. Compute the total price at each request of the webpage and store it in a
   session variable.

1. Code a timeout mechanism in order to erase the shopping cart after a given
   time. This delay should first be of 10 seconds for testing purposes then of
   10 minutes once it works.
   
</div>
