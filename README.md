<h1 align="center">Escalier Béton 🪜</h1>

<p align="center">
  <i>A concrete stair calculator for structural draftsmen: risers, treads, rough levels, finishes and winder balancing in one screen.</i>
</p>

<p align="center">
  <a href="README.fr.md">🇫🇷 Lire en français</a>
</p>

![React](https://shieldcn.dev/badge/React-19-61DAFB.svg?logo=react)
![Vite](https://shieldcn.dev/badge/Vite-8-646CFF.svg?logo=vite)
![TypeScript](https://shieldcn.dev/badge/TypeScript-7-3178C6.svg?logo=typescript)
![Tailwind CSS](https://shieldcn.dev/badge/Tailwind%20CSS-4-06B6D4.svg?logo=tailwindcss)

---

## 📸 Screenshots

> _Add screenshots here_

## 🚀 Key Features

- **Three stair types**: straight, quarter-turn and half-turn stairs, turning left or right, with a square or rounded well.
- **Input on the drawings**: dimensions, finished levels and finishes are typed directly on a plan sketch and a section sketch. Flights are measured from the first riser to the back wall, the way draftsmen dimension them.
- **Office comfort rules**: automatic riser count that respects h ≤ 18 cm, g ≥ 24 cm and 60 < 2h + g < 64, with a pass/fail check for each rule.
- **Winder balancing**: balanced steps computed with the herse method, with the herse construction drawn for each side of the turn.
- **Finished vs rough levels**: floor, landing, tread and riser finishes give rough levels and rough riser heights (first, typical and last).
- **Annotated drawings**: plan view (rough risers solid, finished risers dashed, walking line with direction arrow, flight dimensions), unfolded section along the walking line and a labelled detail of the first steps.
- **Setting-out table**: tread depth on the walking line, width at the well, outer width and cumulative setting-out distances for every riser.
- **Built-in glossary**: every term on the drawings is explained, so new draftsmen get up to speed quickly.
- **Centimetres everywhere**: lengths, thicknesses and levels all use the same unit.

## 💻 Technical Stack

| Category | Technologies |
| :------- | :----------- |
| Frontend | ![React](https://shieldcn.dev/badge/React-19-61DAFB.svg?logo=react) ![Tailwind CSS](https://shieldcn.dev/badge/Tailwind%20CSS-4-06B6D4.svg?logo=tailwindcss) |
| Language | ![TypeScript](https://shieldcn.dev/badge/TypeScript-7-3178C6.svg?logo=typescript) |
| Tooling | ![Vite](https://shieldcn.dev/badge/Vite-8-646CFF.svg?logo=vite) ![pnpm](https://shieldcn.dev/badge/pnpm-package%20manager-F69220.svg?logo=pnpm) |

## 📦 Installation & Getting Started

1. **Open the project folder**
   ```bash
   cd escalier
   ```
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Start the development server**
   ```bash
   pnpm dev
   ```
4. **Check the calculation engine**
   ```bash
   pnpm check
   ```
5. **Type-check and build**
   ```bash
   pnpm lint
   pnpm build
   ```

## 📂 Project Structure

```
src/
├── stair.ts              # Pure calculation engine: geometry, herse, levels, checks
├── App.tsx               # Page layout and default values
└── components/
    ├── Saisie/           # Input fields laid over the plan and section sketches
    ├── Plan.tsx          # Annotated plan view
    ├── Herse.tsx         # Herse construction for each half of the turn
    ├── Coupe.tsx         # Unfolded section along the walking line
    ├── Detail.tsx        # Labelled detail of the first steps
    ├── Results.tsx       # Key figures, checks and setting-out table
    └── Glossary.tsx      # Glossary of stair terms
stair.check.ts            # Self-check of the engine (node stair.check.ts)
```

---

Made with ❤️ by [Matthieu Lechat](https://github.com/matthieulechat)

## 📝 License

No license has been chosen for this project yet.
