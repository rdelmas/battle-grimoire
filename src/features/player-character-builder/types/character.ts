

/** Niveau de maîtrise d'une compétence (D&D 2024) */
export type SkillProficiency = 'none' | 'proficient' | 'expertise'

/** Caractéristiques principales (Ability Scores) */
export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

/** Maîtrises de jets de sauvegarde */
export type SavingThrowProficiency = keyof AbilityScores

/** Compétences officielles D&D 2024 (18 compétences) */
export type SkillName =
  | 'acrobatics'
  | 'animal_handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight_of_hand'
  | 'stealth'

/** Mapping caractéristique -> compétences associées */
export const SKILL_ABILITY_MAP: Record<SkillName, keyof AbilityScores> = {
  acrobatics: 'dex',
  animal_handling: 'wis',
  arcana: 'int',
  athletics: 'str',
  deception: 'cha',
  history: 'int',
  insight: 'wis',
  intimidation: 'cha',
  investigation: 'int',
  medicine: 'wis',
  nature: 'int',
  perception: 'wis',
  performance: 'cha',
  persuasion: 'cha',
  religion: 'int',
  sleight_of_hand: 'dex',
  stealth: 'dex',
} as const

/** Maîtrises d'armes (Weapon Mastery D&D 2024) */
export type WeaponMasteryProperty =
  | 'cleave'
  | 'graze'
  | 'nick'
  | 'push'
  | 'sap'
  | 'slow'
  | 'topple'
  | 'vex'

export interface WeaponMastery {
  weapon: string
  property: WeaponMasteryProperty
}

/** Dons */
export interface Feat {
  name: string
  description: string
  category?: 'origin' | 'general' | 'epic'
}

/** Configuration des emplacements de sorts par niveau */
export interface SpellSlotConfig {
  max: number
  current: number
}

/** Sort préparé */
export interface PreparedSpell {
  name: string
  level: number // 0 = cantrip, 1-9 = spell levels
  casting_time: string
  components: string
  concentration: boolean
  range: string
  description?: string
}

/** Caractéristique d'incantation */
export type SpellcastingAbility = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'none'

/** Configuration des emplacements de sorts (niveaux 1-9) */
export interface SpellSlots {
  '1': SpellSlotConfig
  '2': SpellSlotConfig
  '3': SpellSlotConfig
  '4': SpellSlotConfig
  '5': SpellSlotConfig
  '6': SpellSlotConfig
  '7': SpellSlotConfig
  '8': SpellSlotConfig
  '9': SpellSlotConfig
}

/** Modèle complet d'un Personnage Joueur (D&D 2024 / 5.5e) */
export interface PlayerCharacter {
  // Identifiants
  id: string
  player_name: string
  character_name: string

  // Identité & Progression
  level: number // 1-20
  species: string // ex: "Elf", "Human", "Halfling"
  background: string // ex: "Soldier", "Acolyte"
  class_name: string // ex: "Fighter", "Wizard"
  subclass_name?: string // ex: "Champion", "Evoker" (généralement niveau 3+)

  // Statistiques Vitales de Combat
  armor_class: number
  hit_points_max: number
  speed: string // ex: "9m", "9m, fly 9m"
  initiative_misc_bonus: number // bonus hors DEX (ex: don Alerte)

  // Caractéristiques & Sauvegardes
  abilities: AbilityScores
  saving_throw_proficiencies: SavingThrowProficiency[]

  // Compétences (D&D 2024 : 18 compétences)
  skills: Record<SkillName, SkillProficiency>
  passive_perception: number // calculé automatiquement

  // Arsenal Tactique & Maîtrises (D&D 2024)
  weapon_masteries: WeaponMastery[]
  origin_feat: Feat
  general_feats: Feat[]

  // Module de Magie & Sorts
  spellcasting_ability: SpellcastingAbility
  spell_slots: Partial<SpellSlots> // seulement les niveaux débloqués selon classe/niveau
  prepared_spells: PreparedSpell[]

