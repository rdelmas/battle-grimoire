import { 
  Sparkles, Sword, BookOpen, 
  Brain, Star, Shield, Wrench, Wand2
} from 'lucide-react'
import { getClassIcon } from '../utils/classIcons'
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import type { PlayerCharacter, SkillName, SpellcastingSource } from '../types/character'
import { 
  useCharacterCalculations, 
  useInitiative, 
  usePassivePerception,
  useAllSavingThrowModifiers,
  useAllSkillModifiers,
  useIsSpellcaster,
} from '../hooks/useCharacterCalculations'
import { 
  WEAPON_MASTERY_LABELS,
  ALL_SKILLS,
  ALL_ABILITIES,
} from '../types/character'
import { cn } from '@/shared/utils/cn'
import { 
  createPrimarySpellcastingSource,
  combineSpellSlots,
  getSpellSaveDC,
  getSpellAttackBonus,
  getMaxPreparedSpellsForSource,
} from '../utils/spellcasting'

interface CharacterPreviewProps {
  character: PlayerCharacter
}

export function CharacterPreview({ character }: CharacterPreviewProps) {
  const calculations = useCharacterCalculations(character)
  const savingThrows = useAllSavingThrowModifiers(character)
  const skillModifiers = useAllSkillModifiers(character)
  const isSpellcaster = useIsSpellcaster(character)
  const initiative = useInitiative(character)
  const passivePerception = usePassivePerception(character)

  const proficiencyBonus = calculations.abilities.proficiencyBonus
  const abilityModifiers = calculations.abilities.modifiers

  // Format modifier with sign
  const fmtMod = (mod: number) => `${mod >= 0 ? '+' : ''}${mod}`

  // Get skill display name
  const getSkillLabel = (skill: SkillName): string => {
    const labels: Record<SkillName, string> = {
      acrobatics: 'Acrobaties',
      animal_handling: 'Dressage',
      arcana: 'Arcanes',
      athletics: 'Athlétisme',
      deception: 'Tromperie',
      history: 'Histoire',
      insight: 'Perspicacité',
      intimidation: 'Intimidation',
      investigation: 'Investigation',
      medicine: 'Médecine',
      nature: 'Nature',
      perception: 'Perception',
      performance: 'Représentation',
      persuasion: 'Persuasion',
      religion: 'Religion',
      sleight_of_hand: 'Prestidigitation',
      stealth: 'Discrétion',
      survival: 'Survie',
    }
    return labels[skill]
  }

  // Get ability display name
  const getAbilityLabel = (ability: keyof typeof abilityModifiers): string => {
    const labels = { str: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'SAG', cha: 'CHA' }
    return labels[ability]
  }

  // Get saving throw proficiency
  const isSaveProficient = (ability: keyof typeof savingThrows) => 
    character.saving_throw_proficiencies.includes(ability)

  return (
    <div className="space-y-6">
      {/* En-tête : Identité + Vitals principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-bg-surface border-amber-main/30">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {(() => {
                const Icon = getClassIcon(character.class_name)
                return <Icon className="h-6 w-6 text-amber-main" />
              })()}
            </div>
            <div className="text-2xl font-bold text-text-main font-serif">{character.character_name}</div>
            <div className="text-sm text-text-muted mt-1">
              Niveau {character.level} • {character.species} {character.class_name}
              {character.subclass_name && ` (${character.subclass_name})`}
            </div>
            <div className="text-xs text-text-dark mt-2">Joueur: {character.player_name}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">PV Max</div>
            <div className="text-3xl font-bold text-red-500 font-serif">{character.hit_points_max}</div>
            <div className="text-xs text-text-dark mt-1">CA: {character.armor_class}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Initiative</div>
            <div className="text-3xl font-bold text-yellow-500 font-serif">{fmtMod(initiative)}</div>
            <div className="text-xs text-text-dark mt-1">Vitesse: {character.speed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Perception Passive</div>
            <div className="text-3xl font-bold text-purple-500 font-serif">{passivePerception}</div>
            <div className="text-xs text-text-dark mt-1">Maîtrise: +{proficiencyBonus}</div>
          </CardContent>
        </Card>
      </div>

      {/* Jets de Sauvegarde */}
      <Card>
        <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-main" />
            Jets de Sauvegarde
          </h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {ALL_ABILITIES.map(ability => {
              const mod = savingThrows[ability]
              const proficient = isSaveProficient(ability)
              return (
                <div
                  key={ability}
                  className={cn(
                    'p-3 rounded-lg text-center transition-colors',
                    proficient 
                      ? 'bg-amber-main/10 border border-amber-main/30' 
                      : 'bg-bg-surface border border-border-main'
                  )}
                >
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                    {getAbilityLabel(ability)}
                    {proficient && <span className="ml-1 text-amber-main">●</span>}
                  </div>
                  <div className="text-2xl font-bold text-text-main font-serif">{fmtMod(mod)}</div>
                  <div className="text-xs text-text-dark">mod: {fmtMod(abilityModifiers[ability])}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compétences (grille 2 colonnes) */}
      <Card>
        <CardHeader className="pb-2">
          <h4 className="font-semibold text-text-main flex items-center gap-2">
            <Brain className="h-5 w-5 text-amber-main" />
            Compétences (D&D 2024)
          </h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {ALL_SKILLS.map(skill => {
              const mod = skillModifiers[skill]
              const proficiency = character.skills[skill]
              const profLabels = { none: '', proficient: 'M', expertise: 'E' }
              const profColors = { 
                none: 'text-text-dark', 
                proficient: 'text-amber-main', 
                expertise: 'text-amber-dark' 
              }
              return (
                <div
                  key={skill}
                  className={cn(
                    'p-2.5 rounded-lg text-center transition-colors border',
                    proficiency === 'expertise' 
                      ? 'bg-amber-main/10 border-amber-main/30' 
                      : proficiency === 'proficient'
                      ? 'bg-amber-main/5 border-amber-main/20'
                      : 'bg-bg-surface border-border-main'
                  )}
                >
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1 truncate">
                    {getSkillLabel(skill)}
                  </div>
                  <div className="text-xl font-bold text-text-main font-serif">{fmtMod(mod)}</div>
                  <div className="flex justify-center gap-1 mt-1">
                    <span className={cn('text-xs font-medium', profColors[proficiency])}>
                      {profLabels[proficiency]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dons d'Origine */}
      {character.origin_feats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-main" />
              Dons d'Origine
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {character.origin_feats.map((feat, index) => (
                <div key={index} className="p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
                  <div className="font-medium text-text-main">{feat.name}</div>
                  <div className="text-sm text-text-muted mt-1">{feat.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dons Généraux */}
      {character.general_feats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Dons Généraux
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {character.general_feats.map((feat, index) => (
                <div key={index} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="font-medium text-text-main">{feat.name}</div>
                  <div className="text-sm text-text-muted mt-1">{feat.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maîtrises d'Armes */}
      {character.weapon_masteries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Sword className="h-5 w-5 text-amber-main" />
              Maîtrises d'Armes (Weapon Mastery)
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {character.weapon_masteries.map((wm, index) => (
                <Badge key={index} variant="rarity" rarity="uncommon" className="gap-1.5">
                  <span className="font-medium">{wm.weapon}</span>
                  <span className="px-2 py-0.5 bg-bg-surface rounded text-xs">
                    {WEAPON_MASTERY_LABELS[wm.property]}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maîtrises d'Outils */}
      {character.tool_proficiencies?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-main" />
              Maîtrises d'Outils
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1.5">
              {character.tool_proficiencies.map((tool, i) => (
                <Badge key={i} variant="rarity" size="sm" rarity="common">
                  {tool}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Magie - Sources multiples */}
      {(isSpellcaster || (character.additional_spellcasting_sources && character.additional_spellcasting_sources.length > 0)) && (
        <>
          {/* Calculer toutes les sources pour l'affichage */}
          {(() => {
            const allSources: SpellcastingSource[] = []
            
            // Source principale (classe)
            if (isSpellcaster && character.class_name) {
              const primarySource = createPrimarySpellcastingSource(
                character.class_name, 
                character.level, 
                character.abilities as unknown as Record<string, number>
              )
              if (primarySource) {
                primarySource.preparedSpells = character.prepared_spells
                allSources.push(primarySource)
              }
            }
            
            // Sources additionnelles
            allSources.push(...(character.additional_spellcasting_sources ?? []))
            
            // Slots combinés
            const combinedSlots = combineSpellSlots(allSources)
            
            return (
              <Card>
                <CardHeader className="pb-2">
                  <h4 className="font-semibold text-text-main flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    Magie
                  </h4>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Sources d'incantation (cartes empilées) */}
                  {allSources.length > 0 && (
                    <div className="space-y-4">
                      {allSources.map((source) => (
                        <div 
                          key={source.id} 
                          className={cn(
                            'p-4 rounded-lg border transition-all',
                            source.type === 'class' 
                              ? 'bg-purple-500/5 border-purple-500/30' 
                              : source.type === 'feat'
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : source.type === 'race'
                              ? 'bg-green-500/5 border-green-500/30'
                              : 'bg-blue-500/5 border-blue-500/30'
                          )}
                        >
                          {/* Header de la source */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={cn(
                                'p-2 rounded-lg flex-shrink-0',
                                source.type === 'class' && 'bg-purple-500/10 text-purple-500',
                                source.type === 'feat' && 'bg-amber-500/10 text-amber-500',
                                source.type === 'race' && 'bg-green-500/10 text-green-500',
                                source.type === 'item' && 'bg-blue-500/10 text-blue-500'
                              )}>
                                {source.type === 'class' && <BookOpen className="h-5 w-5" />}
                                {source.type === 'feat' && <Wand2 className="h-5 w-5" />}
                                {source.type === 'race' && <Sparkles className="h-5 w-5" />}
                                {source.type === 'item' && <Star className="h-5 w-5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-semibold text-text-main truncate">{source.name}</h5>
                                  <Badge variant="rarity" size="sm" className={cn(
                                    source.type === 'class' && 'rarity-legendary',
                                    source.type === 'feat' && 'rarity-rare',
                                    source.type === 'race' && 'rarity-uncommon',
                                    source.type === 'item' && 'rarity-common'
                                  )}>
                                    {source.type === 'class' && 'Classe'}
                                    {source.type === 'feat' && 'Don'}
                                    {source.type === 'race' && 'Race'}
                                    {source.type === 'item' && 'Objet'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-text-muted flex items-center gap-2 flex-wrap">
                                  <span>Carac: <strong className="text-text-main">{source.ability.toUpperCase()}</strong></span>
                                  <span>•</span>
                                  <span>Niv. lanceur: <strong className="text-text-main">{source.spellcastingLevel}</strong></span>
                                  {source.sourceDetail && (
                                    <>
                                      <span>•</span>
                                      <span className="text-text-dark">{source.sourceDetail}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats calculées pour cette source */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div className="p-3 bg-bg-surface border border-border-main rounded-lg text-center">
                              <div className="text-xs text-text-muted uppercase tracking-wider">DD Sorts</div>
                              <div className="text-2xl font-bold text-purple-500 font-serif">
                                {getSpellSaveDC(source, proficiencyBonus, character.abilities as unknown as Record<string, number>)}
                              </div>
                            </div>
                            <div className="p-3 bg-bg-surface border border-border-main rounded-lg text-center">
                              <div className="text-xs text-text-muted uppercase tracking-wider">Attaque Magique</div>
                              <div className="text-2xl font-bold text-text-main font-serif">
                                {getSpellAttackBonus(source, proficiencyBonus, character.abilities as unknown as Record<string, number>) >= 0 ? '+' : ''}
                                {getSpellAttackBonus(source, proficiencyBonus, character.abilities as unknown as Record<string, number>)}
                              </div>
                            </div>
                            <div className="p-3 bg-bg-surface border border-border-main rounded-lg text-center">
                              <div className="text-xs text-text-muted uppercase tracking-wider">Sorts Préparés Max</div>
                              <div className="text-2xl font-bold text-text-main font-serif">
                                {getMaxPreparedSpellsForSource(source, character.abilities as unknown as Record<string, number>)}
                              </div>
                            </div>
                          </div>

                          {/* Cantrips connus */}
                          {source.cantripsKnown > 0 && (
                            <div className="mb-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                              <div className="flex items-center gap-2 text-sm">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <span className="font-medium text-text-main">Tours de magie connus: </span>
                                <span className="font-bold text-amber-500">{source.cantripsKnown}</span>
                              </div>
                            </div>
                          )}

                          {/* Sorts toujours préparés */}
                          {source.alwaysPrepared && source.alwaysPrepared.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Sorts toujours préparés (gratuits)</div>
                              <div className="flex flex-wrap gap-2">
                                {source.alwaysPrepared.map((spell, i) => (
                                  <Badge key={i} variant="rarity" size="sm" rarity="legendary" className="gap-1">
                                    <span className="text-xs">{spell.name}</span>
                                    <span className="text-xs text-text-muted">Niv.{spell.level}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sorts accordés par le don */}
                          {source.grantedSpells && source.grantedSpells.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Sorts accordés par le don</div>
                              <div className="flex flex-wrap gap-2">
                                {source.grantedSpells.map((spell, i) => (
                                  <Badge key={i} variant="rarity" size="sm" rarity="rare" className="gap-1">
                                    <span className="text-xs">{spell.name}</span>
                                    <span className="text-xs text-text-muted">Niv.{spell.level}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sorts préparés pour cette source */}
                          {source.preparedSpells.length > 0 && (
                            <div className="space-y-2">
                              <h6 className="font-medium text-text-main flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Sorts préparés ({source.preparedSpells.length} / {getMaxPreparedSpellsForSource(source, character.abilities as unknown as Record<string, number>)})
                              </h6>
                              <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                {source.preparedSpells.map((spell, spellIndex) => (
                                  <div
                                    key={spellIndex}
                                    className="p-2.5 bg-bg-surface border border-border-main rounded-lg hover:border-amber-main/30 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant="rarity" 
                                          size="sm" 
                                          rarity={spell.level === 0 ? 'common' : spell.level <= 2 ? 'uncommon' : spell.level <= 4 ? 'rare' : 'very-rare'}
                                          className="shrink-0"
                                        >
                                          {spell.level === 0 ? 'T' : spell.level}
                                        </Badge>
                                        <span className="font-medium text-text-main">{spell.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-text-muted">
                                        {spell.concentration && (
                                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                                            <Sparkles className="h-3 w-3" /> Concentration
                                          </span>
                                        )}
                                        <span>{spell.casting_time}</span>
                                        <span>{spell.range}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Emplacements de sorts combinés (multiclasse) */}
                  {allSources.length > 0 && (
                    <div>
                      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Emplacements de Sorts Combinés (Multiclasse)</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(combinedSlots)
                          .filter(([, slot]) => slot.max > 0)
                          .map(([levelStr, slot]) => {
                            const level = parseInt(levelStr, 10)
                            return (
                              <Badge key={levelStr} variant="rarity" rarity={level <= 2 ? 'common' : level <= 4 ? 'uncommon' : level <= 6 ? 'rare' : 'very-rare'} className="gap-1">
                                <span className="font-medium">Niv. {level}</span>
                                <span className="px-2 py-0.5 bg-bg-surface rounded text-xs font-mono">
                                  {slot.current}/{slot.max}
                                </span>
                              </Badge>
                            )
                          })}
                      </div>
                      <p className="text-xs text-text-muted mt-2 text-center">
                        Calculés selon la table multiclasse D&D 2024 (somme des niveaux de lanceur effectifs)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}
        </>
      )}

      {/* Message si pas de sorts */}
      {!isSpellcaster && !character.additional_spellcasting_sources?.length && character.class_name && (
        <Card className="border-dashed border-border-main">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-10 w-10 text-text-dark mx-auto mb-3 opacity-50" />
            <p className="text-text-muted">
              {character.character_name} n'est pas un lanceur de sorts
              ({character.spellcasting_ability === 'none' ? 'Aucune caractéristique d\'incantation' : ''})
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}