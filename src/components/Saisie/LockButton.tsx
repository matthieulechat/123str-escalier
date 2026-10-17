import { LockIcon, LockOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocks } from "./locks.ts";

interface LockButtonProps {
  k: string;
  label: string;
}

// Cadenas posé à côté d'une valeur : verrouillée, elle ne peut plus être modifiée.
const LockButton = ({ k, label }: LockButtonProps) => {
  const { isLocked, toggle } = useLocks();
  const locked = isLocked(k);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-2xs"
      aria-pressed={locked}
      aria-label={`${locked ? "Déverrouiller" : "Verrouiller"} ${label}`}
      title={locked ? "Déverrouiller" : "Verrouiller"}
      onClick={() => toggle(k)}
    >
      {locked ? (
        <LockIcon aria-hidden="true" />
      ) : (
        <LockOpenIcon aria-hidden="true" className="opacity-40" />
      )}
    </Button>
  );
};

export default LockButton;
