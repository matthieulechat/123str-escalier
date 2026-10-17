---
register: journal
---

## 2026-10-16

Création de l'app de calcul d'escalier béton (Vite + React + TS + Tailwind) pour les dessinateurs béton. Elle gère les types droit, quart et demi tournant, le jour droit ou arrondi, le balancement par la méthode de la herse, les niveaux finis / bruts et les finitions (sol, palier, marche, contremarche), la paillasse et la dalle. Toutes les valeurs sont en cm.

Vues : saisie directement sur des schémas de plan et de coupe, plan calculé (brut en trait plein, fini en pointillé, annotations), tracé de la herse, coupe développée, détail du départ, lexique et tableau des valeurs repliable. Les contrôles sont limités aux règles du bureau. La convention de saisie des volées a été corrigée après comparaison avec un tracé main (612,8 → 421,4 cm de foulée).

**Entrées clés :**

- [BDR-001](decisions/BDR-001.md) — volées cotées jusqu'au mur du fond
- [BDR-002](decisions/BDR-002.md) — règles du bureau uniquement
- [LRN-001](learnings/LRN-001.md) — formule fermée de la herse
- [ZBLK-002](archive/blockers/ZBLK-002.md) — export DWG en attente

---

Amorçage du projet avec `/project-init` : mémoire projet et `CLAUDE.md`, plugins Vite (checker, qrcode), `CHANGELOG.md`, README en anglais et en français. `vite-plugin-mkcert` a été installé puis retiré : l'aperçu intégré refusait le certificat, même après le `mkcert -install` de Baptiste. Le serveur de dev reste en HTTP.

