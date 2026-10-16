---
id: ZBLK-001
type: blocker
date: 2026-10-16
tags: [webfetch, 403, herse, source, browser]
---

# ZBLK-001 — Page de la herse en 403 via WebFetch

| Friction | Cause réelle | Solution | Statut |
| --- | --- | --- | --- |
| `calcul-escaliers.web4me.fr/Balancement_herse.htm` renvoie une erreur 403 à WebFetch. | Le site bloque les robots, et la méthode n'y est décrite qu'en images. | Ouverture dans le navigateur intégré, puis affichage direct des images (`Images/Demi_tournant_(herse).jpg`, `Images/Calcul_herse.jpg`). | résolu |

## Références

- [LRN-001](../../learnings/LRN-001.md) — méthode extraite
