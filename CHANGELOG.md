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
- Vue 3D orientable de l'escalier (rotation, zoom, déplacement) : marches et paillasse en béton brut, finitions de marche et de contremarche, marches balancées en bleu, avec des cases à cocher pour masquer les finitions ou la couleur des balancées. Chargée seulement à l'ouverture de son panneau.
- Cadenas à côté de chaque valeur de saisie pour la verrouiller et éviter les fautes de frappe.
- Lignes de coupe A, B, C… sur le plan, à 20 cm de chaque mur extérieur, avec flèches de regard vers le jour.
- Coupes dans l'export DXF, alignées sous les vues en plan : profil fini, béton brut et paillasse, avec 100 cm de plancher au départ et de palier à l'arrivée ; lignes de coupe et traits de fin de coupe sur le calque axe, y compris sur les vues en plan.
- Saisie de l'épaisseur du plancher bas, représenté dans les coupes exportées.
- Vues en plan brutes dans l'export DXF, entre les plans et les coupes : sans contremarches finies, ligne de foulée ni numéros, contremarches intermédiaires sur le calque fin.

### Changed

- Interface refondue avec des composants homogènes (cartes, champs, listes déroulantes, cases à cocher, badges de contrôle, tableau).
- Résultats réorganisés : synthèse et contrôles en tête, puis plan, tableau des valeurs, herse, coupe développée, détail et lexique. Toutes ces sections se replient ; seul le plan est ouvert au départ, avec l'export DXF accessible même replié.
- Nouvelle identité visuelle « Cordeau » : fond béton clair, bleu cordeau, police Archivo, logo en haut à gauche et trait de craie sous l'en-tête ; nouvelle icône d'application et nouvelle image d'aperçu pour le partage de lien.
- Saisie regroupée dans un panneau repliable « Saisie de l'escalier », avec des titres Configuration, Plan et Coupe ; cartes de cotes opaques et plus compactes, légende du plan centrée sous le schéma.
- Export DXF : numéros de marche au style du bureau (Tahoma oblique, hauteur 6 cm) collés à la foulée côté jour, et bouts des lignes de coupe en triangle plein avec lettre en gras italique, comme dans les plans du bureau.

### Fixed

- Les panneaux de résultats ne se referment plus quand une saisie passe par une valeur invalide (champ vidé ou en cours de frappe).
- Sur le schéma de coupe, le repère « Finition marche » pointe de nouveau sur la finition de la marche et non dans le béton.
- Export DXF : les limons vont jusqu'à la dernière contremarche brute pour fermer l'escalier en plan, et les lignes de coupe tombent sur le calque `ABAK_A-AXES` du gabarit (nom corrigé).
