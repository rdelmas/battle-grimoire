import { useState, useCallback, useMemo } from 'react'
import type { PlayerCharacter, SkillName, AbilityScores, CustomAttack } from '../types/character'
import { createEmptyCharacter, getProficiencyBonus, getAbilityModifier, ALL_SKILLS, ALL_ABILITIES } from '../types/character'

/** Erreurs de validation par champ */
export interface CharacterFormErrors {
  character_name?: string
  class_name?: string
  hit_points_max?: string
  armor_class?: string
  level?: string
  abilities?: Partial<Record<keyof AbilityScores, string>>
  spellcasting_ability?: string
  general?: string
}

/** État du formulaire */
export interface CharacterFormState {
  character: PlayerCharacter
  errors: CharacterFormErrors
  isDirty: boolean
  isSaving: boolean
  isValid: boolean
}

/** Actions du formulaire */
export interface CharacterFormActions {
  setField: <K extends keyof PlayerCharacter>(field: K, value: PlayerCharacter[K]) => void
  setAbility: (ability: keyof AbilityScores, value: number) => void
  setSkill: (skill: SkillName, value: 'none' | 'proficient' | 'expertise') => void
  setSavingThrowProficiency: (ability: keyof AbilityScores, proficient: boolean) => void
  addWeaponMastery: (weapon: string, property: PlayerCharacter['weapon_masteries'][0]['property']) => void
  removeWeaponMastery: (index: number) => void
  addGeneralFeat: (feat: PlayerCharacter['general_feats'][0]) => void
  removeGeneralFeat: (index: number) => void
  updateGeneralFeat: (index: number, feat: PlayerCharacter['general_feats'][0]) => void
  addOriginFeat: (feat: PlayerCharacter['origin_feats'][0]) => void
  removeOriginFeat: (index: number) => void
  updateOriginFeat: (index: number, feat: PlayerCharacter['origin_feats'][0]) => void
  addPreparedSpell: (spell: PlayerCharacter['prepared_spells'][0]) => void
  removePreparedSpell: (index: number) => void
  updatePreparedSpell: (index: number, spell: PlayerCharacter['prepared_spells'][0]) => void
  updateSpellSlot: (level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, max: number, current: number) => void
  addCustomAttack: (attack: CustomAttack) => void
  removeCustomAttack: (index: number) => void
  updateCustomAttack: (index: number, attack: CustomAttack) => void
  validate: () => boolean
  reset: (character?: PlayerCharacter) => void
  markClean: () => void
  save: () => Promise<{ success: boolean; error?: string }>
  duplicate: () => Promise<PlayerCharacter>
  delete: () => Promise<boolean>
}

/** Type complet du hook */
export type UseCharacterFormReturn = CharacterFormState & CharacterFormActions

/**
 * Hook de gestion du formulaire de personnage
 * Gère l'état, la validation (RG-8-2-01), et la persistance IndexedDB
 */
