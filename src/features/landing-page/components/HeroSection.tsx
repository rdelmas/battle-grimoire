import { Sparkles, BookOpen, Shield, Database } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 px-6">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-magic-glow pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-main animate-pulse" />
            <span className="text-sm font-medium text-amber-main uppercase tracking-wider">
              D&D 2024 READY
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-main mb-6 animate-slide-up">
          Le <span className="text-amber-main">Grimoire</span> Tactique
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          L'outil ultime pour préparer, suivre et gérer vos combats de 
          <span className="font-medium text-text-main">Donjons & Dragons 5.5e (2024)</span>.
          Créez des rencontres équilibrées, suivez l'initiative et gérez vos PJ comme un maître.
        </p>

        {/* Trust indicators / Feature highlights */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-text-dark text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Compatible D&D 5.5e (2024)</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-main" />
            <span>Règles officielles intégrées</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Données 100% locales (IndexedDB)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
