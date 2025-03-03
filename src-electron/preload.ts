import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath: string, data: string) => ipcRenderer.invoke('write-file', filePath, data),
    loadAllTournaments: () => ipcRenderer.invoke('load-all-tournaments'),
    saveTournament: (tournamentName: string, serializedTournamentData: string) => ipcRenderer.invoke('save-tournament', tournamentName, serializedTournamentData)
})