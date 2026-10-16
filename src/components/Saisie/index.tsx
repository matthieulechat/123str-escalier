import type { StairInput } from '../../stair.ts'
import PlanSchema from './PlanSchema.tsx'
import CoupeSchema from './CoupeSchema.tsx'
import type { SaisieProps } from './types.ts'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

const Saisie = ({ value, onChange }: SaisieProps) => {
  const turning = value.type !== 'droit'
  const set = <K extends keyof StairInput>(k: K, v: StairInput[K]) => onChange({ ...value, [k]: v })
  const int = (k: 'nbContremarches' | 'nbBalancees', label: string) => (
    <Label htmlFor={k}>
      {label}
      <Input id={k} type="number" min={0} value={value[k]} onChange={(e) => set(k, e.target.valueAsNumber || 0)} className="w-16 text-right" />
    </Label>
  )

  return (
    <Card size="sm" role="region" aria-label="Saisie de l'escalier">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
      </CardContent>
    </Card>
  )
}

export default Saisie
