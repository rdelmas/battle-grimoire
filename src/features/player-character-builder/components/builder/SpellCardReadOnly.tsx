import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { BookOpen, Timer, Ruler, Sparkles, Brain, Clock, ScrollText, Trash2, Sparkle, ChevronDown } from 'lucide-react'
import type { PreparedSpell } from '../../types/character'

interface SpellCardReadOnlyProps {
  spell: PreparedSpell
  onSwitchToCustom: () => void
  onRemove?: () => void
}

/** Badge couleur par école de magie */
function getSchoolBadge(school?: string) {
  const colors: Record<string, string> = {
    abjuration: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    conjuration: 'bg-green-500/20 text-green-400 border-green-500/30',
    divination: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    enchantment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    evocation: 'bg-red-500/20 text-red-400 border-red-500/30',
    illusion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    necromancy: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    transmutation: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }
  const label: Record<string, string> = {
    abjuration: 'Abjuration',
    conjuration: 'Invocation',
    divination: 'Divination',
    enchantment: 'Enchantement',
    evocation: 'Évocation',
    illusion: 'Illusion',
    necromancy: 'Nécromancie',
    transmutation: 'Transmutation',
  }
  const s = (school ?? '').toLowerCase()
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
      colors[s] ?? 'bg-gray-700 text-gray-300 border-gray-600'
    )}>
      <BookOpen className="h-3 w-3" />
      {label[s] ?? school ?? '—'}
    </span>
  )
}

/** Formatage composantes avec matériel */
function formatComponents(components: string, materialComponent?: string) {
  if (materialComponent && materialComponent.trim()) {
    return `${components} (${materialComponent})`
  }
  return components
}

/**
 * Carte de sort en lecture seule (sort SRD sélectionné).
 * Repliable : l'en-tête (nom, niveau, école, SRD) reste visible,
 * les détails (temps, portée, composantes, concentration, durée, rituel, description)
 * sont masqués par défaut et dépliables via le bouton chevron.
 * Le bouton "Changer" permet de rebasculer en mode sélection.
 */
export function SpellCardReadOnly({ spell, onSwitchToCustom, onRemove }: SpellCardReadOnlyProps) {
  const levelLabel = spell.level === 0 ? 'Cantrip' : `Niveau ${spell.level}`
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="p-3 bg-bg-surface border border-border-main rounded-lg">
      {/* === EN-TÊTE (toujours visible) === */}
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 flex items-center gap-2 text-left"
          title={expanded ? 'Replier' : 'Déplier'}
        >
          <ChevronDown className={cn(
            'h-4 w-4 text-text-muted transition-transform flex-shrink-0',
            expanded && 'rotate-180'
          )} />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-text-main truncate">{spell.name}</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap',
              spell.level === 0
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            )}>
              {levelLabel}
            </span>
            {spell.school && getSchoolBadge(spell.school)}
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              SRD 2024
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onSwitchToCustom}
            className="px-2.5 py-1.5 text-text-muted hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-500/10"
            title="Changer de sort"
          >
            <Sparkle className="h-4 w-4" />
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="px-2.5 py-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
              title="Supprimer ce sort"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* === DÉTAILS (repliables) === */}
      {expanded && (
        <div className="mt-3">
          {/* GRILLE 4 COLONNES : Temps | Portée | Composantes | Concentration */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-2.5 bg-bg-base/50 rounded-lg">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Timer className="h-3 w-3" />
                <span>Temps d'incantation</span>
              </span>
              <span className="text-sm font-medium text-text-main">{spell.casting_time}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Ruler className="h-3 w-3" />
                <span>Portée</span>
              </span>
              <span className="text-sm font-medium text-text-main">{spell.range}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Sparkles className="h-3 w-3" />
                <span>Composantes</span>
              </span>
              <span className="text-sm font-medium text-text-main truncate">
                {formatComponents(spell.components, spell.materialComponent)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Brain className="h-3 w-3" />
                <span>Concentration</span>
              </span>
              <span className={cn(
                'text-sm font-medium',
                spell.concentration ? 'text-green-400' : 'text-red-400'
              )}>
                {spell.concentration ? 'OUI' : 'NON'}
              </span>
            </div>
          </div>

          {/* LIGNE MÉTADONNÉES : Durée | Rituel | École */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="h-4 w-4 text-text-muted/50" />
              <span><strong className="text-text-main">Durée :</strong> {spell.duration ?? '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <ScrollText className="h-4 w-4 text-text-muted/50" />
              <span><strong className="text-text-main">Rituel :</strong> {spell.ritual ? 'OUI' : 'NON'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <BookOpen className="h-4 w-4 text-text-muted/50" />
              <span><strong className="text-text-main">École :</strong> {spell.school ?? '—'}</span>
            </div>
          </div>

          {/* DESCRIPTION */}
          {spell.description?.trim() && (
            <div className="mt-3 pt-3 border-t border-border-main/50">
              <div className="whitespace-pre-wrap text-sm text-text-muted leading-relaxed">
                {spell.description}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}