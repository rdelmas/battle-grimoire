import { ipcMain } from 'electron'
import { storage } from '../services/storage.js'

export function registerStorageIPC() {
  // Generic CRUD
  ipcMain.handle('storage:getAll', async (_event, storeName: string) => {
    return storage.getAll(storeName as 'characters' | 'monsters' | 'encounters' | 'settings')
  })

  ipcMain.handle('storage:get', async (_event, storeName: string, id: string) => {
    return storage.get(storeName as 'characters' | 'monsters' | 'encounters' | 'settings', id)
  })

  ipcMain.handle('storage:put', async (_event, storeName: string, entity: unknown) => {
    return storage.put(storeName as 'characters' | 'monsters' | 'encounters' | 'settings', entity as any)
  })

  ipcMain.handle('storage:delete', async (_event, storeName: string, id: string) => {
    return storage.delete(storeName as 'characters' | 'monsters' | 'encounters' | 'settings', id)
  })

  ipcMain.handle('storage:clear', async (_event, storeName: string) => {
    return storage.clear(storeName as 'characters' | 'monsters' | 'encounters' | 'settings')
  })

  // Settings
  ipcMain.handle('storage:settings:get', (_event, key: string) => {
    return storage.settings.get(key)
  })

  ipcMain.handle('storage:settings:set', (_event, key: string, value: unknown) => {
    storage.settings.set(key, value)
  })

  ipcMain.handle('storage:settings:delete', (_event, key: string) => {
    storage.settings.delete(key)
  })

  ipcMain.handle('storage:settings:has', (_event, key: string) => {
    return storage.settings.has(key)
  })

  ipcMain.handle('storage:settings:clear', () => {
    storage.settings.clear()
  })

  // Query helpers
  ipcMain.handle('storage:getCharacters', async () => {
    return storage.getCharacters()
  })

  ipcMain.handle('storage:getMonsters', async () => {
    return storage.getMonsters()
  })

  ipcMain.handle('storage:getEncounters', async () => {
    return storage.getEncounters()
  })

  ipcMain.handle('storage:getRecentEncounters', async (_event, limit?: number) => {
    return storage.getRecentEncounters(limit)
  })

  ipcMain.handle('storage:getLibraryStats', async () => {
    return storage.getLibraryStats()
  })
}