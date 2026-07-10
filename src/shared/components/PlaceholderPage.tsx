import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Hammer, Skull, Swords, Users } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui'
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/utils/cn'

interface PlaceholderPageProps {
  name: string
}

const pageIcons: Record<string, React.ReactNode> = {
  Personnages: <Users className="h-8 w-8" />,
  Bestiaire: <Skull className="h-8 w-8" />,
  Rencontres: <Hammer className="h-8 w-8" />,
  'Combat Tracker': <Swords className="h-8 w-8" />,
}

const pageDescriptions: Record<string, string> = {
  Personnages: 'Créez et gérez vos personnages joueurs avec calcul automatique des bonus, sorts, équipement et progression de niveau.',
  Bestiaire: 'Accédez à une base de données complète de monstres officiels. Filtrez par CR, type, environnement et créez vos créatures personnalisées.',
  Rencontres: 'Construisez des rencontres équilibrées selon les règles CR 2024. Ajustez la difficulté, le niveau du groupe et la taille du party.',
  'Combat Tracker': "Suivez l'initiative, les PV, les conditions et les tours de combat en temps réel. Interface optimisée pour le MJ.",
}

const pageFeatures: Record<string, string[]> = {
  Personnages: ['Générateur de PJ guidé', 'Calcul automatique des bonus', 'Gestion des sorts et emplacements', 'Progression de niveau (1-20)', 'Export feuille de personnage'],
  Bestiaire: ['Monstres officiels SRD 5.5e', 'Filtres avancés (CR, type, taille)', 'Créatures personnalisées', 'Templates de monstres', 'Import/Export JSON'],
  Rencontres: ['Calculateur de difficulté CR 2024', 'Ajustement taille du party', 'Budget XP automatique', 'Rencontres prédéfinies', 'Export vers Combat Tracker'],
  'Combat Tracker': ["Suivi d'initiative en temps réel", 'Gestion PV/conditions/buffs', 'Tours de combat automatisés', 'Raccourcis clavier MJ', 'Journal de combat'],
}

export function PlaceholderPage({ name }: PlaceholderPageProps) {
  const icon = pageIcons[name] || <Hammer className="h-8 w-8" />
  const description = pageDescriptions[name] || 'Fonctionnalité en cours de développement.'
  const features = pageFeatures[name] || ['En développement...']

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <header className="mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-amber-main transition-colors mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour au tableau de bord
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-main/10 rounded-xl text-amber-main">
            {icon}
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-main">{name}</h1>
            <p className="text-text-muted mt-2 max-w-2xl">{description}</p>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="mb-12" aria-labelledby="features-title">
        <h2 id="features-title" className="font-serif text-2xl font-semibold text-text-main mb-6">
          Fonctionnalités prévues
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} hover className="group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn(
                  'p-2 rounded-lg transition-all duration-300 group-hover:scale-110',
                  'bg-amber-main/10 text-amber-main'
                )}>
                  <ChevronRight className="h-5 w-5" />
                </div>
                <span className="text-text-main font-medium">{feature}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Card className="bg-bg-surface/50 border-amber-main/20">
          <CardContent className="p-8">
            <p className="text-text-muted mb-6 max-w-xl mx-auto">
              Cette fonctionnalité est en cours de développement. L'architecture est prête :
              IndexedDB configuré, IPC opérationnel, routing en place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button variant="primary" size="lg">← Retour à l'accueil</Button>
              </Link>
              <Link to="/app/personnages">
                <Button variant="secondary" size="lg">Voir les Personnages →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}