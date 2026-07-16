import type { 
  SpellcastingAbility, 
  SpellSlots, 
  SpellcastingSource, 
  PreparedSpell,
  SpellcastingProgression 
} from '../types/character'
import { getAbilityModifier } from '../types/character'

/** Type pour slots de sorts partiels (seuls les niveaux débloqués) */
export type PartialSpellSlots = Partial<SpellSlots>

/** Configuration d'un don donnant des sorts (D&D 2024) */
export interface SpellcastingFeatConfig {
  id: string
  name: string
  description: string
  abilityChoices: SpellcastingAbility[]  // Caractéristiques possibles
  grantedCantrips: number
  grantedSpellsLevel1: number  // Nombre de sorts niveau 1 accordés
  spellList: 'bard' | 'cleric' | 'druid' | 'sorcerer' | 'wizard' | 'warlock' | 'paladin' | 'ranger' | 'any'
  ritualCaster?: boolean
  alwaysPrepared?: PreparedSpell[]  // Sorts toujours préparés (ex: Fey Touched = Misty Step)
}

/**
 * Configuration de progression de sorts par classe
 */
export interface ClassSpellcastingConfig {
  progression: SpellcastingProgression
  ability: SpellcastingAbility
  spellcastingLevel: number  // Niveau où la magie commence (1 pour la plupart, 2 pour Paladin, 3 pour EK/AT)
  cantripsKnown?: number[]   // Cantrips connus par niveau [niv1, niv2, ...] ou nombre fixe
  spellsPreparedFormula?: 'level+mod' | 'level+mod-min1'  // Formule D&D 2024
}

/**
 * Configuration de sorts pour chaque classe SRD 2024
 * Basé sur Player's Handbook 2024
 */
