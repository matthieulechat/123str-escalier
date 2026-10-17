---
id: ZBLK-012
type: blocker
date: 2026-10-17
summary: "Numéros « trop petits » : DXF testé issu d'un ancien code"
tags: [dxf, pwa, cache, cadcraft, stale-build]
status: résolu
---

# BLK-012 — Numéros « trop petits » : DXF testé issu d'un ancien code

**Friction** : Après le passage des numéros au style du bureau, Baptiste les trouve trop petits et mal inclinés, alors que les valeurs du code (hauteur 6, oblique 20°, tahoma) correspondaient à l'exemple.

**Cause réelle** : DXF exporté depuis une version antérieure (hauteur 4,4 dans le fichier) : changements ni commités ni déployés, PWA en cache.

**Solution** : Capture de la palette Propriétés de CadCraft, puis export refait depuis `pnpm dev` : « l'export est parfait ».

## Références

- [LRN-022](../../learnings/LRN-022.md) — vérifier la version du fichier testé
