---
id: ZBLK-007
type: blocker
date: 2026-10-16
summary: "Volets refermés à chaque changement de valeur"
tags: [ui, collapsible, state, unmount, saisie]
status: résolu
---

# ZBLK-007 — Volets refermés à chaque changement de valeur

**Friction** : Avec la 3D ouverte, modifier une cote refermait la 3D et rouvrait le Plan.

**Cause réelle** : Un champ vidé ou en cours de frappe passe par 0 ; `computeStair` renvoie une erreur et `App` démontait toute la section de résultats, remontée ensuite avec les `defaultOpen`.

**Solution** : Dernier résultat valide gardé (`setState` pendant le rendu) et section masquée par `hidden` au lieu d'être démontée (pattern global GLRN-343).
