import type { Pt } from '../stair.ts'
import { hitsBox, type Box, type Label } from './svg.ts'

const INK = '#7c3aed'

// Cartes d'annotation, même rendu que les champs de saisie (Field : bg-blue-50, ring-blue-200, text-blue-800).
const CARD = { fill: '#eff6ff', stroke: '#bfdbfe', text: '#1e40af' }

interface Card {
  x0: number
  x1: number
  y0: number
  y1: number
}

// Taille estimée d'une carte (pas de mesure du texte en SVG avant rendu).
const cardSize = (text: string, fs: number) => ({ w: text.length * fs * 0.8 * 0.55 + fs, h: fs * 1.5 })

// Étiquette en carte reliée à un point du dessin par une ligne de rappel (jusqu'au bord le plus proche de la carte).
// Texte toujours bleu ; la couleur propre de l'étiquette reste sur la ligne de rappel et le point.
const Callout = ({ at, card, text, fs, color }: { at: Pt; card: Card; text: string; fs: number; color?: string }) => {
  const to = { x: Math.min(Math.max(at.x, card.x0), card.x1), y: Math.min(Math.max(at.y, card.y0), card.y1) }
  const ink = color ?? CARD.text
  return (
    <g>
      <line x1={at.x} y1={at.y} x2={to.x} y2={to.y} stroke={ink} strokeWidth={fs / 14} />
      <circle cx={at.x} cy={at.y} r={fs / 6} fill={ink} />
      <rect x={card.x0} y={card.y0} width={card.x1 - card.x0} height={card.y1 - card.y0} rx={fs / 4} fill={CARD.fill} stroke={CARD.stroke} strokeWidth={fs / 14} />
      <text x={(card.x0 + card.x1) / 2} y={(card.y0 + card.y1) / 2} fontSize={fs * 0.8} fill={CARD.text} textAnchor="middle" dominantBaseline="middle">
        {text}
      </text>
    </g>
  )
}

// Cote entre deux points, décalée perpendiculairement de `offset`.
export const Dim = ({ a, b, text, fs, offset = 0, color = INK }: { a: Pt; b: Pt; text: string; fs: number; offset?: number; color?: string }) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const nx = (-(b.y - a.y) / len) * offset
  const ny = ((b.x - a.x) / len) * offset
  const p = { x: a.x + nx, y: a.y + ny }
  const q = { x: b.x + nx, y: b.y + ny }
  const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
  const upright = angle > 90 || angle < -90 ? angle + 180 : angle
  const tick = fs / 3
  const tx = ((b.x - a.x) / len) * tick
  const ty = ((b.y - a.y) / len) * tick
  const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
  return (
    <g stroke={color} strokeWidth={fs / 14}>
      {offset !== 0 && <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} strokeDasharray={`${fs / 6} ${fs / 6}`} />}
      {offset !== 0 && <line x1={b.x} y1={b.y} x2={q.x} y2={q.y} strokeDasharray={`${fs / 6} ${fs / 6}`} />}
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
      <line x1={p.x - ty - tx} y1={p.y + tx - ty} x2={p.x + ty + tx} y2={p.y - tx + ty} />
      <line x1={q.x - ty - tx} y1={q.y + tx - ty} x2={q.x + ty + tx} y2={q.y - tx + ty} />
      <text
        x={mid.x}
        y={mid.y}
        fontSize={fs * 0.75}
        fill={color}
        style={{ stroke: 'var(--card)' }}
        strokeWidth={fs / 5}
        paintOrder="stroke"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${upright} ${mid.x} ${mid.y})`}
      >
        {text}
      </text>
    </g>
  )
}

// Place chaque étiquette au plus près de sa cible, là où sa carte ne recouvre ni le dessin (`obstacles`, segments)
// ni une autre carte, hors du polygone `forbid`, sans sortir de `area`. Sans obstacles fournis, ou faute de place, elle part en marge gauche/droite.
// ponytail: recherche par anneaux (rayon × 12 directions), suffisant pour une dizaine d'étiquettes.
const DIRS = [0, 180, 30, 150, -30, -150, 60, 120, -60, -120, 90, -90].map((d) => (d * Math.PI) / 180)

// Point dans un polygone (règle pair-impair).
const inside = (p: Pt, poly: Pt[]) =>
  poly.reduce((acc, a, i) => {
    const b = poly[(i + 1) % poly.length]
    return (a.y > p.y) !== (b.y > p.y) && p.x < a.x + ((p.y - a.y) * (b.x - a.x)) / (b.y - a.y) ? !acc : acc
  }, false)

export const Labels = ({ items, box, fs, gapX = 2, obstacles, area, forbid }: { items: Label[]; box: Box; fs: number; gapX?: number; obstacles?: [Pt, Pt][]; area?: Box; forbid?: Pt[] }) => {
  const cx = (box.minX + box.maxX) / 2
  const cards: Card[] = []
  const gap = fs * 0.8 // espace mini entre deux cartes
  const free = (c: Card) =>
    (!area || (c.x0 >= area.minX && c.x1 <= area.maxX && c.y0 >= area.minY && c.y1 <= area.maxY)) &&
    (obstacles ?? []).every(([a, b]) => !hitsBox(a, b, c.x0, c.x1, c.y0, c.y1)) &&
    !(forbid && inside({ x: (c.x0 + c.x1) / 2, y: (c.y0 + c.y1) / 2 }, forbid)) && // pas dans l'emprise (jour compris)
    cards.every((o) => c.x1 < o.x0 - gap || c.x0 > o.x1 + gap || c.y1 < o.y0 - gap || c.y0 > o.y1 + gap)
  const near = (l: Label): Card | undefined => {
    const { w, h } = cardSize(l.text, fs)
    for (let r = fs * 1.5; r <= fs * 25; r += fs / 2)
      for (const d of DIRS) {
        // Bord de la carte (et non son centre) à la distance r : la ligne de rappel reste courte.
        const [ux, uy] = [Math.cos(d), -Math.sin(d)]
        const c = { x: l.at.x + ux * (r + w / 2), y: l.at.y + uy * (r + h / 2) }
        const card = { x0: c.x - w / 2, x1: c.x + w / 2, y0: c.y - h / 2, y1: c.y + h / 2 }
        if (free(card)) return card
      }
  }
  // Repli : marges gauche/droite, empilées sans chevauchement (comportement d'origine).
  const ys = { left: -Infinity, right: -Infinity }
  const gutter = (l: Label): Card => {
    const side = l.side ?? (l.at.x < cx ? 'left' : 'right')
    const { w, h } = cardSize(l.text, fs)
    const y = Math.max(l.at.y, ys[side] + h + gap)
    ys[side] = y
    const x0 = side === 'left' ? box.minX - fs * gapX - w : box.maxX + fs * gapX
    return { x0, x1: x0 + w, y0: y - h / 2, y1: y + h / 2 }
  }
  const sorted = [...items].sort((a, b) => a.at.y - b.at.y)
  const placed = sorted.map((l) => {
    const card = (obstacles && near(l)) || gutter(l)
    cards.push(card)
    return { ...l, card }
  })
  return (
    <>
      {placed.map((l) => (
        <Callout key={l.text} at={l.at} card={l.card} text={l.text} fs={fs} color={l.color} />
      ))}
    </>
  )
}
