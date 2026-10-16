import type { Pt } from '../stair.ts'
import type { Box, Label } from './svg.ts'

const INK = '#7c3aed'

// Étiquette reliée à un point du dessin par une ligne de rappel.
export const Callout = ({ at, to, text, fs, color = INK }: { at: Pt; to: Pt; text: string; fs: number; color?: string }) => (
  <g>
    <line x1={at.x} y1={at.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={fs / 14} />
    <circle cx={at.x} cy={at.y} r={fs / 6} fill={color} />
    <text
      x={to.x}
      y={to.y}
      fontSize={fs * 0.8}
      fill={color}
      textAnchor={to.x >= at.x ? 'start' : 'end'}
      dominantBaseline="middle"
      dx={to.x >= at.x ? fs / 4 : -fs / 4}
      paintOrder="stroke"
      stroke="#fff"
      strokeWidth={fs / 5}
    >
      {text}
    </text>
  </g>
)

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
        stroke="#fff"
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

// Range les étiquettes dans les marges gauche/droite du dessin, empilées sans chevauchement.
export const Labels = ({ items, box, fs, gapX = 2 }: { items: Label[]; box: Box; fs: number; gapX?: number }) => {
  const cx = (box.minX + box.maxX) / 2
  const gap = fs * 1.3
  const placed = (['left', 'right'] as const).flatMap((side) => {
    const list = items.filter((l) => (l.side ?? (l.at.x < cx ? 'left' : 'right')) === side).sort((a, b) => a.at.y - b.at.y)
    let y = -Infinity
    return list.map((l) => {
      y = Math.max(l.at.y, y + gap)
      return { ...l, to: { x: side === 'left' ? box.minX - fs * gapX : box.maxX + fs * gapX, y } }
    })
  })
  return (
    <>
      {placed.map((l) => (
        <Callout key={l.text} at={l.at} to={l.to} text={l.text} fs={fs} color={l.color} />
      ))}
    </>
  )
}
