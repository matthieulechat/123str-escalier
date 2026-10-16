import type { StairInput } from '../../stair.ts'
import PlanSchema from './PlanSchema.tsx'
import CoupeSchema from './CoupeSchema.tsx'
import type { SaisieProps } from './types.ts'

const SELECT = 'rounded border border-slate-300 px-2 py-1 text-sm'

const Saisie = ({ value, onChange }: SaisieProps) => {
  const turning = value.type !== 'droit'
  const set = <K extends keyof StairInput>(k: K, v: StairInput[K]) => onChange({ ...value, [k]: v })
  const int = (k: 'nbContremarches' | 'nbBalancees', label: string) => (
    <label htmlFor={k} className="flex items-center gap-1 text-sm">
      {label}
      <input
        id={k}
        type="number"
        min={0}
        value={value[k]}
        onChange={(e) => set(k, e.target.valueAsNumber || 0)}
        className="w-16 rounded border border-slate-300 px-1 py-1 text-right"
      />
    </label>
  )

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3" aria-label="Saisie de l'escalier">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <label htmlFor="type" className="flex items-center gap-1 text-sm">
          Type
          <select id="type" value={value.type} onChange={(e) => set('type', e.target.value as StairInput['type'])} className={SELECT}>
            <option value="droit">Droit</option>
            <option value="quart">Quart tournant</option>
            <option value="demi">Demi tournant</option>
          </select>
        </label>
        {turning && (
          <label htmlFor="sens" className="flex items-center gap-1 text-sm">
            Sens
            <select id="sens" value={value.sens} onChange={(e) => set('sens', e.target.value as StairInput['sens'])} className={SELECT}>
              <option value="gauche">Tourne à gauche</option>
              <option value="droite">Tourne à droite</option>
            </select>
          </label>
        )}
        {turning && (
          <label htmlFor="jourArrondi" className="flex items-center gap-1 text-sm">
            <input id="jourArrondi" type="checkbox" checked={value.jourArrondi} onChange={(e) => set('jourArrondi', e.target.checked)} />
            Jour arrondi
          </label>
        )}
        {int('nbContremarches', 'Nb contremarches (0 = auto)')}
        {turning && int('nbBalancees', 'Marches balancées / côté')}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-1 text-sm font-semibold">Plan — dimensions</h2>
          <div className="mx-auto max-w-2xl">
            <PlanSchema value={value} onChange={onChange} />
          </div>
        </div>
        <div>
          <h2 className="mb-1 text-sm font-semibold">Coupe — niveaux et finitions</h2>
          <div className="mx-auto max-w-2xl">
            <CoupeSchema value={value} onChange={onChange} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Saisie
