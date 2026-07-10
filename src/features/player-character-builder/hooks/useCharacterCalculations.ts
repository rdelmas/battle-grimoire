import { useMemo } from 'react'
import type {
  PlayerCharacter,
  AbilityScores,
  SkillName,
  SkillProficiency,
  SavingThrowProficiency,
} from '../types/character'
import {
  getProficiencyBonus,
  getAbilityModifier,
  getSkillAbility,
  ALL_SKILLS,
  ALL_ABILITIES,
} from '../types/character'

/** Résultat des calculs de caractéristiques */
export interface CalculatedAbilities {
  modifiers: Record<keyof AbilityScores, number>
  proficiencyBonus: number
}

/** Résultat des calculs de jets de sauvegarde */
export interface CalculatedSavingThrows {
  modifiers: Record<SavingThrowProficiency, number>
  proficient: Record<SavingThrowProficiency, boolean>
}

/** Résultat des calculs de compétences */
export interface CalculatedSkills {
  modifiers: Record<SkillName, number>
  proficiency: Record<SkillName, SkillProficiency>
  passivePerception: number
}

/** Résultat des calculs magiques */
export interface CalculatedSpellcasting {
  spellSaveDC: number | null
  spellAttackBonus: number | null
}

/** Résultat des calculs d'initiative */
export interface CalculatedInitiative {
  initiative: number
  dexModifier: number
  miscBonus: number
}

/** Résultat complet des calculs du personnage */
export interface CharacterCalculations {
  abilities: CalculatedAbilities
  savingThrows: CalculatedSavingThrows
  skills: CalculatedSkills
  spellcasting: CalculatedSpellcasting
  initiative: CalculatedInitiative
}

/**
 * Hook principal pour tous les calculs D&D 2024 du personnage
 * Implémente les règles RG-8-1-01 à RG-8-1-08
 */
export function useCharacterCalculations(character: PlayerCharacter): CharacterCalculations {
  const abilities = useCalculatedAbilities(character)
  const savingThrows = useCalculatedSavingThrows(character, abilities)
  const skills = useCalculatedSkills(character, abilities)
  const spellcasting = useCalculatedSpellcasting(character, abilities)
  const initiative = useCalculatedInitiative(character, abilities)

  return {
    abilities,
    savingThrows,
    skills,
    spellcasting,
    initiative,
  }
}

/**
 * RG-8-1-01: Bonus de maîtrise dynamique par niveau
 * RG-8-1-02: Modificateur d'attribut standard
 */
export function useCalculatedAbilities(character: PlayerCharacter) {
  return useMemo(() => {
    const proficiencyBonus = getProficiencyBonus(character.level)
    const modifiers: Record<keyof AbilityScores, number> = {} as Record<keyof AbilityScores, number>

    for (const ability of ALL_ABILITIES) {
      modifiers[ability] = getAbilityModifier(character.abilities[ability])
    }

    return {
      modifiers,
      proficiencyBonus,
    }
  }, [character.level, character.abilities])
}

/**
 * RG-8-1-03: Calcul des jets de sauvegarde
 * Modificateur final = modificateur caractéristique + (bonus maîtrise si maîtrisé)
 */
export function useCalculatedSavingThrows(
  character: PlayerCharacter,
  abilities: CalculatedAbilities
) {
  return useMemo(() => {
    const modifiers: Record<SavingThrowProficiency, number> = {} as Record<SavingThrowProficiency, number>
    const proficient: Record<SavingThrowProficiency, boolean> = {} as Record<SavingThrowProficiency, boolean>

    for (const ability of ALL_ABILITIES) {
      const isProficient = character.saving_throw_proficiencies.includes(ability)
      proficient[ability] = isProficient
      modifiers[ability] = abilities.modifiers[ability] + (isProficient ? abilities.proficiencyBonus : 0)
    }

    return { modifiers, proficient }
  }, [character.saving_throw_proficiencies, abilities])
}

/**
 * RG-8-1-04: Niveaux de maîtrise de compétence (none, proficient, expertise)
 * RG-8-1-05: Calcul des modificateurs de compétence
 * - none: modificateur d'attribut
 * - proficient: modificateur d'attribut + bonus de maîtrise
 * - expertise: modificateur d'attribut + 2 × bonus de maîtrise
 * RG-8-1-06: Perception passive = 10 + modificateur final Perception
 */
