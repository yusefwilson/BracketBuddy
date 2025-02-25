import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath: string, data: string) => ipcRenderer.invoke('write-file', filePath, data),
    fileExists: (filePath: string) => ipcRenderer.invoke('file-exists', filePath)
})