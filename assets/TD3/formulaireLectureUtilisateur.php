<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <div>
            <form method="get" action="formulaireLectureUtilisateur.php">
                <fieldset>
                    <legend>Retrouve un utilisateur par son login :</legend>
                    <p>
                        <label for="login_id">Login</label> :
                        <input type="text" placeholder="Ex : leblancj" name="login" id="login_id" required/>
                    </p>
                    <p>
                        <input type="submit" value="Envoyer" />
                    </p>
                </fieldset>
            </form>
        </div>
        <?php

        require_once 'ConnexionBaseDeDonnees.php';
        require_once 'Utilisateur.php';

        function recupererUtilisateurParLogin(string $login) : ?Utilisateur {
            $sql = "SELECT * from utilisateur2 WHERE login='$login'";
            echo "<p>J'effectue la requête <pre>$sql</pre></p>";
            $pdoStatement = ConnexionBaseDeDonnees::getPdo()->query($sql);
            $utilisateurTableau = $pdoStatement->fetch();
            if ($utilisateurTableau !== false) {
                return Utilisateur::construireDepuisTableauSQL($utilisateurTableau);
            }
            return null;
        }

        if (isset($_GET['login'])) {
            $u = recupererUtilisateurParLogin($_GET['login']);
            echo $u;
        }
        ?>
    </body>
</html>
