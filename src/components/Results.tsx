import type { Level, StairResult } from '../stair.ts'
import { fmt as cm, lvl as m } from './svg.ts'
import { CollapsibleCard } from './Section.tsx'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

      <CollapsibleCard title="Tableau des valeurs par contremarche">
        <Table className="text-right tabular-nums">
          <TableHeader>
            <TableRow>
              <TableHead>CM n°</TableHead>
              <TableHead className="text-right">H finie</TableHead>
              <TableHead className="text-right">H brute</TableHead>
              <TableHead className="text-right">NF dessus</TableHead>
              <TableHead className="text-right">NB dessus</TableHead>
              <TableHead className="text-right">Giron foulée</TableHead>
              {turning && <TableHead className="text-right">Collet (jour)</TableHead>}
              {turning && <TableHead className="text-right">Giron ext.</TableHead>}
              {turning && <TableHead className="text-right">Cumul collet</TableHead>}
              {turning && <TableHead className="text-right">Cumul ext.</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {r.rows.map((row) => {
              const riser = r.risers[row.cm - 1]
              const isLast = row.cm === r.n
              return (
                <TableRow key={row.cm} className={riser.balanced ? 'bg-sky-50 dark:bg-sky-950' : undefined}>
                  <TableCell className="text-left font-medium">
                    {row.cm}
                    {isLast && <span className="ml-1 text-xs text-muted-foreground">palier</span>}
                  </TableCell>
                  <TableCell>{cm(row.hFini)}</TableCell>
                  <TableCell className={row.hBrut !== row.hFini ? 'font-semibold text-orange-700' : undefined}>{cm(row.hBrut)}</TableCell>
                  <TableCell>{m(row.nf)}</TableCell>
                  <TableCell>{m(row.nb)}</TableCell>
                  <TableCell>{row.giron === undefined ? '—' : cm(row.giron)}</TableCell>
                  {turning && <TableCell>{row.collet === undefined ? '—' : cm(row.collet)}</TableCell>}
                  {turning && <TableCell>{row.gironExt === undefined ? '—' : cm(row.gironExt)}</TableCell>}
                  {turning && <TableCell className="text-muted-foreground">{cm(riser.u)}</TableCell>}
                  {turning && <TableCell className="text-muted-foreground">{cm(riser.outerLen)}</TableCell>}
                </TableRow>
              )
            })}
          </TableBody>
          <TableCaption className="text-left text-xs">
            Toutes les valeurs en cm. Cumuls mesurés depuis le nez de la 1re contremarche, le long du jour et du mur extérieur (report de
            traçage). Lignes bleues : contremarches balancées (méthode de la herse). Encombrement : {cm(r.encombrement.x)} ×{' '}
            {cm(r.encombrement.y)} cm.
          </TableCaption>
        </Table>
      </CollapsibleCard>
    </div>
  )
}

export default Results
