import { useMemo, useState } from "react";
import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { computeStair, type StairInput, type StairResult } from "./stair.ts";
import Saisie from "./components/Saisie/index.tsx";
import Herse from "./components/Herse.tsx";
import Results from "./components/Results.tsx";
import ValuesTable from "./components/ValuesTable.tsx";
import Plan from "./components/Plan.tsx";
import Vue3D from "./components/Vue3D.tsx";
import Coupe from "./components/Coupe.tsx";
import Detail from "./components/Detail.tsx";
import Glossary from "./components/Glossary.tsx";

const DEFAULTS: StairInput = {
  type: "demi",
  sens: "gauche",
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
  dalleBas: 20,
  nbContremarches: 0,
  nbBalancees: 5,
};

const App = () => {
  const [input, setInput] = useState<StairInput>(DEFAULTS);
  const result = useMemo(() => computeStair(input), [input]);
  // Dernier calcul valide (mise à jour pendant le rendu, motif React « état dérivé du précédent »).
  const [lastOk, setLastOk] = useState<StairResult | null>(null);
  if (!("error" in result) && result !== lastOk) setLastOk(result);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="chalk-line flex items-center justify-between bg-background px-6 py-3">
        <h1 className="flex items-center gap-3 font-heading text-lg font-extrabold">
          <img src="/icon.svg" alt="" width={36} height={36} />
          Escalier béton — calcul des dimensions
        </h1>
        <Button onClick={() => window.print()} className="print:hidden">
          <PrinterIcon aria-hidden="true" />
          Imprimer
        </Button>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <Saisie value={input} onChange={setInput} result={lastOk} />
        {"error" in result && (
          <Alert variant="destructive" aria-live="polite">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
        {/* Masqué (pas démonté) pendant une saisie invalide : les volets gardent leur état ouvert/fermé. */}
        {lastOk && (
          <section
            hidden={"error" in result}
            className="flex min-w-0 flex-col gap-6"
          >
            <Results r={lastOk} />
            <Plan r={lastOk} />
            <Vue3D r={lastOk} />
            <ValuesTable r={lastOk} />
            <Herse r={lastOk} />
            <Coupe r={lastOk} />
            <Detail r={lastOk} />
            <Glossary />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
