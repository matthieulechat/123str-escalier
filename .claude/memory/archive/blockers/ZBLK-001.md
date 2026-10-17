---
id: ZBLK-001
type: blocker
date: 2026-10-16
summary: "Page de la herse en 403 via WebFetch"
tags: [webfetch, 403, herse, source, browser]
status: résolu
---

# ZBLK-001 — Page de la herse en 403 via WebFetch

**Friction** : `calcul-escaliers.web4me.fr/Balancement_herse.htm` renvoie une erreur 403 à WebFetch.

**Cause réelle** : Le site bloque les robots, et la méthode n'y est décrite qu'en images.

**Solution** : Ouverture dans le navigateur intégré, puis affichage direct des images (`Images/Demi_tournant_(herse).jpg`, `Images/Calcul_herse.jpg`).

## Références

- [LRN-001](../../learnings/LRN-001.md) — méthode extraite
