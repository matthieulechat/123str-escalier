---
id: ZBLK-002
type: blocker
date: 2026-10-16
tags: [dwg, autocad, export, dxf, format]
---

# ZBLK-002 — DWG d'exemple illisible (AC1032 compressé)

| Friction | Cause réelle | Solution | Statut |
| --- | --- | --- | --- |
| `EXEMPLE ESCALIER.dwg`, le rendu attendu par les dessinateurs, ne peut pas être lu pour en extraire les calques et les conventions. | Format AutoCAD 2018 (AC1032), binaire compressé, sans bibliothèque DWG installée. | Export DXF livré côté navigateur ; conventions de calques obtenues par capture du gestionnaire de calques, sans lire le DWG. | résolu |

## Références

- [BDR-006](../../decisions/BDR-006.md) — export DXF R12
- [BDR-007](../../decisions/BDR-007.md) — calques du gabarit ABAK
