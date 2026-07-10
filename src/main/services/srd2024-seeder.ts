/**
 * SRD 2024 Data Seeder
 * Popule la base de données avec les données de référence D&D 2024
 * À exécuter au démarrage de l'application ou via une commande de migration
 */

import Store from 'electron-store'
import { SRD2024_SPECIES, CUSTOM_SPECIES_OPTION, type SpeciesData } from '../data/srd2024-species.js'
import { SRD2024_BACKGROUNDS, CUSTOM_BACKGROUND_OPTION, type BackgroundData } from '../data/srd2024-backgrounds.js'
import { SRD2024_CLASSES, type ClassData } from '../data/srd2024-classes.js'

// Types pour le stockage
interface ReferenceDataStore {
  species: Record<string, SpeciesData & { isCustom?: boolean }>
  backgrounds: Record<string, BackgroundData & { isCustom?: boolean }>
  classes: Record<string, ClassData>
  subclasses: Record<string, ClassData['subclasses'][0]>
  seeded: boolean
  seededAt: number
  version: string
}

/**
 * Initialise les données de référence SRD 2024 dans le store
 */
export async function seedSRD2024Data(): Promise<{ success: boolean; message: string }> {
  const referenceStore = new Store<ReferenceDataStore>({ name: 'reference-data' })
  
  // Vérifier si déjà seedé
  if (referenceStore.get('seeded') === true) {
    const version = referenceStore.get('version') || 'unknown'
    const seededAt = referenceStore.get('seededAt') || 0
    return { 
      success: true, 
      message: `Données SRD 2024 déjà initialisées (v${version} le ${new Date(seededAt).toLocaleDateString()})` 
    }
  }

  try {
    // 1. Espèces (Races)
    const speciesData: Record<string, SpeciesData & { isCustom?: boolean }> = {}
    
    for (const species of SRD2024_SPECIES) {
      speciesData[species.id] = {
        ...species,
        isCustom: false,
      }
    }
    
    // Ajouter l'option "Autre"
    speciesData[CUSTOM_SPECIES_OPTION.id] = {
      ...CUSTOM_SPECIES_OPTION,
      isCustom: true,
    }

    // 2. Historiques (Backgrounds)
    const backgroundsData: Record<string, BackgroundData & { isCustom?: boolean }> = {}
    
    for (const bg of SRD2024_BACKGROUNDS) {
      backgroundsData[bg.id] = {
        ...bg,
        isCustom: false,
      }
    }
    
    // Ajouter l'option "Autre"
    backgroundsData[CUSTOM_BACKGROUND_OPTION.id] = {
      ...CUSTOM_BACKGROUND_OPTION,
      isCustom: true,
    }

    // 3. Classes
    const classesData: Record<string, ClassData> = {}
    
    for (const cls of SRD2024_CLASSES) {
      classesData[cls.id] = cls
    }

    // 4. Sous-classes (aplaties pour recherche facile)
    const subclassesData: Record<string, ClassData['subclasses'][0] & { classId: string; className: string }> = {}
    
    for (const cls of SRD2024_CLASSES) {
      for (const subclass of cls.subclasses) {
        subclassesData[subclass.id] = {
          ...subclass,
          classId: cls.id,
          className: cls.name,
        }
      }
    }

    // Sauvegarder tout
    referenceStore.set('species', speciesData)
    referenceStore.set('backgrounds', backgroundsData)
    referenceStore.set('classes', classesData)
    referenceStore.set('subclasses', subclassesData)
    referenceStore.set('seeded', true)
    referenceStore.set('seededAt', Date.now())
    referenceStore.set('version', '2024.1.0')

    const speciesCount = Object.keys(speciesData).length
    const backgroundsCount = Object.keys(backgroundsData).length
    const classesCount = Object.keys(classesData).length
    const subclassesCount = Object.keys(subclassesData).length

    return { 
      success: true, 
      message: `Données SRD 2024 initialisées: ${speciesCount} espèces, ${backgroundsCount} historiques, ${classesCount} classes, ${subclassesCount} sous-classes` 
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Erreur lors du seeding: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

/**
 * Force la réinitialisation des données de référence
 */
export async function reseedSRD2024Data(): Promise<{ success: boolean; message: string }> {
  const referenceStore = new Store<ReferenceDataStore>({ name: 'reference-data' })
  referenceStore.clear()
  return seedSRD2024Data()
}

/**
 * Obtient les statistiques des données de référence
 */
export function getReferenceDataStats(): {
  speciesCount: number
  backgroundsCount: number
  classesCount: number
  subclassesCount: number
  seeded: boolean
  seededAt: number | null
  version: string | null
} {
  const referenceStore = new Store<ReferenceDataStore>({ name: 'reference-data' })
  
  return {
    speciesCount: Object.keys(referenceStore.get('species') || {}).length,
    backgroundsCount: Object.keys(referenceStore.get('backgrounds') || {}).length,
    classesCount: Object.keys(referenceStore.get('classes') || {}).length,
    subclassesCount: Object.keys(referenceStore.get('subclasses') || {}).length,
    seeded: referenceStore.get('seeded') || false,
    seededAt: referenceStore.get('seededAt') || null,
    version: referenceStore.get('version') || null,
  }
}

/**
 * Vérifie si les données de référence sont à jour
 */
export function isReferenceDataUpToDate(): boolean {
  const referenceStore = new Store<ReferenceDataStore>({ name: 'reference-data' })
  return referenceStore.get('seeded') === true && referenceStore.get('version') === '2024.1.0'
}