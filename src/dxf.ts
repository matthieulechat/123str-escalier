// Export DXF (R12 ASCII) des tracés du plan. Ouvrable dans AutoCAD, puis Enregistrer sous… DWG.
import { cutLines, cutProfile, type Pt, type StairResult } from './stair.ts'

// Calques du gabarit du bureau (noms exacts pour fusionner avec ceux du DWG cible).
const VU = 'ABAK_BC-COFFRAGE-VU'
const FIN = 'ABAK_BC-COFFRAGE-FIN'
const CACHE = 'ABAK_BC-COFFRAGE-CA'
const COTA = 'ABAK_A-COTA'
const NUM = 'ABAK_A-ANNOT'
const COUPE = VU // béton coupé (brut et sous-face des coupes)
const AXE = 'ABAK_A-AXES' // lignes de coupe et traits de fin de coupe
const BLACK = 7 // blanc/noir AutoCAD
// Style des numéros de marches du gabarit (EXEMPLE ESCALIER.dwg) : Tahoma, oblique 20°, hauteur 6 cm.
const NUM_STYLE = 'ABAK_ANNO_RESA'
const NUM_H = 6
// Extrémités des lignes de coupe (même exemple) : triangle plein sur les hachures, lettre Arial gras italique.
const HACH = 'ABAK_A-HACHURES'
const CUT_STYLE = 'ABAK_COUPE'
const CUT_H = 6

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

