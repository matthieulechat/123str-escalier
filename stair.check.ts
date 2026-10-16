// Vérification : node stair.check.ts
import assert from 'node:assert/strict'
import { herse, computeStair, type StairInput } from './src/stair.ts'

// Feuille de calcul calcul-escaliers.web4me.fr : giron 24, foulée 107,4, collet 76.
const exp = [22.9, 41.63, 57.22, 70.42, 76.0]
;[24, 48, 72, 96, 107.4].forEach((x, i) => assert.ok(Math.abs(herse(107.4, 76, x) - exp[i]) < 0.02, `herse ${x}`))

const base: StairInput = {
  type: 'demi', sens: 'gauche', largeur: 90, jour: 20, jourArrondi: true, volee1: 250, volee2: 250,
  nfBas: 0, nfHaut: 280, finSolBas: 5, finSolHaut: 5, finMarche: 3, finContremarche: 1,
  paillasse: 15, dalleHaut: 20, nbContremarches: 0, nbBalancees: 5,
}

const verify = (input: StairInput, jourLen: number) => {
  const r = computeStair(input)
  if ('error' in r) throw new Error(r.error)
  assert.ok(Math.abs(r.rows.reduce((a, x) => a + x.hBrut, 0) - (r.nbHaut - r.nbBas)) < 1e-6, 'somme CM brutes')
  const collets = r.rows.filter((x) => x.collet !== undefined).map((x) => x.collet ?? 0)
  assert.ok(collets.every((c) => c > 0), 'collets positifs')
  assert.ok(Math.abs(collets.reduce((a, c) => a + c, 0) - jourLen) < 1e-6, 'somme collets = longueur au jour')
  assert.ok(collets.every((c, i) => Math.abs(c - collets[collets.length - 1 - i]) < 1e-6), 'balancement symétrique')
  console.log('OK', input.type, input.jourArrondi ? 'arrondi' : 'droit', r.n, r.h.toFixed(2), r.g.toFixed(2), collets.map((c) => c.toFixed(1)).join(' '))
}

verify(base, 300 + Math.PI * 10)
verify({ ...base, jourArrondi: false, volee1: 240, volee2: 240 }, 300 + 20)
verify({ ...base, type: 'quart', jourArrondi: false, volee1: 240, volee2: 240, nbBalancees: 4 }, 300)

// Cas tracé à la main : volées de 220 jusqu'au mur du fond, jour droit de 20, emmarchement 90.
const main = computeStair({ ...base, jourArrondi: false, volee1: 220, volee2: 220, nfHaut: 301 })
if ('error' in main) throw new Error(main.error)
assert.ok(Math.abs(main.lf - (130 + Math.PI * 45 + 20 + 130)) < 1e-6, 'foulée 421,4')
