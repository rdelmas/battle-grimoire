import { useMemo, useState } from 'react'
import type { PreparedSpell, SpellcastingSource } from '../../types/character'
import { SRD2024_SPELLS } from '@/shared/data/srd2024-spells'
import { SpellCardReadOnly } from './SpellCardReadOnly'

interface SpellSelectorProps {
  spell: PreparedSpell
  source: SpellcastingSource
  characterClass: string
  onChange: (spell: PreparedSpell) => void
  onSwitchToCustom?: () => void
  cantripOnly?: boolean
}

/**
 * Obtient tous les sorts disponibles pour une source d'incantation
 * selon la mécanique D&D 2024 et le niveau du sort
 */
function getAvailableSpellsForSource(
  source: SpellcastingSource,
  characterClass: string,
  cantripOnly: boolean
): typeof SRD2024_SPELLS {
  let base: typeof SRD2024_SPELLS

  if (source.type === 'class') {
    base = SRD2024_SPELLS.filter(spell =>
      spell.classes?.includes(characterClass.toLowerCase())
    )
  } else {
    base = SRD2024_SPELLS
  }

  // Filtrer par niveau : cantrips (level 0) ou sorts (level > 0)
  return base.filter(spell => cantripOnly ? spell.level === 0 : spell.level > 0)
}

/**
 * Sélecteur de sort avec deux modes :
 * - Mode "fiche SRD" (lecture seule) quand un sort officiel est sélectionné
 * - Mode saisie (select + datalist) pour choisir un sort ou un sort personnalisé
 */
export function SpellSelector({
  spell,
  source,
  characterClass,
  onChange,
  onSwitchToCustom,
  cantripOnly = false,
}: SpellSelectorProps) {
  const availableSpells = useMemo(
    () => getAvailableSpellsForSource(source, characterClass, cantripOnly),
    [source, characterClass, cantripOnly]
  )

  const filteredSpells = useMemo(
    () => availableSpells.filter(s => s.level === spell.level),
    [availableSpells, spell.level]
  )

  const matchedSpell = useMemo(
    () => availableSpells.find(s => s.name.toLowerCase() === spell.name.toLowerCase()),
    [availableSpells, spell.name]
  )

  // Mode lecture seule si le sort vient de la BDD SRD
  const isFromSRD = spell.isFromSRD === true && !!matchedSpell
  const [isCustomMode, setIsCustomMode] = useState(!isFromSRD)

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customName = e.target.value
    const matched = availableSpells.find(s => s.name.toLowerCase() === customName.toLowerCase())
    if (matched) {
      setIsCustomMode(false)
      onChange({
        ...spell,
        name: matched.name,
        level: matched.level,
        casting_time: matched.castingTime,
        range: matched.range,
        components: matched.components,
        concentration: matched.concentration,
        description: matched.description,
        duration: matched.duration,
        ritual: matched.ritual,
        school: matched.school,
        materialComponent: matched.materialComponent,
        isFromSRD: true,
        srdId: matched.id,
      })
    } else {
      onChange({ ...spell, name: customName, isFromSRD: false, srdId: undefined })
    }
  }

  const handleSwitchToCustom = () => {
    setIsCustomMode(true)
    onSwitchToCustom?.()
  }

  // Mode affichage fiche SRD (lecture seule)
  if (!isCustomMode && isFromSRD && matchedSpell) {
    return (
      <div className="w-full">
        <SpellCardReadOnly
          spell={{
            ...spell,
            casting_time: matchedSpell.castingTime,
            range: matchedSpell.range,
            components: matchedSpell.components,
            concentration: matchedSpell.concentration,
            description: matchedSpell.description,
            duration: matchedSpell.duration,
            ritual: matchedSpell.ritual,
            school: matchedSpell.school,
            materialComponent: matchedSpell.materialComponent,
          }}
          onSwitchToCustom={handleSwitchToCustom}
        />
      </div>
    )
  }

  // Mode saisie libre avec datalist pour autocomplétion
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-muted mb-1.5">Nom</label>
      <div className="relative">
        <input
          type="text"
          list={`spell-suggestions-${spell.level}`}
          value={spell.name}
          onChange={handleCustomInputChange}
          placeholder="Nom du sort"
          className="w-full px-3 py-2.5 bg-bg-surface border border-border-main rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 pr-20"
        />
        <datalist id={`spell-suggestions-${spell.level}`}>
          {filteredSpells.map(s => (
            <option key={s.name} value={s.name} />
          ))}
          <option value="__custom__">✏️ Autre (personnalisé)</option>
        </datalist>

        {/* Indicateur visuel si le sort vient de la BDD */}
        {matchedSpell && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded pointer-events-none">
            ✓ SRD
          </div>
        )}
      </div>
    </div>
  )
}