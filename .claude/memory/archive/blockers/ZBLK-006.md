---
id: ZBLK-006
type: blocker
date: 2026-10-16
summary: "« Tableau des valeurs » mal identifié, deux déplacements faux"
tags: [ui, layout, vocabulaire, composant, results]
status: résolu
---

# ZBLK-006 — « Tableau des valeurs » mal identifié, deux déplacements faux

**Friction** : Demande « passe le tableau des valeurs sous le plan » : le composant `Results` entier a été déplacé, puis remonté, sans jamais placer le bon bloc (3 tentatives).

**Cause réelle** : Le volet *Tableau des valeurs par contremarche* vivait dans `Results.tsx` avec les cartes de synthèse ; le libellé n'a pas été cherché dans le code.

**Solution** : Volet extrait dans `ValuesTable.tsx` et placé sous le plan.

## Références

- [LRN-011](../../learnings/LRN-011.md) — pattern extrait