export function useCalculatedSkills(
  character: PlayerCharacter,
  abilities: CalculatedAbilities
) {
  return useMemo(() => {
    const modifiers: Record<SkillName, number> = {} as Record<SkillName, number>
    const proficiency: Record<SkillName, SkillProficiency> = {} as Record<SkillName, SkillProficiency>

    for (const skill of ALL_SKILLS) {
      const skillProficiency = character.skills[skill]
      const ability = getSkillAbility(skill)
      const abilityMod = abilities.modifiers[ability]

      proficiency[skill] = skillProficiency

      switch (skillProficiency) {
        case 'expertise':
          modifiers[skill] = abilityMod + 2 * abilities.proficiencyBonus
          break
        case 'proficient':
          modifiers[skill] = abilityMod + abilities.proficiencyBonus
          break
        case 'none':
        default:
          modifiers[skill] = abilityMod
          break
      }
    }

    // RG-8-1-06: Perception passive
    const passivePerception = 10 + modifiers.perception

    return { modifiers, proficiency, passivePerception }
  }, [character.skills, abilities])
}

/**
 * RG-8-1-07: Calcul de l'initiative tactique
 * Initiative = modificateur DEX + bonus initiative divers (ex: don Alerte)
 */
export function useCalculatedInitiative(
  character: PlayerCharacter,
  abilities: CalculatedAbilities
) {
  return useMemo(() => {
    const dexModifier = abilities.modifiers.dex
    const miscBonus = character.initiative_misc_bonus
    const initiative = dexModifier + miscBonus

    return {
      initiative,
      dexModifier,
      miscBonus,
    }
  }, [abilities.modifiers.dex, character.initiative_misc_bonus])
}

/**
 * RG-8-1-08: Calculs magiques
 * Si spellcasting_ability !== 'none':
 * - DD de sauvegarde des sorts = 8 + bonus de maîtrise + modificateur caractéristique magique
 * - Bonus d'attaque magique = bonus de maîtrise + modificateur caractéristique magique
 */
export function useCalculatedSpellcasting(
  character: PlayerCharacter,
  abilities: CalculatedAbilities
) {
  return useMemo(() => {
    const spellcastingAbility = character.spellcasting_ability

    if (spellcastingAbility === 'none') {
      return {
        spellSaveDC: null,
        spellAttackBonus: null,
      }
    }

    const abilityMod = abilities.modifiers[spellcastingAbility]
    const spellSaveDC = 8 + abilities.proficiencyBonus + abilityMod
    const spellAttackBonus = abilities.proficiencyBonus + abilityMod

    return {
      spellSaveDC,
      spellAttackBonus,
    }
  }, [character.spellcasting_ability, abilities])
}

/**
 * Hook utilitaire pour obtenir les modificateurs de toutes les compétences d'un coup
 * Utile pour l'affichage en grille dans le builder
 */
export function useAllSkillModifiers(character: PlayerCharacter) {
  const { skills } = useCharacterCalculations(character)
  return skills.modifiers
}

/**
 * Hook utilitaire pour obtenir les jets de sauvegarde calculés
 */
export function useAllSavingThrowModifiers(character: PlayerCharacter) {
  const { savingThrows } = useCharacterCalculations(character)
  return savingThrows.modifiers
}

/**
 * Hook pour la perception passive (RG-8-1-06)
 */
export function usePassivePerception(character: PlayerCharacter) {
  const { skills } = useCharacterCalculations(character)
  return skills.passivePerception
}

/**
 * Hook pour l'initiative (RG-8-1-07)
 */
export function useInitiative(character: PlayerCharacter) {
  const { initiative } = useCharacterCalculations(character)
  return initiative.initiative
}

/**
 * Hook pour les calculs magiques (RG-8-1-08)
 */
export function useSpellcastingCalculations(character: PlayerCharacter) {
  const { spellcasting } = useCharacterCalculations(character)
  return spellcasting
}

/**
 * Vérifie si un personnage est un lanceur de sorts
 */
export function useIsSpellcaster(character: PlayerCharacter): boolean {
  return useMemo(() => character.spellcasting_ability !== 'none', [character.spellcasting_ability])
}

/**
 * Obtient les slots de sorts disponibles pour un niveau donné
 */
export function useSpellSlotsForLevel(character: PlayerCharacter, level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
  return useMemo(() => {
    const slotKey = String(level) as keyof typeof character.spell_slots
    return character.spell_slots[slotKey] ?? { max: 0, current: 0 }
  }, [character.spell_slots, level])
}

/**
 * Calcule le nombre total de sorts préparés possibles selon la règle D&D 2024
 * (Niveau de personnage + modificateur caractéristique d'incantation, minimum 1)
 */
export function useMaxPreparedSpells(character: PlayerCharacter) {
  return useMemo(() => {
    if (character.spellcasting_ability === 'none') return 0
    const abilityMod = getAbilityModifier(character.abilities[character.spellcasting_ability])
    return Math.max(1, character.level + abilityMod)
  }, [character.level, character.spellcasting_ability, character.abilities])
}