---
title: TD3 &ndash; Prepared statements and class association
subtitle: SQL JOIN
layout: tutorial
---

Tutorial 3 follows the exercises on databases of TD2 using the `PDO` class of
PHP. We continue with the central concept of prepared statements. Then we will
code the association between database tables.

**Attention:** You must have completed the previous tutorial 
  [until Section 2.1 included](tutorial2-en.html#make-a-sql-query-without-parameters)
  before starting this tutorial.


## SQL injections

### Example of SQL injection

Imagine a website which executes the following SQL query to check if a user can
log in:

```sql
SELECT uid FROM Users WHERE name = '$nom' AND password = '$mot_de_passe';
```

The website accepts the credential if the previous query answers at least a
record.

A malicious user could give the following information:

* Username: `Dupont';--`
* Password: anything

The query becomes

```sql
SELECT uid FROM Users WHERE name = 'Dupont'; -- ' AND password = 'mdp';
```

which is equivalent in SQL to

```sql
SELECT uid FROM Users WHERE name = 'Dupont';
```

So the malicious user can sign in under the `Dupont` login with any
password. This attack technique is called an **SQL injection**.

We will simulate an SQL attack later in this tutorial.

*Source:* [https://fr.wikipedia.org/wiki/Injection_SQL](https://fr.wikipedia.org/wiki/Injection_SQL)

## Prepared statements

Imagine that we have coded the function `getVoitureByImmat($immatriculation)` as
follows

```php?start_inline=1
function getVoitureByImmat($immat) {
    $sql = "SELECT * from voiture WHERE immatriculation='$immat'"; 
    $rep = Model::$pdo->query($sql);
    $rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
    return $rep->fetch();
}
```

This function works but is vulnerable to **SQL injections** ; a malicious user
could give evil information `$immat` and execute any SQL code that he wishes
(table deletion ...).

In order avoid **SQL injections**, we will use a functionality called **prepared
statements**. This functionality is implemented in `PDO`. Here is how they work:

1. Write a *tag* `:nom_tag` in the query in place of the value that you wish to
   replace.

1. "Prepare" the SQL query using `prepare($requete_sql)`. Note that SQL query and
   SQL statement are synonyms, so prepared statements are just SQL queries that
   are "prepared".

1. Use an array to associate values to tags:

   ```php?start_inline=1
   $values = array("nom_tag" => "une valeur");
   ```

1. Finally, execute the prepared statement with `execute($values)`

1. Note that you can retrieve the results of the SQL executions as usual, with
   `fetchAll()` for instance.

Here is a complete example of the previous steps all together: 

```php?start_inline=1
function getVoitureByImmat($immat) {
	// In the query, put tags :xxx instead of variables $xxx
    $sql = "SELECT * from voiture WHERE immatriculation=:nom_tag";
    // Prepare the SQL statement
    $req_prep = Model::$pdo->prepare($sql);

    $values = array(
        "nom_tag" => $immat,
        //nomdutag => valeur, ...
    );
    // Execute the SQL prepared statement after replacing tags 
	// with the values given in $values
    $req_prep->execute($values);

    // Retrieve results as previously
    $req_prep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
    $tab_voit = $req_prep->fetchAll();
    // Careful: you should handle the special case of no results
    if (empty($tab_voit))
        return false;
    return $tab_voit[0];
}
```

<div class="exercise-en">
1. Copy/paste in a new folder the files `Conf.php`, `Model.php`, `Voiture.php`
   and `lireVoiture.php`.

1. Copy the preceding function in the `Voiture` class and make it public and
   static method.

   **Reminder:** Please use a decent webpage editor, i.e.
   [**NetBeans**]({{site.baseurl}}/assets/tut2-complement.html#créer-un-projet-avec-netbeans) by default.

1. Test the function `getVoitureByImmat` of file `lireVoiture.php`.

</div>
<div class="exercise-en">

2. Create a `save()` method in the `Voiture` class which insert the current
   `Voiture` (`$this`) in the database. Here is a reminder on the SQL syntax for
   insertion:

   ```sql
   INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...)
   ```

   **Attention:** The SQL statement `INSERT INTO` returns nothing; therefore
     you should not call `fetch()` on its result, at risk of raising an error
     `SQLSTATE[HY000]: General error`.

3. Test your method in `lireVoiture.php` by creating an instance of the
   `Voiture` class and by saving it.

</div>
<div class="exercise-en">

Let's now link the car save in the database to the form of car creation from
TD1:

2. Copy in the folder TD3 the files `creerVoiture.php` and
   `formulaireVoiture.html` from TD1.
3. Modify the webpage `creerVoiture.php` so that it creates and saves a car with
   the information received by the webpage (using the GET or POST method,
   depending on your form `formulaireVoiture.html`).   
4. Test the insertion using the form `formulaireVoiture.html`. 
5. Verify in PHPMyAdmin that the new car appears.

**Don't forget** to protect every chunk of code containing some `PDO`
(`getAllVoitures`, ...)  with some try - catch (as in `Model`). Indeed, every
`PDO` function is likely to throw an exception, in which case we must catch and
handle it.

</div>

## Creation of the database tables for our carpool website

<div class="exercise-en"> 

If you have not already done this, please create tables `utilisateur` and
`trajet` as follows:

1. In PHPMyAdmin, create a table `utilisateur` with the following fields:
   * `login`: VARCHAR 32, primary key
   * `nom`: VARCHAR 32
   * `prenom`: VARCHAR 32

   **Important:** Remember to always use `InnoDB` as storage engine, and
   `utf8_general_ci` as collation (character encoding, for accents ...)

1. Inset a few users

2. Create a table `trajet` with the following fields
   * `id`: INT, primary key with auto-increment (see below)
   * `depart`: VARCHAR 32
   * `arrivee`: VARCHAR 32
   * `date`: DATE
   * `nbplaces`: INT
   * `prix`: INT
   * `conducteur_login`: VARCHAR 32
   
   **Note:** We want that primary key to auto-increment itself at each
   insertion. This is done using the `A_I` (auto-increment) checkbox for the
   field `id`.

   **Important:** Have you used `InnoDB` and `utf8_general_ci` ?

2. Insert a few journeys (don't fill the `id` box since the auto-increment will
   give a value for you). Please put existing logins in `conducteur_login` to
   avoid later complications.

</div>

## First link between `utilisateur` and `trajet`

You have seen during the ACDA course the concept of class diagrams, which is
useful to design a database. Here is the diagram of our database:

<img alt="Diagramme entité association"
src="../assets/DiagClasse.png" style="margin-left:auto;margin-right:auto;display:block;">

**Question:** How would you implement the *conducteur* association between the
tables `utilisateurs` and `trajets` considering its multiplicity?

**Our solution:** Since there is only one driver by journey, we will simply add
a field `conducteur_login` to the table `trajet`.

We want the field `trajet.conducteur_login` to match a driver login
`utilisateur.login`. What is the name of the database technique that ensures
this kind of constraint:

**Réponse:** <span style="color:#FCFCFC">Foreign key constraint</span>

<div class="exercise-en">

Let's implement this constraint:

1. Using PHPMyAdmin, change the properties of `trajet.conducteur_login` to be an
   **index**.

   **Help:** Go in the tab `Structure` of the table `trajet`, and click on the
   icon `index` that is on the same line as `conducteur_login`.

   **More details:** The property to be an **index** is meant to tell MySql that
   we will do searches on the field `conducteur_login`. Therefore, MySql will
   create a special data structure to optimize these searches. Since the
   **foreign key constraint** needs this kind of search, we have to give the
   **index** property to the fields involved in the **foreign key constraint**.
   
2. Let's create a foreign key constraint between `trajet.conducteur_login`
   and `utilisateur.login`.  To do so, go to the tab `Structure` of the table
   `trajet` and click on `Gestion des relations` (or `Vue relationnelle` for
   more recent PHPMyAdmin).

   We will use the behavior `ON DELETE CASCADE` so that we delete a record if
   its foreign key is deleted and the behavior `ON UPDATE CASCADE` to update a
   record if its foreign key is updated.
   
   **Attention:** Only `InnoDB` tables support foreign key constraints.
   
</div>

## Association between users and journeys

### In the database

**Question:** How would you implement the association between users and
journeys in view of its multiplicity?

**Answer:** 
<span style="color:#FCFCFC">
Since the association *passager* is unbounded (no limit on the number of
passenger of a journey, nor of journey for a user), we need to use join tables.
</span>

Let's create a `passager` table which contains two fields:

* the identifier INT `trajet_id` of a journey and
* the identifier VARCHAR(32) `utilisateur_login` of a user.

To sign up a user to a journey, it remains to write a record in the `passager`
table with the adequate `utilisateur_login` and `trajet_id`.

**Question:** What should be the primary key of the table `passager`?

**Answer:** 
<span style="color:#FCFCFC">
The couple (trajet_id,utilisateur_login), since they define together the
passenger association.
</span>

<div class="exercise-en"> 
1. Create the `passager` table using PHPMyAdmin interface.

   **Important:** Have you thought about `InnoDB` and `utf8_general_ci`?

1. Ensure that you set up the couple (`trajet_id`,`utilisateur_login`) as
   primary key. You can check this in the `Gestion des relations` window.

2. Add the **foreign key constraint** between `passager.trajet_id` and
   `trajet.id`, and between `passager.utilisateur_login` and
   `utilisateur.login`. Use the behaviors `ON DELETE CASCADE` and `ON UPDATE
   CASCADE` as explained previously.

3. Using PHPMyAdmin interface, insert a few  `passager` records.

4. Let's check that the foreign key constraint behaviors, e.g. `ON DELETE
   CASCADE`, are correct. For this matter
   1. create a journey with a certain driver,
   1. add some passengers to this journey,
   1. remove the driver user in the `utilisateur` table and check that the
      corresponding passengers were also deleted.

</div>

### Inside the PHP code

#### List the users of a journey and conversely

We can now complete our PHP code to handle this association. Let's start by
adding methods to the classes `Utilisateur` and `Trajet`.

**Note:** If your files `Utilisateur.php` and `Trajet.php` are not complete, you
can start over with the following files:
[`Utilisateur.php`]({{site.baseurl}}/assets/TD3/Utilisateur.php),
[`Trajet.php`]({{site.baseurl}}/assets/TD3/Trajet.php).

Before anything else, do you remember the join mechanism in SQL? If you are not
sure, you should refresh your memories by reading e.g.
[https://www.w3schools.com/sql/sql_join.asp](https://www.w3schools.com/sql/sql_join.asp).


<div class="exercise-en">

1. Create a `public static function findPassagers($id)` in `Trajet.php` which
   takes as input a journey identifier. This method will return an array of
   objects of class `Utilisateur` corresponding to the passengers recorded in
   the table `passager`.
   
   **Hint:**
   
   * Use an `INNER JOIN` SQL query. Best practice is to first develop your SQL
     query and test it in e.g. PHPMyAdmin. Then you can integrate it in your PHP
     code.
   * You may have to update the `Utilisateur` class so that its attributes match
     the ones of the database table `utilisateur`. You may also have to update
     the constructor [as done previously for `Voiture`](tutorial2-en.html#majconst).

2. Let's test your method. Create a webpage `testFindUtil.php` which will

   1. include the necessary class declarations,
   3. call the method `findPassagers($id)` with an existing journey identifier,
   4. display the passengers using their method `afficher`.

3. Create a form `formFindUtil.php` with method `GET` and a text input field
   where we can type in the journey identifier. The handling page (`target`) of
   this form will be `testFindUtil.php`. Modify `testFindUtil.php` so that it
   reads the journey identifier from the data sent by the form.

</div>

## Create an SQL injection

If you are moving quickly forward with the tutorials, we invite you to create an
example of an SQL injection. Let's set it up:

1. To avoid deleting an important table, create a temporary table `voiture2`: in
   PHPMyAdmin, in the `Importer` tab, upload the file
   [`voiture2.sql`]({{site.baseurl}}/assets/TD3/voiture2.sql) and it will create
   a table `voiture2` with a few cars
 1. We supply the base PHP file [`formGetImmatSQL.php`]({{site.baseurl}}/assets/TD3/formGetImmatSQL.php)  
    This file contains a form which displays the information of a car given its license plate.  
    **Test** this file by giving an existing license plate.  
    **Read** the code and make sure that you understand it (and ask the prof if need be).

1. The key point in this file is the function `getVoitureByImmat` which was
   coded without prepared statements. It is therefore vulnerable to SQL
   injections.
   
   ```php?start_inline=1
   function getVoitureByImmat($immat) {
       $sql = "SELECT * from voiture2 WHERE immatriculation='$immat'"; 
       $rep = Model::$pdo->query($sql);
       $rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
       return $rep->fetch();
   }
   ```

   **Find out** what you should type in this form so that `getVoitureByImmat`
   empties the table `voiture2` (SQL Truncate).

### A concrete example

Some clever driver change their license plate to mess with the speed cameras

 <p style="text-align:center">
 ![Requête HTTP]({{site.baseurl}}/assets/injection-sql-radar.jpg)
 </p>


## And if there is still some time left

If you are ahead of time, here are ideas to add some features to your carpool website.

### List the journeys of a user

Similarly to the exercise on `findPassager()`, add to your website the
possibility to find all the journeys that a user took part in as passenger.
You will have to use a join SQL query as before.

### Unsubscribe a passenger from a journey and conversely

Last feature: In the webpage that lists all the journeys of a user, we want a
**Unsubscribe** hyperlink next to each journey, which deletes the corresponding
passenger association.

### (Optional) A few additional ideas

1. Our list of journeys for a user is still incomplete: the list of the
   journeys that a user took part in as driver is missing. The corresponding
   webpage should list separately both the journeys as a driver and the journeys
   as a passenger.
1. Similarly, we did not include the driver in the list of passengers of a
   journey. Display him separately.
1. You could also add triggers to your database so that a user cannot be listed
   in twice as a passenger for the same journey so that we have a limit on the
   number of passenger for a journey ...
