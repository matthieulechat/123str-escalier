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
  vertical?: 'left' | 'right' // tourné à la verticale, posé de ce côté du point (bord collé à la cote)
}

// Champ de saisie posé directement sur le schéma.
const Field = ({ k, label, x, y, step = 1, vertical, value, onChange }: FieldProps) => {
  const locked = useLocks().isLocked(k)
  return (
    <div
      className="absolute flex flex-col items-center rounded bg-blue-50 px-1 shadow-sm ring-1 ring-blue-200"
      // Vertical : après la rotation, un décalage de ±50 % de sa hauteur le pousse à gauche / à droite du point, sans recouvrir le dessin.
      style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%)${vertical ? ` rotate(-90deg) translateY(${vertical === 'left' ? -50 : 50}%)` : ''}` }}
    >
      <Label htmlFor={k} className="text-[11px] leading-tight whitespace-nowrap text-blue-800">
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
