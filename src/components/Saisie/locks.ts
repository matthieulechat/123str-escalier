import { createContext, useContext } from "react";

// Champs verrouillés contre les fautes de frappe, partagés par tous les champs de la saisie.
export interface Locks {
  isLocked: (k: string) => boolean;
  toggle: (k: string) => void;
}

export const LocksContext = createContext<Locks>({
  isLocked: () => false,
  toggle: () => {},
});

export const useLocks = (): Locks => useContext(LocksContext);
