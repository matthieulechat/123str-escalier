// Export DXF (R12 ASCII) des tracés du plan. Ouvrable dans AutoCAD, puis Enregistrer sous… DWG.
import type { Pt, StairResult } from './stair.ts'

// Calques du gabarit du bureau (noms exacts pour fusionner avec ceux du DWG cible).
const VU = 'ABAK_BC-COFFRAGE-VU'
const FIN = 'ABAK_BC-COFFRAGE-FIN'
const CACHE = 'ABAK_BC-COFFRAGE-CA'
const COTA = 'ABAK_A-COTA'
const NUM = 'ABAK_A-ANNOT'
const BLACK = 7 // blanc/noir AutoCAD

// Le segment [a, b] coupe-t-il le rectangle [x0, x1] × [y0, y1] ? (découpage de Liang-Barsky)
const hitsBox = (a: Pt, b: Pt, x0: number, x1: number, y0: number, y1: number): boolean => {
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

// Une vue tournée de `rotation` degrés (sens trigo) autour du centre de l'escalier, puis décalée de dx en X.
// Les textes restent horizontaux.
const view = (r: StairResult, rotation: number, dx: number): string[] => {
  const [cos, sin] = [Math.cos((rotation * Math.PI) / 180), Math.sin((rotation * Math.PI) / 180)]
  const flip = r.input.sens === 'gauche' ? -1 : 1
  // Repère écran (comme Plan.tsx), puis Y inversé : le SVG a l'axe Y vers le bas, le DXF vers le haut.
  const scr = (p: Pt): Pt => ({ x: p.x, y: flip * p.y })
  const all = [...r.outerLine, ...r.innerLine].map(scr)
  const span = (k: 'x' | 'y') => Math.max(...all.map((p) => p[k])) - Math.min(...all.map((p) => p[k]))
  const mid = (k: 'x' | 'y') => (Math.max(...all.map((p) => p[k])) + Math.min(...all.map((p) => p[k]))) / 2
  const out = (p: Pt): Pt => {
    const [x, y] = [p.x - mid('x'), mid('y') - p.y]
    return { x: x * cos - y * sin + dx, y: x * sin + y * cos }
  }
  const size = Math.max(span('x'), span('y')) / 40 // même échelle de texte qu'à l'écran

  const ents: string[] = []
  const drawn: [Pt, Pt][] = [] // segments tracés (repère DXF), pour que les numéros les évitent
  const color = (c?: number) => (c ? ['62', `${c}`] : [])
  // seg/segs : points déjà dans le repère écran ; line/poly : points du moteur.
  const seg = (layer: string, a: Pt, b: Pt, c?: number) => {
    const [p, q] = [out(a), out(b)]
    drawn.push([p, q])
    ents.push('0', 'LINE', '8', layer, ...color(c), '10', `${p.x}`, '20', `${p.y}`, '30', '0', '11', `${q.x}`, '21', `${q.y}`, '31', '0')
  }
  const segs = (layer: string, pts: Pt[]) => pts.slice(1).forEach((p, i) => seg(layer, pts[i], p))
  const line = (layer: string, a: Pt, b: Pt, c?: number) => seg(layer, scr(a), scr(b), c)
  const poly = (layer: string, pts: Pt[]) => segs(layer, pts.map(scr))

  poly(VU, r.outerLine)
  poly(VU, r.innerLine)
  r.risers.forEach((x, i) => {
    const edge = i === 0 || i === r.risers.length - 1
    line(edge ? VU : FIN, x.brutInner, x.brutOuter, edge ? undefined : BLACK)
    line(CACHE, x.inner, x.outer)
  })

  // Ligne de foulée (calque cotation) : double ligne au départ, flèche ouverte à l'arrivée, croquis du bureau.
  const h = size * 0.8 // hauteur des numéros, sert d'unité aux symboles
  const unit = (p: Pt, q: Pt): Pt => {
    const l = Math.hypot(q.x - p.x, q.y - p.y) || 1
    return { x: (q.x - p.x) / l, y: (q.y - p.y) / l }
  }
  const at = (p: Pt, d: Pt, k: number, n = 0): Pt => ({ x: p.x + d.x * k - d.y * n, y: p.y + d.y * k + d.x * n })
  const f = r.fouleeLine.map(scr)
  const d0 = unit(f[0], f[1])
  const start = at(f[0], d0, -1.1 * h)
  segs(COTA, [start, ...f])
  for (const side of [-0.3 * h, 0.3 * h]) seg(COTA, at(f[0], d0, -1.1 * h, side), at(f[0], d0, 0.45 * h, side))
  const end = f[f.length - 1]
  const d1 = unit(f[f.length - 2], end)
  for (const side of [-0.45 * h, 0.45 * h]) seg(COTA, end, at(end, d1, -1.5 * h, side))

  // Numéros 01, 02… en italique, entre la foulée et le jour : au plus près de la contremarche de départ
  // et de la foulée, sans toucher aucun trait. Boîte du texte mesurée sur le rendu AutoCAD (« 05 » ≈ 1,9 h de large).
  const [hw, hh] = [1.2 * h, 0.7 * h] // demi-largeur / demi-hauteur, marge comprise
  const free = (c: Pt) => drawn.every(([a, b]) => !hitsBox(a, b, c.x - hw, c.x + hw, c.y - hh, c.y + hh))
  r.risers.slice(0, -1).forEach((x, i) => {
    const [p, q, jour] = [scr(x.foulee), scr(r.risers[i + 1].foulee), scr(x.inner)]
    const d = unit(p, q)
    const side = Math.sign(-d.y * (jour.x - p.x) + d.x * (jour.y - p.y)) || 1
    const giron = Math.hypot(q.x - p.x, q.y - p.y)
    const tries: { a: number; s: number }[] = []
    for (let a = 0.3 * h; a < giron; a += 0.2 * h) for (let s = 0.5 * h; s < 6 * h; s += 0.2 * h) tries.push({ a, s })
    tries.sort((u, v) => u.a + u.s - (v.a + v.s))
    const best = tries.map(({ a, s }) => out(at(p, d, a, side * s))).find(free)
    // ponytail: recherche en grille (quelques milliers d'essais par marche), suffisant pour ~20 marches.
    const c = best ?? out(at(p, d, 1.6 * h, side * 1.4 * h))
    ents.push('0', 'TEXT', '8', NUM, '10', `${c.x}`, '20', `${c.y}`, '30', '0', '40', `${h}`, '1', String(i + 1).padStart(2, '0'),
      '51', '15', '72', '1', '73', '2', '11', `${c.x}`, '21', `${c.y}`, '31', '0')
  })

  return ents
}

// Les 4 orientations côte à côte : le dessinateur garde celle qui colle au plan archi.
export const planDxf = (r: StairResult): string => {
  const pts = [...r.outerLine, ...r.innerLine]
  const diag = Math.hypot(
    Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x)),
    Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y)),
  )
  const ents = [0, 90, 180, 270].flatMap((a, i) => view(r, a, i * diag * 1.3))
  return ['0', 'SECTION', '2', 'ENTITIES', ...ents, '0', 'ENDSEC', '0', 'EOF', ''].join('\r\n')
}

export const downloadDxf = (r: StairResult) => {
  const url = URL.createObjectURL(new Blob([planDxf(r)], { type: 'application/dxf' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'escalier-plan.dxf' })
  a.click()
  URL.revokeObjectURL(url)
}
