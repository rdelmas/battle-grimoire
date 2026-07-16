import { useMemo } from 'react'
import type {
  PlayerCharacter,
  AbilityScores,
  SkillName,
  SkillProficiency,
  SavingThrowProficiency,
  AttackOption,
  DamageType,
} from '../types/character'
import {
  getProficiencyBonus,
  getAbilityModifier,
  getSkillAbility,
  ALL_SKILLS,
  ALL_ABILITIES,
  WEAPON_MASTERY_LABELS,
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

/** Résultat des calculs d'attaques unifiées (armes, sorts, cantrips, mains nues, perso) */
export interface CalculatedAttacks {
  options: AttackOption[]
}

/** Résultat complet des calculs du personnage */
export interface CharacterCalculations {
  abilities: CalculatedAbilities
  savingThrows: CalculatedSavingThrows
  skills: CalculatedSkills
  spellcasting: CalculatedSpellcasting
  initiative: CalculatedInitiative
  attacks: CalculatedAttacks
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
  const attacks = useCalculatedAttacks(character, abilities, spellcasting)

  return {
    abilities,
    savingThrows,
    skills,
    spellcasting,
    initiative,
    attacks,
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
  }, [character, level])
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
  }, [character])
}

/**
 * Options de calcul des attaques (dons optionnels).
 * GWM = Great Weapon Master (-5 attaque / +10 dégâts).
 * SS = Sharpshooter (-5 attaque / +10 dégâts sur attaques à distance).
 */
export interface AttackComputeOptions {
  greatWeaponMaster?: boolean
  sharpshooter?: boolean
}

/**
 * Armes finesse (D&D 2024) : utilisent FOR ou DEX (au choix du meilleur).
 */
const FINESSE_WEAPONS = ['dague', 'dague', 'épée courte', 'rapiere', 'rapier', 'fouet', 'couteau', 'stiletto']
/** Armes à distance (pour Sharpshooter et dégâts perçants) */
const RANGED_WEAPONS = ['arc', 'arbalète', 'arbalete', 'arbalete', 'fronde', 'sling', 'dart', 'dards', 'javelot', 'blowgun']

/**
 * Dé de dégâts heuristique par nom d'arme (mots-clés).
 * Le projet ne dispose pas d'une base d'armes complète ; ce mapping couvre
 * les armes SRD usuelles. Les armes non reconnues retombent sur 1d6 contondant.
 */
const WEAPON_DAMAGE_MAP: { keywords: string[]; dice: string; type: DamageType }[] = [
  { keywords: ['dague', 'stiletto', 'couteau'], dice: '1d4', type: 'piercing' },
  { keywords: ['gourdin', 'massue', 'club', 'batte'], dice: '1d4', type: 'bludgeoning' },
  { keywords: ['javelot', 'javelin'], dice: '1d6', type: 'piercing' },
  { keywords: ['fronde', 'sling'], dice: '1d4', type: 'bludgeoning' },
  { keywords: ['dards', 'dart', 'blowgun'], dice: '1d4', type: 'piercing' },
  { keywords: ['hachette', 'handaxe', 'hache'], dice: '1d6', type: 'slashing' },
  { keywords: ['marteau léger', 'light hammer'], dice: '1d4', type: 'bludgeoning' },
  { keywords: ['arc court', 'shortbow'], dice: '1d6', type: 'piercing' },
  { keywords: ['arc long', 'longbow'], dice: '1d8', type: 'piercing' },
  { keywords: ['arbalète légère', 'light crossbow', 'arbalete'], dice: '1d8', type: 'piercing' },
  { keywords: ['arbalète lourde', 'heavy crossbow'], dice: '1d10', type: 'piercing' },
  { keywords: ['fléau', 'flail'], dice: '1d8', type: 'bludgeoning' },
  { keywords: ['massue lourde', 'mace'], dice: '1d6', type: 'bludgeoning' },
  { keywords: ['épée courte', 'rapier', 'rapiere', 'rapiere'], dice: '1d8', type: 'piercing' },
  { keywords: ['épée longue', 'longsword', 'epee longue'], dice: '1d8', type: 'slashing' },
  { keywords: ['épée bastarde', 'longsword'], dice: '1d10', type: 'slashing' },
  { keywords: ['morgenstern', 'mace'], dice: '1d6', type: 'piercing' },
  { keywords: ['hallebarde', 'halberd'], dice: '1d10', type: 'slashing' },
  { keywords: ['lance', 'lance'], dice: '1d10', type: 'piercing' },
  { keywords: ['masse d\'armes', 'maul'], dice: '2d6', type: 'bludgeoning' },
  { keywords: ['marteau de guerre', 'warhammer'], dice: '1d8', type: 'bludgeoning' },
  { keywords: ['pique', 'pike'], dice: '1d10', type: 'piercing' },
  { keywords: ['épée à deux mains', 'greatsword', 'epee deux mains', 'grande épée'], dice: '2d6', type: 'slashing' },
  { keywords: ['hache de bataille', 'battleaxe'], dice: '1d8', type: 'slashing' },
  { keywords: ['hache de bataille lourde', 'great axe', 'greataxe'], dice: '1d12', type: 'slashing' },
  { keywords: ['fouet', 'whip'], dice: '1d4', type: 'slashing' },
  { keywords: ['cimeterre', 'scimitar'], dice: '1d6', type: 'slashing' },
  { keywords: ['serpe', 'sickle'], dice: '1d4', type: 'slashing' },
  { keywords: ['fers', 'spear', 'lancier'], dice: '1d6', type: 'piercing' },
  { keywords: ['trident'], dice: '1d6', type: 'piercing' },
  { keywords: ['gae bolg', 'net'], dice: '1d4', type: 'bludgeoning' },
]

