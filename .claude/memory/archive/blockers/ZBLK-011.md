---
id: ZBLK-011
type: blocker
date: 2026-10-16
tags: [git, github, permissions, push, collaboration]
---

# ZBLK-011 — `git push` refusé sur le repo de Matthieu

| Friction | Cause réelle | Solution | Statut |
| --- | --- | --- | --- |
| `git push` → `403 Permission to matthieulechat/123str-escalier.git denied to baptistelechat`. | Le remote `origin` appartient à `matthieulechat` ; le compte GitHub de Baptiste n'y a pas les droits d'écriture. | Commit `31760ea` (identité Cordeau) gardé en local. Résolu le 2026-10-17 : le push `b8c2e67` sur `main` est passé (droits d'écriture obtenus). | résolu |
