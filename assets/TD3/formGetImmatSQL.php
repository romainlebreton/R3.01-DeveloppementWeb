<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <div>
            <form method="get" action="formGetImmatSQL.php">
                <fieldset>
                    <legend>Trouve une voiture par son immatriculation :</legend>
                    <p>
                        <label for="immat_id">Immatriculation</label> :
                        <input type="text" placeholder="Ex : 256AB34" name="immatriculation" id="immat_id" required/>
                    </p>
                    <p>
                        <input type="submit" value="Envoyer" />
                    </p>
                </fieldset> 
            </form>
        </div>
        <?php

        require_once 'Model.php';
        require_once 'Voiture.php';
        
        function getVoitureByImmat($immat) {
            $sql = "SELECT * from voiture2 WHERE immatriculation='$immat'";
            echo "<p>J'effectue la requête \"$sql\"</p>";
            $rep = Model::$pdo->query($sql);
            $rep->setFetchMode(PDO::FETCH_CLASS, 'Voiture');
            return $rep->fetch();
        }

        if (isset($_GET['immatriculation'])) {
            $v = getVoitureByImmat($_GET['immatriculation']);
            $v-> afficher();
        }
        ?>
    </body>
</html>
