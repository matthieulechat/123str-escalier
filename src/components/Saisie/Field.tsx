import type { NumKey, SaisieProps } from './types.ts'

interface FieldProps extends SaisieProps {
  k: NumKey
  label: string
  x: number // position en % de la largeur du schéma
  y: number // position en % de la hauteur du schéma
  step?: number
}

// Champ de saisie posé directement sur le schéma.
const Field = ({ k, label, x, y, step = 1, value, onChange }: FieldProps) => (
  <label
    htmlFor={k}
    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded bg-white/90 px-1 text-[11px] leading-tight text-violet-700 shadow-sm ring-1 ring-violet-200"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    {label}
    <span className="flex items-center gap-0.5">
      <input
        id={k}
        type="number"
        step={step}
        value={value[k]}
        onChange={(e) => onChange({ ...value, [k]: e.target.valueAsNumber || 0 })}
        className="w-16 rounded border border-violet-300 px-1 py-0.5 text-right text-sm text-slate-900"
      />
      <span className="text-slate-500">cm</span>
    </span>
  </label>
)

export default Field
