import Store from 'electron-store'

// Type definitions
export interface CharacterData {
  id: string
  name: string
  class: string
  level: number
  race: string
  background: string
  abilityScores: Record<string, number>
  hitPoints: { current: number; max: number; temp: number }
  armorClass: number
  speed: number
  proficiencyBonus: number
  savingThrows: Record<string, boolean>
  skills: Record<string, boolean>
  features: CharacterFeature[]
  equipment: EquipmentItem[]
  spells: SpellData[]
  createdAt: number
  updatedAt: number
}

export interface CharacterFeature {
  id: string
  name: string
  description: string
  source: string
  level: number
}

export interface EquipmentItem {
  id: string
  name: string
  type: string
  quantity: number
  weight: number
  properties: string[]
  equipped: boolean
}

export interface SpellData {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  description: string
  prepared: boolean
  slotsUsed: number
}

export interface MonsterData {
  id: string
  name: string
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'
  type: string
  alignment: string
  challengeRating: number
  xp: number
  armorClass: number
  hitPoints: { average: number; formula: string }
  speed: Record<string, number>
  abilityScores: Record<string, number>
  savingThrows: Record<string, number>
  skills: Record<string, number>
  damageResistances: string[]
  damageImmunities: string[]
  conditionImmunities: string[]
  senses: string
  languages: string
  traits: MonsterTrait[]
  actions: MonsterAction[]
  legendaryActions?: MonsterLegendaryAction[]
  createdAt: number
  updatedAt: number
}

export interface MonsterTrait {
  id: string
  name: string
  description: string
}

export interface MonsterAction {
  id: string
  name: string
  description: string
  attackBonus?: number
  damage?: string
}

export interface MonsterLegendaryAction {
  id: string
  name: string
  description: string
  cost: number
}

export interface EncounterData {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
  partyLevel: number
  partySize: number
  monsters: EncounterMonster[]
  totalXP: number
  adjustedXP: number
  status: 'planned' | 'active' | 'completed'
  round: number
  turn: number
  initiativeOrder: InitiativeEntry[]
  createdAt: number
  updatedAt: number
}

export interface EncounterMonster {
  id: string
  monsterId: string
  name: string
  count: number
  hp: number
  maxHp: number
  initiative: number
  conditions: string[]
  customName?: string
}

export interface InitiativeEntry {
  id: string
  name: string
  type: 'pc' | 'monster'
  entityId: string
  initiative: number
  hp: number
  maxHp: number
  conditions: string[]
}

export interface SettingsData {
  key: string
  value: unknown
}

// Use electron-store for all data (works in main process)
const charactersStore = new Store<Record<string, CharacterData>>({ name: 'characters' })
const monstersStore = new Store<Record<string, MonsterData>>({ name: 'monsters' })
const encountersStore = new Store<Record<string, EncounterData>>({ name: 'encounters' })
const settingsStore = new Store<Record<string, unknown>>({ name: 'settings' })

type StoreName = 'characters' | 'monsters' | 'encounters' | 'settings'

function getStore(storeName: StoreName) {
  switch (storeName) {
    case 'characters':
      return charactersStore
    case 'monsters':
      return monstersStore
    case 'encounters':
      return encountersStore
    case 'settings':
      return settingsStore
  }
}

export const storage = {
  // Generic CRUD
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const store = getStore(storeName)
    return Object.values(store.store) as unknown as T[]
  },

  async get<T>(storeName: StoreName, id: string): Promise<T | undefined> {
    const store = getStore(storeName)
    return store.get(id as any) as T | undefined
  },

  async put<T extends { id: string }>(storeName: StoreName, entity: T): Promise<string> {
    const store = getStore(storeName)
    store.set(entity.id, entity as any)
    return entity.id
  },

  async delete(storeName: StoreName, id: string): Promise<void> {
    const store = getStore(storeName)
    store.delete(id)
  },

  async clear(storeName: StoreName): Promise<void> {
    const store = getStore(storeName)
    store.clear()
  },

  // Settings
  settings: {
    get(key: string): unknown {
      return settingsStore.get(key)
    },
    set(key: string, value: unknown): void {
      settingsStore.set(key, value)
    },
    delete(key: string): void {
      settingsStore.delete(key)
    },
    has(key: string): boolean {
      return settingsStore.has(key)
    },
    clear(): void {
      settingsStore.clear()
    },
  },

  // Query helpers
  async getCharacters(): Promise<CharacterData[]> {
    return this.getAll('characters')
  },

  async getMonsters(): Promise<MonsterData[]> {
    return this.getAll('monsters')
  },

  async getEncounters(): Promise<EncounterData[]> {
    return this.getAll('encounters')
  },

  async getRecentEncounters(limit = 5): Promise<EncounterData[]> {
    const encounters = await this.getAll<EncounterData>('encounters')
    return encounters
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
  },

  async getLibraryStats(): Promise<{ totalPCs: number; totalMonsters: number; totalEncounters: number }> {
    const [characters, monsters, encounters] = await Promise.all([
      this.getAll('characters'),
      this.getAll('monsters'),
      this.getAll('encounters'),
    ])

    return {
      totalPCs: characters.length,
      totalMonsters: monsters.length,
      totalEncounters: encounters.length,
    }
  },
}