export const CLASS_SPELLCASTING_CONFIG: Record<string, ClassSpellcastingConfig> = {
  // Full casters (niveau 1-9)
  bard: {
    progression: 'full',
    ability: 'cha',
    spellcastingLevel: 1,
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsPreparedFormula: 'level+mod',
  },
  cleric: {
    progression: 'full',
    ability: 'wis',
    spellcastingLevel: 1,
    cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    spellsPreparedFormula: 'level+mod',
  },
  druid: {
    progression: 'full',
    ability: 'wis',
    spellcastingLevel: 1,
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsPreparedFormula: 'level+mod',
  },
  sorcerer: {
    progression: 'full',
    ability: 'cha',
    spellcastingLevel: 1,
    cantripsKnown: [4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    spellsPreparedFormula: 'level+mod',
  },
  wizard: {
    progression: 'full',
    ability: 'int',
    spellcastingLevel: 1,
    cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    spellsPreparedFormula: 'level+mod',
  },

  // Half casters (niveau 1-5, progression moitié)
  paladin: {
    progression: 'half',
    ability: 'cha',
    spellcastingLevel: 2,
    cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    spellsPreparedFormula: 'level+mod',
  },
  ranger: {
    progression: 'half',
    ability: 'wis',
    spellcastingLevel: 1,
    cantripsKnown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    spellsPreparedFormula: 'level+mod',
  },

  // Third casters (niveau 1-4, progression tiers)
  fighter: {
    progression: 'third',
    ability: 'int',
    spellcastingLevel: 3,  // Eldritch Knight seulement
    cantripsKnown: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    spellsPreparedFormula: 'level+mod',
  },
  rogue: {
    progression: 'third',
    ability: 'int',
    spellcastingLevel: 3,  // Arcane Trickster seulement
    cantripsKnown: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    spellsPreparedFormula: 'level+mod',
  },

  // Pact Magic (Warlock - mécanique unique)
  warlock: {
    progression: 'pact',
    ability: 'cha',
    spellcastingLevel: 1,
    cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsPreparedFormula: 'level+mod',
  },

  // Non-casters
  barbarian: { progression: 'none', ability: 'none', spellcastingLevel: 0, cantripsKnown: [] },
  monk: { progression: 'none', ability: 'none', spellcastingLevel: 0, cantripsKnown: [] },
}

/**
 * Configuration des sorts innés par race/lignée (PHB 2024)
 * Utilisé pour créer automatiquement une source d'incantation de type 'race'
 */
export interface RaceSpellcastingConfig {
  ability: SpellcastingAbility
  cantrips: string[]           // Noms des cantrips (fixes ou 'choice-sorcerer' pour Haut-Elfe)
  spells: { name: string; level: number }[]  // Sorts innés avec leur niveau
  cantripChoice?: 'sorcerer'   // Si true, l'utilisateur doit choisir 1 cantrip liste Sorcier
}

/** Mapping species (race) -> configuration sorts innés PHB 2024 */
export const RACE_SPELLCASTING_CONFIG: Record<string, RaceSpellcastingConfig> = {
  // Tiefling (PHB 2024)
  tiefling: {
    ability: 'cha',
    cantrips: ['Thaumaturgy'],
    spells: [
      { name: 'Hellish Rebuke', level: 2 },
      { name: 'Darkness', level: 3 },
    ],
  },
  // Drow (Elfe) - PHB 2024
  drow: {
    ability: 'cha',
    cantrips: ['Dancing Lights'],
    spells: [
      { name: 'Faerie Fire', level: 1 },
      { name: 'Darkness', level: 2 },
    ],
  },
  // Haut-Elfe (High Elf) - PHB 2024 : choix 1 cantrip liste Sorcier
  'high-elf': {
    ability: 'int',
    cantrips: ['choice-sorcerer'],
    spells: [],
    cantripChoice: 'sorcerer',
  },
  // Gnome des forêts (Forest Gnome) - PHB 2024
  'forest-gnome': {
    ability: 'int',
    cantrips: ['Minor Illusion'],
    spells: [
      { name: 'Speak with Animals', level: 1 },
    ],
  },
  // Gnome des profondeurs (Deep Gnome) - PHB 2024
  'deep-gnome': {
    ability: 'int',
    cantrips: [],
    spells: [
      { name: 'Disguise Self', level: 1 },
      { name: 'Nondetection', level: 2 },
    ],
  },
  // Asimar (PHB 2024)
  aasimar: {
    ability: 'cha',
    cantrips: ['Light'],
    spells: [
      { name: 'Healing Hands', level: 1 },
    ],
  },
  // Génasi (Air, Terre, Feu, Eau) - simplifié, à affiner selon sous-race
  'air-genasi': {
    ability: 'con',
    cantrips: ['Shocking Grasp'],
    spells: [
      { name: 'Feather Fall', level: 1 },
      { name: 'Levitate', level: 2 },
    ],
  },
  'earth-genasi': {
    ability: 'con',
    cantrips: ['Blade Ward'],
    spells: [
      { name: 'Pass without Trace', level: 2 },
    ],
  },
  'fire-genasi': {
    ability: 'con',
    cantrips: ['Produce Flame'],
    spells: [
      { name: 'Burning Hands', level: 1 },
      { name: 'Flame Blade', level: 2 },
    ],
  },
  'water-genasi': {
    ability: 'con',
    cantrips: ['Shape Water'],
    spells: [
      { name: 'Create or Destroy Water', level: 1 },
      { name: 'Water Walk', level: 3 },
    ],
  },
}

/**
 * Table de progression des slots pour Full Casters (Bard, Cleric, Druid, Sorcerer, Wizard)
 * Niveaux 1-20, slots 1-9
 */
export const FULL_CASTER_SLOTS: Record<number, PartialSpellSlots> = {
  1: { '1': { max: 2, current: 2 } },
  2: { '1': { max: 3, current: 3 } },
  3: { '1': { max: 4, current: 4 }, '2': { max: 2, current: 2 } },
  4: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 } },
  5: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 2, current: 2 } },
  6: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 } },
  7: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 1, current: 1 } },
  8: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 2, current: 2 } },
  9: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 1, current: 1 } },
  10: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 } },
  11: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 } },
  12: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 } },
  13: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 }, '7': { max: 1, current: 1 } },
  14: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 }, '7': { max: 1, current: 1 } },
  15: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 }, '7': { max: 1, current: 1 }, '8': { max: 1, current: 1 } },
  16: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 }, '7': { max: 1, current: 1 }, '8': { max: 1, current: 1 } },
  17: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 }, '6': { max: 1, current: 1 }, '7': { max: 1, current: 1 }, '8': { max: 1, current: 1 }, '9': { max: 1, current: 1 } },
  18: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 3, current: 3 }, '6': { max: 1, current: 1 }, '7': { max: 1, current: 1 }, '8': { max: 1, current: 1 }, '9': { max: 1, current: 1 } },
  19: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 3, current: 3 }, '6': { max: 2, current: 2 }, '7': { max: 1, current: 1 }, '8': { max: 1, current: 1 }, '9': { max: 1, current: 1 } },
  20: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 3, current: 3 }, '6': { max: 2, current: 2 }, '7': { max: 2, current: 2 }, '8': { max: 1, current: 1 }, '9': { max: 1, current: 1 } },
}

