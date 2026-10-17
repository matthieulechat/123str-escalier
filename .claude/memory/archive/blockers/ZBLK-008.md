---
id: ZBLK-008
type: blocker
date: 2026-10-16
summary: "`pnpm add three` : EPERM sur `package.json`"
tags: [pnpm, windows, eperm, package-json, lock]
status: résolu
---

# ZBLK-008 — `pnpm add three` : EPERM au renommage de `package.json`

**Friction** : La dépendance s'installait dans `node_modules` mais `package.json` restait inchangé (EPERM sur le rename du fichier temporaire).

**Cause réelle** : Fichier probablement verrouillé un instant par le serveur de dev d'une autre session (Windows).

**Solution** : Relancer `pnpm add` a suffi ; vérifier `package.json` après chaque install sous Windows.
