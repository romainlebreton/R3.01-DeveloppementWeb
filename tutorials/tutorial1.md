---
title: TD1 &ndash; Prise en main de JavaScript
subtitle: JavaScript et DOM
layout: tutorial
---


## Les outils de développements

Nous allons utiliser les outils de développements de Chrome pour nos TDs. Pour ouvrir les outils de développements de Chrome, appuyez sur `F12` (ou `Ctrl+Shift+I` ou Outils > Outils de développement).

#### L'inspecteurs d'éléments de page Web 

L'onglet **Élément** contient le code HTML de la page Web courante. En survolant le code HTML, l'inspecteur vous indique où se trouve la boîte englobant l'élément courant. Les rectangles affichés de couleurs différentes représentent les quatre boites englobantes&nbsp;: la marge extérieure (`margin`), la bordure, la marge intérieure (`padding`) et le contenu. Les dimensions des boîtes sont indiquées dans l'onglet style, qui regroupe toutes les règles CSS s'appliquant à cet élément.

À l'inverse, vous pouvez vous servir de la loupe ![loupe]({{ site.baseurl }}/assets/magnifying.png) (`Ctrl+Shift+C`) pour explorer visuellement le rendu de la page Web. La loupe vous montre alors le code HTML de l'élément sous votre souris.

<div class="exercice">
1. Inspectez la page courante dans l'onglet **Élément**. 
2. Éditez la page HTML. Modifiez le texte du TD. Rajouter ou enlevez des balises de la page HTML. <br/>
**Note:** Pour éditer le HTML, il faut faire clic droit > 'Edit as HTML'.
3. Changez des éléments de style. Par exemple la façon dont les bouts de code en ligne comme `margin`, `padding` sont stylisés. Ou passez à une numérotation binaire des listes d'exercices (`list-style-type: binary` ; [Ne marche pas sur Firefox ni IE](http://www.quirksmode.org/css/lists.html)).
**Note:** Vous pouvez faire ces modifications de style dans la sous-partie **Styles** de l'onglet **Élément** ou directement dans le ficher *CSS* qui se trouve dans l'onglet **Sources**.
4. Rajouter votre premier gestionnaire d'événement (event handler). Pour cela, rajoutez `onclick="alert('À Malibu!')"` comme attribut à l'une des balises HTML. Vous n'avez alors plus qu'à cliquer dessus pour voir le message s'afficher.
</div>

L'un des grands avantages de l'onglet **Élément** est que l'on voit le code HTML de la page en direct. L'affichage classique des sources `Ctrl+U` ne montre que le code source original envoyé par le serveur.
Les modifications que vous avez faites sont temporaires et disparaîtrons lors du rechargement de la page. Il faudra reporter les modifications côté serveur pour les enregistrer (cf. plus bas).

#### Le moniteur réseau

L'onglet **Network** permet d'observer les requêtes HTTP faites pour charger votre page. On y voit le chargement de la page HTML, des styles CSS et des images liées.

