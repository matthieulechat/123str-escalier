// Moteur de calcul d'escalier béton. Toutes les valeurs (longueurs, épaisseurs, niveaux) en cm.

export type StairType = 'droit' | 'quart' | 'demi'
export type Sens = 'gauche' | 'droite'
export type Level = 'ok' | 'bad'

export interface StairInput {
  type: StairType
  sens: Sens
  largeur: number // emmarchement
  jour: number // quart : rayon du jour arrondi ; demi : largeur du jour
  jourArrondi: boolean // false = jour droit (angles vifs)
  volee1: number // de la 1re contremarche au mur du fond (longueur de foulée si droit)
  volee2: number // du nez du palier d'arrivée au mur du fond
  nfBas: number // niveau fini départ
  nfHaut: number // niveau fini arrivée
  finSolBas: number // épaisseur de finition du sol au départ
  finSolHaut: number // épaisseur de finition du palier d'arrivée
  finMarche: number // épaisseur de finition sur le dessus des marches
  finContremarche: number // épaisseur de finition sur les contremarches
  paillasse: number // épaisseur de la paillasse béton (perpendiculaire)
  dalleHaut: number // épaisseur de la dalle du palier d'arrivée
  nbContremarches: number // 0 = automatique
  nbBalancees: number // marches balancées de chaque côté de la ligne de séparation
}

export interface Pt {
  x: number
  y: number
}

export interface Riser {
  j: number // index du nez (0 = départ, n-1 = arrivée)
  s: number // abscisse sur la ligne de foulée
  u: number // abscisse au collet (jour)
  inner: Pt // contremarche finie
  foulee: Pt
  outer: Pt
  brutInner: Pt // contremarche brute (décalée de la finition de contremarche)
  brutOuter: Pt
  outerLen: number // abscisse le long du mur extérieur
  balanced: boolean
}

export interface Row {
  cm: number // n° de contremarche (1..n)
  hFini: number
  hBrut: number
  nf: number // niveau fini du dessus (marche ou palier)
  nb: number // niveau brut du dessus
  giron?: number
  collet?: number
  gironExt?: number
}

export interface HersePoint {
  j: number // index du nez
  x: number // abscisse sur AC (foulée)
  collet: number // collet cumulé lu sur AD
}

export interface HerseData {
  cote: 'départ' | 'arrivée'
  a: number // AC : foulée à balancer
  c: number // AB : collet à balancer
  points: HersePoint[]
}

export interface Check {
  label: string
  value: string
  range: string
  level: Level
}

export interface StairResult {
  input: StairInput
  n: number
  h: number
  g: number
  f: number // distance de la ligne de foulée au collet
  lf: number // longueur développée de la ligne de foulée
  theta: number
  nbBas: number
  nbHaut: number
  risers: Riser[]
  innerLine: Pt[]
  outerLine: Pt[]
  fouleeLine: Pt[]
  separation?: [Pt, Pt]
  herses: HerseData[]
  rows: Row[]
  checks: Check[]
  warnings: string[]
  encombrement: { x: number; y: number }
}

const EPS = 1e-6

// Méthode de la herse : AB = collet à balancer (c), AC = foulée à balancer (a).
// D sur BC tel que AD = AB ; le collet cumulé du giron x est l'intersection de (B, x) avec (AD).
export const herse = (a: number, c: number, x: number): number => {
  const t = (2 * c * c) / (a * a + c * c)
  const ux = (a * t) / c
  const uy = 1 - t
  return (c * x) / (x * uy + c * ux)
}

const cross = (a: Pt, b: Pt): number => a.x * b.y - a.y * b.x

// Prolonge la droite (p, q) au-delà de p + tMin·(q - p) jusqu'au contour `line`.
const hitPolyline = (p: Pt, q: Pt, line: Pt[], tMin = 1): { pt: Pt; len: number; t: number } => {
  const d = { x: q.x - p.x, y: q.y - p.y }
  let best = { t: Infinity, pt: q, len: 0 }
  let acc = 0
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i]
    const e = { x: line[i + 1].x - a.x, y: line[i + 1].y - a.y }
    const den = cross(d, e)
    if (Math.abs(den) > EPS) {
      const ap = { x: a.x - p.x, y: a.y - p.y }
      const t = cross(ap, e) / den
      const s = cross(ap, d) / den
      if (t > tMin - EPS && s > -EPS && s < 1 + EPS && t < best.t) {
        best = { t, pt: { x: p.x + t * d.x, y: p.y + t * d.y }, len: acc + s * Math.hypot(e.x, e.y) }
      }
    }
    acc += Math.hypot(e.x, e.y)
  }
  return best
}

