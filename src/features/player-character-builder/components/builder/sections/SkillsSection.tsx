import { Card, CardHeader, CardContent, Select } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../../hooks/useCharacterCalculations'
import { ALL_SKILLS, type SkillName, type AbilityScores } from '../../../types/character'
import { SKILL_ABILITY_MAP } from '../../../types/character'
import { Brain } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface SkillsSectionProps {
  character: ReturnType<typeof useCharacterForm>['character']
  form: ReturnType<typeof useCharacterForm>
  calculations: ReturnType<typeof useCharacterCalculations>
}

const skillLabels: Record<SkillName, string> = {
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

const abilityLabels: Record<keyof AbilityScores, string> = {
  str: 'FOR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'SAG',
  cha: 'CHA',
}

const fullAbilityLabels: Record<keyof AbilityScores, string> = {
  str: 'Force',
  dex: 'Dextérité',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Sagesse',
  cha: 'Charisme',
}

const abilityOrder: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

const proficiencyOptions = [
  { value: 'none', label: '—', desc: 'Aucune' },
  { value: 'proficient', label: 'M', desc: 'Maîtrise (+PB)' },
  { value: 'expertise', label: 'E', desc: 'Expertise (+2×PB)' },
] as const

export function SkillsSection({ character, form, calculations }: SkillsSectionProps) {
  const skillModifiers = calculations.skills.modifiers
  const proficiencyBonus = calculations.abilities.proficiencyBonus
  const abilityModifiers = calculations.abilities.modifiers

  // Group skills by ability
  const skillsByAbility = abilityOrder.map(ability => {
    const skills = ALL_SKILLS.filter(skill => SKILL_ABILITY_MAP[skill] === ability)
    return { ability, skills }
  }).filter(group => group.skills.length > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <Brain className="h-5 w-5 text-blue-500" />
        <div>
          <p className="font-medium text-text-main">Perception Passive: <span className="text-blue-500">{calculations.skills.passivePerception}</span></p>
          <p className="text-sm text-text-muted">10 + modificateur Perception final</p>
        </div>
      </div>

      <div className="space-y-6">
        {skillsByAbility.map(({ ability, skills }) => {
          const abilityMod = abilityModifiers[ability]
          const abilityLabel = abilityLabels[ability]

          return (
            <Card key={ability} className="bg-bg-surface/50 border-border-main/50">
              <CardHeader className="pb-2 bg-amber-main/5 border-b border-amber-main/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-text-main flex items-center gap-2">
                    <span className="text-amber-main font-mono text-sm">{abilityLabel}</span>
                    <span className="text-text-muted text-sm">{fullAbilityLabels[ability]}</span>
                  </h4>
                  <div className={cn(
                    'text-xl font-bold font-serif px-3 py-0.5 rounded bg-bg-surface border border-border-main',
                    abilityMod >= 0 ? 'text-amber-main' : 'text-red-500'
                  )}>
                    {abilityMod >= 0 ? '+' : ''}{abilityMod}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.map(skill => {
                    const proficiency = character.skills[skill]
                    const totalMod = skillModifiers[skill]

                    return (
                      <div
                        key={skill}
                        className={cn(
                          'flex flex-col gap-2 p-3 rounded-lg transition-colors',
                          proficiency === 'expertise' && 'bg-amber-main/10 border border-amber-main/20',
                          proficiency === 'proficient' && 'bg-amber-main/5 border border-amber-main/10',
                          proficiency === 'none' && 'bg-bg-surface/50 border border-border-main/50 hover:border-border-main/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-text-main min-w-0">{skillLabels[skill]}</div>
                          <div className={cn(
                            'text-xl font-bold font-serif shrink-0',
                            totalMod >= 0 ? 'text-amber-main' : 'text-red-500'
                          )}>
                            {totalMod >= 0 ? '+' : ''}{totalMod}
                          </div>
                        </div>
                        
                        <div className="text-xs text-text-muted font-mono">
                          {(() => {
                            const profValue = proficiency === 'expertise' ? proficiencyBonus * 2 : proficiency === 'proficient' ? proficiencyBonus : 0
                            return `Mod ${abilityLabel}: ${abilityMod >= 0 ? '+' : ''}${abilityMod}  |  B.Maitrise: ${profValue >= 0 ? '+' : ''}${profValue}  =  ${totalMod >= 0 ? '+' : ''}${totalMod}`
                          })()}
                        </div>
                        
                        <Select
                          value={proficiency}
                          onChange={e => form.setSkill(skill, e.target.value as 'none' | 'proficient' | 'expertise')}
                          className="w-full max-w-[100px]"
                        >
                          {proficiencyOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}