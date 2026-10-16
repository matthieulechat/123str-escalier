import type { Level, StairResult } from '../stair.ts'
import { fmt as cm, lvl as m } from './svg.ts'

const LEVEL_STYLE: Record<Level, string> = {
  ok: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  bad: 'border-red-300 bg-red-50 text-red-900',
}
const LEVEL_ICON: Record<Level, string> = { ok: '✔', bad: '✖' }

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
)

const Results = ({ r }: { r: StairResult }) => {
  const first = r.rows[0]
  const last = r.rows[r.rows.length - 1]
  const turning = r.theta > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Contremarches / marches" value={`${r.n} / ${r.n - 1}`} />
        <Stat label="Hauteur finie" value={`${cm(r.h)} cm`} />
        <Stat label="Giron (foulée)" value={`${cm(r.g)} cm`} />
        <Stat label="Foulée développée" value={`${cm(r.lf)} cm (à ${cm(r.f)} cm du jour)`} />
        <Stat label="NB départ / arrivée" value={`${m(r.nbBas)} / ${m(r.nbHaut)} cm`} />
        <Stat label="1re CM brute" value={`${cm(first.hBrut)} cm`} />
        <Stat label="CM brute courante" value={`${cm(r.h)} cm`} />
        <Stat label="Dernière CM brute" value={`${cm(last.hBrut)} cm`} />
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Vérifications">
        {r.checks.map((c) => (
          <li key={c.label} className={`rounded border px-2 py-1 text-sm ${LEVEL_STYLE[c.level]}`}>
            <span aria-hidden="true">{LEVEL_ICON[c.level]}</span> {c.label} : <strong>{c.value}</strong>{' '}
            <span className="opacity-70">({c.range})</span>
          </li>
        ))}
      </ul>

      {r.warnings.length > 0 && (
        <ul aria-live="polite" className="list-inside list-disc rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {r.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <details className="rounded-lg border border-slate-200 bg-white">
        <summary className="cursor-pointer p-3 text-sm font-semibold">Tableau des valeurs par contremarche</summary>
        <div className="overflow-x-auto">
        <table className="w-full text-right text-sm tabular-nums">
          <thead className="bg-slate-100 text-xs text-slate-600">
            <tr>
              <th className="px-2 py-1.5 text-left">CM n°</th>
              <th className="px-2">H finie</th>
              <th className="px-2">H brute</th>
              <th className="px-2">NF dessus</th>
              <th className="px-2">NB dessus</th>
              <th className="px-2">Giron foulée</th>
              {turning && <th className="px-2">Collet (jour)</th>}
              {turning && <th className="px-2">Giron ext.</th>}
              {turning && <th className="px-2">Cumul collet</th>}
              {turning && <th className="px-2">Cumul ext.</th>}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row) => {
              const riser = r.risers[row.cm - 1]
              const isLast = row.cm === r.n
              return (
                <tr key={row.cm} className={`border-t border-slate-100 ${riser.balanced ? 'bg-sky-50' : ''}`}>
                  <td className="px-2 py-1 text-left font-medium">
                    {row.cm}
                    {isLast && <span className="ml-1 text-xs text-slate-500">palier</span>}
                  </td>
                  <td className="px-2">{cm(row.hFini)}</td>
                  <td className={`px-2 ${row.hBrut !== row.hFini ? 'font-semibold text-orange-700' : ''}`}>{cm(row.hBrut)}</td>
                  <td className="px-2">{m(row.nf)}</td>
                  <td className="px-2">{m(row.nb)}</td>
                  <td className="px-2">{row.giron === undefined ? '—' : cm(row.giron)}</td>
                  {turning && <td className="px-2">{row.collet === undefined ? '—' : cm(row.collet)}</td>}
                  {turning && <td className="px-2">{row.gironExt === undefined ? '—' : cm(row.gironExt)}</td>}
                  {turning && <td className="px-2 text-slate-500">{cm(riser.u)}</td>}
                  {turning && <td className="px-2 text-slate-500">{cm(riser.outerLen)}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="border-t border-slate-100 px-2 py-1.5 text-xs text-slate-500">
          Toutes les valeurs en cm. Cumuls mesurés depuis le nez de la 1re contremarche, le long du jour et du mur extérieur (report de traçage).
          Lignes bleues : contremarches balancées (méthode de la herse). Encombrement : {cm(r.encombrement.x)} ×{' '}
          {cm(r.encombrement.y)} cm.
        </p>
        </div>
      </details>
    </div>
  )
}

export default Results