// Une vue tournée de `rotation` degrés (sens trigo) autour du centre de l'escalier, puis décalée de (dx, dy).
// Les textes restent horizontaux. `brut` : sans la couche de finition (contremarches finies).
const view = (r: StairResult, rotation: number, dx: number, dy = 0, brut = false): string[] => {
  const [cos, sin] = [Math.cos((rotation * Math.PI) / 180), Math.sin((rotation * Math.PI) / 180)]
  const flip = r.input.sens === 'gauche' ? -1 : 1
  // Repère écran (comme Plan.tsx), puis Y inversé : le SVG a l'axe Y vers le bas, le DXF vers le haut.
  const scr = (p: Pt): Pt => ({ x: p.x, y: flip * p.y })
  const all = [...r.outerLine, ...r.innerLine].map(scr)
  const span = (k: 'x' | 'y') => Math.max(...all.map((p) => p[k])) - Math.min(...all.map((p) => p[k]))
  const mid = (k: 'x' | 'y') => (Math.max(...all.map((p) => p[k])) + Math.min(...all.map((p) => p[k]))) / 2
  const out = (p: Pt): Pt => {
    const [x, y] = [p.x - mid('x'), mid('y') - p.y]
    return { x: x * cos - y * sin + dx, y: x * sin + y * cos + dy }
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

  // Limons prolongés jusqu'à la dernière contremarche brute, quand elle dépasse le nez de palier fini : escalier fermé.
  const last = r.risers[r.risers.length - 1]
  const toEnd = (pts: Pt[], end: Pt): Pt[] => {
    const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]]
    return (end.x - b.x) * (b.x - a.x) + (end.y - b.y) * (b.y - a.y) > 1e-6 ? [...pts, end] : pts
  }
  poly(VU, toEnd(r.outerLine, last.brutOuter))
  poly(VU, toEnd(r.innerLine, last.brutInner))
  r.risers.forEach((x, i) => {
    const edge = i === 0 || i === r.risers.length - 1
    // Vue brute : contremarches intermédiaires en couleur du calque FIN.
    line(edge ? VU : FIN, x.brutInner, x.brutOuter, edge || brut ? undefined : BLACK)
    if (!brut) line(CACHE, x.inner, x.outer)
  })

  // Ligne de foulée (calque cotation, absente de la vue brute) : double ligne au départ, flèche ouverte à l'arrivée, croquis du bureau.
  const h = NUM_H // hauteur des numéros, sert d'unité aux symboles (cotes de l'exemple du bureau)
  const unit = (p: Pt, q: Pt): Pt => {
    const l = Math.hypot(q.x - p.x, q.y - p.y) || 1
    return { x: (q.x - p.x) / l, y: (q.y - p.y) / l }
  }
  const at = (p: Pt, d: Pt, k: number, n = 0): Pt => ({ x: p.x + d.x * k - d.y * n, y: p.y + d.y * k + d.x * n })
  const f = r.fouleeLine.map(scr)
  const d0 = unit(f[0], f[1])
  const start = at(f[0], d0, -1.1 * h)
  if (!brut) {
    segs(COTA, [start, ...f])
    for (const side of [-0.3 * h, 0.3 * h]) seg(COTA, at(f[0], d0, -1.1 * h, side), at(f[0], d0, 0.45 * h, side))
    const end = f[f.length - 1]
    const d1 = unit(f[f.length - 2], end)
    for (const side of [-0.45 * h, 0.45 * h]) seg(COTA, end, at(end, d1, -1.5 * h, side))
  }

  // Lignes de coupe (calque axe), cotes de l'exemple du bureau : à chaque bout, triangle plein côté vue
  // (base 10 posée à 1 de la ligne et finissant à son extrémité, hauteur 3, couleur 18), puis la lettre
  // posée sur la ligne, côté vue, à 1 au-delà de l'extrémité. Lettre horizontale comme les autres textes.
  for (const c of cutLines(r)) {
    const pt = (t: number, k = 0): Pt => scr({ x: c.a.x + c.n.x * k + c.d.x * t, y: c.a.y + c.n.y * k + c.d.y * t })
    const ext = 2 * size
    const ends = [-ext, c.len + ext]
    seg(AXE, pt(ends[0]), pt(ends[1]))
    for (const [t, dir] of [[ends[0], 1], [ends[1], -1]]) {
      const [a, b, apex] = [out(pt(t, 1)), out(pt(t + dir * 10, 1)), out(pt(t + dir * 5, 4))]
      ents.push('0', 'SOLID', '8', HACH, '62', '18', '10', `${a.x}`, '20', `${a.y}`, '30', '0', '11', `${b.x}`, '21', `${b.y}`, '31', '0',
        '12', `${apex.x}`, '22', `${apex.y}`, '32', '0', '13', `${apex.x}`, '23', `${apex.y}`, '33', '0')
      // Boîte du texte (≈ 0,94 h × h, mesurée sur l'exemple) collée à la ligne et à 1 de son bout, repère DXF.
      const E = out(pt(t))
      const [D, N] = [unit(E, out(pt(t - dir))), unit(E, out(pt(t, 1)))]
      const [tw, th] = [0.47 * CUT_H, 0.5 * CUT_H]
      const along = Math.abs(D.x) * tw + Math.abs(D.y) * th
      const across = Math.abs(N.x) * tw + Math.abs(N.y) * th
      const l = at(at(E, D, 1 + along), N, across)
      ents.push('0', 'TEXT', '8', NUM, '7', CUT_STYLE, '10', `${l.x}`, '20', `${l.y}`, '30', '0', '40', `${CUT_H}`, '1', c.name,
        '72', '1', '73', '2', '11', `${l.x}`, '21', `${l.y}`, '31', '0')
    }
  }

  // Numéros 01, 02… comme l'exemple du bureau : côté jour, le texte longe la foulée (à 0,4 h)
  // et commence à 1 h de la contremarche de départ. S'il touche un trait (marches balancées), recherche
  // au plus près, sans toucher aucun trait. « 05 » en Tahoma ≈ 1,75 h de large.
  const [tw, th] = [0.875 * h, 0.5 * h] // demi-largeur / demi-hauteur du texte
  const [hw, hh] = [tw + 0.2 * h, th + 0.2 * h] // marge comprise
  const free = (c: Pt) => drawn.every(([a, b]) => !hitsBox(a, b, c.x - hw, c.x + hw, c.y - hh, c.y + hh))
  if (!brut) r.risers.slice(0, -1).forEach((x, i) => {
    const [p, q, jour] = [scr(x.foulee), scr(r.risers[i + 1].foulee), scr(x.inner)]
    const d = unit(p, q)
    const side = Math.sign(-d.y * (jour.x - p.x) + d.x * (jour.y - p.y)) || 1
    const giron = Math.hypot(q.x - p.x, q.y - p.y)
    const tries: { a: number; s: number }[] = []
    for (let a = 0.3 * h; a < giron; a += 0.2 * h) for (let s = 0.5 * h; s < 6 * h; s += 0.2 * h) tries.push({ a, s })
    tries.sort((u, v) => u.a + u.s - (v.a + v.s))
    // Place préférée, dans le repère DXF (le texte reste horizontal quelle que soit l'orientation de la vue).
    const P = out(p)
    const [D, N] = [unit(P, out(at(p, d, 1))), unit(P, out(at(p, d, 0, side)))]
    const ea = Math.abs(D.x) * tw + Math.abs(D.y) * th
    const es = Math.abs(N.x) * tw + Math.abs(N.y) * th
    const pref = at(at(P, D, h + ea), N, 0.4 * h + es)
    const best = [pref, ...tries.map(({ a, s }) => out(at(p, d, a, side * s)))].find(free)
    // ponytail: recherche en grille (quelques milliers d'essais par marche), suffisant pour ~20 marches.
    const c = best ?? out(at(p, d, 1.6 * h, side * 1.4 * h))
    ents.push('0', 'TEXT', '8', NUM, '10', `${c.x}`, '20', `${c.y}`, '30', '0', '40', `${h}`, '1', String(i + 1).padStart(2, '0'),
      '7', NUM_STYLE, '51', '20', '72', '1', '73', '2', '11', `${c.x}`, '21', `${c.y}`, '31', '0')
  })

  return ents
}