  // Métadonnées d'état
  is_dead: boolean
  created_at: number
  updated_at: number
}

/** Valeurs par défaut pour un nouveau personnage */
export const DEFAULT_ABILITIES: AbilityScores = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
}

export const DEFAULT_SKILLS: Record<SkillName, SkillProficiency> = {
  acrobatics: 'none',
  animal_handling: 'none',
  arcana: 'none',
  athletics: 'none',
  deception: 'none',
  history: 'none',
  insight: 'none',
  intimidation: 'none',
  investigation: 'none',
  medicine: 'none',
  nature: 'none',
  perception: 'none',
  performance: 'none',
  persuasion: 'none',
  religion: 'none',
  sleight_of_hand: 'none',
  stealth: 'none',
}

export const DEFAULT_SPELL_SLOTS: SpellSlots = {
  '1': { max: 0, current: 0 },
  '2': { max: 0, current: 0 },
  '3': { max: 0, current: 0 },
  '4': { max: 0, current: 0 },
  '5': { max: 0, current: 0 },
  '6': { max: 0, current: 0 },
  '7': { max: 0, current: 0 },
  '8': { max: 0, current: 0 },
  '9': { max: 0, current: 0 },
}

export const DEFAULT_SPELLCASTING_ABILITY: SpellcastingAbility = 'none'

/** Crée un personnage par défaut vierge */
export function createEmptyCharacter(overrides: Partial<PlayerCharacter> = {}): PlayerCharacter {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    player_name: '',
    character_name: '',
    level: 1,
    species: '',
    background: '',
    class_name: '',
    subclass_name: undefined,
    armor_class: 10,
    hit_points_max: 1,
    speed: '9m',
    initiative_misc_bonus: 0,
    abilities: { ...DEFAULT_ABILITIES },
    saving_throw_proficiencies: [],
    skills: { ...DEFAULT_SKILLS },
    passive_perception: 10,
    weapon_masteries: [],
    origin_feat: { name: '', description: '' },
    general_feats: [],
    spellcasting_ability: DEFAULT_SPELLCASTING_ABILITY,
    spell_slots: { ...DEFAULT_SPELL_SLOTS },
    prepared_spells: [],
    is_dead: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

/** Niveaux de sorts débloqués par niveau de classe (table simplifiée, à affiner par classe) */
export const SPELL_SLOTS_BY_LEVEL: Record<number, Partial<SpellSlots>> = {
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

/** Bonus de maîtrise par niveau (D&D 2024) */
export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6
  if (level >= 13) return 5
  if (level >= 9) return 4
  if (level >= 5) return 3
  return 2
}

/** Modificateur de caractéristique (D&D standard) */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/** Compétence liée à une caractéristique */
export function getSkillAbility(skill: SkillName): keyof AbilityScores {
  return SKILL_ABILITY_MAP[skill]
}

/** Liste des 18 compétences pour itération */
export const ALL_SKILLS: SkillName[] = [
  'acrobatics',
  'animal_handling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleight_of_hand',
  'stealth',
]

/** Liste des 6 caractéristiques pour itération */
export const ALL_ABILITIES: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** Liste des 8 propriétés de Maîtrise d'Arme (D&D 2024) */
export const WEAPON_MASTERY_PROPERTIES: WeaponMasteryProperty[] = [
  'cleave',
  'graze',
  'nick',
  'push',
  'sap',
  'slow',
  'topple',
  'vex',
]

/** Labels d'affichage pour les propriétés de maîtrise d'arme */
export const WEAPON_MASTERY_LABELS: Record<WeaponMasteryProperty, string> = {
  cleave: 'Cleave (Entaille)',
  graze: 'Graze (Effleurement)',
  nick: 'Nick (Entaille)',
  push: 'Push (Poussée)',
  sap: 'Sap (Affaiblissement)',
  slow: 'Slow (Ralentissement)',
  topple: 'Topple (Renversement)',
  vex: 'Vex (Vexation)',
}