<div class="exercice">
1. Cliquez sur l'onglet **Network** et observez les différentes fichiers échangés lors du chargement de la page. Si l'onglet est vide, rechargez la page.
2. Cliquez sur la ligne de la page Web *tutorial1.html* et observez le sous-onglet **Headers**. On y voit les caractéristiques principales de la [requête HTTP](http://openclassrooms.com/courses/les-requetes-http) qui demande la page au serveur :
  * l'adresse du serveur : **romainlebreton.github.io**
  * l'URL de la page demandée :  **http://romainlebreton.github.io/ProgWeb-ClientRiche/tutorials/tutorial1.html**
  * la méthode de requête : **GET**
  * le [code de statut](http://fr.wikipedia.org/wiki/Liste_des_codes_HTTP) de la réponse : 200 OK ou 304 Not modified (ou 404 Not Found)
</div>

#### La console JavaScript

C'est ici que nous allons passer le reste du TD. L'onglet **Console** (caché tout à droite) présente deux avantages :

 - c'est une console JavaScript. Ce sera donc notre bac à sable pour expérimenter du code JavaScript;
 - nous avons accès au DOM de la page Web courante. Ceci nous permettra d'interagir avec la page Web.

## Le Document Object Model (DOM)

Le Document Object Model (DOM) de JavaScript est un objet JavaScript qui modélise le document (la page Web). Cet objet possède un ensemble de méthodes qui nous permettent d'interagir avec le document. Nous allons aborder le DOM d'un point de vue très pratique. 

Le DOM est accessible dans la console JavaScript dans la variable `document`.

<div class="exercice">
1. Explorez dans la console quelques attributs de la variable `document`, par exemple `document.URL`, `document.head`, `document.body`.
</div>

#### Trouver un élément de la page Web

La manière la plus pratique de trouver un élément de la page Web est via les méthodes `getElementById`, `getElementsByTagName` et `getElementsByClassName` de l'objet `document`. Les trois méthodes prennent une chaîne de caractères et renvoient le tableau des éléments correspondants, sauf `getElementById` qui ne renvoie qu'un élément puisqu'un identifiant est unique.

<div class="exercice">
1. Accédez dans la console à l'élément d'identifiant **le-document-object-model-dom** à l'aide du code

        var e1 = document.getElementById("le-document-object-model-dom");
        console.log(e1);

2. Dans le même ordre d'idée, sélectionnez tous les *list items* `<li>` à l'aide de `getElementsByTagName` et comptez les en utilisant leur propriété `.length`.

3. Enfin, sélectionnez tous les éléments ayant la classe *exercice* à l'aide de `getElementsByClassName` et comptez les en utilisant leur propriété `.length`.

</div>

Supposons que nous souhaitons accéder à tous les `<li>` correspondant à des exercices, donc descendant d'un bloc de classe *exercice*. C'est exactement le genre de sélection que l'on fait en CSS pour appliquer du style. Vous ne serez donc pas surpris que JavaScript possède une fonction `document.querySelector` qui prend un sélecteur en entrée et renvoie le premier élément correspondant. De même, `querySelectorAll` renvoie tous les éléments correspondants.

<div class="exercice">
1. Sélectionnez dans la console tous les `<li>` correspondant à des exercices à l'aide de la fonction `document.querySelectorAll`. Combien y en a-t-il ?<br>
   **Aide:** Vous pouvez consulter ce [rappel sur les sélecteurs](http://www.w3schools.com/cssref/css_selectors.asp).

#### Modifier une page Web

Nous allons ici faire un petit tour d'horizon des méthodes pour modifier une page Web. Nous utiliserons ces méthodes dans la section suivante : [Mise en application -- Formulaire dynamique](#mise-en-application----formulaire-dynamique).

Pour créer des éléments (ou nœuds), il y a principalement deux fonctions : [`document.createElement`](https://developer.mozilla.org/fr/docs/Web/API/Document/createTextNode) et [`document.createTextNode`](https://developer.mozilla.org/fr/docs/Web/API/Document/createTextNode). La fonction `createElement` prend en paramètre un nom de balise HTML et crée l'élément de type balise correspondant. La fonction `createTextNode` prend en paramètre le texte et crée l'élément de type texte correspondant.

Une fois un élément créé, il faut l'insérer dans la page Web. Les fonctions à votre disposition sont [`appendChild`](https://developer.mozilla.org/fr/docs/Web/API/Node/appendChild) et [`insertBefore`](https://developer.mozilla.org/fr/docs/Web/API/Node/insertBefore).

Enfin, la fonction [`setAttribute`](https://developer.mozilla.org/fr/docs/Web/API/Element/setAttribute) permet de modifier les attributs d'un élément.

<div class="exercice">
1. À l'aide des fonctions précédentes, créez l'élément correspondant au code HTML suivant :

   ~~~
   <tr>
     <TD>Nom:<input type="text" name="nom"></TD>
     <TD>Prénom:<input type="text" name="prenom"></TD>
   </tr>
   ~~~
   {:.html}
   **Aide:** Créer les nœuds de l'intérieur vers l'extérieur. 
   Sauver votre code au fur et à mesure quelque part car nous nous en resservirons dans ce TD.
</div>


## Mise en application -- Formulaire dynamique

Nous allons utiliser JavaScript pour rajouter du dynamisme <span style="text-decoration: line-through">aux étudiants</span> à un formulaire. Dans notre cas, nous allons développer un formulaire avec une partie facultative et de taille variable. Veuillez récupérer le [fichier HTML]({{ site.baseurl }}/assets/DynamicForm/DynamicForm.html) et [fichier CSS]({{ site.baseurl }}/assets/DynamicForm/DynamicForm.css) qui vous serviront de base pour notre formulaire dynamique.

Créez un projet **DynamicForm** avec ces deux fichiers dans NetBeans (ou votre IDE préféré).

#### Affichage de la partie facultative du formulaire

<div class="exercice">
1. On souhaite cacher par défaut la partie facultative du formulaire correspondant à la liste des enfants. Rajouter `class="hidden"` comme attribut au `<div>` contenant la liste des enfants.  Créer la règle de style suivante qui a pour effet de cacher le contenu.

   ~~~
   .hidden {
     display:none;
   }
   ~~~
   {:.css}

2. Pour l'instant, nous allons développer notre code dans la console JavaScript de Chrome. Sélectionnez l'élément d'identifiant "enfants" à l'aide de `document.getElementById()` et stockez le dans une variable `enfants`

3. Pour accéder en lecture/écriture aux classes de `enfants`, nous allons utiliser sa propriété `enfants.classList` ([documentation](https://developer.mozilla.org/fr/docs/Web/API/Element/classList), [Ne marche pas sur IE <=9](http://caniuse.com/#search=classlist)).
   Une fonction très pratique de `classList` est la fonction `toggle()` qui agit comme un interrupteur : il active/désactive la classe selon si elle était désactivé/activé ([exemple d'utilisation](https://developer.mozilla.org/fr/docs/Web/API/Element/classList#Exemple)). Utilisez-la pour afficher/cacher le formulaire enfant.

5. Veuillez regrouper le code précédant au sein d'une fonction `ActiverEnfants`

   ~~~
   function ActiverEnfants () {
     // Votre code ici
   }
   ~~~
   {:.javascript}
  
6. Nous allons maintenant associer cette fonction au clic sur le bouton <input type='checkbox' checked> de *"Avez-vous des enfants ?"*
   1. Pour cela, donnez à `querySelector` le sélecteur qui sélectionne les inputs d'attribut `type='checkbox'` ([documentation sur les sélecteurs](http://www.w3schools.com/cssref/css_selectors.asp)). Mettez cet élément dans une variable `aEnfant`
   2. On va associer à l'élément `aEnfant` un gestionnaire d'événement qui lancera notre fonction `ActiverEnfants` lors de chaque clic sur le bouton.
      La fonction `addEventListener` prend en premier argument le nom de l'événement à écouter et en deuxième argument la fonction à appeler.

      ~~~
      aEnfant.addEventListener("click",ActiverEnfants);
      ~~~
      {:.javascript}

      

7. *Last but not least:* Maintenant que notre code est prêt, nous allons le déployer côté serveur pour qu'il soit envoyé et exécuté avec la page Web. 
   1. Créez donc un ficher **DynamicForm.js** contenant ce code dans le répertoire de votre projet **DynamicForm**. 
   2. Pour lier le script **DynamicForm.js** à notre page Web **DynamicForm.html**, ajouter dans cette dernière une balise

      ~~~
      <script src="DynamicForm.js"></script>
      ~~~
      {:.html}
      juste avant la balise fermante `</body>`.
      Votre script sera ainsi exécuté au chargement de la page ; l'action d'affichage du formulaire 'enfant' sera donc lié à la *checkbox*.
      Note : Comme le script DynamicForm.js est mis qqaprès le formulaire dans la page, nous sommes sûr de pouvoir modifier des éléments existants en javascript (l'élément d'id "enfants" existe, etc).

</div>

#### Avoir un formulaire de taille variable

Notre objectif dans cette dernière partie est de pouvoir rajouter des lignes à un formulaire en cliquant sur un bouton.

<div class="exercice">

1. Sélectionnez l'élément de balise `<tbody>` inclus dans l'élément d'identifiant *enfants* à l'aide de `document.querySelector()` et stockez le dans une variable `table_enfants`
2. Nous souhaitons maintenant ajouter une nouvelle ligne à notre tableau. Ajoutez le code HTML suivant à la fin du tableau comme nous avons vu à la section [Modifier une page Web](modifier-une-page-web).

   ~~~
   <tr>
     <TD>2</TD>
     <TD><input type="text" name="nom-e2"></TD>
     <TD><input type="text" name="prenom-e2"></TD>
   </tr>
   ~~~
   {:.html}
<!--
   Nous allons procéder en plusieurs étapes :

   1. Créer un nouvel élément HTML de type `<tr>` à l'aide de 

      ~~~
      var e = document.createElement("tr");
      ~~~
      {:.javascript}

   2. Actuellement, notre élément `e` représente juste le code HTML `<tr></tr>`. Nous allons le remplir en éditant son intérieur via `e.innerHTML` ([documentation](https://developer.mozilla.org/fr/docs/Web/API/Element/innertHTML)).
      Ajoutez le code HTML nécessaire en assignant la bonne chaîne de caractères à `e.innerHTML`.

      **Remarque:** Les chaînes de caractères en JavaScript commencent et finissent par **"** (ou **'**). Le caractère d'échappement **\\** est nécessaire pour les caractères spéciaux comme les guillemets `\"` &#8594; **"**, le saut de ligne `\n` &#8594;  **&#8626;**.

   3. Il ne reste plus qu'à ajouter notre élément `e` à la fin de body. Pour cela, utilisons `table_enfants.`[`appendChild`](https://developer.mozilla.org/fr/docs/Web/API/Node/appendChild)`(e)`.
-->

3. Associons notre action à l'événement 'clic' sur le bouton *Ajouter un enfant* 
   1. Empaquetons tout cela dans une fonction `function AjoutEnfant()`.
   2. Sélectionner notre bouton à l'aide de `querySelector` (c'est le premier bouton qui provient de la balise d'identifiant *enfants*).
   3. Associer lui le gestionnaire d'événement qui associe au clic l'action `AjoutEnfant`.

4. Actuellement, nous rajoutons toujours la même ligne n°2 au tableau lors de clic successifs. 
   1. Pour garder trace du numéro de la ligne actuelle, nous allons créer une variable globale `enf_count` que nous incrémenterons dans `AjoutEnfant`.

      ~~~
      var enf_count = 2;
      function AjoutEnfant () {
        // ...
        enf_count++;
      }
      ~~~
      {:.javascript}

   2. Changer le corps de la fonction `AjoutEnfant` pour créer la ligne n° `enf_count`.

5. Déployez votre code avec un copier/coller dans **DynamicForm.js**. Quand tout marche bien, profiter de l'instant.

</div>

## Quelques liens

- [La présentation des outils de développements sur le site de Chrome](https://developer.chrome.com/devtools)
- [Le site de Mozilla sur les technologies Web](https://developer.mozilla.org/fr/)
- [La structure d'arbre du HTML](http://fr.eloquentjavascript.net/chapter12.html)

