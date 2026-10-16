import type { NumKey, SaisieProps } from './types.ts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FieldProps extends SaisieProps {
  k: NumKey
  label: string
  x: number // position en % de la largeur du schéma
  y: number // position en % de la hauteur du schéma
  step?: number
}

// Champ de saisie posé directement sur le schéma.
const Field = ({ k, label, x, y, step = 1, value, onChange }: FieldProps) => (
  <div
    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded bg-background/90 px-1 shadow-sm ring-1 ring-violet-200"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <Label htmlFor={k} className="text-[11px] leading-tight text-violet-700">
      {label}
    </Label>
    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
      <Input
        id={k}
        type="number"
        size="sm"
        step={step}
        value={value[k]}
        onChange={(e) => onChange({ ...value, [k]: e.target.valueAsNumber || 0 })}
        className="w-16 text-right"
      />
      cm
    </span>
  </div>
)

export default Field
