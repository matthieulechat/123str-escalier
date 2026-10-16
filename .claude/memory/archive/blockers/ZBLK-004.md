---
id: ZBLK-004
type: blocker
date: 2026-10-16
tags: [shadcn, windows, cli, build, imports]
---

# ZBLK-004 — Build cassé après `shadcn init` (import `cn`, utils circulaire)

| Friction | Cause réelle | Solution | Statut |
| --- | --- | --- | --- |
| Après `shadcn init` + `add`, les composants importaient `"cn"` et `utils.ts` se ré-exportait lui-même. | Bug du CLI shadcn 4.21.5 sous Windows sur la résolution de l'alias `utils`. | Imports réécrits vers `@/lib/utils`, `cn` npm remplacé par `clsx` + `tailwind-merge`, `utils.ts` réécrit. | résolu |

## Références

- [LRN-006](../../learnings/LRN-006.md) — pattern extrait