/**
 * Table de progression des slots pour Half Casters (Paladin, Ranger)
 * Progression = niveau de lanceur = floor((classLevel + 1) / 2) pour Paladin (commence niv 2)
 * Pour Ranger : floor(classLevel / 2)
 */
export const HALF_CASTER_SLOTS: Record<number, PartialSpellSlots> = {
  // Niveau de lanceur 1 (Paladin niv 2, Ranger niv 1)
  1: { '1': { max: 2, current: 2 } },
  // Niveau de lanceur 2 (Paladin niv 3-4, Ranger niv 2-3)
  2: { '1': { max: 3, current: 3 } },
  // Niveau de lanceur 3 (Paladin niv 5-6, Ranger niv 4-5)
  3: { '1': { max: 4, current: 4 }, '2': { max: 2, current: 2 } },
  // Niveau de lanceur 4 (Paladin niv 7-8, Ranger niv 6-7)
  4: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 } },
  // Niveau de lanceur 5 (Paladin niv 9-10, Ranger niv 8-9)
  5: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 2, current: 2 } },
  // Niveau de lanceur 6 (Paladin niv 11-12, Ranger niv 10-11)
  6: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 } },
  // Niveau de lanceur 7 (Paladin niv 13-14, Ranger niv 12-13)
  7: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 1, current: 1 } },
  // Niveau de lanceur 8 (Paladin niv 15-16, Ranger niv 14-15)
  8: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 2, current: 2 } },
  // Niveau de lanceur 9 (Paladin niv 17-18, Ranger niv 16-17)
  9: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 1, current: 1 } },
  // Niveau de lanceur 10 (Paladin niv 19-20, Ranger niv 18-20)
  10: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 3, current: 3 }, '5': { max: 2, current: 2 } },
}

/**
 * Table de progression des slots pour Third Casters (Eldritch Knight, Arcane Trickster)
 * Niveau de lanceur = floor(classLevel / 3)
 */
export const THIRD_CASTER_SLOTS: Record<number, PartialSpellSlots> = {
  // Niveau de lanceur 1 (niv 3-5)
  1: { '1': { max: 2, current: 2 } },
  // Niveau de lanceur 2 (niv 6-8)
  2: { '1': { max: 3, current: 3 } },
  // Niveau de lanceur 3 (niv 9-11)
  3: { '1': { max: 4, current: 4 }, '2': { max: 2, current: 2 } },
  // Niveau de lanceur 4 (niv 12-14)
  4: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 } },
  // Niveau de lanceur 5 (niv 15-17)
  5: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 2, current: 2 } },
  // Niveau de lanceur 6 (niv 18-19)
  6: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 } },
  // Niveau de lanceur 7 (niv 20)
  7: { '1': { max: 4, current: 4 }, '2': { max: 3, current: 3 }, '3': { max: 3, current: 3 }, '4': { max: 1, current: 1 } },
}

/**
 * Table de slots pour Pact Magic (Warlock)
 * Slots uniques par niveau, recharge au repos court
 */
