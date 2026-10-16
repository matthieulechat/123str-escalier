import { useMemo, useState } from 'react'
import { computeStair, type StairInput } from './stair.ts'
import Saisie from './components/Saisie/index.tsx'
import Herse from './components/Herse.tsx'
import Results from './components/Results.tsx'
import Plan from './components/Plan.tsx'
import Coupe from './components/Coupe.tsx'
import Detail from './components/Detail.tsx'
import Glossary from './components/Glossary.tsx'

const DEFAULTS: StairInput = {
  type: 'demi',
  sens: 'gauche',
  largeur: 90,
  jour: 20,
  jourArrondi: false,
  volee1: 220,
  volee2: 220,
  nfBas: 0,
  nfHaut: 280,
  finSolBas: 5,
  finSolHaut: 5,
  finMarche: 3,
  finContremarche: 1,
  paillasse: 15,
  dalleHaut: 20,
  nbContremarches: 0,
  nbBalancees: 5,
}

const App = () => {
  const [input, setInput] = useState<StairInput>(DEFAULTS)
  const result = useMemo(() => computeStair(input), [input])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <h1 className="text-lg font-bold">Escalier béton — calcul des dimensions</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 print:hidden"
        >
          Imprimer
        </button>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <Saisie value={input} onChange={setInput} />
        {'error' in result ? (
          <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
            {result.error}
          </p>
        ) : (
          <section className="flex min-w-0 flex-col gap-6">
            <Results r={result} />
            <Herse r={result} />
            <div className="grid gap-6">
              <Plan r={result} />
              <Coupe r={result} />
              <Detail r={result} />
            </div>
            <Glossary />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
