import { Card, Input } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../../hooks/useCharacterCalculations'
import { ALL_ABILITIES, type AbilityScores } from '../../../types/character'
import { Target } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface AbilitiesSectionProps {
  character: ReturnType<typeof useCharacterForm>['character']
  form: ReturnType<typeof useCharacterForm>
  calculations: ReturnType<typeof useCharacterCalculations>
}

const abilityLabels: Record<keyof AbilityScores, string> = {
  str: 'FOR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'SAG',
  cha: 'CHA',
}

const fullLabels: Record<keyof AbilityScores, string> = {
  str: 'Force',
  dex: 'Dextérité',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Sagesse',
  cha: 'Charisme',
}

export function AbilitiesSection({ character, form, calculations }: AbilitiesSectionProps) {
  const proficiencyBonus = calculations.abilities.proficiencyBonus
  const abilityModifiers = calculations.abilities.modifiers

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-3 bg-amber-main/5 border border-amber-main/20 rounded-lg">
        <Target className="h-5 w-5 text-amber-main" />
        <div>
          <p className="font-medium text-text-main">Bonus de Maîtrise: <span className="text-amber-main">+{proficiencyBonus}</span></p>
          <p className="text-sm text-text-muted">Calculé automatiquement selon le niveau</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {ALL_ABILITIES.map(ability => {
          const score = character.abilities[ability]
          const mod = abilityModifiers[ability]
          const isSaveProficient = character.saving_throw_proficiencies.includes(ability)
          const saveMod = mod + (isSaveProficient ? proficiencyBonus : 0)

          return (
            <Card key={ability} className={cn(
              'p-4',
              isSaveProficient && 'bg-amber-main/5 border-amber-main/30'
            )}>
              <div className="text-center">
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                  {fullLabels[ability]} ({abilityLabels[ability]})
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-2">
                  <button 
                    type="button"
                    className="h-8 w-8 p-0 flex-shrink-0 text-text-main bg-bg-surface border border-border-main rounded-lg hover:bg-amber-main/10 hover:border-amber-main/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => form.setAbility(ability, score - 1)}
                    disabled={score <= 1}
                  >−</button>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={score}
                    onChange={e => form.setAbility(ability, parseInt(e.target.value) || 1)}
                    className="w-full max-w-24 text-center text-2xl font-bold font-serif bg-transparent border-none p-0 mx-auto"
                    error={form.errors.abilities?.[ability]}
                  />
                  <button 
                    type="button"
                    className="h-8 w-8 p-0 flex-shrink-0 text-text-main bg-bg-surface border border-border-main rounded-lg hover:bg-amber-main/10 hover:border-amber-main/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => form.setAbility(ability, score + 1)}
                    disabled={score >= 30}
                  >+</button>
                </div>
                <div className={cn(
                  'text-3xl font-bold font-serif',
                  mod >= 0 ? 'text-amber-main' : 'text-red-500'
                )}>
                  {mod >= 0 ? '+' : ''}{mod}
                </div>
                <label className="flex items-center justify-center gap-1.5 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSaveProficient}
                    onChange={e => form.setSavingThrowProficiency(ability, e.target.checked)}
                    className="h-4 w-4 rounded border-border-main text-amber-main focus:ring-amber-main"
                  />
                  <span className="text-xs text-text-muted">Maîtrise JDS</span>
                </label>
                {isSaveProficient && (
                  <div className="text-xs text-text-dark mt-1">JDS: {saveMod >= 0 ? '+' : ''}{saveMod}</div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}