export const PACT_MAGIC_SLOTS: Record<number, { level: number; max: number; current: number }> = {
  1: { level: 1, max: 1, current: 1 },
  2: { level: 1, max: 2, current: 2 },
  3: { level: 2, max: 2, current: 2 },
  4: { level: 2, max: 2, current: 2 },
  5: { level: 3, max: 2, current: 2 },
  6: { level: 3, max: 2, current: 2 },
  7: { level: 4, max: 2, current: 2 },
  8: { level: 4, max: 2, current: 2 },
  9: { level: 5, max: 2, current: 2 },
  10: { level: 5, max: 2, current: 2 },
  11: { level: 5, max: 3, current: 3 },  // Mystic Arcanum 6th level (1/day, not a slot)
  12: { level: 5, max: 3, current: 3 },
  13: { level: 5, max: 3, current: 3 },  // Mystic Arcanum 7th level
  14: { level: 5, max: 3, current: 3 },
  15: { level: 5, max: 3, current: 3 },  // Mystic Arcanum 8th level
  16: { level: 5, max: 3, current: 3 },
  17: { level: 5, max: 4, current: 4 },  // Mystic Arcanum 9th level
  18: { level: 5, max: 4, current: 4 },
  19: { level: 5, max: 4, current: 4 },
  20: { level: 5, max: 4, current: 4 },
}

/**
 * Obtient la configuration de sortilège pour une classe
 */
export function getClassSpellcastingConfig(classId: string): ClassSpellcastingConfig {
  return CLASS_SPELLCASTING_CONFIG[classId] ?? { progression: 'none', ability: 'none', spellcastingLevel: 0 }
}

/**
 * Calcule le niveau de lanceur effectif selon la classe et le niveau de personnage
 */
export function getEffectiveCasterLevel(classId: string, characterLevel: number): number {
  const config = getClassSpellcastingConfig(classId)
  
  if (config.progression === 'none') return 0
  if (characterLevel < config.spellcastingLevel) return 0

  switch (config.progression) {
    case 'full':
      return characterLevel
    case 'half':
      // Paladin commence au niveau 2, Ranger au niveau 1
      if (classId === 'paladin') {
        return Math.floor((characterLevel - 1) / 2)
      }
      return Math.floor(characterLevel / 2)
    case 'third':
      return Math.floor(characterLevel / 3)
    case 'pact':
      return characterLevel  // Warlock utilise son niveau de classe complet pour les slots
    default:
      return 0
  }
}

/**
 * Obtient les slots de sorts pour une classe et un niveau donnés
 */
export function getSpellSlotsForClass(classId: string, characterLevel: number): PartialSpellSlots {
  const config = getClassSpellcastingConfig(classId)
  const casterLevel = getEffectiveCasterLevel(classId, characterLevel)

  if (casterLevel === 0) return {}

  switch (config.progression) {
    case 'full':
      return FULL_CASTER_SLOTS[casterLevel] ?? {}
    case 'half':
      return HALF_CASTER_SLOTS[casterLevel] ?? {}
    case 'third':
      return THIRD_CASTER_SLOTS[casterLevel] ?? {}
    case 'pact': {
      // Pour Warlock, on retourne un format spécial
      const pactSlot = PACT_MAGIC_SLOTS[characterLevel]
      if (!pactSlot) return {}
      // Convertir en format standard pour l'affichage (un seul niveau de slot)
      const slots: PartialSpellSlots = {}
      for (let i = 1; i <= pactSlot.level; i++) {
        if (i === pactSlot.level) {
          slots[String(i) as keyof PartialSpellSlots] = { max: pactSlot.max, current: pactSlot.current }
        } else {
          slots[String(i) as keyof PartialSpellSlots] = { max: 0, current: 0 }
        }
      }
      return slots
    }
    default:
      return {}
  }
}

/**
 * Obtient le nombre de cantrips connus pour une classe à un niveau donné
 */
export function getCantripsKnown(classId: string, characterLevel: number): number {
  const config = getClassSpellcastingConfig(classId)
  if (!config.cantripsKnown || config.cantripsKnown.length === 0) return 0
  const index = Math.min(characterLevel - 1, config.cantripsKnown.length - 1)
  return config.cantripsKnown[index] ?? 0
}

/**
 * Calcule le nombre max de sorts préparés selon la formule D&D 2024
 * Formule standard : niveau de personnage + modificateur de caractéristique d'incantation (minimum 1)
 */
export function getMaxPreparedSpells(
  classId: string, 
  characterLevel: number, 
  spellcastingAbility: SpellcastingAbility,
  _abilities: Record<string, number>
): number {
  const config = getClassSpellcastingConfig(classId)
  if (config.progression === 'none' || spellcastingAbility === 'none') return 0
  
  const casterLevel = getEffectiveCasterLevel(classId, characterLevel)
  if (casterLevel === 0) return 0

  const abilityMod = getAbilityModifier(_abilities[spellcastingAbility] ?? 10)
  
  // Warlock et autres casters "known spells" n'ont pas de limite de préparation
  if (config.progression === 'pact') {
    // Warlock : sorts connus = niveau + mod (mais géré différemment)
    return Math.max(1, casterLevel + abilityMod)
  }

  // Formule standard D&D 2024 : niveau de lanceur + modifiant caractéristique (min 1)
  return Math.max(1, casterLevel + abilityMod)
}

