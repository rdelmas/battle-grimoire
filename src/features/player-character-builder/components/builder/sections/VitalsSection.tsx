import { Input, Card } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { useCharacterCalculations } from '../../../hooks/useCharacterCalculations'
import { Zap } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface VitalsSectionProps {
  character: ReturnType<typeof useCharacterForm>['character']
  form: ReturnType<typeof useCharacterForm>
  calculations: ReturnType<typeof useCharacterCalculations>
}

export function VitalsSection({ character, form, calculations }: VitalsSectionProps) {
  const initiative = calculations.initiative.initiative

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Points de vie max *"
          type="number"
          min={1}
          value={character.hit_points_max}
          onChange={e => form.setField('hit_points_max', parseInt(e.target.value) || 1)}
          error={form.errors.hit_points_max}
        />
        <Input
          label="Classe d'armure *"
          type="number"
          min={1}
          value={character.armor_class}
          onChange={e => form.setField('armor_class', parseInt(e.target.value) || 10)}
          error={form.errors.armor_class}
        />
        <Input
          label="Vitesse"
          value={character.speed}
          onChange={e => form.setField('speed', e.target.value)}
          placeholder="Ex: 9m, 9m vol 9m"
        />
        <Input
          label="Bonus Initiative (hors DEX)"
          type="number"
          value={character.initiative_misc_bonus}
          onChange={e => form.setField('initiative_misc_bonus', parseInt(e.target.value) || 0)}
          placeholder="Ex: +5 (Don Alerte)"
        />
      </div>

      <Card className="bg-amber-main/5 border-amber-main/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="font-medium text-text-main">Initiative calculée: </span>
          <span className={cn('text-2xl font-bold font-serif', initiative >= 0 ? 'text-yellow-500' : 'text-red-500')}>
            {initiative >= 0 ? '+' : ''}{initiative}
          </span>
        </div>
        <p className="text-sm text-text-muted">
          DEX ({calculations.abilities.modifiers.dex >= 0 ? '+' : ''}{calculations.abilities.modifiers.dex}) + Divers ({character.initiative_misc_bonus >= 0 ? '+' : ''}{character.initiative_misc_bonus}) = {initiative >= 0 ? '+' : ''}{initiative}
        </p>
      </Card>
    </div>
  )
}