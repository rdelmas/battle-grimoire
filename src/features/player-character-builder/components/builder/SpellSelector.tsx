import { useMemo } from 'react'
import type { PreparedSpell, SpellcastingSource } from '../../types/character'
import { SRD2024_SPELLS } from '@/shared/data/srd2024-spells'

interface SpellSelectorProps {
  spell: PreparedSpell
  source: SpellcastingSource
  characterClass: string
  onChange: (spell: PreparedSpell) => void
}

/**
 * Obtient tous les sorts disponibles pour une source d'incantation
 * (classe, don, race, objet)
 */
function getAvailableSpellsForSource(source: SpellcastingSource, characterClass: string): typeof SRD2024_SPELLS {
  if (source.type === 'class') {
    return SRD2024_SPELLS.filter(spell => 
      spell.classes?.includes(characterClass.toLowerCase())
    )
  }
  if (source.type === 'feat') {
    return SRD2024_SPELLS
  }
  return SRD2024_SPELLS
}

/**
 * Composant sélecteur de sort avec filtre depuis la BDD SRD
 * Remplace la saisie libre par une liste déroulante filtrée
 * Structure alignée sur le composant Select pour cohérence visuelle dans la grille
 */
export function SpellSelector({ 
  spell, 
  source, 
  characterClass, 
  onChange 
}: SpellSelectorProps) {
  const availableSpells = useMemo(
    () => getAvailableSpellsForSource(source, characterClass),
    [source, characterClass]
  )
  
  const filteredSpells = useMemo(
    () => availableSpells.filter(s => s.level === spell.level),
    [availableSpells, spell.level]
  )
  
  const matchedSpell = useMemo(
    () => availableSpells.find(s => s.name.toLowerCase() === spell.name.toLowerCase()),
    [availableSpells, spell.name]
  )
  
  const isCustomSpell = !matchedSpell

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value
    if (selectedName === '__custom__') {
      return
    }
    const selectedSpell = availableSpells.find(s => s.name === selectedName)
    if (selectedSpell) {
      onChange({
        ...spell,
        name: selectedSpell.name,
        level: selectedSpell.level,
        casting_time: selectedSpell.castingTime,
        range: selectedSpell.range,
        components: selectedSpell.components,
        concentration: selectedSpell.concentration,
        description: selectedSpell.description,
      })
    }
  }

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customName = e.target.value
    const matched = availableSpells.find(s => s.name.toLowerCase() === customName.toLowerCase())
    if (matched) {
      onChange({
        ...spell,
        name: matched.name,
        level: matched.level,
        casting_time: matched.castingTime,
        range: matched.range,
        components: matched.components,
        concentration: matched.concentration,
        description: matched.description,
      })
    } else {
      onChange({ ...spell, name: customName })
    }
  }

  // Structure IDENTIQUE au composant Select : wrapper w-full > label + select/input + badge
  // Padding py-2.5 pour alignement parfait avec Select/Input
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-muted mb-1.5">Nom</label>
      <div className="relative">
        {isCustomSpell ? (
          // Mode saisie libre avec datalist pour autocomplétion
          <>
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
          </>
        ) : (
          // Mode sélection depuis la BDD - select natif avec MÊMES classes que Select
          <select
            value={spell.name}
            onChange={handleSelectChange}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-main rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-amber-main focus:border-amber-main appearance-none pr-20"
          >
            <option value="">— Choisir un sort —</option>
            {filteredSpells.map(s => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.school})
              </option>
            ))}
            <option value="__custom__">✏️ Autre (personnalisé)</option>
          </select>
        )}
        
        {/* Indicateur visuel si le sort vient de la BDD - même positionnement */}
        {matchedSpell && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded pointer-events-none">
            ✓ SRD
          </div>
        )}
      </div>
    </div>
  )
}