/**
 * Applique automatiquement la configuration de sortilège quand la classe change
 * Retourne les champs à mettre à jour
 */
export function autoConfigureSpellcasting(
  classId: string, 
  characterLevel: number, 
  _abilities: Record<string, number>,
  currentSpellcastingAbility: SpellcastingAbility
): {
  spellcasting_ability: SpellcastingAbility
  spell_slots: PartialSpellSlots
  cantrips_known: number
  max_prepared_spells: number
} {
  const config = getClassSpellcastingConfig(classId)
  
  // Ne pas écraser si l'utilisateur a déjà choisi une caractéristique (multiclasse, feat, etc.)
  // Mais si c'est 'none' ou non défini, on auto-configure
  const shouldAutoConfigure = currentSpellcastingAbility === 'none' || currentSpellcastingAbility === config.ability
  
  const spellcasting_ability = shouldAutoConfigure ? config.ability : currentSpellcastingAbility
  const spell_slots = getSpellSlotsForClass(classId, characterLevel)
  const cantrips_known = getCantripsKnown(classId, characterLevel)
  const max_prepared_spells = getMaxPreparedSpells(classId, characterLevel, spellcasting_ability, _abilities)

  return {
    spellcasting_ability,
    spell_slots,
    cantrips_known,
    max_prepared_spells,
  }
}

/**
 * Crée une source d'incantation principale à partir de la classe
 */
export function createPrimarySpellcastingSource(
  classId: string,
  characterLevel: number
): SpellcastingSource | null {
  const config = getClassSpellcastingConfig(classId)
  if (config.progression === 'none') return null

  const casterLevel = getEffectiveCasterLevel(classId, characterLevel)
  if (casterLevel === 0) return null

  const cantripsKnown = getCantripsKnown(classId, characterLevel)

  return {
    id: `class-${classId}`,
    type: 'class',
    name: classId.charAt(0).toUpperCase() + classId.slice(1),
    ability: config.ability,
    spellcastingLevel: casterLevel,
    progression: config.progression,
    cantripsKnown,
    preparedSpells: [],
    alwaysPrepared: [],
    sourceDetail: `Niveau ${characterLevel}`,
  }
}

/**
 * Combine les slots de sorts de toutes les sources selon la table multiclasse D&D 2024
 * Règle : Somme des niveaux de lanceur effectifs par type de progression
 */
export function combineSpellSlots(sources: SpellcastingSource[]): PartialSpellSlots {
  // Calculer le niveau de lanceur total par type de progression
  let fullCasterLevel = 0
  let halfCasterLevel = 0
  let thirdCasterLevel = 0
  let pactCasterLevel = 0

  for (const source of sources) {
    switch (source.progression) {
      case 'full':
        fullCasterLevel += source.spellcastingLevel
        break
      case 'half':
        halfCasterLevel += source.spellcastingLevel
        break
      case 'third':
        thirdCasterLevel += source.spellcastingLevel
        break
      case 'pact':
        pactCasterLevel += source.spellcastingLevel
        break
    }
  }

  // Table multiclasse officielle D&D 2024
  // Niveau de lanceur total = full + half/2 + third/3 (arrondi下)
  const totalCasterLevel = fullCasterLevel + Math.floor(halfCasterLevel / 2) + Math.floor(thirdCasterLevel / 3)
  
  // Pour Pact Magic, on garde les slots séparés (recharge repos court)
  // Mais pour l'affichage combiné, on utilise la table full caster pour le niveau total
  const combinedSlots = { ...FULL_CASTER_SLOTS[totalCasterLevel] ?? {} }

  // Ajouter les slots de Pact Magic (Warlock) - ils sont séparés
  if (pactCasterLevel > 0) {
    const pactSlot = PACT_MAGIC_SLOTS[pactCasterLevel]
    if (pactSlot) {
      // Les slots de warlock sont au niveau pactSlot.level
      // On les ajoute comme slots additionnels
      const existing = combinedSlots[String(pactSlot.level) as keyof PartialSpellSlots]
      if (existing) {
        combinedSlots[String(pactSlot.level) as keyof PartialSpellSlots] = {
          max: existing.max + pactSlot.max,
          current: existing.current + pactSlot.current,
        }
      } else {
        combinedSlots[String(pactSlot.level) as keyof PartialSpellSlots] = {
          max: pactSlot.max,
          current: pactSlot.current,
        }
      }
    }
  }

  return combinedSlots
}

