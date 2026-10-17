import { useState } from 'react'
import type { StairInput } from '../../stair.ts'
import PlanSchema from './PlanSchema.tsx'
import CoupeSchema from './CoupeSchema.tsx'
import type { SaisieProps } from './types.ts'
import { CollapsibleCard } from '../Section.tsx'
import LockButton from './LockButton.tsx'
import { LocksContext } from './locks.ts'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

const Saisie = ({ value, onChange }: SaisieProps) => {
  const turning = value.type !== 'droit'
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
          <h2 className="mb-1 font-heading text-sm font-medium">Configuration</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Label htmlFor="type">
              Type
              <NativeSelect id="type" value={value.type} onChange={(e) => set('type', e.target.value as StairInput['type'])}>
                <NativeSelectOption value="droit">Droit</NativeSelectOption>
                <NativeSelectOption value="quart">Quart tournant</NativeSelectOption>
                <NativeSelectOption value="demi">Demi tournant</NativeSelectOption>
              </NativeSelect>
            </Label>
            {turning && (
              <Label htmlFor="sens">
                Sens
                <NativeSelect id="sens" value={value.sens} onChange={(e) => set('sens', e.target.value as StairInput['sens'])}>
                  <NativeSelectOption value="gauche">Tourne à gauche</NativeSelectOption>
                  <NativeSelectOption value="droite">Tourne à droite</NativeSelectOption>
                </NativeSelect>
              </Label>
            )}
            {turning && (
              <Label>
                <Checkbox checked={value.jourArrondi} onCheckedChange={(c) => set('jourArrondi', c)} />
                Jour arrondi
              </Label>
            )}
            {int('nbContremarches', 'Nb contremarches (0 = auto)')}
            {turning && int('nbBalancees', 'Marches balancées / côté')}
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <h2 className="mb-1 font-heading text-sm font-medium">Plan — dimensions</h2>
            <div className="mx-auto max-w-2xl">
              <PlanSchema value={value} onChange={onChange} />
            </div>
          </div>
          <div>
            <h2 className="mb-1 font-heading text-sm font-medium">Coupe — niveaux et finitions</h2>
            <div className="mx-auto max-w-2xl">
              <CoupeSchema value={value} onChange={onChange} />
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </LocksContext>
  )
}

export default Saisie
