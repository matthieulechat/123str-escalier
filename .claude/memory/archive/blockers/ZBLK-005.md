---
id: ZBLK-005
type: blocker
date: 2026-10-16
summary: "Numéros DXF en contact avec les traits"
tags: [dxf, autocad, text, collision, rotation, placement]
status: résolu
---

# ZBLK-005 — Numéros DXF en contact avec les traits

**Friction** : Dans AutoCAD, les numéros de marche touchaient les contremarches et la foulée, surtout dans le tournant et dans les vues tournées (3 itérations).

**Cause réelle** : Écarts fixes calibrés sur un aperçu SVG, alors que le texte AutoCAD est plus large et reste horizontal quand la vue tourne.

**Solution** : Placement par recherche de la position libre la plus proche, boîte mesurée sur le rendu AutoCAD.

## Références

- [LRN-008](../../learnings/LRN-008.md) — largeur réelle du texte
- [LRN-009](../../learnings/LRN-009.md) — placement sans collision
