import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Skull, 
  Swords, 
  Hammer,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Power,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, external: true },
  { name: 'Personnages', href: '/app/personnages', icon: Users },
  { name: 'Bestiaire', href: '/app/bestiaire', icon: Skull },
  { name: 'Rencontres', href: '/app/rencontres', icon: Hammer },
  { name: 'Combat Tracker', href: '/app/combat-tracker', icon: Swords },
]

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg-main font-sans flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-bg-surface border-r border-border-main transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Navigation principale"
      >
        {/* Brand */}
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-border-main', sidebarCollapsed && 'justify-center')}>
          <Link to="/" className={cn('flex items-center gap-3 transition-opacity', sidebarCollapsed && 'opacity-0 pointer-events-none w-0')}>
            <div className="p-2 bg-amber-main/10 rounded-lg flex-shrink-0">
              <BookOpen className="h-6 w-6 text-amber-main" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-main">
              BATTLE GRIMOIRE
            </span>
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn('p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-card transition-colors flex-shrink-0', sidebarCollapsed && 'ml-auto')}
            aria-label={sidebarCollapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" role="navigation" aria-label="Menu principal">
          {navigation.map((item) => {
            const isActive = item.external 
              ? location.pathname === item.href 
              : location.pathname.startsWith(item.href)
            const isExternal = item.external

            return (
              <Link
                key={item.name}
                to={item.href}
                target={isExternal ? '_self' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'focus-ring',
                  isActive
                    ? 'bg-amber-main/10 text-amber-main font-medium'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-card',
                  sidebarCollapsed && 'justify-center px-0'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className={cn('p-4 border-t border-border-main', sidebarCollapsed && 'hidden')}>
          <p className="text-xs text-text-dark text-center mb-4">
            Battle Grimoire v0.1.0
          </p>
          
          {/* Quit button */}
          <button
            id="quit-app-sidebar"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200 focus-ring"
            aria-label="Quitter l'application"
            title="Quitter"
            onClick={() => window.api?.app?.quit()}
          >
            <Power className="h-4 w-4" aria-hidden="true" />
            <span>Quitter</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main
        className={cn(
          'flex-1 min-h-screen overflow-auto transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
        role="main"
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}