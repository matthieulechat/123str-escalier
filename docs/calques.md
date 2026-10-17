# 🗂️ Calques du gabarit AutoCAD (ABAK)

Relevé du gestionnaire des propriétés des calques du gabarit du bureau (18 calques).
Les noms doivent être repris **à l'identique** dans l'export DXF : c'est ce qui fusionne les calques avec ceux du DWG cible à l'insertion.

| Calque                                    | Couleur   | Type de ligne | Épaisseur  | Tracé | Utilisé par l'export DXF                                   |
| ----------------------------------------- | --------- | ------------- | ---------- | ----- | ---------------------------------------------------------- |
| `0`                                       | Blanc     | Continuous    | Par défaut | ✅    | —                                                          |
| `ABAK_A-ANNOT`                            | Blanc     | Continuous    | Par défaut | ✅    | Numéros de marches, lettres et titres des coupes           |
| `ABAK_A-ANNOT FERRAILLAGES`               | Blanc     | Continuous    | Par défaut | ✅    | —                                                          |
| `ABAK_A-AXES`                             | Color 32  | AXES          | 0.20 mm    | ✅    | Lignes de coupe, traits de fin de coupe                    |
| `ABAK_A-CARTOUCHE`                        | Blanc     | Continuous    | 0.20 mm    | ✅    | —                                                          |
| `ABAK_A-COTA`                             | Blanc     | Continuous    | 0.18 mm    | ✅    | Ligne de foulée (double trait de départ, flèche d'arrivée) |
| `ABAK_A-HACHURES`                         | Color 253 | Continuous    | 0.15 mm    | ✅    | —                                                          |
| `ABAK_A-TITRES`                           | Color 150 | Continuous    | 0.40 mm    | ✅    | —                                                          |
| `ABAK_BA-FERRAILLAGES`                    | Rouge     | Continuous    | Par défaut | ✅    | —                                                          |
| `ABAK_BA-FERRAILLAGES CACHES`             | Blanc     | CACHE         | Par défaut | ✅    | —                                                          |
| `ABAK_BC-COFFRAGE-CA`                     | Blanc     | CACHE         | 0.15 mm    | ✅    | Contremarches finies (plan), profil fini (coupes)          |
| `ABAK_BC-COFFRAGE-CO`                     | Blanc     | Continuous    | 0.50 mm    | ✅    | —                                                          |
| `ABAK_BC-COFFRAGE-FIN`                    | Bleu      | Continuous    | 0.15 mm    | ✅    | Contremarches brutes intermédiaires (couleur 7 forcée)     |
| `ABAK_BC-COFFRAGE-VU`                     | Blanc     | Continuous    | 0.30 mm    | ✅    | Limons, 1re et dernière CM brutes, béton coupé (coupes)    |
| `ABAK_BC-EXISTANT`                        | Color 252 | Continuous    | 0.15 mm    | ✅    | —                                                          |
| `ABAK_BC-STR METAL`                       | Color 20  | Continuous    | 0.20 mm    | ✅    | —                                                          |
| `ABAK_Hachures`                           | Color 252 | Continuous    | 0.15 mm    | ✅    | —                                                          |
| `DEFPOINTS`                               | Blanc     | Continuous    | Par défaut | ❌    | —                                                          |

Tous les calques sont activés, non gelés, non verrouillés, transparence 0.

## Correspondance dans le code

Les constantes de calques sont en tête de [`src/dxf.ts`](../src/dxf.ts). Règles de choix : [BDR-007](../.claude/memory/decisions/BDR-007.md) (plan) et [BDR-016](../.claude/memory/decisions/BDR-016.md) (coupes).
