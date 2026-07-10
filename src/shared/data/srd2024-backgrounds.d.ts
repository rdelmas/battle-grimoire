/**
 * SRD 2024 - Historiques (Backgrounds) officiels D&D 2024 (5.5e)
 * Source: SRD 2024 / Player's Handbook 2024
 * Dans D&D 2024, les historiques donnent : compétences, outils, langues, équipement, et un don d'origine
 */
export interface BackgroundData {
    id: string;
    name: string;
    description: string;
    skillProficiencies: string[];
    toolProficiencies?: string[];
    languages?: number;
    equipment: string[];
    originFeat: {
        name: string;
        description: string;
    };
    feature?: {
        name: string;
        description: string;
    };
}
/**
 * Liste des historiques officiels SRD 2024
 * Chaque historique donne un don d'origine (Origin Feat)
 */
export declare const SRD2024_BACKGROUNDS: BackgroundData[];
/**
 * Option "Autre" pour les historiques personnalisés non-SRD
 */
export declare const CUSTOM_BACKGROUND_OPTION: {
    id: string;
    name: string;
    description: string;
    skillProficiencies: never[];
    toolProficiencies: never[];
    languages: number;
    equipment: never[];
    originFeat: {
        name: string;
        description: string;
    };
    isCustom: boolean;
};
/**
 * Obtenir tous les historiques avec l'option "Autre"
 */
export declare function getAllBackgrounds(): (BackgroundData & {
    isCustom?: boolean;
})[];
/**
 * Obtenir un historique par son ID
 */
export declare function getBackgroundById(id: string): (BackgroundData & {
    isCustom?: boolean;
}) | undefined;
/**
 * Obtenir la liste des noms d'historiques pour les listes déroulantes
 */
export declare function getBackgroundNames(): {
    id: string;
    name: string;
}[];
//# sourceMappingURL=srd2024-backgrounds.d.ts.map