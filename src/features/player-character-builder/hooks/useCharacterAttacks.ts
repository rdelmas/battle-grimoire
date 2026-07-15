import { useMemo } from 'react'
import type { PlayerCharacter, AttackOption } from '../types/character'
import {
  useCharacterCalculations,
  computeAttacks,
  type AttackComputeOptions,
} from './useCharacterCalculations'

/**
 * Hook réutilisable pour le futur combat tracker.
 *
 * Expose la liste unifiée d'options d'attaque (armes, cantrips, sorts,
 * mains nues, attaques personnalisées) calculée à partir d'un personnage.
 * Les attaques dérivées reflètent les maîtrises, sorts préparés, classe/niveau
 * et dons pertinents (GWM, Sharpshooter).
 */
export interface UseCharacterAttacksResult {
  attacks: AttackOption[]
  count: number
}

export function useCharacterAttacks(
  character: PlayerCharacter,
  options: AttackComputeOptions = {}
): UseCharacterAttacksResult {
  const calculations = useCharacterCalculations(character)

  return useMemo(() => {
    const attacks = computeAttacks(
      character,
      calculations.abilities,
      calculations.spellcasting,
      options
    )
    return { attacks, count: attacks.length }
  }, [character, calculations.abilities, calculations.spellcasting, options.greatWeaponMaster, options.sharpshooter])
}