/** Dé de dégâts de martial arts (Moine D&D 2024) par niveau */
function monkMartialArtsDie(level: number): string {
  if (level >= 17) return '1d10'
  if (level >= 11) return '1d8'
  if (level >= 5) return '1d6'
  return '1d4'
}

/** Détecte si un don (nom) correspond à un don de combat donné */
function hasFeat(character: PlayerCharacter, match: (name: string) => boolean): boolean {
  const all = [...(character.origin_feats ?? []), ...(character.general_feats ?? [])]
  return all.some(f => f.name && match(f.name.toLowerCase()))
}

const isFinesse = (weapon: string) => FINESSE_WEAPONS.some(k => weapon.toLowerCase().includes(k))
const isRanged = (weapon: string) => RANGED_WEAPONS.some(k => weapon.toLowerCase().includes(k))

/**
 * Calcule la liste unifiée d'options d'attaque (armes, cantrips, sorts, mains nues, perso).
 * Fonction pure, réutilisable par le futur combat tracker.
 */
export function computeAttacks(
  character: PlayerCharacter,
  abilities: CalculatedAbilities,
  spellcasting: CalculatedSpellcasting,
  options: AttackComputeOptions = {}
): AttackOption[] {
  const mods = abilities.modifiers
  const prof = abilities.proficiencyBonus
  const attacks: AttackOption[] = []

  // 1) Attaques d'armes équipées (weapon_masteries)
  for (const wm of character.weapon_masteries) {
    const weapon = wm.weapon
    const ability: keyof AbilityScores = isFinesse(weapon)
      ? (mods.dex >= mods.str ? 'dex' : 'str')
      : 'str'
    const abilityMod = mods[ability]
    let attackBonus = abilityMod + prof
    let damageBonus = abilityMod
    let damageDice = '1d6'
    let damageType: DamageType = 'bludgeoning'

    const matched = WEAPON_DAMAGE_MAP.find(m => m.keywords.some(k => weapon.toLowerCase().includes(k)))
    if (matched) {
      damageDice = matched.dice
      damageType = matched.type
    }
    const ranged = isRanged(weapon)

    if (options.greatWeaponMaster && !ranged) {
      attackBonus -= 5
      damageBonus += 10
    }
    if (options.sharpshooter && ranged) {
      attackBonus -= 5
      damageBonus += 10
    }

    const masteryLabel = WEAPON_MASTERY_LABELS[wm.property]
    attacks.push({
      id: `weapon-${weapon}-${wm.property}`,
      name: weapon,
      kind: 'weapon',
      ability,
      attack_bonus: attackBonus,
      damage_dice: damageDice,
      damage_bonus: damageBonus,
      damage_type: damageType,
      range: ranged ? '9m' : '1,5m',
      note: `Maîtrise: ${masteryLabel}`,
    })
  }

  // 2) Cantrips (prepared_spells niveau 0)
  if (spellcasting.spellAttackBonus !== null) {
    const spellAtk = spellcasting.spellAttackBonus
    for (const spell of character.prepared_spells.filter(s => s.level === 0)) {
      // Dégâts heuristiques des cantrips : montée par niveau (échelle standard)
      const dieByLevel = character.level >= 17 ? '3d8' : character.level >= 11 ? '2d8' :
        character.level >= 5 ? '2d6' : '1d8'
      attacks.push({
        id: `cantrip-${spell.name}`,
        name: spell.name,
        kind: 'cantrip',
        ability: character.spellcasting_ability === 'none' ? 'none' : character.spellcasting_ability,
        attack_bonus: spellAtk,
        damage_dice: dieByLevel,
        damage_bonus: 0,
        damage_type: 'force', // type par défaut, à affiner via la base de sorts si besoin
        is_spell: true,
        spell_level: 0,
        save_dc: spellcasting.spellSaveDC,
        is_concentration: spell.concentration,
        range: spell.range,
        note: spell.description,
      })
    }
  }

  // 3) Sorts d'attaque (prepared_spells niveau > 0)
  if (spellcasting.spellSaveDC !== null) {
    for (const spell of character.prepared_spells.filter(s => s.level > 0)) {
      attacks.push({
        id: `spell-${spell.name}`,
        name: spell.name,
        kind: 'spell',
        ability: character.spellcasting_ability === 'none' ? 'none' : character.spellcasting_ability,
        attack_bonus: spellcasting.spellAttackBonus ?? 0,
        damage_dice: '', // dépend du sort, renseigné via la base de sorts si disponible
        damage_bonus: 0,
        damage_type: 'force',
        is_spell: true,
        spell_level: spell.level,
        save_dc: spellcasting.spellSaveDC,
        is_concentration: spell.concentration,
        range: spell.range,
        note: spell.description,
      })
    }
  }

  // 4) Attaque mains nues (classe/niveau)
  const unarmedAbilityMod = mods.str
  const isMonk = character.class_name.toLowerCase().includes('moine') || character.class_name.toLowerCase().includes('monk')
  const unarmedDice = isMonk ? monkMartialArtsDie(character.level) : '1d4'
  attacks.push({
    id: `unarmed-${character.id}`,
    name: isMonk ? 'Coup (Arts Martiaux)' : 'Mains nues',
    kind: 'unarmed',
    ability: 'str',
    attack_bonus: unarmedAbilityMod + prof,
    damage_dice: unarmedDice,
    damage_bonus: unarmedAbilityMod,
    damage_type: 'bludgeoning',
    range: '1,5m',
  })

  // 5) Attaques personnalisées (custom_attacks)
  for (const ca of character.custom_attacks ?? []) {
    const caAbilityMod = ca.ability === 'none' ? 0 : mods[ca.ability]
    attacks.push({
      id: `custom-${ca.id}`,
      name: ca.name,
      kind: 'custom',
      ability: ca.ability,
      attack_bonus: caAbilityMod + prof + ca.bonus,
      damage_dice: ca.damage_dice,
      damage_bonus: caAbilityMod + ca.damage_bonus,
      damage_type: ca.damage_type,
      note: ca.note,
    })
  }

  return attacks
}

/**
 * Hook de calcul des attaques unifiées (RG-8-1-09, futur combat tracker).
 */
export function useCalculatedAttacks(
  character: PlayerCharacter,
  abilities: CalculatedAbilities,
  spellcasting: CalculatedSpellcasting,
  options: AttackComputeOptions = {}
): CalculatedAttacks {
  return useMemo(() => {
    const options2 = {
      greatWeaponMaster: options.greatWeaponMaster ?? hasFeat(character, n => n.includes('great weapon master') || n.includes('maître armes')),
      sharpshooter: options.sharpshooter ?? hasFeat(character, n => n.includes('sharpshooter') || n.includes('tireur d\'élite')),
    }
    return {
      options: computeAttacks(character, abilities, spellcasting, options2),
    }
  }, [character, abilities, spellcasting, options.greatWeaponMaster, options.sharpshooter])
}
