import type { StairResult } from '../stair.ts'
import { Dim, Labels } from './Annot.tsx'
import { boxOf, fmt, lvl, viewBox, type Label } from './svg.ts'

// Zoom sur le départ : explique finitions, niveaux fini/brut et 1re contremarche brute.
const Detail = ({ r }: { r: StairResult }) => {
  const { h, g, input } = r
  const { finSolBas: eBas, finMarche: eM, finContremarche: eCm, paillasse } = input
  const steps = 3
  const xs = (i: number) => (i - 1) * g // face finie de la contremarche i
  const P = (x: number, z: number) => ({ x, y: -z })
  const rect = (x1: number, z1: number, x2: number, z2: number, fill: string) => (
    <rect x={Math.min(x1, x2)} y={-Math.max(z1, z2)} width={Math.abs(x2 - x1)} height={Math.abs(z2 - z1)} fill={fill} />
  )

  const alpha = Math.atan(h / g)
  const corner = { x: xs(2) + eCm, z: h - eM } // angle rentrant brut
  const underPt = { x: corner.x + paillasse * Math.sin(alpha), z: corner.z - paillasse * Math.cos(alpha) }
  const slope = h / g
  const under = (x: number) => underPt.z + slope * (x - underPt.x)
  const xLeft = -45
  const xRight = xs(steps + 1) + 10
  const zLow = -eBas - 25
  const xGround = Math.max(xLeft, underPt.x + (-eBas - underPt.z) / slope)

  const brut: string[] = [`M${xLeft},${eBas}`]
  let z = -eBas
  for (let i = 1; i <= steps; i++) {
    const x = xs(i) + eCm
    brut.push(`L${x},${-z}`, `L${x},${-(i * h - eM)}`)
    z = i * h - eM
  }
  brut.push(`L${xRight},${-z}`)
  const fini: string[] = [`M${xLeft},0`]
  for (let i = 1; i <= steps; i++) fini.push(`L${xs(i)},${-(i - 1) * h}`, `L${xs(i)},${-i * h}`)
  fini.push(`L${xRight},${-steps * h}`)

  const box = boxOf([P(xLeft, zLow), P(xRight, steps * h + 10)])
  const fs = (xRight - xLeft) / 30
  const labels: Label[] = [
    { at: P(xs(2), 2 * h), text: 'Nez de marche', side: 'left' },
    { at: P((xs(2) + xs(3)) / 2, 2 * h - eM / 2), text: `Finition marche ${fmt(eM)}`, color: '#b45309', side: 'right' },
    { at: P(xs(2) + eCm / 2, 1.5 * h), text: `Finition contremarche ${fmt(eCm)}`, color: '#b45309', side: 'left' },
    { at: P(xLeft + 12, -eBas / 2), text: `Finition sol ${fmt(eBas)}`, color: '#b45309', side: 'left' },
    { at: P(xLeft + 4, 0), text: `NF ${lvl(input.nfBas)} (niveau fini)`, color: '#0f172a', side: 'left' },
    { at: P(xLeft + 20, -eBas), text: `NB ${lvl(r.nbBas)} (niveau brut)`, color: '#ea580c', side: 'left' },
    { at: P(xs(3) + eCm, 2.5 * h - eM), text: 'Contremarche brute', color: '#ea580c', side: 'right' },
    { at: P(xs(1) + g / 2, h - eM - 5), text: 'Béton brut', color: '#475569', side: 'right' },
  ]
  const FIN = '#fcd34d'

  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-3">
      <figcaption className="mb-2 text-sm font-semibold">Détail au départ — vocabulaire</figcaption>
      <svg viewBox={viewBox(box, fs, 13)} className="h-auto w-full" role="img" aria-label="Détail annoté des premières marches">
        <path
          d={`${brut.join(' ')} L${xRight},${-under(xRight)} L${xGround},${eBas} Z`}
          fill="#e2e8f0"
        />
        {rect(xLeft, -eBas, xs(1), 0, FIN)}
        {Array.from({ length: steps }, (_, k) => {
          const i = k + 1
          return (
            <g key={i}>
              {rect(xs(i), i * h - eM, Math.min(xs(i + 1) + eCm, xRight), i * h, FIN)}
              {rect(xs(i), i === 1 ? 0 : (i - 1) * h, xs(i) + eCm, i * h - eM, FIN)}
            </g>
          )
        })}
        <rect x={xLeft} y={eBas} width={xRight - xLeft} height={25} fill="#cbd5e1" />
        <path d={brut.join(' ')} fill="none" stroke="#ea580c" strokeWidth={fs / 8} />
        <path d={fini.join(' ')} fill="none" stroke="#0f172a" strokeWidth={fs / 12} strokeDasharray={`${fs / 3} ${fs / 4}`} />
        <path d={`M${underPt.x - 40},${-under(underPt.x - 40)} L${xRight},${-under(xRight)}`} stroke="#475569" strokeWidth={fs / 10} />

        <Dim a={P(xs(2), 2 * h)} b={P(xs(3), 2 * h)} text={`Giron g ${fmt(g)}`} fs={fs} offset={fs * 1.3} />
        <Dim a={P(xs(3), 2 * h)} b={P(xs(3), 3 * h)} text={`h ${fmt(h)}`} fs={fs} offset={fs * 1.3} />
        <Dim a={P(xs(1) + eCm, -eBas)} b={P(xs(1) + eCm, h - eM)} text={`1re CM brute ${fmt(h - eM + eBas)}`} fs={fs} offset={fs * 1.2} />
        <Dim a={P(corner.x, corner.z)} b={P(underPt.x, underPt.z)} text={`Paillasse ${fmt(paillasse)}`} fs={fs} offset={0} color="#475569" />

        <Labels items={labels} box={box} fs={fs} />
      </svg>
      <p className="mt-2 text-xs text-slate-600">Jaune : finitions · gris : béton brut · cotes et niveaux en cm.</p>
    </figure>
  )
}

export default Detail
