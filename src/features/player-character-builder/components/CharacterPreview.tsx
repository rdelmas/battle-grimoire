import { 
  Sparkles, Sword, BookOpen, 
  Brain, Star, Shield
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import type { PlayerCharacter, SkillName } from '../types/character'
import { 
  useCharacterCalculations, 
  useInitiative, 
  usePassivePerception,
  useAllSavingThrowModifiers,
  useAllSkillModifiers,
  useSpellcastingCalculations,
  useIsSpellcaster,
} from '../hooks/useCharacterCalculations'
import { 
  WEAPON_MASTERY_LABELS,
  ALL_SKILLS,
  ALL_ABILITIES,
} from '../types/character'
import { cn } from '@/shared/utils/cn'

interface CharacterPreviewProps {
  character: PlayerCharacter
}

export function CharacterPreview({ character }: CharacterPreviewProps) {
  const calculations = useCharacterCalculations(character)
  const savingThrows = useAllSavingThrowModifiers(character)
  const skillModifiers = useAllSkillModifiers(character)
  const spellcasting = useSpellcastingCalculations(character)
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

      {/* Don d'Origine */}
      {character.origin_feat.name && (
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-main" />
              Don d'Origine
            </h4>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
              <div className="font-medium text-text-main">{character.origin_feat.name}</div>
              <div className="text-sm text-text-muted mt-1">{character.origin_feat.description}</div>
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

      {/* Magie */}
      {isSpellcaster && (
        <Card>
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-text-main flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Magie
            </h4>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Infos de lancer de sorts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                <div className="text-xs text-text-muted uppercase tracking-wider">Caractéristique</div>
                <div className="text-xl font-bold text-purple-500 font-serif">
                  {character.spellcasting_ability.toUpperCase()}
                </div>
              </div>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                <div className="text-xs text-text-muted uppercase tracking-wider">DD Sorts</div>
                <div className="text-xl font-bold text-text-main font-serif">
                  {spellcasting.spellSaveDC ?? '—'}
                </div>
              </div>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                <div className="text-xs text-text-muted uppercase tracking-wider">Attaque Magique</div>
                <div className="text-xl font-bold text-text-main font-serif">
                  {spellcasting.spellAttackBonus ? fmtMod(spellcasting.spellAttackBonus) : '—'}
                </div>
              </div>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
                <div className="text-xs text-text-muted uppercase tracking-wider">Sorts Préparés</div>
                <div className="text-xl font-bold text-text-main font-serif">
                  {character.prepared_spells.length}
                </div>
              </div>
            </div>

            {/* Emplacements de sorts */}
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Emplacements de Sorts</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(character.spell_slots)
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
            </div>

            {/* Sorts préparés */}
            {character.prepared_spells.length > 0 && (
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Sorts Préparés</div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                  {character.prepared_spells.map((spell, index) => (
                    <div
                      key={index}
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
          </CardContent>
        </Card>
      )}

      {/* Message si pas de sorts */}
      {!isSpellcaster && character.class_name && (
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