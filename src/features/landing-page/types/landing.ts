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