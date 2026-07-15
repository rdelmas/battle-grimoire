import { Input, Select } from '@/shared/components/ui'
import { useCharacterForm } from '../../../hooks/useCharacterForm'
import { getAllSpecies, getAllBackgrounds, getAllClasses, getSubclasses } from '@/shared/data'
import { useMemo } from 'react'
import type { PlayerCharacter } from '../../../types/character'

interface IdentitySectionProps {
  character: PlayerCharacter
  form: ReturnType<typeof useCharacterForm>
}

export function IdentitySection({ character, form }: IdentitySectionProps) {
  const speciesList = useMemo(() => getAllSpecies(), [])
  const backgroundList = useMemo(() => getAllBackgrounds(), [])
  const classList = useMemo(() => getAllClasses(), [])
  
  const availableSubclasses = useMemo(() => {
    if (!character.class_name) return []
    return getSubclasses(character.class_name)
  }, [character.class_name])
  
  const isSubclassEnabled = character.class_name && character.level >= 3

  return (
    <div className="space-y-6">
      {/* Nom du personnage & Joueur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nom du personnage *"
          value={character.character_name}
          onChange={e => form.setField('character_name', e.target.value)}
          error={form.errors.character_name}
          placeholder="Ex: Thorgar Pied-Lourd"
        />
        <Input
          label="Nom du joueur *"
          value={character.player_name}
          onChange={e => form.setField('player_name', e.target.value)}
          placeholder="Ex: Thomas"
        />
      </div>

      {/* Niveau, Espèce, Historique - 3 colonnes égales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Niveau *"
          type="number"
          min={1}
          max={20}
          value={character.level}
          onChange={e => form.setField('level', parseInt(e.target.value) || 1)}
          error={form.errors.level}
          placeholder="1–20"
        />
        <Select
          label="Espèce (SRD 2024)"
          value={character.species}
          onChange={e => form.setField('species', e.target.value)}
        >
          <option value="">— Choisir une espèce —</option>
          {speciesList.map(species => (
            <option key={species.id} value={species.name}>
              {species.name} {species.isCustom ? '(Personnalisée)' : ''}
            </option>
          ))}
        </Select>
        <Select
          label="Historique (SRD 2024)"
          value={character.background}
          onChange={e => form.setField('background', e.target.value)}
        >
          <option value="">— Choisir un historique —</option>
          {backgroundList.map(bg => (
            <option key={bg.id} value={bg.name}>
              {bg.name} {bg.isCustom ? '(Personnalisé)' : ''}
            </option>
          ))}
        </Select>
      </div>

      {/* Classe & Sous-classe - 2 colonnes égales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Classe * (SRD 2024)"
          value={character.class_name}
          onChange={e => form.setField('class_name', e.target.value)}
          error={form.errors.class_name}
          required
        >
          <option value="">Classe *</option>
          {classList.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </Select>
        <Select
          label="Sous-classe"
          value={character.subclass_name ?? ''}
          onChange={e => form.setField('subclass_name', e.target.value || undefined)}
          disabled={!isSubclassEnabled}
        >
          <option value="">— Aucune —</option>
          {!isSubclassEnabled && character.level < 3 && (
            <option value="" disabled>Disponible au niveau 3</option>
          )}
          {!isSubclassEnabled && character.level >= 3 && availableSubclasses.length === 0 && (
            <option value="" disabled>Pas de sous-classe pour cette classe</option>
          )}
          {availableSubclasses.map(subclass => (
            <option key={subclass.id} value={subclass.name}>
              {subclass.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}