const text = (x: number, y: number, h: number, s: string) =>
  ['0', 'TEXT', '8', NUM, '10', `${x}`, '20', `${y}`, '30', '0', '40', `${h}`, '1', s, '72', '1', '11', `${x}`, '21', `${y}`, '31', '0']

// Coupes A, B… alignées sur une ligne sous les plans, z vers le haut depuis le NF départ.
// Vue vers le jour : en sens « droite », la montée va de droite à gauche.
const sections = (r: StairResult, x0: number, yTop: number, gap: number, h: number): string[] => {
  const ents: string[] = []
  const mirror = r.input.sens === 'droite'
  let x = x0
  for (const c of cutLines(r)) {
    const { fini, brut, sousFace, ends } = cutProfile(r, c)
    const x0c = Math.min(...brut.map((p) => p.x))
    const w = Math.max(...fini.map((p) => p.x), ...brut.map((p) => p.x)) - x0c
    const top = Math.max(...brut.map((p) => p.y), ...fini.map((p) => p.y))
    const out = (p: Pt): Pt => ({ x: x + (mirror ? w - (p.x - x0c) : p.x - x0c), y: yTop - top + p.y })
    const segs = (layer: string, pts: Pt[]) =>
      pts.slice(1).forEach((p, i) => {
        const [a, b] = [out(pts[i]), out(p)]
        if (Math.hypot(b.x - a.x, b.y - a.y) > 1e-6)
          ents.push('0', 'LINE', '8', layer, '10', `${a.x}`, '20', `${a.y}`, '30', '0', '11', `${b.x}`, '21', `${b.y}`, '31', '0')
      })
    segs(CACHE, fini)
    segs(COUPE, brut)
    segs(COUPE, sousFace)
    ends.forEach((e) => segs(AXE, e))
    const bottom = Math.min(...brut.map((p) => p.y), ...sousFace.map((p) => p.y))
    const t = out({ x: x0c + w / 2, y: bottom })
    ents.push(...text(t.x, t.y - 2.5 * h, 1.5 * h, `COUPE ${c.name}-${c.name}`))
    x += w + gap
  }
  return ents
}

// Les 4 orientations côte à côte : le dessinateur garde celle qui colle au plan archi.
// Dessous, les mêmes vues en brut, puis les coupes.
export const planDxf = (r: StairResult): string => {
  const pts = [...r.outerLine, ...r.innerLine]
  const diag = Math.hypot(
    Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x)),
    Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y)),
  )
  const ents = [0, 90, 180, 270].flatMap((a, i) => [...view(r, a, i * diag * 1.3), ...view(r, a, i * diag * 1.3, -diag * 1.3, true)])
  ents.push(...sections(r, -diag / 2, -diag * 2.05, diag * 0.3, diag / 50))
  // Seule table : les styles de texte (numéros, lettres de coupe). Les calques restent ceux du gabarit à l'insertion (BDR-006).
  const def = (name: string, h: number, oblique: number, font: string) =>
    ['0', 'STYLE', '2', name, '70', '0', '40', '0', '41', '1', '50', `${oblique}`, '71', '0', '42', `${h}`, '3', font, '4', '']
  const style = ['0', 'TABLE', '2', 'STYLE', '70', '2', ...def(NUM_STYLE, NUM_H, 20, 'tahoma.ttf'),
    ...def(CUT_STYLE, CUT_H, 0, 'arialbi.ttf'), '0', 'ENDTAB']
  return ['0', 'SECTION', '2', 'TABLES', ...style, '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES', ...ents, '0', 'ENDSEC', '0', 'EOF', '']
    .join('\r\n')
}

export const downloadDxf = (r: StairResult) => {
  const url = URL.createObjectURL(new Blob([planDxf(r)], { type: 'application/dxf' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'escalier-plan.dxf' })
  a.click()
  URL.revokeObjectURL(url)
}
