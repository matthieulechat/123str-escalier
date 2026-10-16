<h1 align="center">Escalier Béton 🪜</h1>

<p align="center">
  <i>Un calculateur d'escaliers béton pour les dessinateurs en structure : contremarches, girons, niveaux bruts, finitions et balancement sur un seul écran.</i>
</p>

<p align="center">
  <a href="README.md">🇬🇧 Read in English</a>
</p>

![React](https://shieldcn.dev/badge/React-19-61DAFB.svg?logo=react)
![Vite](https://shieldcn.dev/badge/Vite-8-646CFF.svg?logo=vite)
![TypeScript](https://shieldcn.dev/badge/TypeScript-7-3178C6.svg?logo=typescript)
![Tailwind CSS](https://shieldcn.dev/badge/Tailwind%20CSS-4-06B6D4.svg?logo=tailwindcss)

---

## 📸 Captures d'écran

> _Ajouter des captures ici_

## 🚀 Fonctionnalités clés

- **Trois types d'escalier** : droit, quart tournant et demi tournant, tournant à gauche ou à droite, avec un jour droit ou arrondi.
- **Saisie sur les schémas** : dimensions, niveaux finis et finitions se saisissent directement sur un schéma de plan et un schéma de coupe. Les volées sont cotées de la 1re contremarche au mur du fond, comme le font les dessinateurs.
- **Règles de confort du bureau** : nombre de contremarches automatique respectant h ≤ 18 cm, g ≥ 24 cm et 60 < 2h + g < 64, avec un contrôle conforme / non conforme pour chaque règle.
- **Balancement** : marches balancées calculées par la méthode de la herse, avec le tracé de la herse pour chaque côté du tournant.
- **Niveaux finis et bruts** : les finitions du sol, du palier, des marches et des contremarches donnent les niveaux bruts et les hauteurs de contremarches brutes (1re, courante et dernière).
- **Schémas annotés** : vue en plan (contremarches brutes en trait plein, finies en pointillé, ligne de foulée avec flèche de montée, cotes des volées), coupe développée sur la ligne de foulée et détail annoté des premières marches.
- **Tableau de traçage** : giron sur la foulée, collet au jour, giron extérieur et cumuls de traçage pour chaque contremarche.
- **Lexique intégré** : chaque terme des schémas est expliqué, pour que les nouveaux dessinateurs prennent vite leurs repères.
- **Tout en centimètres** : longueurs, épaisseurs et niveaux utilisent la même unité.

## 💻 Stack technique

| Catégorie | Technologies |
| :-------- | :----------- |
| Frontend | ![React](https://shieldcn.dev/badge/React-19-61DAFB.svg?logo=react) ![Tailwind CSS](https://shieldcn.dev/badge/Tailwind%20CSS-4-06B6D4.svg?logo=tailwindcss) |
| Langage | ![TypeScript](https://shieldcn.dev/badge/TypeScript-7-3178C6.svg?logo=typescript) |
| Outillage | ![Vite](https://shieldcn.dev/badge/Vite-8-646CFF.svg?logo=vite) ![pnpm](https://shieldcn.dev/badge/pnpm-package%20manager-F69220.svg?logo=pnpm) |

## 📦 Installation et démarrage

1. **Ouvrir le dossier du projet**
   ```bash
   cd escalier
   ```
2. **Installer les dépendances**
   ```bash
   pnpm install
   ```
3. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```
4. **Vérifier le moteur de calcul**
   ```bash
   pnpm check
   ```
5. **Vérifier les types et compiler**
   ```bash
   pnpm lint
   pnpm build
   ```

## 📂 Structure du projet

```
src/
├── stair.ts              # Moteur de calcul pur : géométrie, herse, niveaux, contrôles
├── App.tsx               # Mise en page et valeurs par défaut
└── components/
    ├── Saisie/           # Champs de saisie posés sur les schémas de plan et de coupe
    ├── Plan.tsx          # Vue en plan annotée
    ├── Herse.tsx         # Tracé de la herse pour chaque moitié du tournant
    ├── Coupe.tsx         # Coupe développée sur la ligne de foulée
    ├── Detail.tsx        # Détail annoté des premières marches
    ├── Results.tsx       # Chiffres clés, contrôles et tableau de traçage
    └── Glossary.tsx      # Lexique des termes d'escalier
stair.check.ts            # Auto-vérification du moteur (node stair.check.ts)
```

---

Fait avec ❤️ par [Matthieu Lechat](https://github.com/matthieulechat)

## 📝 Licence

Aucune licence n'a encore été choisie pour ce projet.