// Règles du bureau : h ≤ 18, g ≥ 24, 60 < 2h + g < 64.
export const RULES = { hMax: 18, gMin: 24, blondelMin: 60, blondelMax: 64 }

const autoN = (H: number, lf: number): number => {
  let bestN = 3
  let bestScore = Infinity
  for (let n = 3; n <= 80; n++) {
    const h = H / n
    const g = lf / (n - 1)
    const b = 2 * h + g
    const ko = (h > RULES.hMax ? 1 : 0) + (g < RULES.gMin ? 1 : 0) + (b <= RULES.blondelMin || b >= RULES.blondelMax ? 1 : 0)
    const score = ko * 100 + Math.abs(b - (RULES.blondelMin + RULES.blondelMax) / 2)
    if (score < bestScore) {
      bestScore = score
      bestN = n
    }
  }
  return bestN
}

type Seg = { kind: 'line'; L: number } | { kind: 'arc'; a: number; r: number }

const segLen = (sg: Seg, d: number): number => (sg.kind === 'line' ? sg.L : sg.a * (sg.r + d))

// Tracé du jour : volée, tournant (angles vifs ou arrondi), volée.
const buildSegs = (input: StairInput, L1: number, L2: number): Seg[] => {
  const { type, jour, jourArrondi } = input
  if (type === 'droit') return [{ kind: 'line', L: L1 }]
  const turn: Seg[] =
    type === 'quart'
      ? [{ kind: 'arc', a: Math.PI / 2, r: jourArrondi ? jour : 0 }]
      : jourArrondi
        ? [{ kind: 'arc', a: Math.PI, r: jour / 2 }]
        : [{ kind: 'arc', a: Math.PI / 2, r: 0 }, { kind: 'line', L: jour }, { kind: 'arc', a: Math.PI / 2, r: 0 }]
  return [{ kind: 'line', L: L1 }, ...turn, { kind: 'line', L: L2 }]
}