export function useCharacterForm(initialCharacter?: PlayerCharacter): UseCharacterFormReturn {
  const [character, setCharacter] = useState<PlayerCharacter>(() => 
    initialCharacter ?? createEmptyCharacter()
  )
  const [errors, setErrors] = useState<CharacterFormErrors>({})
  const [isDirty, setIsDirty] = useState(() => (initialCharacter ? false : true))
  const [isSaving, setIsSaving] = useState(false)

  // Validation RG-8-2-01 : Champs obligatoires
  const validate = useCallback((): boolean => {
    const newErrors: CharacterFormErrors = {}

    if (!character.character_name.trim()) {
      newErrors.character_name = 'Le nom du personnage est obligatoire'
    }

    if (!character.class_name.trim()) {
      newErrors.class_name = 'La classe est obligatoire'
    }

    if (character.hit_points_max <= 0) {
      newErrors.hit_points_max = 'Les points de vie max doivent être supérieurs à 0'
    }

    if (character.armor_class <= 0) {
      newErrors.armor_class = 'La classe d\'armure doit être supérieure à 0'
    }

    if (character.level < 1 || character.level > 20) {
      newErrors.level = 'Le niveau doit être entre 1 et 20'
    }

    // Validation des caractéristiques (1-30)
    const abilityErrors: CharacterFormErrors['abilities'] = {}
    for (const ability of ALL_ABILITIES) {
      const value = character.abilities[ability]
      if (value < 1 || value > 30) {
        abilityErrors[ability] = 'La valeur doit être entre 1 et 30'
      }
    }
    if (Object.keys(abilityErrors).length > 0) {
      newErrors.abilities = abilityErrors
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [character])

  // Vérifier si le formulaire est valide
  const isValid = useMemo(() => {
    return (
      character.character_name.trim() !== '' &&
      character.class_name.trim() !== '' &&
      character.hit_points_max > 0 &&
      character.armor_class > 0 &&
      character.level >= 1 &&
      character.level <= 20 &&
      ALL_ABILITIES.every(a => character.abilities[a] >= 1 && character.abilities[a] <= 30)
    )
  }, [character])

  // Mise à jour générique d'un champ
  const setField = useCallback(<K extends keyof PlayerCharacter>(field: K, value: PlayerCharacter[K]) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value,
      updated_at: Date.now(),
    }))
  }, [])

  // Mise à jour d'une caractéristique
  const setAbility = useCallback((ability: keyof AbilityScores, value: number) => {
    const clampedValue = Math.max(1, Math.min(30, value))
    setCharacter(prev => ({
      ...prev,
      abilities: { ...prev.abilities, [ability]: clampedValue },
      updated_at: Date.now(),
    }))
  }, [])

  // Mise à jour d'une compétence
  const setSkill = useCallback((skill: SkillName, value: 'none' | 'proficient' | 'expertise') => {
    setCharacter(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value },
      updated_at: Date.now(),
    }))
  }, [])

  // Mise à jour d'une maîtrise de jet de sauvegarde
  const setSavingThrowProficiency = useCallback((ability: keyof AbilityScores, proficient: boolean) => {
    setCharacter(prev => {
      const current = prev.saving_throw_proficiencies
      const updated = proficient
        ? [...current, ability]
        : current.filter(a => a !== ability)
      return {
        ...prev,
        saving_throw_proficiencies: updated,
        updated_at: Date.now(),
      }
    })
  }, [])

  // Maîtrises d'armes
  const addWeaponMastery = useCallback((weapon: string, property: PlayerCharacter['weapon_masteries'][0]['property']) => {
    setCharacter(prev => ({
      ...prev,
      weapon_masteries: [...prev.weapon_masteries, { weapon, property }],
      updated_at: Date.now(),
    }))
  }, [])

  const removeWeaponMastery = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      weapon_masteries: prev.weapon_masteries.filter((_, i) => i !== index),
      updated_at: Date.now(),
    }))
  }, [])

  // Dons généraux
  const addGeneralFeat = useCallback((feat: PlayerCharacter['general_feats'][0]) => {
    setCharacter(prev => ({
      ...prev,
      general_feats: [...prev.general_feats, feat],
      updated_at: Date.now(),
    }))
  }, [])

  const removeGeneralFeat = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      general_feats: prev.general_feats.filter((_, i) => i !== index),
      updated_at: Date.now(),
    }))
  }, [])

  const updateGeneralFeat = useCallback((index: number, feat: PlayerCharacter['general_feats'][0]) => {
    setCharacter(prev => {
      const updated = [...prev.general_feats]
      updated[index] = feat
      return { ...prev, general_feats: updated, updated_at: Date.now() }
    })
  }, [])

  // Dons d'origine
  const addOriginFeat = useCallback((feat: PlayerCharacter['origin_feats'][0]) => {
    setCharacter(prev => ({
      ...prev,
      origin_feats: [...prev.origin_feats, feat],
      updated_at: Date.now(),
    }))
  }, [])

  const removeOriginFeat = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      origin_feats: prev.origin_feats.filter((_, i) => i !== index),
      updated_at: Date.now(),
    }))
  }, [])

  const updateOriginFeat = useCallback((index: number, feat: PlayerCharacter['origin_feats'][0]) => {
    setCharacter(prev => {
      const updated = [...prev.origin_feats]
      updated[index] = feat
      return { ...prev, origin_feats: updated, updated_at: Date.now() }
    })
  }, [])

  // Sorts préparés
  const addPreparedSpell = useCallback((spell: PlayerCharacter['prepared_spells'][0]) => {
    setCharacter(prev => ({
      ...prev,
      prepared_spells: [...prev.prepared_spells, spell],
      updated_at: Date.now(),
    }))
  }, [])

  const removePreparedSpell = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      prepared_spells: prev.prepared_spells.filter((_, i) => i !== index),
      updated_at: Date.now(),
    }))
  }, [])

  const updatePreparedSpell = useCallback((index: number, spell: PlayerCharacter['prepared_spells'][0]) => {
    setCharacter(prev => {
      const updated = [...prev.prepared_spells]
      updated[index] = spell
      return { ...prev, prepared_spells: updated, updated_at: Date.now() }
    })
  }, [])

  // Emplacements de sorts
  const updateSpellSlot = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, max: number, current: number) => {
    setCharacter(prev => ({
      ...prev,
      spell_slots: {
        ...prev.spell_slots,
        [level]: { max: Math.max(0, max), current: Math.max(0, Math.min(current, max)) },
      },
      updated_at: Date.now(),
    }))
  }, [])

  // Attaques personnalisées
  const addCustomAttack = useCallback((attack: CustomAttack) => {
    setCharacter(prev => ({
      ...prev,
      custom_attacks: [...prev.custom_attacks, attack],
      updated_at: Date.now(),
    }))
  }, [])

  const removeCustomAttack = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      custom_attacks: prev.custom_attacks.filter((_, i) => i !== index),
      updated_at: Date.now(),
    }))
  }, [])

  const updateCustomAttack = useCallback((index: number, attack: CustomAttack) => {
    setCharacter(prev => {
      const updated = [...prev.custom_attacks]
      updated[index] = attack
      return { ...prev, custom_attacks: updated, updated_at: Date.now() }
    })
  }, [])

  // Réinitialiser le formulaire
  const reset = useCallback((newCharacter?: PlayerCharacter) => {
    setCharacter(newCharacter ?? createEmptyCharacter())
    setErrors({})
    setIsDirty(false)
  }, [])

  // Marquer comme propre (après sauvegarde)
  const markClean = useCallback(() => {
    setIsDirty(false)
  }, [])

  // Sauvegarde IndexedDB via IPC
  const save = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!validate()) {
      return { success: false, error: 'Validation échouée' }
    }

    // RG-8-2-04 : Nettoyage des entrées vides avant sauvegarde
    const cleanedCharacter: PlayerCharacter = {
      ...character,
      weapon_masteries: character.weapon_masteries.filter(wm => wm.weapon.trim() && wm.property),
      origin_feats: character.origin_feats.filter(f => f.name.trim()),
      general_feats: character.general_feats.filter(f => f.name.trim()),
      prepared_spells: character.prepared_spells.filter(s => s.name.trim()),
      updated_at: Date.now(),
    }

    setIsSaving(true)
    try {
      // Utiliser l'API IPC pour sauvegarder dans IndexedDB (via electron-store dans le main process)
      await window.api.storage.put('characters', cleanedCharacter)
      setIsSaving(false)
      setIsDirty(false)
      return { success: true }
    } catch (error) {
      setIsSaving(false)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }, [character, validate])

  // Duplication (RG-8-2-03 : suffixe " - Copie")
  const duplicate = useCallback(async (): Promise<PlayerCharacter> => {
    const duplicated: PlayerCharacter = {
      ...character,
      id: crypto.randomUUID(),
      character_name: `${character.character_name} - Copie`,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    await window.api.storage.put('characters', duplicated)
    return duplicated
  }, [character])

  // Suppression
  const deleteCharacter = useCallback(async (): Promise<boolean> => {
    try {
      await window.api.storage.delete('characters', character.id)
      return true
    } catch {
      return false
    }
  }, [character.id])

  return {
    // État
    character,
    errors,
    isDirty,
    isSaving,
    isValid,

    // Actions
    setField,
    setAbility,
    setSkill,
    setSavingThrowProficiency,
    addWeaponMastery,
    removeWeaponMastery,
    addGeneralFeat,
    removeGeneralFeat,
    updateGeneralFeat,
    addOriginFeat,
    removeOriginFeat,
    updateOriginFeat,
    addPreparedSpell,
    removePreparedSpell,
    updatePreparedSpell,
    updateSpellSlot,
    addCustomAttack,
    removeCustomAttack,
    updateCustomAttack,
    validate,
    reset,
    markClean,
    save,
    duplicate,
    delete: deleteCharacter,
  }
}

