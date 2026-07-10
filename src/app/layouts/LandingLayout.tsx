import { Outlet, Link } from 'react-router-dom'
import { BookOpen, Sparkles, Users, Skull, Hammer, Swords, Power } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const navItems = [
  { name: 'Personnages', href: '/app/personnages', icon: Users },
  { name: 'Bestiaire', href: '/app/bestiaire', icon: Skull },
  { name: 'Rencontres', href: '/app/rencontres', icon: Hammer },
  { name: 'Combat Tracker', href: '/app/combat-tracker', icon: Swords },
]

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-bg-main font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-main/70 backdrop-blur-md border-b border-border-main">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Battle Grimoire - Accueil">
            <div className="p-2 bg-amber-main/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-amber-main" />
            </div>
            <span className="font-serif text-xl font-bold text-text-main tracking-tight">
              Battle Grimoire
            </span>
          </Link>
          
          {/* Quick navigation buttons */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Navigation rapide">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-muted',
                  'hover:text-text-main hover:bg-bg-card rounded-lg transition-colors duration-200',
                  'focus-ring'
                )}
                title={item.name}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider bg-amber-main/10 text-amber-main rounded-full hidden sm:inline-flex">
              D&D 2024 READY
            </span>
            <Sparkles className="h-5 w-5 text-amber-main/50" />
          {/* Quit button */}
            <button
              id="quit-app"
              className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200 focus-ring"
              aria-label="Quitter l'application"
              title="Quitter"
              onClick={() => window.api?.app?.quit()}
            >
              <Power className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-main bg-bg-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-text-muted text-sm">
            Battle Grimoire - Outil de gestion de combats pour D&D 5.5e (2024)
          </p>
          <p className="text-text-dark text-xs mt-1">
            Non affilié à Wizards of the Coast. Contenu communautaire.
          </p>
        </div>
      </footer>
    </div>
  )
}
