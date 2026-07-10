import { ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/shared/components/ui'
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/utils/cn'
import type { ModuleCardConfig } from '../types/landing'

export function ModuleCard({ icon, title, description, actionLabel, actionHref, primary = false }: ModuleCardConfig) {
  return (
    <Card className={cn('overflow-hidden h-full flex flex-col transition-all duration-300', primary && 'ring-2 ring-amber-main/30')} hover>
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="p-3 bg-amber-main/10 rounded-xl w-fit mb-4 text-amber-main">
          {icon}
        </div>
        <h3 className="font-serif text-xl font-semibold text-text-main mb-2">{title}</h3>
        <p className="text-text-muted text-base leading-relaxed flex-1">{description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <a href={actionHref}>
          <Button
            variant={primary ? 'primary' : 'secondary'}
            size="md"
            className="w-full justify-center gap-2"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </a>
        {primary && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber-main/70">
            <Sparkles className="h-3 w-3" />
            <span>Recommandé</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}