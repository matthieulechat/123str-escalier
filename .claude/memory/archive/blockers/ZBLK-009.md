---
id: ZBLK-009
type: blocker
date: 2026-10-16
summary: "`pnpm lint` réécrit en eslint par rtk"
tags: [rtk, lint, tsc, command-rewriting, tooling]
status: résolu
---

# ZBLK-009 — `pnpm lint` réécrit en eslint par rtk

**Friction** : `pnpm lint` échouait sur « eslint not found » alors que le script du projet est `tsc --noEmit`.

**Cause réelle** : Le hook rtk réécrit `pnpm lint` en sa commande lint (eslint), sans lire le script du projet.

**Solution** : `rtk proxy pnpm lint` pour exécuter le vrai script (voir aussi GLRN-237).
