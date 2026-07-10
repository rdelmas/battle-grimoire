/**
 * SRD 2024 - Classes et Sous-classes officielles D&D 2024 (5.5e)
 * Source: SRD 2024 / Player's Handbook 2024
 * Dans D&D 2024, les sous-classes sont choisies au niveau 3 (sauf exceptions)
 */
export interface ClassData {
    id: string;
    name: string;
    description: string;
    hitDie: number;
    primaryAbility: string[];
    savingThrows: string[];
    skillChoices: {
        choose: number;
        from: string[];
    };
    armorProficiencies: string[];
    weaponProficiencies: string[];
    toolProficiencies?: string[];
    subclasses: SubclassData[];
    spellcasting?: {
        ability: string;
        level: number;
    };
}
export interface SubclassData {
    id: string;
    name: string;
    description: string;
    classId: string;
    level: number;
    features: SubclassFeature[];
}
export interface SubclassFeature {
    level: number;
    name: string;
    description: string;
}
/**
 * Liste des classes officielles SRD 2024 avec leurs sous-classes
 */
export declare const SRD2024_CLASSES: ClassData[];
/**
 * Obtenir toutes les classes
 */
export declare function getAllClasses(): ClassData[];
/**
 * Obtenir une classe par son ID
 */
export declare function getClassById(id: string): ClassData | undefined;
/**
 * Obtenir les sous-classes d'une classe
 */
export declare function getSubclasses(classId: string): SubclassData[];
/**
 * Obtenir une sous-classe par son ID
 */
export declare function getSubclassById(classId: string, subclassId: string): SubclassData | undefined;
/**
 * Obtenir la liste des noms de classes pour les listes déroulantes
 */
export declare function getClassNames(): {
    id: string;
    name: string;
}[];
/**
 * Obtenir la liste des noms de sous-classes pour une classe
 */
export declare function getSubclassNames(classId: string): {
    id: string;
    name: string;
    level: number;
}[];
/**
 * Vérifier si une sous-classe est disponible pour un niveau donné
 */
export declare function isSubclassAvailable(classId: string, subclassId: string, characterLevel: number): boolean;
//# sourceMappingURL=srd2024-classes.d.ts.map