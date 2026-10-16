import type { StairResult } from '../stair.ts'
import { Dim, Labels } from './Annot.tsx'
import { boxOf, fmt, lvl, viewBox, type Label } from './svg.ts'

// Coupe développée sur la ligne de foulée : profil fini, profil brut et béton (paillasse + dalle haute).
const Coupe = ({ r }: { r: StairResult }) => {
  const { n, h, g, input } = r
  const { finSolBas: eBas, finSolHaut: eHaut, finMarche: eM, finContremarche: eCm, paillasse, dalleHaut } = input
  const H = n * h
  const sLast = (n - 1) * g
  const zBrutTop = H - eHaut

  // Sous-face de paillasse : parallèle aux angles rentrants courants, décalée de l'épaisseur perpendiculaire.
  const slope = h / g
  const off = paillasse * Math.hypot(1, slope)
  const under = (x: number) => h - eM + slope * (x - g - eCm) - off
  const xAt = (z: number) => (z + off - h + eM) / slope + g + eCm
  const xBot = xAt(-eBas)
  const xTop = xAt(zBrutTop - dalleHaut)
  const xStart = Math.min(-60, xBot - 20)
  const xEnd = Math.max(sLast + eCm + 80, xTop + 40)

  const fini: [number, number][] = [[xStart, 0]]
  for (let i = 0; i < n; i++) fini.push([i * g, i * h], [i * g, (i + 1) * h])
  fini.push([xEnd, H])

  const brut: [number, number][] = [[xStart, -eBas]]
  let z = -eBas
  for (let i = 1; i <= n; i++) {
    const x = (i - 1) * g + eCm
    const zNext = i === n ? zBrutTop : i * h - eM
    brut.push([x, z], [x, zNext])
    z = zNext
  }
  brut.push([xEnd, zBrutTop])

  const beton: [number, number][] = [
    ...brut.slice(1),
    [xEnd, zBrutTop - dalleHaut],
    [xTop, zBrutTop - dalleHaut],
    [xBot, under(xBot)],
  ]

  const toPath = (pts: [number, number][], close = false) =>
    pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${-y}`).join(' ') + (close ? ' Z' : '')
  const P = (x: number, zz: number) => ({ x, y: -zz })

  const box = boxOf([...beton, ...fini, [xStart, -eBas]].map(([x, zz]) => P(x, zz)))
  const fs = (box.maxX - box.minX) / 45
  const k = Math.max(2, Math.floor(n / 2))
  const xMid = (xBot + xTop) / 2
  const labels: Label[] = [
    { at: P(xStart + 10, 0), text: `NF départ ${lvl(input.nfBas)}`, color: '#0f172a' },
    { at: P(xStart + 25, -eBas), text: `NB départ ${lvl(r.nbBas)}`, color: '#ea580c' },
    { at: P(xEnd - 10, H), text: `NF arrivée ${lvl(input.nfHaut)}`, color: '#0f172a' },
    { at: P(xEnd - 15, zBrutTop), text: `NB arrivée ${lvl(r.nbHaut)}`, color: '#ea580c' },
    { at: P(xEnd - 30, zBrutTop - dalleHaut / 2), text: `Dalle palier ${fmt(dalleHaut)}`, color: '#475569' },
    { at: P(xMid, under(xMid) + paillasse / 2), text: `Paillasse ${fmt(paillasse)} (perpendiculaire)`, color: '#475569', side: 'right' },
    { at: P((k + 1) * g + eCm, (k + 1) * h - eM), text: 'Profil brut (béton)', color: '#ea580c', side: 'right' },
    { at: P((k - 2) * g, (k - 1.5) * h), text: 'Profil fini', color: '#0f172a', side: 'left' },
  ]

  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-3">
      <figcaption className="mb-2 text-sm font-semibold">Coupe développée sur la ligne de foulée</figcaption>
      <svg viewBox={viewBox(box, fs, 17)} className="h-auto w-full" role="img" aria-label="Coupe développée annotée de l'escalier">
        <path d={toPath(beton, true)} fill="#e2e8f0" stroke="none" />
        <line x1={xStart} y1={eBas} x2={xEnd} y2={eBas} stroke="#94a3b8" strokeWidth={fs / 10} />
        <path d={toPath(brut)} fill="none" stroke="#ea580c" strokeWidth={fs / 8} />
        <path d={toPath(fini)} fill="none" stroke="#0f172a" strokeWidth={fs / 10} strokeDasharray={`${fs / 2} ${fs / 3}`} />
        <path
          d={toPath([[xBot, under(xBot)], [xTop, zBrutTop - dalleHaut], [xEnd, zBrutTop - dalleHaut]])}
          fill="none"
          stroke="#475569"
          strokeWidth={fs / 8}
        />

        <Dim a={P(xEnd, 0)} b={P(xEnd, H)} text={`Hauteur à monter ${fmt(H)}`} fs={fs} offset={-fs * 2} />
        <Dim a={P(0, 0)} b={P(sLast, 0)} text={`Foulée développée ${fmt(r.lf)} = ${n - 1} × ${fmt(g)}`} fs={fs} offset={-fs * 3.5} />

        <Labels items={labels} box={box} fs={fs} />
      </svg>
      <p className="mt-2 text-xs text-slate-600">Orange : brut (béton) · pointillé : fini · cotes et niveaux en cm.</p>
    </figure>
  )
}

export default Coupe
