import { Button } from "@/components/ui/button";
import { rotate } from "../svg.ts";
import type { Pt, StairResult } from "../../stair.ts";

const ROTATIONS = [0, 90, 180, 270];

// Pictogramme d'une ligne de foulée (repère écran, Y vers le bas), cadrée dans 24 × 24, flèche = montée.
// `rotation` : degrés sens trigo à l'œil, comme `view` dans dxf.ts.
export const StairGlyph = ({
  pts,
  rotation = 0,
  id,
}: {
  pts: Pt[];
  rotation?: number;
  id: string;
}) => {
  const rot = pts.map((p) => rotate(p, rotation));
  const xs = rot.map((p) => p.x);
  const ys = rot.map((p) => p.y);
  const [x0, y0, w, h] = [
    Math.min(...xs),
    Math.min(...ys),
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
  ];
  const k = 16 / Math.max(w, h, 1e-9);
  const d = rot
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${12 - (w * k) / 2 + (p.x - x0) * k},${12 - (h * k) / 2 + (p.y - y0) * k}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <defs>
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX={6}
          refY={5}
          markerWidth={3}
          markerHeight={3}
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        markerEnd={`url(#${id})`}
      />
    </svg>
  );
};

// Un bouton par orientation du plan dans l'export DXF : le dessinateur choisit celle qui colle au plan archi.
const Orientation = ({ r, value, onChange }: { r: StairResult; value: number; onChange: (a: number) => void }) => {
  const flip = r.input.sens === 'gauche' ? -1 : 1
  const pts = r.fouleeLine.map((p) => ({ x: p.x, y: flip * p.y }))
  return (
    <div className="flex items-center gap-1 text-sm font-medium" role="group" aria-label="Orientation du plan dans l'export DXF">
      <span className="mr-1">Orientation</span>
      {ROTATIONS.map((a) => (
        <Button
          key={a}
          variant={value === a ? 'default' : 'outline'}
          size="icon"
          aria-pressed={value === a}
          onClick={() => onChange(a)}
          title={`Plan tourné de ${a}° dans l'export DXF (flèche = sens de montée)`}
          aria-label={`Plan tourné de ${a}°`}
        >
          <StairGlyph pts={pts} rotation={a} id={`orientation-arrow-${a}`} />
        </Button>
      ))}
    </div>
  )
}

export default Orientation
