import { Link } from 'react-router-dom'
import { Target, Clock, Users, ChevronRight, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, Badge } from '@/shared/components/ui'
import { useLibraryStats } from '../hooks/useLibraryStats'
import { cn } from '@/shared/utils/cn'

const difficultyConfig = {
  easy: { label: 'Facile', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  medium: { label: 'Moyen', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  hard: { label: 'Difficile', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  deadly: { label: 'Mortel', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
} as const

// Mock data for now - will be replaced with real data from storage
const mockRecentEncounters = [
  {
    id: 'enc-1',
    name: 'Embuscade Gobelins',
    difficulty: 'medium' as const,
    updatedAt: Date.now() - 86400000,
    monsterCount: 6,
  },
  {
    id: 'enc-2',
    name: 'Dragon Rouge Adulte',
    difficulty: 'deadly' as const,
    updatedAt: Date.now() - 172800000,
    monsterCount: 1,
  },
]

export function QuickResume() {
  const { stats, loading } = useLibraryStats()

  const hasData = stats.totalEncounters > 0
  const recentEncounters = hasData ? [] : mockRecentEncounters // Use mock when no real data

  if (loading) {
    return (
      <section className="py-16 px-6" aria-labelledby="quick-resume-title">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <h2 id="quick-resume-title" className="font-serif text-2xl font-bold text-text-main">
              Reprise Rapide
            </h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-32 bg-bg-surface rounded mb-4" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-bg-surface rounded-full" />
                    <div className="h-4 w-20 bg-bg-surface rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-6" aria-labelledby="quick-resume-title">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h2 id="quick-resume-title" className="font-serif text-2xl font-bold text-text-main">
            Reprise Rapide
          </h2>
          <Link
            to="/app/rencontres"
            className="text-sm text-amber-main hover:text-amber-dark font-medium flex items-center gap-1 transition-colors"
          >
            Voir toutes <ChevronRight className="h-4 w-4" />
          </Link>
        </header>

        {recentEncounters.length === 0 ? (
          <Card className="text-center py-12 px-6">
            <CardContent>
              <Target className="h-12 w-12 mx-auto text-text-dark mb-4" />
              <h3 className="font-serif text-xl font-semibold text-text-main mb-2">
                Aucune rencontre récente
              </h3>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                Commencez par créer votre première rencontre pour la retrouver ici.
              </p>
              <Link to="/app/rencontres?action=create">
                <button className="inline-flex items-center gap-2 px-6 py-2 bg-amber-main text-bg-main font-semibold rounded-lg hover:bg-amber-dark transition-colors">
                  <PlusCircle className="h-4 w-4" />
                  Créer une rencontre
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEncounters.map((encounter) => {
              const diff = difficultyConfig[encounter.difficulty]
              const date = new Date(encounter.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <Card key={encounter.id} hover className={cn('group', diff.border)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg font-semibold text-text-main truncate">
                          {encounter.name}
                        </h3>
                        <p className="text-text-muted text-sm mt-1">
                          {encounter.monsterCount} créature{encounter.monsterCount > 1 ? 's' : ''} • {date}
                        </p>
                      </div>
                      <Badge variant="difficulty" className={cn(diff.bg, diff.color)}>
                        {diff.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 pt-3 border-t border-border-main">
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Clock className="h-4 w-4" />
                        <span>Dernière mise à jour</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Users className="h-4 w-4" />
                        <span>{encounter.monsterCount} participants</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Link
                      to={`/app/combat-tracker?encounter=${encounter.id}`}
                      className="w-full"
                    >
                      <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-main text-bg-main font-semibold rounded-lg hover:bg-amber-dark transition-colors group">
                        Charger le combat
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}