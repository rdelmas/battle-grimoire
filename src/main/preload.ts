import { contextBridge, ipcRenderer } from 'electron'

// Storage API types
interface StorageAPI {
  getAll: (storeName: 'characters' | 'monsters' | 'encounters' | 'settings') => Promise<unknown[]>
  get: (storeName: 'characters' | 'monsters' | 'encounters' | 'settings', id: string) => Promise<unknown>
  put: (storeName: 'characters' | 'monsters' | 'encounters' | 'settings', entity: unknown) => Promise<string>
  delete: (storeName: 'characters' | 'monsters' | 'encounters' | 'settings', id: string) => Promise<void>
  clear: (storeName: 'characters' | 'monsters' | 'encounters' | 'settings') => Promise<void>
  
  settings: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<void>
    delete: (key: string) => Promise<void>
    has: (key: string) => Promise<boolean>
    clear: () => Promise<void>
  }
  
  getCharacters: () => Promise<unknown[]>
  getMonsters: () => Promise<unknown[]>
  getEncounters: () => Promise<unknown[]>
  getRecentEncounters: (limit?: number) => Promise<unknown[]>
  getLibraryStats: () => Promise<{ totalPCs: number; totalMonsters: number; totalEncounters: number }>
}

// App API types
interface AppAPI {
  quit: () => Promise<void>
}

const storageAPI: StorageAPI = {
  getAll: (storeName) => ipcRenderer.invoke('storage:getAll', storeName),
  get: (storeName, id) => ipcRenderer.invoke('storage:get', storeName, id),
  put: (storeName, entity) => ipcRenderer.invoke('storage:put', storeName, entity),
  delete: (storeName, id) => ipcRenderer.invoke('storage:delete', storeName, id),
  clear: (storeName) => ipcRenderer.invoke('storage:clear', storeName),
  
  settings: {
    get: (key) => ipcRenderer.invoke('storage:settings:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:settings:set', key, value),
    delete: (key) => ipcRenderer.invoke('storage:settings:delete', key),
    has: (key) => ipcRenderer.invoke('storage:settings:has', key) as Promise<boolean>,
    clear: () => ipcRenderer.invoke('storage:settings:clear'),
  },
  
  getCharacters: () => ipcRenderer.invoke('storage:getCharacters'),
  getMonsters: () => ipcRenderer.invoke('storage:getMonsters'),
  getEncounters: () => ipcRenderer.invoke('storage:getEncounters'),
  getRecentEncounters: (limit) => ipcRenderer.invoke('storage:getRecentEncounters', limit),
  getLibraryStats: () => ipcRenderer.invoke('storage:getLibraryStats'),
}

const appAPI: AppAPI = {
  quit: () => ipcRenderer.invoke('app:quit'),
}

contextBridge.exposeInMainWorld('api', {
  storage: storageAPI,
  app: appAPI,
})

// Type declaration for window.api
declare global {
  interface Window {
    api: {
      storage: StorageAPI
      app: AppAPI
    }
  }
}
