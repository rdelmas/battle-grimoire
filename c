import { ipcMain, BrowserWindow } from 'electron'

export function registerAppIPC() {
  ipcMain.handle('app:quit', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.close()
  })
}