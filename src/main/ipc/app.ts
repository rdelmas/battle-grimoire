import { ipcMain } from 'electron'
import { app } from 'electron'

export function registerAppIPC() {
  ipcMain.handle('app:quit', () => {
    app.quit()
    return Promise.resolve()
  })
}