/**
 * Calcule le DD des sorts pour une source donnée
 */
export function getSpellSaveDC(source: SpellcastingSource, proficiencyBonus: number, abilities: Record<string, number>): number {
  if (source.ability === 'none') return 0
  const abilityMod = getAbilityModifier(abilities[source.ability] ?? 10)
  return 8 + proficiencyBonus + abilityMod
}

/**
 * Calcule le bonus d'attaque magique pour une source donnée
 */
export function getSpellAttackBonus(source: SpellcastingSource, proficiencyBonus: number, abilities: Record<string, number>): number {
  if (source.ability === 'none') return 0
  const abilityMod = getAbilityModifier(abilities[source.ability] ?? 10)
  return proficiencyBonus + abilityMod
}

/**
 * Calcule le max de sorts préparés pour une source
 */
export function getMaxPreparedSpellsForSource(source: SpellcastingSource, abilities: Record<string, number>): number {
  if (source.ability === 'none' || source.progression === 'none') return 0
  if (source.progression === 'pact') {
    // Warlock : sorts connus (pas préparés)
    return Math.max(1, source.spellcastingLevel + getAbilityModifier(abilities[source.ability] ?? 10))
  }
  // Formule standard : niveau de lanceur + mod caractéristique (min 1)
  return Math.max(1, source.spellcastingLevel + getAbilityModifier(abilities[source.ability] ?? 10))
}

/**
 * Configuration des dons de sortilège D&D 2024
 */
export const SPELLCASTING_FEATS: SpellcastingFeatConfig[] = [
  {
    id: 'magic-initiate',
    name: 'Initié à la magie (Magic Initiate)',
    description: 'Apprenez 2 tours de magie et 1 sort de niveau 1 (1/jour) d\'une liste de classe au choix',
    abilityChoices: ['int', 'wis', 'cha'],
    grantedCantrips: 2,
    grantedSpellsLevel1: 1,
    spellList: 'any',
  },
  {
    id: 'ritual-caster',
    name: 'Lanceur de rituels (Ritual Caster)',
    description: 'Apprenez 2 sorts rituels de niveau 1 et pouvez en copier d\'autres dans votre livre de rituels',
    abilityChoices: ['int', 'wis', 'cha'],
    grantedCantrips: 0,
    grantedSpellsLevel1: 2,
    spellList: 'any',
    ritualCaster: true,
  },
  {
    id: 'fey-touched',
    name: 'Touché par les fées (Fey Touched)',
    description: 'Augmentez Int, Sag ou Cha de 1. Apprenez Étape brumeuse et 1 sort de divination/enchantement de niveau 1',
    abilityChoices: ['int', 'wis', 'cha'],
    grantedCantrips: 0,
    grantedSpellsLevel1: 1,
    spellList: 'any',
    alwaysPrepared: [
      { name: 'Étape brumeuse (Misty Step)', level: 2, casting_time: 'Action bonus', components: 'V', concentration: false, range: 'Personnel', description: 'Téléportation 9m' },
    ],
  },
  {
    id: 'shadow-touched',
    name: 'Touché par l\'ombre (Shadow Touched)',
    description: 'Augmentez Int, Sag ou Cha de 1. Apprenez Invisibilité et 1 sort d\'illusion/nécromancie de niveau 1',
    abilityChoices: ['int', 'wis', 'cha'],
    grantedCantrips: 0,
    grantedSpellsLevel1: 1,
    spellList: 'any',
    alwaysPrepared: [
      { name: 'Invisibilité (Invisibility)', level: 2, casting_time: 'Action', components: 'V, S, M', concentration: true, range: 'Contact', description: 'Invisibilité 1h' },
    ],
  },
  {
    id: 'aberrant-dragonmark',
    name: 'Marque draconique aberrante (Aberrant Dragonmark)',
    description: 'Augmentez Con de 1. Apprenez 1 tour de magie et 1 sort de niveau 1 (Constitution). Jet de sauvegarde Con pour éviter dégâts',
    abilityChoices: ['con'],
    grantedCantrips: 1,
    grantedSpellsLevel1: 1,
    spellList: 'any',
  },
]

