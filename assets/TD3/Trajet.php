<?php

require_once 'Model.php';

class Trajet {

    private int $id;
    private string $depart;
    private string $arrivee;
    private string $date;
    private int $nbPlaces;
    private int $prix;
    private string $conducteurLogin;

    public function __construct(
        int $id,
        string $depart,
        string $arrivee,
        string $date,
        int $nbPlaces,
        int $prix,
        string $conducteurLogin
    )
    {
        $this->id = $id;
        $this->depart = $depart;
        $this->arrivee = $arrivee;
        $this->date = $date;
        $this->nbPlaces = $nbPlaces;
        $this->prix = $prix;
        $this->conducteurLogin = $conducteurLogin;
    }

    public static function construireDepuisTableau(array $trajetTableau) : Trajet {
        return new Trajet(
            $trajetTableau["id"],
            $trajetTableau["depart"],
            $trajetTableau["arrivee"],
            $trajetTableau["date"],
            $trajetTableau["nbPlaces"],
            $trajetTableau["prix"],
            $trajetTableau["conducteurLogin"],
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getDepart(): string
    {
        return $this->depart;
    }

    public function setDepart(string $depart): void
    {
        $this->depart = $depart;
    }

    public function getArrivee(): string
    {
        return $this->arrivee;
    }

    public function setArrivee(string $arrivee): void
    {
        $this->arrivee = $arrivee;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): void
    {
        $this->date = $date;
    }

    public function getNbPlaces(): int
    {
        return $this->nbPlaces;
    }

    public function setNbPlaces(int $nbPlaces): void
    {
        $this->nbPlaces = $nbPlaces;
    }

    public function getPrix(): int
    {
        return $this->prix;
    }

    public function setPrix(int $prix): void
    {
        $this->prix = $prix;
    }

    public function getConducteurLogin(): string
    {
        return $this->conducteurLogin;
    }

    public function setConducteurLogin(string $conducteurLogin): void
    {
        $this->conducteurLogin = $conducteurLogin;
    }

    public function __toString()
    {
        return "<p> Ce trajet du {$this->date} partira de {$this->depart} pour aller à {$this->arrivee}. </p>";
    }

    /**
     * @return Trajet[]
     */
    public static function getTrajets() : array {
        $pdoStatement = Model::getPDO()->query("SELECT * FROM trajet");

        $trajets = [];
        foreach($pdoStatement as $trajetFormatTableau) {
            $trajets[] = Trajet::construireDepuisTableau($trajetFormatTableau);
        }

        return $trajets;
    }
}
