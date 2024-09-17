---
title: TD5 &ndash; Architecture MVC avancée 1/2
subtitle: Contrôleur frontal, échappement du HTML, vues modulaires, CRUD
layout: tutorial
lang: fr
---

<!-- TODO An prochain : changer le nom du dossier Lib -->

<!-- Prévoir une explication écrite de la différence entre chemin de fichier et
URL.  Notament pour ceux qui mettent du ROOT dans les URL -->

<!--
URL absolue en récupérant nom de domaine et chemin de l'URL avec
http://{$_SERVER['HTTP_HOST']}{$_SERVER['PHP_SELF']}
-->

<!-- require d'un chemin de fichier **et pas de query string** -->

Nous allons continuer de développer notre site-école de covoiturage. Au fur et à
mesure que le projet grandit, nous allons bénéficier du patron d'architecture
MVC qui va nous faciliter la tâche.

Le but des TDs 5 & 6 est donc d'avoir un site qui propose une gestion minimale
des utilisateurs et des trajets proposés en covoiturage. En attendant de
pouvoir gérer les sessions d'utilisateur, nous allons développer l'interface
"administrateur" du site.

## Remise en route

Lors du [TD4](https://romainlebreton.github.io/R3.01-DeveloppementWeb/tutorials/tutorial4.html),
nous avons commencé à utiliser l'architecture MVC. Le code était découpé en trois parties :

3. Le modèle (*e.g.* `Modele/ModeleUtilisateur.php`) est une bibliothèque des
fonctions permettant de gérer les données, *i.e.* l'interaction avec la base de données dans
notre cas. Cette bibliothèque sera utilisée par le contrôleur.

2. Les vues (*e.g.* `vue/utilisateur/liste.php`) ne doivent contenir que
les parties du code qui écrivent la page Web. Ces scripts seront appelés par le
contrôleur qui s'en servira comme d'un outil pour générer la page Web ;

1. Le contrôleur est la partie principale du script PHP. Dans notre cas, il est
   composé de deux parties :

   1. le routeur (*e.g.* `Controleur/routeur.php`) est la page que l'utilisateur
      demande pour se connecter au site. C'est donc le script PHP de cette page
      qui est **exécuté**. Cette page est chargée de récupérer l'action envoyée
      avec la demande de la page et d'appeler le bon code du contrôleur
      correspondant.

   1. la partie `Utilisateur` du contrôleur (*e.g.*
      `Controleur/ControleurUtilisateur.php`) contient le code source des
      actions. C'est donc ici qu'est présente la logique du site Web : on y
      appelle le modèle pour récupérer/enregistrer des données, on traite ces
      données, on appelle les vues pour écrire la page Web...

<!--
<div class="exercise">

Dessinez sur papier un schéma qui explique comment le contrôleur (le routeur et
la partie Utilisateur), le modèle et la vue interagissent pour créer la page qui
correspond par exemple à l'action `afficherDetail`. Ce schéma doit représenter les différents fichiers exécutés par PHP, les regrouper par composant MVC, et indiquer à l'aide de flèches l'ordre d'exécution.

Préparez-vous à l'expliquer à votre chargé de TD quand il passera le corriger.

</div>
-->

## Réorganisation du site

### Limitation des pages accessibles

L'organisation actuelle du site pose un problème majeur : un client du site Web
est censé accéder au site avec une requête `Controleur/routeur.php`. Mais rien
ne garantit qu'il n'essayera pas d'accéder aux autres fichiers PHP "internes".
Nous allons donc séparer les fichiers PHP dans des dossiers différents en
fonction de s'ils doivent être accessibles sur le Web.

<div class="exercise">

   1. Renommez et déplacez le fichier `Controleur/routeur.php` pour qu'il
   devienne `web/controleurFrontal.php` **en évitant d'utiliser PHPStorm**. En
   effet, *PHPStorm* vous rajouterait des lignes `namespace ...` et `use ...` en
   haut de vos scripts PHP qu'il faudrait supprimer.

      **Note :** Ce script s'appelle contrôleur frontal (*front controller* en
      anglais) puisque c'est la partie visible de notre site.

   2. Déplacez les dossiers `Configuration`, `Controleur`, `Modele` et `vue` dans un
      dossier `src` **en évitant d'utiliser PHPStorm**. 
      
      Ce déplacement casse quand même le site Web, mais nous allons le réparer
      dans le prochain exercice.

