export type Rarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very-rare'
  | 'legendary'
  | 'artifact'

export type CombatPhase = 
  | 'preparation'
  | 'initiative'
  | 'round'
  | 'turn'
  | 'ended'

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export interface LibraryStats {
  totalPCs: number
  totalMonsters: number
  totalEncounters: number
}

export interface RecentEncounter {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
  updatedAt: number
  monsterCount: number
}

export interface ModuleCardConfig {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  actionHref: string
  primary?: boolean
}