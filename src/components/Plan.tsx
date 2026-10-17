import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadDxf } from '../dxf.ts'
import { CollapsibleCard } from './Section.tsx'
import { CUT, cutLines, type Pt, type StairResult } from '../stair.ts'
import { Dim, Labels } from './Annot.tsx'
import { boxOf, fmt, viewBox, type Label } from './svg.ts'

// Aperçu en plan : contremarches brutes en trait plein, finies en pointillé.
const Plan = ({ r }: { r: StairResult }) => {
  const flip = r.input.sens === 'gauche' ? -1 : 1
  const map = (p: Pt): Pt => ({ x: p.x, y: flip * p.y })
  const path = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${map(p).x},${map(p).y}`).join(' ')

  const box = boxOf([...r.outerLine, ...r.innerLine, ...r.risers.map((x) => x.outer)].map(map))
  const fs = Math.max(box.maxX - box.minX, box.maxY - box.minY) / 40
  const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

  const { risers, n } = r
  const o = r.outerLine
  const end = r.fouleeLine[r.fouleeLine.length - 1]
  const bal = risers.findIndex((x) => x.balanced)
  const r2 = risers[Math.min(2, n - 1)]
  const cIdx = Math.min(bal + 2, n - 2)
  const turnMid = r.innerLine[Math.floor(r.innerLine.length / 2)]
  const dash = `${fs / 2} ${fs / 3}`
  const lerp = (a: Pt, b: Pt, k: number): Pt => map({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })
  // Débord au-delà des cotes (décalées de 2 à 2,5 fs), sous la marge du viewBox (5 fs).
  const cuts = cutLines(r, CUT).map((c) => {
    const ext = fs * 3.5
    const pt = (t: number, k = 0): Pt => map({ x: c.a.x + c.n.x * k + c.d.x * t, y: c.a.y + c.n.y * k + c.d.y * t })
    const [t0, t1] = [-ext, c.len + ext]
    return { name: c.name, p: pt(t0), q: pt(t1), pa: pt(t0, fs * 1.5), qa: pt(t1, fs * 1.5), pl: pt(t0, fs * 2.3), ql: pt(t1, fs * 2.3) }
  })
  const labels: Label[] = [
    { at: map(risers[0].foulee), text: 'Départ (1re contremarche)' },
    { at: map(end), text: `Arrivée (${n}e CM = nez de palier)` },
    { at: lerp(risers[0].foulee, risers[1].foulee, 0.5), text: `Ligne de foulée (à ${fmt(r.f)} du jour)`, color: '#dc2626', side: 'left' },
    { at: map(mid(r.outerLine[0], r.outerLine[1])), text: 'Mur / limon extérieur' },
    // Cibles près du mur extérieur : lignes de rappel courtes, hors de la zone des cotes.
    { at: lerp(risers[1].brutInner, risers[1].brutOuter, 0.85), text: 'Contremarche brute (trait plein)', side: 'left' },
    { at: lerp(risers[1].inner, risers[1].outer, 0.95), text: 'Contremarche finie (pointillé)', side: 'left' },
  ]
  if (r.theta > 0) {
    labels.push({ at: map(turnMid), text: 'Jour (limon intérieur / collet)' })
    if (r.separation) labels.push({ at: map(r.separation[1]), text: 'Ligne de séparation', color: '#a855f7' })
    if (bal > 0) {
      labels.push({ at: map(mid(risers[bal].foulee, risers[bal + 1].foulee)), text: 'Marche balancée (bleu)', color: '#0284c7' })
      labels.push({ at: map(mid(risers[cIdx].inner, risers[cIdx + 1].inner)), text: 'Collet (giron au jour)', color: '#0284c7' })
    }
  }

  return (
    <CollapsibleCard
      defaultOpen
      title="Plan"
      action={
        <Button variant="outline" size="sm" onClick={() => downloadDxf(r)} title="Tracés seuls, dans les 4 orientations. Ouvrir dans AutoCAD puis Enregistrer sous DWG.">
          <DownloadIcon aria-hidden="true" />
          Export DXF
        </Button>
      }
      legend={
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>━ brut (béton)</span>
          <span>┄ fini (après finition de {fmt(r.input.finContremarche)} cm en contremarche)</span>
          <span className="text-sky-700">bleu : marches balancées</span>
          <span className="text-red-600">rouge : ligne de foulée</span>
          <span className="text-emerald-600">vert : lignes de coupe à {CUT} cm du mur</span>
          <span>Cotes en cm.</span>
        </p>
      }
    >
      <svg viewBox={viewBox(box, fs, 18)} className="h-auto w-full" role="img" aria-label="Vue en plan annotée de l'escalier">
        <path d={path(r.outerLine)} fill="none" stroke="#0f172a" strokeWidth={fs / 4} />
        <path d={path(r.innerLine)} fill="none" stroke="#0f172a" strokeWidth={fs / 4} />
        {risers.map((x) => {
          const color = x.balanced ? '#0284c7' : '#334155'
          return (
            <g key={x.j}>
              <path d={path([x.inner, x.outer])} stroke={color} strokeWidth={fs / 12} strokeDasharray={dash} />
              <path d={path([x.brutInner, x.brutOuter])} stroke={color} strokeWidth={fs / 7} />
            </g>
          )
        })}
        {r.separation && <path d={path(r.separation)} stroke="#a855f7" strokeWidth={fs / 10} strokeDasharray={`${fs} ${fs / 3} ${fs / 6} ${fs / 3}`} />}
        <defs>
          <marker id="plan-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={fs * 1.2} markerHeight={fs * 1.2} markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#dc2626" />
          </marker>
        </defs>
        <defs>
          <marker id="plan-cut-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={fs} markerHeight={fs} markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#059669" />
          </marker>
        </defs>
        {cuts.map((c) => (
          <g key={c.name} stroke="#059669" fill="#059669">
            <line x1={c.p.x} y1={c.p.y} x2={c.q.x} y2={c.q.y} strokeWidth={fs / 10} strokeDasharray={`${fs * 1.5} ${fs / 3} ${fs / 6} ${fs / 3}`} />
            <line x1={c.p.x} y1={c.p.y} x2={c.pa.x} y2={c.pa.y} strokeWidth={fs / 6} markerEnd="url(#plan-cut-arrow)" />
            <line x1={c.q.x} y1={c.q.y} x2={c.qa.x} y2={c.qa.y} strokeWidth={fs / 6} markerEnd="url(#plan-cut-arrow)" />
            {[c.pl, c.ql].map((l, k) => (
              <text key={k} x={l.x} y={l.y} stroke="none" fontSize={fs} fontWeight={700} textAnchor="middle" dominantBaseline="middle">
                {c.name}
              </text>
            ))}
          </g>
        ))}
        <path d={path(r.fouleeLine)} fill="none" stroke="#dc2626" strokeWidth={fs / 10} strokeDasharray={`${fs} ${fs / 2}`} markerEnd="url(#plan-arrow)" />
        {risers.slice(0, -1).map((x, i) => {
          const p = mid(map(x.foulee), map(risers[i + 1].foulee))
          return (
            <text key={x.j} x={p.x} y={p.y} dy={-fs / 3} fontSize={fs * 0.8} textAnchor="middle" fill="#0f172a">
              {i + 1}
            </text>
          )
        })}

        <Dim a={map(risers[0].inner)} b={map(risers[0].outer)} text={`Emmarchement ${fmt(r.input.largeur)}`} fs={fs} offset={-fs * 2 * flip} />
        <Dim a={map(o[0])} b={map(o[1])} text={`${r.theta > 0 ? 'Volée départ' : 'Longueur'} ${fmt(r.input.volee1)}`} fs={fs} offset={-flip * fs * 2.5} />
        {r.theta > 0 && <Dim a={map(o[o.length - 1])} b={map(o[o.length - 2])} text={`Volée arrivée ${fmt(r.input.volee2)}`} fs={fs} offset={flip * fs * 2.5} />}
        <Dim a={map(risers[1].foulee)} b={map(r2.foulee)} text={`g ${fmt(r.g)}`} fs={fs} offset={fs * 1.2} />
        <Labels items={labels} box={box} fs={fs} gapX={5} />
      </svg>
    </CollapsibleCard>
  )
}

export default Plan
