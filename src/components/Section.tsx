import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleCardProps {
  title: string;
  legend?: ReactNode;
  // Reste visible quand la carte est repliée (ex. bouton d'export).
  action?: ReactNode;
  defaultOpen?: boolean;
  // Nom de la zone pour les lecteurs d'écran : la carte devient un repère navigable.
  regionLabel?: string;
  children: ReactNode;
}

export const CollapsibleCard = ({
  title,
  legend,
  action,
  defaultOpen = false,
  regionLabel,
  children,
}: CollapsibleCardProps) => (
  <Card
    size="sm"
    role={regionLabel ? "region" : undefined}
    aria-label={regionLabel}
  >
    <Collapsible defaultOpen={defaultOpen}>
      <div className="flex items-center gap-2 px-(--card-spacing)">
        <CollapsibleTrigger
          render={<Button variant="ghost" className="flex-1 justify-between" />}
        >
          {title}
          <ChevronDownIcon
            aria-hidden="true"
            className="transition-transform in-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        {action}
      </div>
      <CollapsibleContent>
        <CardContent className="flex flex-col gap-2 pt-2">
          {children}
          {legend && (
            <div className="text-xs text-muted-foreground">{legend}</div>
          )}
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
);