</div>

#### Réparer les inclusions de fichiers du site

Lorsque l'on a déplacé la page d'accueil vers `controleurFrontal.php`, **tous nos
`require_once` ont été décalés**. En effet, le problème quand on utilise des chemins de fichiers 
relatifs dans nos
`require_once`, c'est que comme ils sont tous copiés/collés dans `routeur.php`, ils
utilisent le dossier du routeur comme base.

Prenons l'exemple de `require_once '../Configuration/ConfigurationBaseDeDonnees.php'` dans `ConnexionBaseDeDonnees.php` :
* Avant cette adresse était relative à `/chemin_du_site/Controleur/routeur.php`, donc elle 
  pointait vers `/chemin_du_site/Controleur/../Configuration/ConfigurationBaseDeDonnees.php`, donc sur
`/chemin_du_site/Configuration/ConfigurationBaseDeDonnees.php`
* Désormais, cette adresse est relative à `/chemin_du_site/web/controleurFrontal.php`. Elle
va renvoyer vers l'adresse inconnue `/chemin_du_site/web/../Configuration/ConfigurationBaseDeDonnees.php`, c.-à-d. `/chemin_du_site/Configuration/ConfigurationBaseDeDonnees.php`.

Pour éviter ce comportement qui porte à confusion, nous allons utiliser des chemins
de fichiers absolus. Pour ce faire, nous utiliserons la constante [`__DIR__`](https://www.php.net/manual/fr/language.constants.magic.php) qui contient le chemin absolu du dossier contenant le fichier actuel. Par exemple, nous pouvons écrire dans `ConnexionBaseDeDonnees.php`
```php
// __DIR__ renvoie vers le dossier contenant ConnexionBaseDeDonnees.php
// c-à-d ici __DIR__ égal "/chemin_du_site/Modele"
require_once __DIR__ . '/../Configuration/ConfigurationBaseDeDonnees.php';
```

À partir de maintenant, nous n'utiliserons plus de `require_once` avec des
chemins relatifs. Il va donc falloir changer ceux qui existent déjà.

<!-- 
`__DIR__` donne le dossier du fichier. Si utilisé dans une inclusion, le
dossier du fichier inclus sera retourné. Ce nom de dossier ne contiendra
pas de slash final (sauf si c'est le dossier racine `/`). -->



<div class="exercise">

Corrigez tous les `require_once` pour que le site remarche : 

1. Changez tous les `require_once` qui chargent des classes ;
2. Changez le `require` dans `ControleurUtilisateur::afficherVue` qui charge les
   vues ; 
3. Si besoin, changez les liens de `liste.php` et l'attribut `action` du
   formulaire `formulaireCreation.php` pour qu'ils renvoient sur
   `controleurFrontal.php` au lieu de `routeur.php`.

</div>

Maintenant que le site remarche et que les scripts accessibles sur le Web sont
isolées dans des dossiers différents, nous allons pouvoir appliquer la
restriction d'accès.

<div class="exercise">

2. Nous allons indiquer au serveur Web Apache que les fichiers ne sont pas accessibles sur internet par défaut. Pour ceci, créez un fichier `.htaccess` à la racine de votre site `TD5` avec le contenu suivant

   ```apache
   Require all denied
   ```

3. Pour indiquer que les fichiers du dossier `web` sont accessibles, créez un fichier `web/.htaccess` avec le contenu suivant

   ```apache
   Require all granted
   ```

4. Vérifiez que l'accès par internet aux scripts autres que `web/controleurFrontal.php`
   affiche une page Web `Forbidden You don't have permission to access this resource`.

   Note : Si votre fichier `.htaccess` n'a pas d'effet et que vous êtes sur
   votre machine, il se peut qu'il faille 
   [configurer Apache autrement]({{site.baseurl}}/assets/tut5-complement.html#si-le-fichier-htaccess-ne-marche-pas).
   
</div>

### Chargement automatique des classes

Nous venons de faire l'expérience des limites des chemins relatifs. Dans le
monde professionnel du PHP, on utilise le chargement automatique de classe
(`autoloading` en anglais) : quand PHP doit utiliser une classe qu'il ne connait
pas, il va charger le fichier de déclaration de cette classe. 

Vous avez déjà utilisé ce mécanisme en Java sans le savoir. En effet, vous
n'avez jamais inclus de fichier de déclaration de classe en Java avec des
`require_once` comme en PHP. Alors, comment fait Java pour savoir quel fichier
inclure ? 

Le chemin du fichier est directement lié au nom de classe *qualifié*, c.-à-d. du
nom de classe précédé du nom de `package`. Par exemple, le fichier Java
`src/main/java/fr/umontpellier/iut/svg/SVG.java` 
```java
package fr.umontpellier.iut.svg;

public class SVG { }
```
contient la déclaration de la classe dont le nom qualifié est
`fr.umontpellier.iut.svg.SVG`. On imagine bien comment Java s'est servi du nom de
classe qualifié pour trouver l'adresse du fichier de déclaration. 

Les principaux avantages du chargement automatique de classe sont : 
* le chargement de classe devient paresseux, c.-à-d. qu'une classe ne sera chargée que
  quand on a besoin d'elle. Pour de gros sites Web, cette économie est substantielle.
* Ce mécanisme sera indispensable pour pouvoir utiliser des bibliothèques
  externes PHP avec [`composer`](https://getcomposer.org/). Les élèves du
  parcours A le verront lors du semestre 4, et ceux du parcours D au semestre 5.
* On évite les problèmes de chemins relatifs.
* On évite l'erreur de charger deux fois une classe (que l'on traitait avec
  `require_once` avant).
* La solution proposée sera portable, c.-à-d. qu'elle gèrera les sordides
  subtilités entre les chemins de fichier Windows et ceux de Linux / Mac.

#### Espaces de noms

Avant d'utiliser le chargement automatique, nous avons besoin de préciser nos
noms de classes avec des espaces de noms (`namespace` en anglais). C'est
l'équivalent des `package` en Java.

<div class="exercise">

1. Rajoutez
   ```php
   namespace App\Covoiturage\Configuration;
   ```
   au début de `src/Configuration/ConfigurationBaseDeDonnees.php`.

   **Explication :** La déclaration `namespace` regroupe toutes les classes (et
     fonctions) déclarées dans le fichier dans l'espace de nom
     `App\Covoiturage\Configuration`, ce qui a pour effet de rajouter un préfixe
     à leur nom. Ainsi, la classe déclarée dans `ConfigurationBaseDeDonnees.php`
     s'appelle maintenant
     `App\Covoiturage\Configuration\ConfigurationBaseDeDonnees`. 


   **Attention :** Les espaces de nom utilisent des antislashs `\`, tandis que 
   les chemins de fichiers Linux/Mac utilisent des slashs `/`.

2. Le site est de nouveau cassé : `ConnexionBaseDeDonnees.php` ne connait pas la classe `ConfigurationBaseDeDonnees`.
   En effet, cette classe s'appelle désormais `App\Covoiturage\Configuration\ConfigurationBaseDeDonnees`.  
   **Complétez** le nom de la classe `ConfigurationBaseDeDonnees` dans `ConnexionBaseDeDonnees.php`. Le site Web doit refonctionner.

   **Note :** Vous ne devez pas toucher aux noms de fichiers dans les
   `require_once`, mais plutôt changer le nom de classe
   `ConfigurationBaseDeDonnees` dans les appels à des méthodes statiques. 

3. Vous conviendrez volontiers que ce nom de classe à rallonge est pénible. Nous
   allons utiliser un alias à la place :

   ```php
   // ConfigurationBaseDeDonnees est un raccourci pour App\Covoiturage\Configuration\ConfigurationBaseDeDonnees
   use App\Covoiturage\Configuration\ConfigurationBaseDeDonnees as ConfigurationBaseDeDonnees; 
   // ou syntaxe équivalente plus rapide 
   use App\Covoiturage\Configuration\ConfigurationBaseDeDonnees;
   ```

   **Raccourcissez** les noms de classe dans `ConnexionBaseDeDonnees.php` grâce à cet alias.

   **Remarques :**
   * `use` est similaire à `import` en Java. 
   * PhpStorm peut faire ce travail à votre place. Par exemple, quand il ne
     connait pas la classe `Configuration`, il la surligne pour indiquer un *warning*.
     Lorsque votre curseur est sur la ligne du *warning*, une ampoule apparait
     pour vous proposer des solutions rapides (ou faites `Alt+Entrée`).
     Choisissez la solution *Import Class*.
   
</div>

#### PSR-4 : Autoloading Standard

Le groupe PHP-FIG (PHP Framework Interoperability Group) pour l'interopérabilité
de PHP travaille pour standardiser la pratique de PHP. Ce travail vise notamment
à ce que les différents composants ou framework PHP puissent bien communiquer
entre eux.

Parmi les recommandations de standards PHP (PSR en anglais) les plus importants,
on trouve :
* [PSR-1](https://www.php-fig.org/psr/psr-1/) : Basic Code Style
* [PSR-4](https://www.php-fig.org/psr/psr-4/) : Autoloading Standard
* [PSR-12](https://www.php-fig.org/psr/psr-12/) : Extended Coding Style Guide

PhpStorm peut formater votre code en suivant les standards de style `PSR-1` et
`PSR-12` en allant dans le menu `Code > Reformat Code` (ou en tapant
`Ctrl+Alt+L`).


Dans la suite, nous allons vous fournir une classe `Psr4AutoloaderClass` qui
implémente un chargeur automatique de classe suivant le standard `PSR-4`. 
En pratique, après avoir initialisé la classe avec 
```php
$chargeurDeClasse = new App\Covoiturage\Lib\Psr4AutoloaderClass();
$chargeurDeClasse->register();
```
vous pourrez enregistrer une association entre un espace de nom et un dossier
```php
$chargeurDeClasse->addNamespace('App\Covoiturage', __DIR__ . '/../src');
```
Vous pouvez maintenant utiliser n'importe quelle classe dont l'espace nom
commence par `App\Covoiturage` et `Psr4AutoloaderClass` chargera le fichier de
déclaration de classe correspondant avec un `require_once`. Par exemple, si vous
exécutez maintenant
```php
use App\Covoiturage\Configuration\ConfigurationBaseDeDonnees;
echo ConfigurationBaseDeDonnees::getPort();
```
alors `Psr4AutoloaderClass` exécutera pour vous
```php
require_once(__DIR__ . '/../src/Configuration/ConfigurationBaseDeDonnees.php')
```
Le chemin de fichier est déterminé par `Psr4AutoloaderClass` en utilisant
l'association déclarée précédemment avec `addNamespace` pour remplacer
`'App\Covoiturage'` par `__DIR__ . '/../src'` dans le nom de classe qualifié de
``ConfigurationBaseDeDonnees``.


<div class="exercise">

1. Créez le dossier `src/Lib` (attention à la majuscule). Enregistrez le fichier
   [Psr4AutoloaderClass.php](../assets/TD5/Psr4AutoloaderClass.php) directement à
   l'emplacement `src/Lib/Psr4AutoloaderClass.php`.

   **Attention :** Un bug apparaît si vous vous servez de PhpStorm pour déplacer `Psr4AutoloaderClass` et le changer de dossier. Il est donc important d'enregistrer `Psr4AutoloaderClass` directement dans le bon dossier.

2. Au début du contrôleur frontal, incluez ce fichier à l'aide d'un
   `require_once`. Utilisez un chemin de fichier absolu avec `__DIR__` comme vu
   précédemment. 

3. Rajoutez le code suivant dans le contrôleur frontal juste avant de traiter
   les actions :
   ```php
   // initialisation en activant l'affichage de débogage
   $chargeurDeClasse = new App\Covoiturage\Lib\Psr4AutoloaderClass(true);
   $chargeurDeClasse->register();
   // enregistrement d'une association "espace de nom" → "dossier"
   $chargeurDeClasse->addNamespace('App\Covoiturage', __DIR__ . '/../src');
   ```

   *En résumé*, ce code dit au système d'autoloading de PHP que les classes dont
   l'espace de nom commence par `App\Covoiturage` se trouvent dans le dossier
   `src`.  

4. Nous allons enfin pouvoir utiliser l'autoloader. Comme expliqué précédemment,
   la classe `App\Covoiturage\Configuration\ConfigurationBaseDeDonnees` sera cherchée dans le
   fichier `src/Configuration/ConfigurationBaseDeDonnees.php`.  
   <!-- **Renommez** le dossier `Configuration` avec une majuscule `Configuration`.  -->
   Dans
   `ConnexionBaseDeDonnees.php`, enlevez le `require_once` de la classe `Configuration`.  
   Le site Web doit refonctionner.

   <!-- **Besoin d'aide pour débugger `Psr4AutoloaderClass` ?** Rajoutez une ligne à
   la méthode `requireFile` de `Psr4AutoloaderClass` pour afficher le nom du fichier
   que l'*autoloader* essaye de charger. -->

5. Répétez ce processus pour enlever tous les `require_once` de fichier de
   déclaration de classe (sauf pour `Psr4AutoloaderClass`) :
   * ajout de `namespace` dans chaque classe,
   * utilisation d'alias pour faire référence à cette classe,
   * suppression des `require_once`.  

   Nous vous conseillons de procéder classe par classe, dans l'ordre suivant :
   `ConnexionBaseDeDonnees`, `ModeleUtilisateur` puis `ControleurUtilisateur`.

   **Attention :** La classe `PDO` dans `ConnexionBaseDeDonnees.php` est
   comprise comme `App\Covoiturage\Modele\PDO` à cause du `namespace
   App\Covoiturage\Modele`. Or son nom complet est `\PDO`. Deux solutions
   possibles :
   * Ajoutez `use \PDO as PDO;` pour que PHP sache que `PDO` est dans l'espace de nom
     global.
   * Ou spécifiez que `PDO` est dans l'espace de nom global en appelant la
     classe `\PDO`.
   
6. Maintenant que vous avez compris le principe de `Psr4AutoloaderClass`, vous
   pouvez si vous le souhaitez désactiver son affichage de débogage :
   ```php
   $loader = new App\Covoiturage\Lib\Psr4AutoloaderClass(false);
   ```

</div>

## Sécurité des vues 

Nous allons apprendre pourquoi nous devons faire attention lorsque nous
remplaçons une variable PHP par sa valeur dans l'écriture de la page HTML. Vous
allez voir que les raisons sont assez similaires au problème derrière les
injections SQL.

Prenons l'exemple de notre vue `detail.php` qui écrit entre autre

```php?start_inline=1
echo "<p> Utilisateur {$u->getLogin()} </p>";
```

Que se passe-t-il si l'utilisateur a rentré du code HTML à la place d'un
login ?

<div class="exercise">

Créez un utilisateur de login `<h1>Hack` et regardez comment elle
s'affiche. Inspectez le code source HTML correspondant pour comprendre ce qu'il
s'est passé.

</div>

Le login est compris comme du code HTML et est donc interprétée. Ce
comportement est non désiré et peut carrément être dangereux, notamment si
l'utilisateur se met à écrire du JavaScript. 

<!-- XSS et aussi que ça marche bien pour Math O'reilly (! ') -->

#### Échappement dans du HTML

<!-- https://dev.w3.org/html5/html-author/charref -->

Pour éviter cela, il faut faire **attention aux caractères protégés** du
HTML. Voici la liste des caractères qui font la différence entre du texte pur et
du code HTML :

1. les chevrons `<` et `>` car ils délimitent les balises HTML ;
2. les guillemets simples `'` ou doubles `"` car ils délimitent les valeurs des
   attributs ;
3. L'esperluette `&` car elle sert à échapper les caractères. Par exemple, le
   code HTML `&amp;` sert à afficher une esperluette `&`.

Ces caractères spéciaux doivent être échappés dans les vues pour que le texte
s'affiche bien mais ne risque pas de changer la structure du document
HTML. Voici comment échapper ces caractères :

| `&lt;` | `&gt;` | `&amp;` | `&quot;` | `&apos;` |
|  `<`   |  `>`   |   `&`   |   `"`    |   `'`    |
{: #entities .centered }

<style scoped>
#entities td { padding: 0.5ex 2em }
#entities td:not(:first-child) { border-left: solid thin #aaa }
</style>

**Bonne nouvelle :** PHP fait ceci pour nous avec la fonction
[`htmlspecialchars`](http://php.net/manual/fr/function.htmlspecialchars.php). Par
exemple, le code

```php?start_inline=1
echo htmlspecialchars('<a href="test">Test</a>');
```

renvoie

```text
&lt;a href=&quot;test&quot;&gt;
```

Le remplacement des caractères spéciaux a bien eu lieu.

Du coup, il faut utiliser `htmlspecialchars` à chaque fois que l'on écrit une
variable non sûre (par ex. provenant de l'utilisateur) comme texte de la page
HTML ou comme attribut d'une balise.

```php
$nom = "<h1>Danger ! </h1>";
echo "Page personnelle de ". $nom; // Danger !  
echo "Page personnelle de ". htmlspecialchars($nom); // Écriture sécurisée
$valeurDefaut = '"><script>alert("Danger!");';
echo '<input type="text" value="' . $valeurDefaut . '">'; // Danger !  
echo '<input type="text" value="' . htmlspecialchars($valeurDefaut) . '">'; // Écriture sécurisée  
```

<div class="exercise">

1. Changer donc toutes vos vues pour appliquer la fonction `htmlspecialchars` à
toutes les variables PHP qui se trouvent à un endroit où du code HTML pourrait
être interprété. L'endroit typique est dans les zones de texte.  
Nous vous conseillons de créer des variables temporaires pour stocker le texte
échappé, par exemple `$loginHTML`, puis d'afficher ces variables.

2. Vérifiez que votre utilisateur de login `<h1>Hack` s'affiche maintenant
   correctement et ne crée plus de balise HTML `<h1>`. Allez voir dans le code
   source comment le login a été échappé.

</div>

#### Échappement des URLs

De la même manière, il faut encoder les URLs pour éviter d'en changer le sens
lorsque l'on insère une donnée fournie par l'utilisateur. Par exemple, nous
allons devoir échapper les caractères `?` et `=` puisqu'ils permettent de passer
de l'information dans l'URL avec le format *query string*.

Pour information, la liste des caractères réservés des URLs sont
`:/?#[]@!$&'()*+,;=`. Nous allons donc utiliser la fonction
[`rawurlencode`](http://php.net/manual/fr/function.rawurlencode.php) pour
échapper les variables PHP qui interviennent dans des URLs.


<div class="exercise">

1. Créez un utilisateur de login `&a=b` en utilisant votre action
   `afficherFormulaireCreation` ;

2. Observez que le lien vers la vue de détail de cet utilisateur ne marche
   pas. Pourquoi ?

   <!-- On change la signification de l'URL, le login ne correspond plus -->

3. Changer la vue `liste.php` pour qu'elle encode à l'aide de `rawurlencode` la
   variable PHP correspondant au login.  
   **Attention :** Il ne faut pas encoder le login déjà échappé pour
   le HTML. Il faut créer deux variables : un login `$loginHTML` pour le HTML et
   un `$loginURL` pour les URLs.

4. Testez que le lien vers la vue de détail remarche.

</div>

**Source :** [RFC 3986 sur les URI](https://www.ietf.org/rfc/rfc3986.txt)

## Vues modulaires

En l'état, certains bouts de code de nos vues se retrouvent dupliqués à de
multiples endroits. Les prochaines questions vont vous aider à réorganiser le
code pour éviter les redondances en vue d'améliorer la maintenance du code et
son debuggage.

### Mise en commun de l'en-tête et du pied de page

Actuellement, les scripts de vues sont chargées d'écrire l'ensemble de la page
Web, du
<code><!DOCTYPE HTML><html>...</code>
jusqu'au
<code></body></html></code>
. C'est problématique car cela nous empêche de mettre facilement deux vues bout à
bout. Voyons cela sur un exemple.

Supposez que l'on souhaite que notre vue de création (action `creerDepuisFormulaire`) de
*utilisateur* affiche *"Votre utilisateur a bien été créé"* puis la liste des
utilisateurs. Il serait donc naturel d'écrire le message puis d'appeler la vue
`liste.php`. Mais comme cette dernière vue écrivait la page HTML du début à la
fin, on ne pouvait rien y rajouter au milieu !

Décomposons nos pages Web en trois parties : le *header* (en-tête), le *body*
(corps ou fil d'Ariane) et le *footer* (pied de page). Dans le site final de
l'an dernier, on voit bien la distinction entre les 3 parties. On note aussi que
le *header* et le *footer* sont communs à toutes nos pages.

<p style="text-align:center">
<img src="{{site.baseurl}}/assets/headerbodyfooter.png" width="95%"
style="vertical-align:top">
</p>

Au niveau du HTML, l'en-tête de la page (*header*) correspond à la partie : 

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Liste des trajets</title>
    </head>
    <body>
        <header>
            <nav>
                <!-- Le menu de l'en-tête -->
            </nav>
        </header>
```

le corps de la page (*body*) à la partie :

```html?start_inline=1
        <main>
            <h1>Liste des trajets:</h1>
            <ol>
                <li>...</li>
                <li>...</li>
            </ol>
        </main>
```

et le pied de page (*footer*) à la partie :

```html?start_inline=1
        <footer>
            <p>Copyleft Romain Lebreton</p>
        </footer>    
    </body>
</html>
```

Nous allons donc changer nos vues pour qu'elles n'écrivent plus que le corps de
la page. Enfin une vue spéciale, appelée vue générique, chargera l'une de ces
vues "corps" en l'incluant dans l'en-tête et le pied de page communs.

<div class="exercise">

1. Créer une vue générique `TD5/vue/vueGenerale.php` avec le code suivant. La fonction
   de `vueGenerale.php` est de charger un en-tête et un pied de page communs, ainsi
   que la vue dont le nom de fichier est stocké dans la variable `$cheminCorpsVue` (et le titre de
   page contenu dans `$titre`).

   ```php
   <!DOCTYPE html>
   <html>
      <head>
         <meta charset="UTF-8">
         <title><?php echo $titre; ?></title>
      </head>
      <body>
         <header>
               <nav>
                   <!-- Votre menu de navigation ici -->
               </nav>
         </header>
         <main>
               <?php
               require __DIR__ . "/{$cheminCorpsVue}";
               ?>
         </main>
         <footer>
         </footer>
      </body>
   </html>
   ```
   
2. Dans vos vues existantes, supprimer les parties du code correspondant aux
   *header* et *footer*.

3. Reprendre l'action `afficherListe` du contrôleur pour afficher la vue `vueGenerale.php`
   avec les paramètres supplémentaires `"titre" => "Liste des utilisateurs"`,
   `"cheminCorpsVue" => "utilisateur/liste.php"`.

4. **Testez** votre action `afficherListe`. Regardez le code source de la page Web
   pour vérifier que le HTML généré est correct.

5. Modifiez les autres actions et testez votre site.

</div> 


Nous allons bénéficier de notre changement d'organisation pour rajouter un
*header* et un *footer* (minimalistes) à toutes nos pages.

<div class="exercise"> 

1. Modifier la vue `vueGenerale.php` pour ajouter en en-tête de page une barre de menu,
avec trois liens vers les différents contrôleurs :

   ```html
   <nav>
      <ul>
         <li>
            <a href="controleurFrontal.php?action=afficherListe&controleur=utilisateur">Gestion des utilisateurs</a>
         </li><li>
            <a href="controleurFrontal.php?action=afficherListe&controleur=trajet">Gestion des trajets</a>
         </li>
      </ul>
   </nav>
   ```

1. Modifier la vue `vueGenerale.php` pour rajouter un pied de page comme

   ```html
   <p>
     Site de covoiturage de ...
   </p>
   ```

2. Rajoutez un [style CSS minimaliste]({{site.baseurl}}/assets/TD5/navstyle.css)
   à votre page Web. Ce style sera mis dans un dossier `css`. Où mettre ce
   dossier `css` sachant que nous interdisons l'accès internet à certaines
   parties du dossier `TD5` ?
   
   Une façon de faire est de créer un dossier `TD5/ressources` qui sera accessible sur
   internet (copiez le `.htaccess` de `web`), et qui contiendra le dossier `css`, mais aussi plus tard des
   dossiers `img` d'images et `js` pour le JavaScript.

   N'oubliez pas de rajouter la balise d'inclusion du CSS dans la vue générale
   ```html
   <link rel="stylesheet" href="...">
   ```

3. Ce fichier CSS rajoute aussi un style pour les formulaires. Pour l'appliquer,
   changez `formulaireCreation.php` pour qu'un champ de formulaire s'obtienne par exemple avec 
    ```html
    <p class="InputAddOn">
        <label class="InputAddOn-item" for="login_id">Login&#42;</label>
        <input class="InputAddOn-field" type="text" placeholder="Ex : leblancj" name="login" id="login_id" required>
    </p>
    ```

</div> 

### Concaténer des vues

Notre réorganisation nous permet aussi de résoudre le problème soulevé plus tôt
à propos de la vue de création d'un utilisateur.

<div class="exercise">

Nous souhaitons créer une vue `utilisateurCree.php` qui affiche le message

```html
<p>L'utilisateur a bien été créé !</p>
```

avant de faire un `require` de `liste.php` puisque cette vue sert à écrire la liste
des utilisateurs. Ceci donnerait le visuel suivant.

![UtilisateurCreate]({{site.baseurl}}/assets/TD5/UtilisateurCreate.png){: .blockcenter}

1. Créez la vue `utilisateurCree.php` comme expliqué ci-dessus, en utilisant le
   concept de vue modulaire.  
   **Remarque :** La vue `utilisateurCree.php` doit faire deux lignes
   maintenant.

2. Changez l'action `creerDepuisFormulaire` du contrôleur pour appeler cette vue.  
   **Attention :** Il faut initialiser la variable `$utilisateurs` contenant le
   tableau de tous les utilisateurs afin qu'elle puisse être affichée dans la vue.

3. Comme vous développez un site Web, il faut vérifier régulièrement sa
   [conformité HTML](https://html5.validator.nu/) et
   [CSS](https://jigsaw.w3.org/css-validator/). Faites-le maintenant. 

</div>
