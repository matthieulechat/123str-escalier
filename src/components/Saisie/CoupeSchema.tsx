import Field from './Field.tsx'
import type { NumKey, SaisieProps } from './types.ts'

// Schéma de principe en coupe (viewBox 480 × 260, colonne de champs à droite) : niveaux, finitions et béton.
const STEPS = 4
const X0 = 100
const Y0 = 200
const G = 40
const H = 30
const YTOP = Y0 - STEPS * H
const FIN = '#fcd34d'

const SPOTS: { k: NumKey; label: string; x: number; y: number; to: [number, number] }[] = [
  { k: 'nfBas', label: 'NF départ', x: 45, y: 165, to: [60, Y0] },
  { k: 'finSolBas', label: 'Finition sol départ', x: 45, y: 238, to: [60, Y0 + 4] },
  { k: 'nfHaut', label: 'NF arrivée', x: 440, y: 40, to: [380, YTOP] },
  { k: 'finSolHaut', label: 'Finition palier', x: 440, y: 95, to: [370, YTOP + 4] },
  { k: 'dalleHaut', label: 'Dalle palier', x: 440, y: 150, to: [360, YTOP + 26] },
  { k: 'finMarche', label: 'Finition marche', x: 150, y: 60, to: [X0 + 2.5 * G, Y0 - 2 * H + 4] },
  { k: 'finContremarche', label: 'Finition contremarche', x: 75, y: 112, to: [X0 + G + 3, Y0 - 1.5 * H] },
  { k: 'paillasse', label: 'Paillasse', x: 260, y: 215, to: [220, 159] },
]

const CoupeSchema = ({ value, onChange }: SaisieProps) => {
  let fini = `M10,${Y0} L${X0},${Y0}`
  let brut = `M10,${Y0 + 8} L${X0 + 4},${Y0 + 8}`
  const fins: string[] = []
  for (let i = 0; i < STEPS; i++) {
    const x = X0 + i * G
    const z = Y0 - (i + 1) * H
    fini += ` L${x},${z} L${x + G},${z}`
    brut += ` L${x + 4},${z + 6} L${x + G + 4},${z + 6}`
    fins.push(`M${x},${z} L${x + G + 4},${z} L${x + G + 4},${z + 6} L${x + 4},${z + 6} L${x + 4},${z + H} L${x},${z + H} Z`)
  }
  fini += ` L390,${YTOP}`
  brut += ` L390,${YTOP + 8}`

  return (
    <div className="relative aspect-[480/260] w-full">
      <svg viewBox="0 0 480 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={`${brut} L390,${YTOP + 34} L${X0 + 4 + STEPS * G + 30},${YTOP + 34} L${X0 + 40},${Y0 + 8} Z`} fill="#e2e8f0" />
        <rect x={10} y={Y0} width={X0 - 10} height={8} fill={FIN} />
        <rect x={X0 + STEPS * G} y={YTOP} width={390 - X0 - STEPS * G} height={8} fill={FIN} />
        {fins.map((d) => (
          <path key={d} d={d} fill={FIN} />
        ))}
        <rect x={10} y={Y0 + 8} width={X0 + 30} height={30} fill="#cbd5e1" />
        <line x1={X0 + 40} y1={Y0 + 8} x2={X0 + 34 + STEPS * G} y2={YTOP + 34} stroke="#475569" strokeWidth={1.5} />
        <path d={brut} fill="none" stroke="#ea580c" strokeWidth={2} />
        <path d={fini} fill="none" stroke="#0f172a" strokeWidth={1.2} strokeDasharray="4 3" />
        {SPOTS.map((s) => (
          <line key={s.k} x1={s.x} y1={s.y} x2={s.to[0]} y2={s.to[1]} stroke="#7c3aed" strokeWidth={0.8} />
        ))}
        {SPOTS.map((s) => (
          <circle key={s.k} cx={s.to[0]} cy={s.to[1]} r={2.5} fill="#7c3aed" />
        ))}
        <text x={390} y={255} fontSize={10} textAnchor="end" fill="#475569">
          pointillé : fini · orange : brut · jaune : finitions
        </text>
      </svg>
      {SPOTS.map((s) => (
        <Field key={s.k} k={s.k} label={s.label} x={(s.x / 480) * 100} y={(s.y / 260) * 100} step={0.5} value={value} onChange={onChange} />
      ))}
    </div>
  )
}

export default CoupeSchema
