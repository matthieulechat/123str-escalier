// Utilitaires partagés par les schémas SVG (hors composants, pour le Fast Refresh).
import type { Pt } from '../stair.ts'

export interface Label {
  at: Pt
  text: string
  color?: string
  side?: 'left' | 'right'
}

export interface Box {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

// viewBox englobant le dessin + les marges d'étiquettes.
export const viewBox = (box: Box, fs: number, margin = 15) =>
  `${box.minX - fs * margin} ${box.minY - fs * 5} ${box.maxX - box.minX + 2 * fs * margin} ${box.maxY - box.minY + fs * 10}`

export const boxOf = (pts: Pt[]): Box => ({
  minX: Math.min(...pts.map((p) => p.x)),
  maxX: Math.max(...pts.map((p) => p.x)),
  minY: Math.min(...pts.map((p) => p.y)),
  maxY: Math.max(...pts.map((p) => p.y)),
})

export const fmt = (v: number) => v.toFixed(1).replace('.', ',')
export const lvl = (v: number) => (v >= 0 ? '+' : '') + fmt(v)

// Rotation de `deg` degrés sens trigo à l'œil (repère écran, Y vers le bas) autour de `c` : orientation choisie en configuration.
export const rotate = (p: Pt, deg: number, c: Pt = { x: 0, y: 0 }): Pt => {
  const [cos, sin] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]
  const [x, y] = [p.x - c.x, p.y - c.y]
  return { x: c.x + x * cos + y * sin, y: c.y - x * sin + y * cos }
}

// Le segment [a, b] coupe-t-il le rectangle [x0, x1] × [y0, y1] ? (découpage de Liang-Barsky)
export const hitsBox = (a: Pt, b: Pt, x0: number, x1: number, y0: number, y1: number): boolean => {
  const [dx, dy] = [b.x - a.x, b.y - a.y]
  let [t0, t1] = [0, 1]
  for (const [p, q] of [[-dx, a.x - x0], [dx, x1 - a.x], [-dy, a.y - y0], [dy, y1 - a.y]]) {
    if (p === 0) {
      if (q < 0) return false
    } else if (p < 0) t0 = Math.max(t0, q / p)
    else t1 = Math.min(t1, q / p)
    if (t0 > t1) return false
  }
  return true
}

// Segments occupés par une cote <Dim> (ligne décalée de `offset`, bande de son texte, lignes d'attache), comme obstacles des étiquettes.
export const dimSegs = (a: Pt, b: Pt, offset: number, fs: number): [Pt, Pt][] => {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const [nx, ny] = [-(b.y - a.y) / len, (b.x - a.x) / len]
  const at = (p: Pt, o: number): Pt => ({ x: p.x + nx * o, y: p.y + ny * o })
  const band = [offset - fs / 2, offset, offset + fs / 2].map((o): [Pt, Pt] => [at(a, o), at(b, o)])
  return [...band, [a, at(a, offset)], [b, at(b, offset)]] // + lignes d'attache
}

// Sur les schémas : sans décimale inutile (200,0 → 200, 17,5 reste 17,5).
export const num = (v: number) => fmt(v).replace(/,0$/, '')
export const numLvl = (v: number) => (v >= 0 ? '+' : '') + num(v)
