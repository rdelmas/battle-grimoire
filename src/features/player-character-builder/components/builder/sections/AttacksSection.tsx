import { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent, Button, Badge } from '@/shared/components/ui'
import { Plus, Trash2, Pencil, Swords } from 'lucide-react'
import type { PlayerCharacter, CustomAttack, AttackOption } from '../../../types/character'
import { DAMAGE_TYPE_LABELS } from '../../../types/character'
import { useCharacterCalculations, computeAttacks } from '../../../hooks/useCharacterCalculations'
import { AttackEditor } from './AttackEditor'
import type { useCharacterForm } from '../../../hooks/useCharacterForm'

interface AttacksSectionProps {
  character: PlayerCharacter
  form: ReturnType<typeof useCharacterForm>
}

const KIND_LABELS: Record<AttackOption['kind'], string> = {
  weapon: 'Arme',
  cantrip: 'Cantrip',
  spell: 'Sort',
  unarmed: 'Mains nues',
  custom: 'Perso',
}

const KIND_COLORS: Record<AttackOption['kind'], string> = {
  weapon: 'bg-amber-main/10 text-amber-main',
  cantrip: 'bg-purple-500/10 text-purple-400',
  spell: 'bg-purple-500/10 text-purple-300',
  unarmed: 'bg-red-500/10 text-red-400',
  custom: 'bg-blue-500/10 text-blue-400',
}

export function AttacksSection({ character, form }: AttacksSectionProps) {
  const calculations = useCharacterCalculations(character)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const derivedAttacks = useMemo(
    () => computeAttacks(character, calculations.abilities, calculations.spellcasting),
    [character, calculations.abilities, calculations.spellcasting]
  )

  const openAdd = () => { setEditingIndex(null); setEditorOpen(true) }
  const openEdit = (index: number) => { setEditingIndex(index); setEditorOpen(true) }

  const handleSave = (attack: CustomAttack) => {
    if (editingIndex !== null) form.updateCustomAttack(editingIndex, attack)
    else form.addCustomAttack(attack)
    setEditorOpen(false)
    setEditingIndex(null)
  }

  const editingAttack = editingIndex !== null ? character.custom_attacks[editingIndex] ?? null : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2 flex items-center justify-between">
          <h4 className="font-semibold text-text-main flex items-center gap-2">
            <Swords className="h-5 w-5 text-amber-main" />
            Attaques unifiées ({derivedAttacks.length})
          </h4>
          <Button variant="secondary" size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Attaque perso
          </Button>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {derivedAttacks.length === 0 ? (
            <p className="text-text-muted text-center py-4">
              Aucune attaque dérivée. Ajoutez des maîtrises d'armes, des sorts ou une attaque personnalisée.
            </p>
          ) : (
            derivedAttacks.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-bg-surface border border-border-main rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-main">{a.name}</span>
                    <Badge variant="rarity" size="sm" className={KIND_COLORS[a.kind]}>{KIND_LABELS[a.kind]}</Badge>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {a.damage_dice && (
                      <span>{a.damage_dice}{a.damage_bonus ? `+${a.damage_bonus}` : ''} {DAMAGE_TYPE_LABELS[a.damage_type]} • </span>
                    )}
                    <span>Attaque {a.attack_bonus >= 0 ? '+' : ''}{a.attack_bonus}</span>
                    {a.is_spell && a.spell_level !== undefined && a.spell_level > 0 && <span> • Niv {a.spell_level}</span>}
                    {a.save_dc !== null && a.save_dc !== undefined && <span> • DD {a.save_dc}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex items-center justify-between">
          <h4 className="font-semibold text-text-main">Attaques personnalisées ({character.custom_attacks.length})</h4>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {character.custom_attacks.length === 0 ? (
            <p className="text-text-muted text-center py-4">Aucune attaque personnalisée.</p>
          ) : (
            character.custom_attacks.map((ca, index) => (
              <div key={ca.id} className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-text-main">{ca.name}</div>
                  <div className="text-xs text-text-muted mt-1">
                    {ca.damage_dice}{ca.damage_bonus ? `+${ca.damage_bonus}` : ''} {DAMAGE_TYPE_LABELS[ca.damage_type]} •
                    Attaque {ca.bonus >= 0 ? '+' : ''}{ca.bonus}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(index)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => form.removeCustomAttack(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AttackEditor
        isOpen={editorOpen}
        initial={editingAttack}
        onClose={() => { setEditorOpen(false); setEditingIndex(null) }}
        onSave={handleSave}
      />
    </div>
  )
}