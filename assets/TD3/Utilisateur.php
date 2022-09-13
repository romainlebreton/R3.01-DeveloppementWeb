<?php

require_once 'Model.php';

class Utilisateur {

    private string $login;
    private string $nom;
    private string $prenom;

    public function __construct(string $login, string $nom, string $prenom)
    {
        $this->login = $login;
        $this->nom = $nom;
        $this->prenom = $prenom;
    }

    public static function construire(array $utilisateurTableau) : Utilisateur {
        return new Utilisateur(
            $utilisateurTableau["login"],
            $utilisateurTableau["nom"],
            $utilisateurTableau["prenom"]
        );
    }

    public function getLogin(): string
    {
        return $this->login;
    }

    public function setLogin(string $login): void
    {
        $this->login = $login;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): void
    {
        $this->nom = $nom;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): void
    {
        $this->prenom = $prenom;
    }

    // une methode d'affichage.
    public function afficher() {
        echo "<p> Utilisateur {$this->prenom} {$this->nom} de login {$this->login} </p>";
    }

    public function __toString() : string {
        return "<p> Utilisateur {$this->prenom} {$this->nom} de login {$this->login} </p>";
    }

    /**
     * @return Utilisateur[]
     */
    public static function getUtilisateurs() : array {
        $pdoStatement = Model::getPdo()->query("SELECT * FROM utilisateur");

        $utilisateurs = [];
        foreach($pdoStatement as $utilisateurFormatTableau) {
            $utilisateurs[] = static::construire($utilisateurFormatTableau);
        }

        return $utilisateurs;
    }
}