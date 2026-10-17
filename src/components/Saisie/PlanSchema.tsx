import Field from './Field.tsx'
import type { NumKey, SaisieProps } from './types.ts'

interface Spot {
  k: NumKey
  label: string
  x: number // coordonnées du schéma (viewBox 400 × 300)
  y: number
  dim: [number, number, number, number] // ligne de cote x1 y1 x2 y2
}

// Schéma de principe (pas à l'échelle) : tourne à gauche, inversé si « tourne à droite ».
const PlanSchema = ({ value, onChange }: SaisieProps) => {
  const { type, jourArrondi: round, sens } = value
  const flip = type !== 'droit' && sens === 'droite'

  let outer = ''
  let inner = ''
  let foulee = ''
  let spots: Spot[] = []
  let cx = 200 // centre horizontal du dessin de l'escalier
  if (type === 'droit') {
    outer = 'M50,120 L350,120 M50,200 L350,200'
    inner = 'M50,120 L50,200 M350,120 L350,200'
    foulee = 'M50,160 L350,160'
    spots = [
      { k: 'volee1', label: 'Longueur (foulée)', x: 200, y: 95, dim: [50, 108, 350, 108] },
      { k: 'largeur', label: 'Emmarchement', x: 0, y: 160, dim: [38, 120, 38, 200] },
    ]
  } else if (type === 'quart') {
    outer = 'M40,260 L340,260 L340,30'
    inner = round ? 'M40,200 L240,200 A40,40 0 0 0 280,160 L280,30' : 'M40,200 L280,200 L280,30'
    foulee = round ? 'M40,230 L240,230 A70,70 0 0 0 310,160 L310,35' : 'M40,230 L310,230 L310,35'
    cx = 190
    spots = [
      { k: 'volee1', label: 'Volée départ (→ mur du fond)', x: 190, y: 283, dim: [40, 270, 340, 270] },
      { k: 'volee2', label: 'Volée arrivée (→ mur du fond)', x: 385, y: 145, dim: [352, 30, 352, 260] },
      { k: 'largeur', label: 'Emmarchement', x: 0, y: 230, dim: [30, 200, 30, 260] },
      ...(round ? [{ k: 'jour' as const, label: 'Rayon du jour', x: 225, y: 140, dim: [240, 160, 268, 172] as Spot['dim'] }] : []),
    ]
  } else {
    outer = 'M40,260 L370,260 L370,40 L40,40'
    inner = round ? 'M40,190 L270,190 A40,40 0 0 0 270,110 L40,110' : 'M40,190 L270,190 L270,110 L40,110'
    foulee = round ? 'M40,225 L270,225 A75,75 0 0 0 270,75 L45,75' : 'M40,225 L305,225 L305,75 L45,75'
    cx = 205
    spots = [
      { k: 'volee1', label: 'Volée départ (1re marche → mur du fond)', x: 205, y: 283, dim: [40, 270, 370, 270] },
      { k: 'volee2', label: 'Volée arrivée (palier → mur du fond)', x: 205, y: 17, dim: [40, 30, 370, 30] },
      { k: 'jour', label: 'Largeur du jour', x: 200, y: 150, dim: [262, 110, 262, 190] },
      { k: 'largeur', label: 'Emmarchement', x: 0, y: 225, dim: [30, 190, 30, 260] },
    ]
  }
  const fy = (y: number) => (flip ? 300 - y : y)

  return (
    <div>
      <div className="relative aspect-[480/300] w-full">
        <svg viewBox="-40 0 480 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g transform={flip ? 'translate(0 300) scale(1 -1)' : undefined}>
            <path d={outer} fill="none" stroke="#0f172a" strokeWidth={3} />
            <path d={inner} fill="none" stroke="#0f172a" strokeWidth={3} />
            <path d={foulee} fill="none" stroke="#dc2626" strokeWidth={1.2} strokeDasharray="6 4" markerEnd="url(#arrow)" />
            {spots.map((s) => (
              <line key={s.k} x1={s.dim[0]} y1={s.dim[1]} x2={s.dim[2]} y2={s.dim[3]} stroke="#7c3aed" strokeWidth={1} markerStart="url(#tick)" markerEnd="url(#tick)" />
            ))}
          </g>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={12} markerHeight={12} markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="#dc2626" />
            </marker>
            <marker id="tick" viewBox="-5 -5 10 10" markerWidth={8} markerHeight={8} orient="auto">
              <line x1={-3} y1={3} x2={3} y2={-3} stroke="#7c3aed" strokeWidth={1.5} />
            </marker>
          </defs>
        </svg>
        {spots.map((s) => (
          <Field key={s.k} k={s.k} label={s.label} x={((s.x + 40) / 480) * 100} y={(fy(s.y) / 300) * 100} value={value} onChange={onChange} />
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] text-red-600" style={{ transform: `translateX(${((cx + 40) / 480 - 0.5) * 100}%)` }}>Pointillé rouge : ligne de foulée, la flèche indique le sens de montée</p>
    </div>
  )
}

export default PlanSchema
