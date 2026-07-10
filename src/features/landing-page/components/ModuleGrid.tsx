import { 
  Users, 
  Skull, 
  Swords, 
  Hammer,
} from 'lucide-react'
import { ModuleCard } from './ModuleCard'
import type { ModuleCardConfig } from '../types/landing'

const modules: ModuleCardConfig[] = [
  {
    icon: (
      <div className="p-3 bg-amber-main/10 rounded-xl w-fit mb-4 text-amber-main">
        <Hammer className="h-6 w-6" />
      </div>
    ),
    title: 'Encounter Builder',
    description: 'Créez des rencontres équilibrées selon les règles CR 2024. Ajustez la difficulté, le niveau du groupe et la taille du party.',
    actionLabel: 'Nouvelle rencontre',
    actionHref: '/app/rencontres?action=create',
    primary: true,
  },
  {
    icon: (
      <div className="p-3 bg-amber-main/10 rounded-xl w-fit mb-4 text-amber-main">
        <Swords className="h-6 w-6" />
      </div>
    ),
    title: 'Combat Tracker',
    description: 'Suivez l\'initiative, les PV, les conditions et les tours de combat en temps réel. Interface optimisée pour le MJ.',
    actionLabel: 'Ouvrir le tracker',
    actionHref: '/app/combat-tracker',
  },
  {
    icon: (
      <div className="p-3 bg-amber-main/10 rounded-xl w-fit mb-4 text-amber-main">
        <Users className="h-6 w-6" />
      </div>
    ),
    title: 'Personnage Builder',
    description: 'Créez et gérez vos PJ avec calcul automatique des bonus, sorts, équipement et progression de niveau.',
    actionLabel: 'Créer un PJ',
    actionHref: '/app/personnages?action=create',
  },
  {
    icon: (
      <div className="p-3 bg-amber-main/10 rounded-xl w-fit mb-4 text-amber-main">
        <Skull className="h-6 w-6" />
      </div>
    ),
    title: 'Bestiaire',
    description: 'Accédez à une base de données de monstres officiels. Filtrez par CR, type, environnement et ajoutez vos créatures custom.',
    actionLabel: 'Explorer le bestiaire',
    actionHref: '/app/bestiaire',
  },
]

export function ModuleGrid() {
  return (
    <section className="py-16 px-6" aria-labelledby="modules-title">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h2 id="modules-title" className="font-serif text-3xl md:text-4xl font-bold text-text-main mb-4">
            Modules Disponibles
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Quatre outils intégrés pour couvrir tout le cycle de vie de vos combats, de la préparation à l'exécution.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>
    </section>
  )
}