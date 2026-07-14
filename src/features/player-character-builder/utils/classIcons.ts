import { 
  Axe, Leaf, Swords, Hand, 
  Shield, Target, PocketKnife, Sparkles, Eye, BookOpen,
  Guitar, Church
} from 'lucide-react'

/**
 * Mapping des classes D&D 2024 vers leurs icônes Lucide représentatives
 * Chaque icône reflète l'archétype visuel emblématique de la classe
 */
export const CLASS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  barbarian: Axe,        // Rage, armes brutales
  bard: Guitar,          // Instrument ancien (mandoline/luth), inspiration
  cleric: Church,        // Foi divine, symbole sacré (église/croix)
  druid: Leaf,           // Nature, métamorphose sauvage
  fighter: Swords,       // Maîtrise martiale, armes
  monk: Hand,            // Coups nus, ki
  paladin: Shield,       // Serment, protection sacrée
  ranger: Target,        // Marque du chasseur, précision
  rogue: PocketKnife,    // Attaque sournoise, finesse
  sorcerer: Sparkles,    // Magie innée, métamagie
  warlock: Eye,          // Regard du patron, eldritch
  wizard: BookOpen,      // Grimoire, étude arcanique
} as const

/**
 * Récupère l'icône associée à une classe
 * Fallback sur Sword si la classe n'est pas reconnue
 */
export function getClassIcon(classId: string): React.ComponentType<{ className?: string }> {
  return CLASS_ICONS[classId] ?? BookOpen
}

/**
 * Vérifie si une classe a une icône dédiée
 */
export function hasClassIcon(classId: string): boolean {
  return classId in CLASS_ICONS
}