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
