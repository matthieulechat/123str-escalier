import type { ReactNode } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface FigureCardProps {
  title: string
  legend?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export const FigureCard = ({ title, legend, action, children }: FigureCardProps) => (
  <Card role="figure" aria-label={title}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {action && <CardAction>{action}</CardAction>}
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      {children}
      {legend && <div className="text-xs text-muted-foreground">{legend}</div>}
    </CardContent>
  </Card>
)

interface CollapsibleCardProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export const CollapsibleCard = ({ title, defaultOpen = false, children }: CollapsibleCardProps) => (
  <Card size="sm">
    <Collapsible defaultOpen={defaultOpen}>
      <div className="px-(--card-spacing)">
        <CollapsibleTrigger render={<Button variant="ghost" className="w-full justify-between" />}>
          {title}
          <ChevronDownIcon aria-hidden="true" className="transition-transform in-data-[panel-open]:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <CardContent className="pt-2">{children}</CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
)
