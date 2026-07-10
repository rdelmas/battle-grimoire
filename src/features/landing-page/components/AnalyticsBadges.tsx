import { Users, BookOpen, Target } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui'
import { useLibraryStats } from '../hooks/useLibraryStats'
import { cn } from '@/shared/utils/cn'

const statCards = [
  { key: 'totalPCs', label: 'Héros créés', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { key: 'totalMonsters', label: 'Monstres archivés', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { key: 'totalEncounters', label: 'Rencontres préparées', icon: Target, color: 'text-amber-400', bg: 'bg-amber-400/10' },
] as const

export function AnalyticsBadges() {
  const { stats, loading } = useLibraryStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-6">
        {statCards.map((card) => (
          <Card key={card.key} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('p-3 rounded-xl', card.bg)}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-bg-surface rounded animate-pulse" />
                  <div className="h-3 w-16 bg-bg-surface rounded mt-2 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-6">
      {statCards.map((card) => (
        <Card key={card.key} hover className="group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-xl transition-all duration-300 group-hover:scale-110', card.bg)}>
                <card.icon className={cn('h-6 w-6', card.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-muted text-sm font-medium">{card.label}</p>
                <p className="font-serif text-2xl font-bold text-text-main mt-1">
                  {stats[card.key as keyof typeof stats]?.toLocaleString() ?? '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}