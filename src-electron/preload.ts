import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    loadAllTournaments: () => ipcRenderer.invoke('load-all-tournaments'),
    saveTournament: (tournamentName: string, serializedTournamentData: string) => ipcRenderer.invoke('save-tournament', tournamentName, serializedTournamentData),
    deleteTournament: (tournamentName: string) => ipcRenderer.invoke('delete-tournament', tournamentName),
    getSaveData: () => ipcRenderer.invoke('get-save-data'),
    saveKeyValue: (key: string, value: any) => ipcRenderer.invoke('save-key-value', key, value),
})