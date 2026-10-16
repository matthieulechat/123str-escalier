import type { Level, StairResult } from '../stair.ts'
import { fmt as cm, lvl as m } from './svg.ts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const LEVEL_VARIANT: Record<Level, 'success' | 'destructive'> = { ok: 'success', bad: 'destructive' }
const LEVEL_ICON: Record<Level, string> = { ok: '✔', bad: '✖' }

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Card size="sm">
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-lg">{value}</CardTitle>
    </CardHeader>
  </Card>
)

const Results = ({ r }: { r: StairResult }) => {
  const first = r.rows[0]
  const last = r.rows[r.rows.length - 1]

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
          <li key={c.label}>
            <Badge variant={LEVEL_VARIANT[c.level]}>
              <span aria-hidden="true">{LEVEL_ICON[c.level]}</span> {c.label} : <strong>{c.value}</strong>
              <span className="opacity-70">({c.range})</span>
            </Badge>
          </li>
        ))}
      </ul>

      {r.warnings.length > 0 && (
        <Alert variant="warning" aria-live="polite">
          <AlertDescription>
            <ul className="list-inside list-disc">
              {r.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

    </div>
  )
}

export default Results
