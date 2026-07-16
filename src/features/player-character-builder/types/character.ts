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
  | 'survival'

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
  survival: 'wis',
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
  // Champs complémentaires pour sorts SRD (affichage lecture seule)
  duration?: string
  ritual?: boolean
  school?: string
  materialComponent?: string
  // Métadonnées de provenance
  isFromSRD?: boolean
  srdId?: string
}

/** Caractéristique d'incantation */
export type SpellcastingAbility = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'none'

/** Type de progression de sorts */
export type SpellcastingProgression = 'full' | 'half' | 'third' | 'pact' | 'none'

/** Source d'incantation (classe, don, race, objet) */
export interface SpellcastingSource {
  id: string                    // "class-paladin", "feat-magic-initiate-druid"
  type: 'class' | 'feat' | 'race' | 'item'
  name: string                  // "Paladin", "Initié à la magie (Druide)"
  ability: SpellcastingAbility  // 'cha', 'wis', 'int'...
  spellcastingLevel: number     // niveau effectif lanceur
  progression: SpellcastingProgression
  cantripsKnown: number
  preparedSpells: PreparedSpell[]  // sorts choisis
  alwaysPrepared?: PreparedSpell[] // sorts bonus (domaines, dons)
  grantedSpells?: PreparedSpell[]  // sorts accordés par le don (Magic Initiate = 2 sorts)
  // Métadonnées pour l'UI
  sourceDetail?: string         // ex: "Niveau 5", "Don: Magic Initiate"
}

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
  origin_feats: Feat[]
  general_feats: Feat[]
  tool_proficiencies: string[] // Maîtrises d'outils (background, classe, don...)

  // Module de Magie & Sorts
  spellcasting_ability: SpellcastingAbility
  spell_slots: Partial<SpellSlots> // seulement les niveaux débloqués selon classe/niveau
  prepared_spells: PreparedSpell[]
  cantrips_known: number // nombre de tours de magie (niveau 0) connus
  additional_spellcasting_sources: SpellcastingSource[] // sources additionnelles (dons, race, objets, multiclasse)

  // Attaques personnalisées (saisie libre, complète les attaques dérivées)
  custom_attacks: CustomAttack[]

  // Métadonnées d'état
  is_dead: boolean
  created_at: number
  updated_at: number
}

/**
 * Attaque personnalisée saisie manuellement par l'utilisateur.
 * Sert à compléter les attaques dérivées (armes, sorts, cantrips, mains nues)
 * pour le futur combat tracker.
 */
export interface CustomAttack {
  id: string
  name: string
  ability: keyof AbilityScores | 'none' // caractéristique utilisée pour l'attaque ('none' = pas de modificateur)
  bonus: number // bonus d'attaque supplémentaire (hors modif + maîtrise)
  damage_dice: string // ex: "1d8"
  damage_bonus: number // bonus aux dégâts
  damage_type: DamageType
  note?: string
}

/** Types de dégâts D&D 2024 */
export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder'

/** Labels d'affichage des types de dégâts */
export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  acid: 'Acide',
  bludgeoning: 'Contondant',
  cold: 'Froid',
  fire: 'Feu',
  force: 'Force',
  lightning: 'Foudre',
  necrotic: 'Nécrotique',
  piercing: 'Perçant',
  poison: 'Poison',
  psychic: 'Psychique',
  radiant: 'Radiant',
  slashing: 'Tranchant',
  thunder: 'Tonnerre',
}

/**
 * Option d'attaque unifiée (armes, sorts, cantrips, mains nues, personnalisée)
 * pour le futur combat tracker.
 */
export interface AttackOption {
  id: string
  name: string
  // 'weapon' = arme équipée (weapon_masteries)
  // 'cantrip' = tour de magie (prepared_spells niveau 0)
  // 'spell' = sort d'attaque (prepared_spells avec attack roll/save)
  // 'unarmed' = attaque mains nues (classe/niveau)
  // 'custom' = saisie libre (custom_attacks)
  kind: 'weapon' | 'cantrip' | 'spell' | 'unarmed' | 'custom'
  ability: keyof AbilityScores | 'none' // caractéristique de l'attaque
  attack_bonus: number // bonus total d'attaque (modif + maîtrise + bonus)
  damage_dice: string // ex: "1d8"
  damage_bonus: number // bonus total aux dégâts
  damage_type: DamageType
  // Pour les sorts/cantrips
  is_spell?: boolean
  spell_level?: number
  save_dc?: number | null // DD de sauvegarde si applicable
  is_concentration?: boolean
  range?: string
  note?: string
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
  survival: 'none',
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

/** Migration d'un ancien personnage vers le nouveau format (sources multiples) */
export function migrateCharacter(character: Partial<PlayerCharacter>): PlayerCharacter {
  const now = Date.now()
  const base = createEmptyCharacter()

  // Copier les champs existants
  const migrated: PlayerCharacter = {
    ...base,
    ...character,
    id: character.id ?? crypto.randomUUID(),
    created_at: character.created_at ?? now,
    updated_at: now,

    // S'assurer que les nouveaux champs existent
    additional_spellcasting_sources: character.additional_spellcasting_sources ?? [],
    tool_proficiencies: character.tool_proficiencies ?? [],
    origin_feats: character.origin_feats ?? [],
    general_feats: character.general_feats ?? [],
    weapon_masteries: character.weapon_masteries ?? [],
    saving_throw_proficiencies: character.saving_throw_proficiencies ?? [],
    skills: { ...DEFAULT_SKILLS, ...character.skills },
    abilities: { ...DEFAULT_ABILITIES, ...character.abilities },
    spell_slots: { ...DEFAULT_SPELL_SLOTS, ...character.spell_slots },
    prepared_spells: character.prepared_spells ?? [],
    cantrips_known: character.cantrips_known ?? 0,
    spellcasting_ability: character.spellcasting_ability ?? DEFAULT_SPELLCASTING_ABILITY,
    initiative_misc_bonus: character.initiative_misc_bonus ?? 0,
    passive_perception: character.passive_perception ?? 10,
    is_dead: character.is_dead ?? false,
    custom_attacks: character.custom_attacks ?? [],
  }

  // Migration automatique : si le personnage a des sorts préparés mais pas de source principale configurée
  // et qu'il a une classe lanceuse de sorts, on pourrait créer la source principale
  // (Cela se fait maintenant dans le builder via autoConfigureSpellcasting)

  return migrated
}

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
    origin_feats: [],
    general_feats: [],
    tool_proficiencies: [],
    spellcasting_ability: DEFAULT_SPELLCASTING_ABILITY,
    spell_slots: { ...DEFAULT_SPELL_SLOTS },
    prepared_spells: [],
    cantrips_known: 0,
    additional_spellcasting_sources: [],
    custom_attacks: [],
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
  'survival',
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

/** Liste des armes SRD 2024 (noms français) pour sélection dans le builder */
export const WEAPON_LIST: string[] = [
  'Arc court',
  'Arc long',
  'Arbalète légère',
  'Arbalète lourde',
  'Cimeterre',
  'Club',
  'Dague',
  'Dards',
  'Fouet',
  'Fléau',
  'Fronde',
  'Gourdin',
  'Hache de bataille',
  'Hachette',
  'Hallebarde',
  'Javelot',
  'Lance',
  'Marteau de guerre',
  'Marteau léger',
  'Masse d\'armes',
  'Massue',
  'Morgenstern',
  'Épée à deux mains',
  'Épée bastarde',
  'Épée courte',
  'Épée longue',
  'Pique',
  'Serpe',
  'Trident',
]