/**
 * Hook pour obtenir les modificateurs calculés en temps réel
 * Utile pour l'affichage dans le builder
 */
export function useCharacterFormCalculations(character: PlayerCharacter) {
  const proficiencyBonus = getProficiencyBonus(character.level)
  
  const abilityModifiers = useMemo(() => {
    const mods: Record<keyof AbilityScores, number> = {} as Record<keyof AbilityScores, number>
    for (const ability of ALL_ABILITIES) {
      mods[ability] = getAbilityModifier(character.abilities[ability])
    }
    return mods
  }, [character.abilities])

  const skillModifiers = useMemo(() => {
    const mods: Record<SkillName, number> = {} as Record<SkillName, number>
    for (const skill of ALL_SKILLS) {
      // We'll compute this in the component using the types functions
      mods[skill] = 0 // placeholder
    }
    return mods
  }, [])

  const savingThrowModifiers = useMemo(() => {
    const mods: Record<keyof AbilityScores, number> = {} as Record<keyof AbilityScores, number>
    for (const ability of ALL_ABILITIES) {
      const proficient = character.saving_throw_proficiencies.includes(ability)
      mods[ability] = abilityModifiers[ability] + (proficient ? proficiencyBonus : 0)
    }
    return mods
  }, [character.saving_throw_proficiencies, abilityModifiers, proficiencyBonus])

  const passivePerception = 10 + (skillModifiers.perception ?? 0)
  const initiative = abilityModifiers.dex + character.initiative_misc_bonus

  return {
    proficiencyBonus,
    abilityModifiers,
    skillModifiers,
    savingThrowModifiers,
    passivePerception,
    initiative,
  }
}