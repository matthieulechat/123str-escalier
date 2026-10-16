import { CollapsibleCard } from './Section.tsx'
import type { HerseData, StairResult } from '../stair.ts'
import { fmt } from './svg.ts'

const INK = '#7c3aed'

// Construction graphique de la herse (calcul-escaliers.web4me.fr) pour une moitié du tournant.
const Diagram = ({ d }: { d: HerseData }) => {
  const { a, c, points } = d
  const t = (2 * c * c) / (a * a + c * c)
  const D = { x: a * t, y: c * (1 - t) } // sur BC, AD = AB
  const P = (x: number, y: number) => ({ x, y: -y })
  const A = P(0, 0)
  const B = P(0, c)
  const C = P(a, 0)
  const Dp = P(D.x, D.y)
  const fs = Math.max(a, c) / 22
  const pad = fs * 4

  return (
    <figure className="flex-1">
      <figcaption className="text-center text-sm font-semibold">Côté {d.cote}</figcaption>
      <svg viewBox={`${-pad * 1.6} ${-c - pad} ${a + pad * 3} ${c + pad * 2.4}`} className="h-auto w-full" role="img" aria-label={`Herse côté ${d.cote}`}>
        <path d={`M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} Z`} fill="none" stroke="#0f172a" strokeWidth={fs / 8} />
        <path d={`M${B.x},${B.y} A${c},${c} 0 0 1 ${Dp.x},${Dp.y}`} fill="none" stroke={INK} strokeWidth={fs / 12} strokeDasharray={`${fs / 3} ${fs / 4}`} />
        <line x1={A.x} y1={A.y} x2={Dp.x} y2={Dp.y} stroke="#0284c7" strokeWidth={fs / 7} />
        {points.map((p, i) => {
          const k = p.collet / c
          // Près de D les intersections se resserrent : on n'étiquette que celles assez espacées (liste complète sous le schéma).
          const roomy = i === 0 || p.collet - points[i - 1].collet > fs * 1.3
          const nearC = a - p.x < fs * 1.5
          const I = P(D.x * k, D.y * k)
          return (
            <g key={p.j}>
              <line x1={B.x} y1={B.y} x2={p.x} y2={0} stroke="#94a3b8" strokeWidth={fs / 14} />
              <circle cx={p.x} cy={0} r={fs / 5} fill="#dc2626" />
              {!nearC && (
                <text x={p.x} y={fs * 1.2} fontSize={fs * 0.7} textAnchor="middle" fill="#dc2626">
                  {fmt(p.x)}
                </text>
              )}
              <circle cx={I.x} cy={I.y} r={fs / 4} fill="#0284c7" />
              {roomy && p.collet < c - fs && (
                <text x={I.x + fs * 0.5} y={I.y + fs * 0.9} fontSize={fs * 0.7} fill="#0284c7">
                  {fmt(p.collet)}
                </text>
              )}
            </g>
          )
        })}
        {(
          [
            ['A', A, -fs * 0.9, fs * 0.9],
            ['B', B, -fs * 0.9, 0],
            ['C', C, fs * 0.4, -fs * 0.3],
            ['D', Dp, -fs * 0.3, -fs * 0.7],
          ] as const
        ).map(([name, p, dx, dy]) => (
          <text key={name} x={p.x + dx} y={p.y + dy} fontSize={fs} fontWeight={700} fill="#0f172a">
            {name}
          </text>
        ))}
        <text x={-fs * 1.4} y={-c / 2} fontSize={fs * 0.7} fill="#0f172a" textAnchor="middle" transform={`rotate(-90 ${-fs * 1.4} ${-c / 2})`}>
          AB = collet à balancer {fmt(c)}
        </text>
        <text x={a / 2} y={fs * 2.3} fontSize={fs * 0.7} fill="#dc2626" textAnchor="middle">
          AC = foulée à balancer {fmt(a)} (girons reportés en rouge)
        </text>
      </svg>
      <p className="text-xs text-muted-foreground tabular-nums">
        Collets cumulés : {points.map((p) => `CM ${p.j + 1} → ${fmt(p.collet)}`).join(' · ')}
      </p>
    </figure>
  )
}

const Herse = ({ r }: { r: StairResult }) =>
  r.herses.length === 0 ? null : (
    <CollapsibleCard title="Tracé de la herse (balancement)">
      <p className="text-xs text-muted-foreground">
        AB = longueur au jour à balancer, AC = longueur de foulée à balancer avec les girons reportés. D est sur BC avec AD = AB
        (arc violet). Les droites issues de B vers chaque giron coupent AD : la distance depuis A donne le collet cumulé (bleu),
        à reporter sur le jour à partir de la dernière marche non balancée. Valeurs en cm.
      </p>
      <div className="mt-2 flex flex-col gap-4 md:flex-row">
        {r.herses.map((d) => (
          <Diagram key={d.cote} d={d} />
        ))}
      </div>
    </CollapsibleCard>
  )

export default Herse
