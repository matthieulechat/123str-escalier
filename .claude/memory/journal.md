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
- [BLK-002](blockers/BLK-002.md) — export DWG en attente

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
- [BLK-004](blockers/BLK-004.md) — build cassé par le CLI shadcn sous Windows
