---
id: ZBLK-009
type: blocker
date: 2026-10-16
tags: [rtk, lint, tsc, command-rewriting, tooling]
---

# ZBLK-009 — `pnpm lint` réécrit en eslint par rtk

| Friction | Cause réelle | Solution | Statut |
| --- | --- | --- | --- |
| `pnpm lint` échouait sur « eslint not found » alors que le script du projet est `tsc --noEmit`. | Le hook rtk réécrit `pnpm lint` en sa commande lint (eslint), sans lire le script du projet. | `rtk proxy pnpm lint` pour exécuter le vrai script (voir aussi GLRN-237). | résolu |
