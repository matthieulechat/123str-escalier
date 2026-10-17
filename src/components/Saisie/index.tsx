import { useState } from 'react'
import type { StairInput, StairResult } from '../../stair.ts'
import Orientation, { StairGlyph } from './Orientation.tsx'
import { Button } from '@/components/ui/button'
import PlanSchema from './PlanSchema.tsx'
import CoupeSchema from './CoupeSchema.tsx'
import type { SaisieProps } from './types.ts'
import { CollapsibleCard } from '../Section.tsx'
import LockButton from './LockButton.tsx'
import { LocksContext } from './locks.ts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeftRightIcon } from 'lucide-react'

// Lignes de foulée schématiques (repère du moteur : la montée part vers +x, tourne vers +y).
const TYPES: { type: StairInput['type']; label: string; pts: { x: number; y: number }[] }[] = [
  { type: 'droit', label: 'Droit', pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }] },
  { type: 'quart', label: '1/4 tournant', pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }] },
  { type: 'demi', label: '1/2 tournant', pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 7 }, { x: 0, y: 7 }] },
]

const Saisie = ({ value, onChange, result }: SaisieProps & { result: StairResult | null }) => {
  const turning = value.type !== 'droit'
  const flip = value.sens === 'gauche' ? -1 : 1
  const [locked, setLocked] = useState<ReadonlySet<string>>(new Set())
  const locks = {
    isLocked: (k: string) => locked.has(k),
    toggle: (k: string) =>
      setLocked((prev) => {
        const next = new Set(prev)
        if (!next.delete(k)) next.add(k)
        return next
      }),
  }
  const set = <K extends keyof StairInput>(k: K, v: StairInput[K]) => onChange({ ...value, [k]: v })
  const int = (k: 'nbContremarches' | 'nbBalancees', label: string) => (
    <Label htmlFor={k}>
      {label}
      <span className="flex items-center gap-0.5">
        <Input id={k} type="number" min={0} disabled={locked.has(k)} value={value[k]} onChange={(e) => set(k, e.target.valueAsNumber || 0)} className="w-14 text-right" />
        <LockButton k={k} label={label} />
      </span>
    </Label>
  )

  return (
    <LocksContext value={locks}>
      <CollapsibleCard title="Saisie de l'escalier" regionLabel="Saisie de l'escalier" defaultOpen>
        <div>
          <h2 className="mb-1 font-heading text-sm font-bold">Configuration</h2>
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1 text-sm font-medium" role="group" aria-label="Type d'escalier">
                <span className="mr-1">Type</span>
                {TYPES.map((t) => (
                  <Button
                    key={t.type}
                    variant={value.type === t.type ? 'default' : 'outline'}
                    aria-pressed={value.type === t.type}
                    onClick={() => set('type', t.type)}
                  >
                    <StairGlyph pts={t.pts.map((p) => ({ x: p.x, y: flip * p.y }))} id={`type-arrow-${t.type}`} />
                    {t.label}
                  </Button>
                ))}
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <Orientation r={result} value={value.orientation ?? 0} onChange={(a) => set('orientation', a)} />
                  {turning && (
                    <Button variant="outline" onClick={() => set('sens', value.sens === 'gauche' ? 'droite' : 'gauche')} title="Tourne à gauche / à droite">
                      <ArrowLeftRightIcon aria-hidden="true" />
                      Inverser
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {turning && (
                <Button
                  variant="outline"
                  aria-pressed={value.jourArrondi}
                  onClick={() => set('jourArrondi', !value.jourArrondi)}
                  title="Basculer entre jour arrondi et jour droit (angles vifs)"
                >
                  {/* Angle du jour tel qu'il sera tracé : arrondi ou vif. */}
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d={value.jourArrondi ? 'M4 20 V13 A9 9 0 0 1 13 4 H20' : 'M4 20 V4 H20'} />
                  </svg>
                  {value.jourArrondi ? 'Jour arrondi' : 'Jour droit'}
                </Button>
              )}
              {int('nbContremarches', 'Nb contremarches (0 = auto)')}
              {turning && int('nbBalancees', 'Marches balancées / côté')}
            </div>
          </div>
        </div>
        {/* Colonnes de même hauteur : chaque schéma est centré verticalement dans la sienne. */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="flex flex-col">
            <h2 className="mb-1 font-heading text-sm font-bold">Plan — dimensions</h2>
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-6">
              <PlanSchema value={value} onChange={onChange} />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="mb-1 font-heading text-sm font-bold">Coupe — niveaux et finitions</h2>
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-6">
              <CoupeSchema value={value} onChange={onChange} />
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </LocksContext>
  )
}

export default Saisie