/**
 * Crée une source d'incantation à partir d'un don
 */
export function createFeatSpellcastingSource(
  featId: string,
  chosenAbility: SpellcastingAbility
): SpellcastingSource | null {
  const feat = SPELLCASTING_FEATS.find(f => f.id === featId)
  if (!feat) return null
  if (!feat.abilityChoices.includes(chosenAbility)) return null

  // Pour les dons, le niveau de lanceur est généralement 1 (ou niveau de personnage pour certains)
  const casterLevel = 1 // Les dons donnent généralement des sorts comme un lanceur niveau 1
  
  return {
    id: `feat-${featId}`,
    type: 'feat',
    name: feat.name,
    ability: chosenAbility,
    spellcastingLevel: casterLevel,
    progression: 'none', // Les dons n'ajoutent pas de progression de slots
    cantripsKnown: feat.grantedCantrips,
    preparedSpells: [],
    alwaysPrepared: feat.alwaysPrepared ?? [],
    grantedSpells: [], // Sera rempli par l'utilisateur via le sélecteur de sorts
    sourceDetail: `Don: ${feat.name}`,
  }
}

/**
 * Crée une source d'incantation à partir d'une race/lignée (sorts innés)
 */
export function createRaceSpellcastingSource(
  species: string,
  chosenCantrip?: string  // Pour Haut-Elfe : le cantrip choisi
): SpellcastingSource | null {
  const config = RACE_SPELLCASTING_CONFIG[species.toLowerCase()]
  if (!config) return null

  // Gérer le choix de cantrip pour Haut-Elfe
  let finalCantrips = [...config.cantrips]
  if (config.cantripChoice === 'sorcerer' && chosenCantrip) {
    finalCantrips = [chosenCantrip]
  } else if (config.cantripChoice === 'sorcerer' && !chosenCantrip) {
    // Pas de choix fait, on ne crée pas la source
    return null
  }

  // Convertir les sorts innés en PreparedSpell
  const alwaysPrepared: PreparedSpell[] = config.spells.map(spell => ({
    name: spell.name,
    level: spell.level,
    casting_time: 'Action',
    components: 'V, S',
    concentration: false,
    range: '9m',
    description: `Sort inné (${species})`,
  }))

  return {
    id: `race-${species.toLowerCase()}`,
    type: 'race',
    name: species.charAt(0).toUpperCase() + species.slice(1),
    ability: config.ability,
    spellcastingLevel: 1, // Les sorts innés sont généralement lancés au niveau 1
    progression: 'none', // Les races n'ajoutent pas de progression de slots
    cantripsKnown: finalCantrips.length,
    preparedSpells: [],
    alwaysPrepared,
    sourceDetail: `Race: ${species}`,
  }
}

/**
 * Crée une source d'incantation à partir d'un objet magique (saisie libre)
 */
export interface ItemSpellcastingInput {
  name: string
  ability: SpellcastingAbility
  cantripsKnown: number
  preparedSpells: PreparedSpell[]
  alwaysPrepared?: PreparedSpell[]
  charges: number
  rechargeType: 'long' | 'short' | 'dawn' | 'none'
  spellcastingLevel: number
}

export function createItemSpellcastingSource(input: ItemSpellcastingInput): SpellcastingSource {
  return {
    id: `item-${input.name.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'item',
    name: input.name,
    ability: input.ability,
    spellcastingLevel: input.spellcastingLevel,
    progression: 'none', // Les objets n'ajoutent pas de progression de slots
    cantripsKnown: input.cantripsKnown,
    preparedSpells: input.preparedSpells,
    alwaysPrepared: input.alwaysPrepared ?? [],
    sourceDetail: `Objet: ${input.name} (${input.charges} charges, recharge: ${input.rechargeType})`,
  }
}