export const computeStair = (input: StairInput): StairResult | { error: string } => {
  const { type, largeur: W } = input
  // Volées cotées jusqu'au mur du fond : on retire l'emmarchement et le rayon du jour arrondi
  // pour obtenir la partie droite au jour.
  const rj = input.jourArrondi ? (type === 'demi' ? input.jour / 2 : input.jour) : 0
  const L1 = type === 'droit' ? input.volee1 : input.volee1 - W - rj
  const L2 = type === 'droit' ? 0 : input.volee2 - W - rj
  const segs = buildSegs(input, L1, L2)
  const theta = segs.reduce((acc, sg) => acc + (sg.kind === 'arc' ? sg.a : 0), 0)
  // Ligne de foulée : milieu de l'emmarchement, à 50 cm du collet au-delà de 1 m.
  const f = W <= 100 ? W / 2 : 50
  const H = input.nfHaut - input.nfBas
  const turnSegs = segs.slice(1, -1)
  const turnF = turnSegs.reduce((acc, sg) => acc + segLen(sg, f), 0)
  const turnU = turnSegs.reduce((acc, sg) => acc + segLen(sg, 0), 0)
  const lf = L1 + turnF + L2

  if (W <= 0 || input.jour < 0) return { error: 'Dimensions invalides.' }
  if (L1 < 0 || L2 < 0) return { error: 'Volée plus courte que l’emmarchement + le jour : vérifier les longueurs jusqu’au mur du fond.' }
  if (H <= 0) return { error: 'Le niveau fini haut doit être au-dessus du niveau fini bas.' }
  if (lf <= 0) return { error: 'Longueur de foulée nulle.' }

  const n = input.nbContremarches >= 3 ? Math.round(input.nbContremarches) : autoN(H, lf)
  const h = H / n
  const g = lf / (n - 1)
  const warnings: string[] = []

  // Point à la distance d du jour, à l'abscisse `along` mesurée sur cette ligne (le tournant est à gauche).
  const at = (d: number, along: number): Pt => {
    let x = 0
    let y = 0
    let hd = 0
    let rem = along
    const off = () => ({ x: x + d * Math.sin(hd), y: y - d * Math.cos(hd) })
    for (let i = 0; i < segs.length; i++) {
      const sg = segs[i]
      const len = segLen(sg, d)
      const last = i === segs.length - 1
      const inside = last || rem <= len
      const step = inside ? rem : len
      if (sg.kind === 'line') {
        x += step * Math.cos(hd)
        y += step * Math.sin(hd)
      } else {
        // Angle vif (longueur nulle) : on ne tourne qu'une fois le coin franchi.
        const phi = len > 0 ? step / (sg.r + d) : inside && rem <= 0 ? 0 : sg.a
        const cx = x - sg.r * Math.sin(hd)
        const cy = y + sg.r * Math.cos(hd)
        hd += phi
        x = cx + sg.r * Math.sin(hd)
        y = cy - sg.r * Math.cos(hd)
      }
      if (inside) return off()
      rem -= len
    }
    return off()
  }

  const sample = (d: number): Pt[] => {
    const pts: Pt[] = []
    let acc = 0
    for (const sg of segs) {
      const len = segLen(sg, d)
      const k = sg.kind === 'arc' && len > 0 ? 24 : 1
      for (let i = 0; i < k; i++) pts.push(at(d, acc + (len * i) / k))
      acc += len
    }
    pts.push(at(d, acc))
    return pts
  }

  const innerLine = sample(0)
  const E = at(0, L1 + turnU) // départ de la volée d'arrivée, côté jour
  const xBack = Math.max(...innerLine.map((pt) => pt.x)) + W
  const outerLine: Pt[] =
    type === 'droit'
      ? [{ x: 0, y: -W }, { x: L1, y: -W }]
      : type === 'quart'
        ? [{ x: 0, y: -W }, { x: E.x + W, y: -W }, { x: E.x + W, y: E.y + L2 }]
        : [{ x: 0, y: -W }, { x: xBack, y: -W }, { x: xBack, y: E.y + W }, { x: E.x - L2, y: E.y + W }]

  // Abscisses des nez sur la foulée, et au collet par défaut (marches rayonnantes).
  const sTurn1 = L1 + turnF
  const herses: HerseData[] = []
  const s = Array.from({ length: n }, (_, j) => j * g)
  const u = s.map((sj) => (sj <= L1 + EPS ? sj : sj >= sTurn1 - EPS ? sj - (turnF - turnU) : NaN))
  const balanced = s.map(() => false)

  if (theta > 0) {
    const k = Math.max(1, Math.round(input.nbBalancees))
    const sSep = L1 + turnF / 2
    const uSep = L1 + turnU / 2
    const jLast = s.reduce((acc, sj, j) => (sj <= sSep + EPS ? j : acc), 0)

    // Première moitié : balancée sur la volée de départ.
    let i0 = jLast - k
    if (i0 < 0) {
      i0 = 0
      warnings.push('Volée de départ trop courte : balancement limité à la première marche.')
    }
    while (i0 > 0 && s[i0] > L1 + EPS) i0--
    if (s[i0] > L1 + EPS) return { error: 'Volée de départ trop courte pour balancer le tournant.' }
    if (i0 < jLast - k) warnings.push(`Côté départ : ${jLast - i0} marches balancées (minimum pour sortir du tournant).`)
    const h1: HerseData = { cote: 'départ', a: sSep - s[i0], c: uSep - u[i0], points: [] }
    for (let j = i0 + 1; j <= jLast; j++) {
      const x = s[j] - s[i0]
      const collet = herse(h1.a, h1.c, x)
      u[j] = u[i0] + collet
      balanced[j] = true
      h1.points.push({ j, x, collet })
    }
    herses.push(h1)

    // Seconde moitié : balancée sur la volée d'arrivée.
    // Un nez posé sur la séparation compte pour les deux moitiés : on garde la symétrie.
    const jFirst = jLast + 1
    const kEnd = Math.abs(s[jLast] - sSep) < 1e-3 ? k - 1 : k
    let iEnd = jFirst + kEnd
    if (iEnd > n - 1) {
      iEnd = n - 1
      warnings.push('Volée d’arrivée trop courte : balancement limité à la dernière marche.')
    }
    while (iEnd < n - 1 && s[iEnd] < sTurn1 - EPS) iEnd++
    if (s[iEnd] < sTurn1 - EPS) return { error: 'Volée d’arrivée trop courte pour balancer le tournant.' }
    if (iEnd > jFirst + kEnd) warnings.push(`Côté arrivée : ${iEnd - jFirst} marches balancées (minimum pour sortir du tournant).`)
    const h2: HerseData = { cote: 'arrivée', a: s[iEnd] - sSep, c: u[iEnd] - uSep, points: [] }
    for (let j = iEnd - 1; j >= jFirst; j--) {
      const x = s[iEnd] - s[j]
      const collet = herse(h2.a, h2.c, x)
      u[j] = u[iEnd] - collet
      balanced[j] = true
      h2.points.push({ j, x, collet })
    }
    herses.push(h2)
  }

  const risers: Riser[] = s.map((sj, j) => {
    const inner = at(0, u[j])
    const foulee = at(f, sj)
    const hit = hitPolyline(inner, foulee, outerLine)
    // Face brute : parallèle à la face finie, reculée de la finition dans le sens de la montée.
    const d = { x: hit.pt.x - inner.x, y: hit.pt.y - inner.y }
    const len = Math.hypot(d.x, d.y)
    const t0 = at(f, sj - 0.5)
    const t1 = at(f, sj + 0.5)
    let nx = -d.y / len
    let ny = d.x / len
    if (nx * (t1.x - t0.x) + ny * (t1.y - t0.y) < 0) [nx, ny] = [-nx, -ny]
    const e = input.finContremarche
    const shift = (p: Pt): Pt => ({ x: p.x + e * nx, y: p.y + e * ny })
    const fb = shift(foulee)
    const bo = hitPolyline(fb, { x: fb.x + d.x, y: fb.y + d.y }, outerLine, 0)
    const bi = hitPolyline(fb, { x: fb.x - d.x, y: fb.y - d.y }, innerLine, 0)
    return {
      j,
      s: sj,
      u: u[j],
      inner,
      foulee,
      outer: hit.pt,
      outerLen: hit.len,
      brutInner: bi.t < Infinity ? bi.pt : shift(inner),
      brutOuter: bo.t < Infinity ? bo.pt : shift(hit.pt),
      balanced: balanced[j],
    }
  })

  let separation: [Pt, Pt] | undefined
  if (theta > 0) {
    const a = at(0, L1 + turnU / 2)
    const b = at(f, L1 + turnF / 2)
    separation = [a, hitPolyline(a, b, outerLine).pt]
  }

  // Niveaux bruts : la finition des marches est constante, seules la 1re et la dernière contremarche brute changent.
  const { finSolBas: eBas, finSolHaut: eHaut, finMarche: eM } = input
  const nbBas = input.nfBas - eBas
  const nbHaut = input.nfHaut - eHaut
  const rows: Row[] = Array.from({ length: n }, (_, k) => {
    const cm = k + 1
    const last = cm === n
    const hBrut = cm === 1 ? h - eM + eBas : last ? h - eHaut + eM : h
    const nf = input.nfBas + cm * h
    const row: Row = { cm, hFini: h, hBrut, nf, nb: last ? nbHaut : nf - eM }
    if (!last) {
      row.giron = g
      row.collet = risers[cm].u - risers[cm - 1].u
      row.gironExt = risers[cm].outerLen - risers[cm - 1].outerLen
    }
    return row
  })

  const treads = rows.filter((r) => r.collet !== undefined)
  const blondel = 2 * h + g
  const fmt = (v: number) => v.toFixed(1).replace('.', ',')

  const checks: Check[] = [
    { label: 'Hauteur de marche', value: `${fmt(h)} cm`, range: `≤ ${RULES.hMax} cm`, level: h <= RULES.hMax + EPS ? 'ok' : 'bad' },
    { label: 'Giron (foulée)', value: `${fmt(g)} cm`, range: `≥ ${RULES.gMin} cm`, level: g >= RULES.gMin - EPS ? 'ok' : 'bad' },
    {
      label: 'Blondel 2h + g',
      value: `${fmt(blondel)} cm`,
      range: `${RULES.blondelMin} < 2h + g < ${RULES.blondelMax} cm`,
      level: blondel > RULES.blondelMin && blondel < RULES.blondelMax ? 'ok' : 'bad',
    },
  ]
  // Remarque de la méthode de la herse (calcul-escaliers.web4me.fr).
  if (treads.some((r) => (r.collet ?? 0) > g + EPS))
    warnings.push('Un collet dépasse le giron : réduire la longueur de volée balancée (moins de marches balancées).')

  const all = [...outerLine, ...risers.map((r) => r.inner), ...innerLine]
  const xs = all.map((p) => p.x)
  const ys = all.map((p) => p.y)

  return {
    input,
    n,
    h,
    g,
    f,
    lf,
    theta,
    nbBas,
    nbHaut,
    risers,
    innerLine,
    outerLine,
    fouleeLine: sample(f),
    separation,
    herses,
    rows,
    checks,
    warnings,
    encombrement: { x: Math.max(...xs) - Math.min(...xs), y: Math.max(...ys) - Math.min(...ys) },
  }
}

