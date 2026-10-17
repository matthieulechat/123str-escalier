---
id: ZBLK-003
type: blocker
date: 2026-10-16
summary: "Aperçu HTTPS refusé malgré `mkcert -install`"
tags: [mkcert, https, preview, certificat, vite]
status: résolu
---

# ZBLK-003 — Aperçu HTTPS refusé malgré `mkcert -install`

**Friction** : Après l'ajout de `vite-plugin-mkcert` (étape 2 de `/project-init`), l'aperçu intégré affiche `ERR_CERT_AUTHORITY_INVALID`, avant comme après le `mkcert -install` lancé par Baptiste.

**Cause réelle** : L'aperçu de l'app Claude ne reprend pas la CA installée en cours de session (chargée au démarrage).

**Solution** : Plugin retiré, serveur de dev repassé en HTTP.

## Références

- [BDR-004](../../decisions/BDR-004.md) — décision prise
- [LRN-003](../../learnings/LRN-003.md) — pattern extrait