Clôture avec `/session-close` : `git init` (le dossier n'était pas un repo), verrous AutoCAD `.dwl` / `.dwl2` exclus du suivi, react-doctor passé de 92 à 100/100 en sortant les utilitaires SVG de `Annot.tsx` vers `src/components/svg.ts` (règle only-export-components), puis premier commit `757c509`. Toutes les entrées de cette clôture sont gardées en mémoire locale, à la demande de Baptiste.

**Entrées clés :**

- [BDR-004](decisions/BDR-004.md) — serveur de dev en HTTP, mkcert retiré
- [LRN-004](learnings/LRN-004.md) — verrous AutoCAD à ignorer dans git

---

Migration de l'UI vers shadcn/ui (style base-nova) à la demande de Baptiste : alias `@` ajouté dans `tsconfig.json` et `vite.config.ts`, puis Card, Button, Input, Label, NativeSelect, Checkbox, Alert, Badge, Table et Collapsible remplacent le Tailwind posé sur les éléments natifs. Les figures et panneaux repliables passent par deux enveloppes partagées (`FigureCard`, `CollapsibleCard`). Le CLI a cassé le build sous Windows (import `cn`, paquet npm `cn`, `utils.ts` circulaire), corrigé à la main. Lint, build, `stair.check.ts` et vérification dans le navigateur OK. Commits `9ee05ac` (UI) et `888795a` (changelog), poussés. Le thème reste neutre : les tokens « Mètre ruban » restent à appliquer.

**Entrées clés :**

- [BDR-005](decisions/BDR-005.md) — UI sur shadcn/ui, thème neutre provisoire
- [ZBLK-004](archive/blockers/ZBLK-004.md) — build cassé par le CLI shadcn sous Windows

---

Export DXF du plan pour AutoCAD (`src/dxf.ts`, bouton « Export DXF » dans l'en-tête de la carte Plan). Un DWG natif étant hors de portée sans bibliothèque, l'export produit un DXF R12 que les dessinateurs ouvrent ou insèrent dans AutoCAD. Itérations avec Baptiste, captures AutoCAD à l'appui : calques du gabarit ABAK à la place de calques maison, 1re et dernière CM brute en vu, ligne de foulée sur `ABAK_A-COTA` avec double ligne de départ et flèche ouverte, numéros 01, 02… en italique côté jour près de la contremarche. Un bouton de rotation a été livré puis remplacé par l'export des 4 orientations côte à côte. Les numéros touchaient les traits dans AutoCAD (police plus large que l'aperçu, texte horizontal dans les vues tournées) : réglé par une recherche de la position libre la plus proche, vérifiée sur 5 escaliers. [ZBLK-002](archive/blockers/ZBLK-002.md) (DWG illisible) est clos et archivé, comme [ZBLK-004](archive/blockers/ZBLK-004.md). Toutes les entrées restent locales, à la demande de Baptiste. Commit `6c5033a`, poussé.

**Entrées clés :**

- [BDR-007](decisions/BDR-007.md) — correspondance avec les calques ABAK
- [BDR-008](decisions/BDR-008.md) — 4 orientations dans l'export
- [ZBLK-005](archive/blockers/ZBLK-005.md) — numéros en contact avec les traits

---

Réorganisation des résultats à la demande de Baptiste. Le volet *Tableau des valeurs par contremarche* est sorti de `Results.tsx` dans `ValuesTable.tsx` et placé sous le plan, après deux déplacements faux du composant `Results` entier (le libellé n'avait pas été cherché dans le code). Coupe développée, détail au départ et plan passent en volets repliables (`CollapsibleCard`, qui gagne les props `legend` et `action`, `FigureCard` supprimé) ; seul le plan est ouvert au chargement, Export DXF visible même replié, et le lexique est désormais fermé. react-doctor 100/100 sur les fichiers modifiés. [ZBLK-005](archive/blockers/ZBLK-005.md) archivé. Entrées gardées en local, à la demande de Baptiste. Commit `e7b7241`, poussé.

**Entrées clés :**

- [BDR-009](decisions/BDR-009.md) — résultats en volets repliables, seul le plan ouvert
- [ZBLK-006](archive/blockers/ZBLK-006.md) — « tableau des valeurs » mal identifié

---

Vue 3D de l'escalier sous le Plan, après comparaison de quatre approches (three.js vanilla, react-three-fiber, axonométrie SVG, export glTF) : three.js retenu, chargé à l'ouverture d'un volet fermé par défaut. Itérations avec Baptiste sur le rendu : la première paillasse en redans a été remplacée par une sous-face continue alignée sur la convention de la Coupe, les finitions de contremarche ajoutées, puis deux coches (finitions, balancées en bleu). Les arêtes automatiques traçaient des traits parasites sur les flancs ; leur suppression rendait la vue de dessus illisible, d'où un tracé manuel des seules vraies arêtes. Lenteur à la saisie mesurée dans le navigateur (≈100 ms par frappe avec la 3D ouverte) : reconstruction différée de 200 ms, géométries fusionnées et pixel ratio plafonné ramènent la frappe à ≈17 ms. Au passage, les volets se refermaient à chaque saisie, parce qu'une valeur intermédiaire invalide démontait toute la section de résultats : elle est désormais masquée et garde son état. react-doctor 100/100, commit `d58facf` (non poussé). [ZBLK-006](archive/blockers/ZBLK-006.md) archivé ; trois learnings passés en global (GLRN-343 à GLRN-345).

**Entrées clés :**

- [BDR-010](decisions/BDR-010.md) — vue 3D three.js lazy-loadée
- [BDR-011](decisions/BDR-011.md) — paillasse 3D alignée sur la Coupe
- [ZBLK-007](archive/blockers/ZBLK-007.md) — volets refermés à chaque saisie

---

Refonte complète de l'identité visuelle via `/brand-creator`, à la place de « Mètre ruban » et du thème shadcn neutre. Six directions UI proposées (Calque, Cordeau, Coffrage, Herse, Niveau, Finition), contrastes WCAG calculés : Baptiste retient Cordeau. Moodboard logo en deux passes : RulerDimensionLine puis Ruler pour les basiques, et deux séries de concepts sur-mesure (Paillasse / Balancement / Chaîne de cotes, puis Mètre pliant / Équerre / Moulage) ; une planche dédiée croise Moulage avec le trait de craie et les fonds H / C, choix final R1. og:image : template ogimagecn Logo, une planche de six sous-titres, choix T2 « Le calculateur d'escaliers béton du dessinateur. », rendu Satori + resvg dans le scratchpad. Assets PWA régénérés en bleu. Les tokens Cordeau sont ensuite appliqués à `src/index.css`, avec le logo et le trait de craie dans le header ; `pnpm add` des polices bloqué par `minimumReleaseAge`, donc Google Fonts en attendant. Correctif du halo blanc autour des annotations SVG. react-doctor 100/100, lint et build verts, commit `31760ea` ; push refusé (403, pas de droit d'écriture sur le repo de Matthieu). [ZBLK-007](archive/blockers/ZBLK-007.md), [ZBLK-008](archive/blockers/ZBLK-008.md) et [ZBLK-009](archive/blockers/ZBLK-009.md) archivés.

**Entrées clés :**

- [BDR-012](decisions/BDR-012.md) — identité « Cordeau » appliquée à l'app
- [BLK-010](blockers/BLK-010.md) — `pnpm add` bloqué par `minimumReleaseAge`
- [ZBLK-011](archive/blockers/ZBLK-011.md) — push refusé sur le repo de Matthieu

## 2026-10-17

Session de finition du panneau de saisie, au fil des retours de Baptiste sur captures. Serveur de dev relancé (config `escalier`, HTTP). La ligne Type / Sens / contremarches reçoit d'abord un titre, puis devient repliable ; Baptiste demande ensuite d'y englober Plan et Coupe : toute la saisie passe dans le `CollapsibleCard` partagé « Saisie de l'escalier », ouvert par défaut, avec une prop `regionLabel` pour conserver le repère `region` des lecteurs d'écran (expliquée simplement après une première remarque trop jargonneuse). Ajout d'un cadenas par valeur pour éviter les fautes de frappe, état remonté dans `Saisie` parce que le panneau Base UI démonte son contenu replié. Les cadenas élargissaient les cartes et faisaient passer la configuration sur deux lignes : taille `icon-2xs`, champs resserrés et cartes opaques ramènent tout sur une ligne (mesuré à 1400 px). Légende rouge du plan centrée sur le dessin de l'escalier (centre propre à chaque type) puis espacée de la cote ; repère « Finition marche » de la coupe corrigé, il pointait dans le béton. Les captures d'écran de l'aperçu échouaient : vérifications faites par script (DOM, `isPointInFill`). react-doctor 96/100 sans problème, lint et build verts, commit `b313784` (non poussé).

**Entrées clés :**

- [BDR-013](decisions/BDR-013.md) — saisie dans un CollapsibleCard nommé region
- [BDR-014](decisions/BDR-014.md) — verrous de saisie non persistés

---

Session sur les coupes. Lignes de coupe A, B, C… ajoutées au plan, à 20 cm de chaque mur extérieur, regard vers le jour ; d'abord rapprochées pour ne plus toucher les cotes, puis allongées au-delà des cotes à la demande de Baptiste. Le moteur expose `cutLines()` / `cutProfile()` et l'export DXF trace les coupes sur une ligne sous les 4 vues en plan (fini en CA, brut et sous-face en COFFRAGE-VU), puis les lignes de coupe sur les vues en plan. Retours successifs après ouverture dans AutoCAD : 100 cm de plancher au départ et de palier à l'arrivée, nouveau champ « Plancher bas », lignes de coupe et traits de fin de coupe sur `ABAK_A-AXE` (traversant la finition), puis jonction monolithe entre le plancher bas et la paillasse. Deux retouches du schéma de saisie (légende masquée, repère caché). Vérifications par aperçu SVG du DXF servi par le serveur de dev ; contrôles ajoutés dans `stair.check.ts`. Une commande Bash a bloqué 120 s sur une ligne `cat >` parasite, et un `grep` via rtk a laissé croire à tort qu'un `sed` avait échoué. react-doctor 96/100, lint et build verts, commit `b8c2e67` poussé : le push fonctionne de nouveau, [ZBLK-011](archive/blockers/ZBLK-011.md) archivé.

**Entrées clés :**

- [BDR-015](decisions/BDR-015.md) — coupes à 20 cm de chaque mur extérieur
- [BDR-016](decisions/BDR-016.md) — calques des coupes DXF
- [BDR-017](decisions/BDR-017.md) — plancher et jonction monolithe
