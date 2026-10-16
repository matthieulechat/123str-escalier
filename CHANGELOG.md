# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Calcul d'escaliers béton droits, quart tournants et demi tournants (tourne à gauche ou à droite), avec jour droit ou arrondi.
- Nombre de contremarches automatique respectant les règles du bureau : h ≤ 18 cm, g ≥ 24 cm, 60 < 2h + g < 64, avec contrôles affichés.
- Balancement des marches par la méthode de la herse, avec le tracé de la herse pour chaque côté du tournant.
- Niveaux finis et bruts, finitions (sol de départ, palier, dessus de marche, contremarche) et hauteurs de contremarches brutes (1re, courante, dernière).
- Saisie des dimensions directement sur des schémas de plan et de coupe.
- Plan annoté : contremarches brutes en trait plein, finies en pointillé, ligne de foulée avec flèche de montée, cotes des volées, de l'emmarchement et du giron.
- Coupe développée sur la ligne de foulée (profil fini, profil brut, paillasse, dalle palier) et détail annoté du départ.
- Tableau des valeurs par contremarche (girons, collets, cumuls de traçage) et lexique du vocabulaire, en panneaux repliables.
- Impression de la page.
- Application installable (PWA) avec icônes, logo et image d'aperçu pour le partage de lien.
- Export DXF du plan pour AutoCAD : tracés sur les calques du bureau (limons, contremarches brutes et finies), ligne de foulée avec double ligne de départ et flèche d'arrivée, numéros de marche côté jour, dans les 4 orientations pour se caler sur le plan archi.

### Changed

- Interface refondue avec des composants homogènes (cartes, champs, listes déroulantes, cases à cocher, badges de contrôle, tableau).
- Résultats réorganisés : synthèse et contrôles en tête, puis plan, tableau des valeurs, herse, coupe développée, détail et lexique. Toutes ces sections se replient ; seul le plan est ouvert au départ, avec l'export DXF accessible même replié.
