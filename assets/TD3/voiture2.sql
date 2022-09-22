SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Structure de la table `voiture2`
--

CREATE TABLE `voiture2` (
  `immatriculation` varchar(8) NOT NULL,
  `marque` varchar(25) NOT NULL,
  `couleur` varchar(12) NOT NULL,
  `nbSieges` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `voiture2`
--

INSERT INTO `voiture2` (`immatriculation`, `marque`, `couleur`, `nbSieges`) VALUES
('12345678', 'Ferrari', 'vert', 2),
('259641', 'Renault', 'Noire', 5),
('710097', 'Tesla', 'Bleu nuit', 4),
('8369210', 'Tesla', 'Bleu nuit', 4),
('abc124az', 'Renault', 'bleu', 5);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `voiture2`
--
ALTER TABLE `voiture2`
  ADD PRIMARY KEY (`immatriculation`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
