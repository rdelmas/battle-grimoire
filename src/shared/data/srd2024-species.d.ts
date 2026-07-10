/**
 * SRD 2024 - Espèces (Races) officielles D&D 2024 (5.5e)
 * Source: SRD 2024 / Player's Handbook 2024
 * Note: "Autre" permet aux joueurs d'entrer une espèce personnalisée non-SRD
 */
export interface SpeciesData {
    id: string;
    name: string;
    description: string;
    size: 'Small' | 'Medium';
    speed: number;
    abilityScoreIncreases: Record<string, number>;
    traits: SpeciesTrait[];
    subraces?: SubraceData[];
}
export interface SpeciesTrait {
    name: string;
    description: string;
}
export interface SubraceData {
    id: string;
    name: string;
    description: string;
    abilityScoreIncreases: Record<string, number>;
    traits: SpeciesTrait[];
}
/**
 * Liste des espèces officielles SRD 2024
 * Dans D&D 2024, le terme "Race" a été remplacé par "Species" (Espèce)
 * Les sous-races sont maintenant des options au sein de l'espèce
 */
export declare const SRD2024_SPECIES: SpeciesData[];
/**
 * Option "Autre" pour les espèces personnalisées non-SRD
 */
export declare const CUSTOM_SPECIES_OPTION: {
    id: string;
    name: string;
    description: string;
    size: "Medium";
    speed: number;
    abilityScoreIncreases: {};
    traits: never[];
    isCustom: boolean;
};
/**
 * Obtenir toutes les espèces avec l'option "Autre"
 */
export declare function getAllSpecies(): (SpeciesData & {
    isCustom?: boolean;
})[];
/**
 * Obtenir une espèce par son ID
 */
export declare function getSpeciesById(id: string): (SpeciesData & {
    isCustom?: boolean;
}) | undefined;
/**
 * Obtenir les sous-races d'une espèce
 */
export declare function getSubraces(speciesId: string): SubraceData[];
//# sourceMappingURL=srd2024-species.d.ts.map