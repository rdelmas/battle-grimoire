import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/shared/components/ui'
import { X } from 'lucide-react'
import type { CustomAttack, DamageType } from '../../../types/character'
import { DAMAGE_TYPE_LABELS, ALL_ABILITIES } from '../../../types/character'

interface AttackEditorProps {
  isOpen: boolean
  initial?: CustomAttack | null
  onClose: () => void
  onSave: (attack: CustomAttack) => void
}

const EMPTY: Omit<CustomAttack, 'id'> = {
  name: '',
  ability: 'str',
  bonus: 0,
  damage_dice: '1d6',
  damage_bonus: 0,
  damage_type: 'bludgeoning',
  note: '',
}

const ABILITY_LABELS: Record<string, string> = {
  str: 'FOR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'SAG',
  cha: 'CHA',
  none: 'Aucune',
}

export function AttackEditor({ isOpen, initial, onClose, onSave }: AttackEditorProps) {
  const [draft, setDraft] = useState<Omit<CustomAttack, 'id'>>(EMPTY)

  useEffect(() => {
    if (isOpen) {
      // Réinitialise le brouillon à l'ouverture de l'éditeur
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(initial ? { ...initial } : EMPTY)
    }
  }, [isOpen, initial])

  const handleSave = () => {
    if (!draft.name.trim()) return
    onSave({ ...draft, id: initial?.id ?? crypto.randomUUID() })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={initial ? 'Modifier l\'attaque' : 'Nouvelle attaque'}>
      <div className="space-y-4">
        <Input
          label="Nom"
          value={draft.name}
          onChange={e => setDraft({ ...draft, name: e.target.value })}
          placeholder="Ex: Souffle de dragon"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Caractéristique</label>
            <Select
              value={draft.ability}
              onChange={e => setDraft({ ...draft, ability: e.target.value as CustomAttack['ability'] })}
            >
              {ALL_ABILITIES.map(a => (
                <option key={a} value={a}>{ABILITY_LABELS[a]}</option>
              ))}
              <option value="none">{ABILITY_LABELS.none}</option>
            </Select>
          </div>
          <Input
            label="Bonus attaque (+)"
            type="number"
            value={draft.bonus}
            onChange={e => setDraft({ ...draft, bonus: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Dé de dégâts"
            value={draft.damage_dice}
            onChange={e => setDraft({ ...draft, damage_dice: e.target.value })}
            placeholder="1d8"
          />
          <Input
            label="Bonus dégâts (+)"
            type="number"
            value={draft.damage_bonus}
            onChange={e => setDraft({ ...draft, damage_bonus: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Type de dégâts</label>
          <Select
            value={draft.damage_type}
            onChange={e => setDraft({ ...draft, damage_type: e.target.value as DamageType })}
          >
            {(Object.keys(DAMAGE_TYPE_LABELS) as DamageType[]).map(t => (
              <option key={t} value={t}>{DAMAGE_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </div>

        <Input
          label="Note (optionnel)"
          value={draft.note ?? ''}
          onChange={e => setDraft({ ...draft, note: e.target.value })}
          placeholder="Précision, condition..."
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Annuler
          </Button>
          <Button onClick={handleSave} disabled={!draft.name.trim()}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  )
}