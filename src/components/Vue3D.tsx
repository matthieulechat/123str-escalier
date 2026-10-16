import { lazy, Suspense, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { StairResult } from "../stair.ts";
import { CollapsibleCard } from "./Section.tsx";

// three.js n'est téléchargé qu'à l'ouverture du volet (le contenu replié n'est pas monté).
const Scene3D = lazy(() => import("./Scene3D.tsx"));

const Vue3D = ({ r }: { r: StairResult }) => {
  const [showFinish, setShowFinish] = useState(true);
  const [showBalanced, setShowBalanced] = useState(true);
  // La 3D suit la saisie avec un léger retard : la reconstruction ne bloque pas chaque frappe.
  const [r3d, setR3d] = useState(r);
  useEffect(() => {
    const t = setTimeout(() => setR3d(r), 200);
    return () => clearTimeout(t);
  }, [r]);

  return (
    <CollapsibleCard
      title="Vue 3D"
      legend={
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>gris : béton brut (marches + paillasse)</span>
          <span>beige : finitions de marche et de contremarche</span>
          <span className="text-sky-700">bleu : marches balancées</span>
          <span>
            Clic-glisser pour tourner, molette pour zoomer, clic droit pour
            déplacer.
          </span>
        </p>
      }
    >
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Label>
          <Checkbox checked={showFinish} onCheckedChange={setShowFinish} />
          Afficher les finitions
        </Label>
        <Label>
          <Checkbox checked={showBalanced} onCheckedChange={setShowBalanced} />
          Marches balancées en bleu
        </Label>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Chargement de la vue 3D…
          </p>
        }
      >
        <Scene3D r={r3d} showFinish={showFinish} showBalanced={showBalanced} />
      </Suspense>
    </CollapsibleCard>
  );
};

export default Vue3D;
