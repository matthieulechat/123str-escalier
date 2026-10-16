import type { StairResult } from '../stair.ts'
import { fmt as cm, lvl as m } from './svg.ts'
import { CollapsibleCard } from './Section.tsx'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const ValuesTable = ({ r }: { r: StairResult }) => {
  const turning = r.theta > 0

  return (
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
  )
}

export default ValuesTable
