-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Dim 18 Septembre 2016 à 19:40
-- Version du serveur :  5.7.15-0ubuntu0.16.04.1
-- Version de PHP :  7.0.8-0ubuntu0.16.04.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données :  `PHP1617`
--

-- --------------------------------------------------------

--
-- Structure de la table `voiture2`
--

CREATE TABLE `voiture2` (
  `immatriculation` varchar(8) NOT NULL,
  `marque` varchar(25) NOT NULL,
  `couleur` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contenu de la table `voiture2`
--

INSERT INTO `voiture2` (`immatriculation`, `marque`, `couleur`) VALUES
('12345678', 'Ferrari', 'vert'),
('259641', 'Renault', 'Noire'),
('710097', 'Tesla', 'Bleu nuit'),
('8369210', 'Tesla', 'Bleu nuit'),
('abc124az', 'Renault', 'bleu');

--
-- Index pour les tables exportées
--

--
-- Index pour la table `voiture2`
--
ALTER TABLE `voiture2`
  ADD PRIMARY KEY (`immatriculation`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
