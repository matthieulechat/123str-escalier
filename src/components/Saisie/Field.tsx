import type { NumKey, SaisieProps } from './types.ts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LockButton from './LockButton.tsx'
import { useLocks } from './locks.ts'

interface FieldProps extends SaisieProps {
  k: NumKey
  label: string
  x: number // position en % de la largeur du schéma
  y: number // position en % de la hauteur du schéma
  step?: number
}

// Champ de saisie posé directement sur le schéma.
const Field = ({ k, label, x, y, step = 1, value, onChange }: FieldProps) => {
  const locked = useLocks().isLocked(k)
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded bg-background px-1 shadow-sm ring-1 ring-violet-200"
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
          disabled={locked}
          value={value[k]}
          onChange={(e) => onChange({ ...value, [k]: e.target.valueAsNumber || 0 })}
          className="w-12 text-right"
        />
        cm
        <LockButton k={k} label={label} />
      </span>
    </div>
  )
}

export default Field
