## 💻 escalier-beton

Calculateur d'escaliers béton pour les dessinateurs béton d'un bureau d'études structure. À partir des cotes de la cage, des niveaux finis et des finitions, il donne le nombre de marches, h, g, les niveaux bruts, le balancement (méthode de la herse) et des schémas annotés (plan, coupe développée, détail).

### Stack technique

- **Langage** : TypeScript
- **Framework** : React 19 + Vite
- **Runtime / Package manager** : Node.js + pnpm
- **Styling** : Tailwind CSS 4

### Architecture

Le moteur de calcul est pur, dans `src/stair.ts` (géométrie par segments, herse, niveaux, contrôles). Les vues SVG sont dans `src/components/`, et la saisie superposée aux schémas dans `src/components/Saisie/`. Le script `stair.check.ts` vérifie le moteur.

### Conventions importantes

- Toutes les valeurs sont en **cm**, niveaux compris : ne jamais mélanger les unités.
- Volées cotées de la 1re marche (ou du nez de palier) jusqu'au mur du fond ; foulée en arc dans le tournant.
- Contrôles limités aux règles du bureau (`RULES`) : h ≤ 18, g ≥ 24, 60 < 2h + g < 64. N'ajouter aucune règle sans source normative.
- Vérifications : `node stair.check.ts`, `pnpm lint` (tsc), `pnpm build`.
