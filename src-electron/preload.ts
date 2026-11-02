import { contextBridge, ipcRenderer } from 'electron';

import type {
    CreateTournamentInput,
    DeleteTournamentInput,
    AddBracketsToTournamentInput,
    RemoveBracketFromTournamentInput,
    UpdateBracketInput,
    AddCompetitorToBracketInput,
    RemoveCompetitorFromBracketInput,
    RandomizeCompetitorsInput,
    EnterRoundRobinResultInput,
    ResetRoundRobinMatchInput,
    SaveKeyValueInput,
    ExportToAERSInput,
    ExportTournamentInput,
    ExportToPDFInput,
} from '../src-shared/types.js';

contextBridge.exposeInMainWorld('electron', {
    // tournament
    loadAllTournaments: async () => ipcRenderer.invoke('load-all-tournaments'),

    loadTournament: async (tournamentId: string) =>
        ipcRenderer.invoke('load-tournament', tournamentId),

    createTournament: async (input: CreateTournamentInput) =>
        ipcRenderer.invoke('create-tournament', input),

    deleteTournament: async (input: DeleteTournamentInput) =>
        ipcRenderer.invoke('delete-tournament', input),

    addBracketsToTournament: async (input: AddBracketsToTournamentInput) =>
        ipcRenderer.invoke('add-brackets-to-tournament', input),

    removeBracketFromTournament: async (input: RemoveBracketFromTournamentInput) =>
        ipcRenderer.invoke('remove-bracket-from-tournament', input),

    exportTournament: async (input: ExportTournamentInput) =>
        ipcRenderer.invoke('export-tournament', input),

    importTournament: async () =>
        ipcRenderer.invoke('import-tournament'),

    // bracket
    enterResult: async (input: UpdateBracketInput) =>
        ipcRenderer.invoke('update-bracket', input),

    enterRoundRobinResult: async (input: EnterRoundRobinResultInput) =>
        ipcRenderer.invoke('enter-round-robin-result', input),

    resetRoundRobinMatch: async (input: ResetRoundRobinMatchInput) =>
        ipcRenderer.invoke('reset-round-robin-result', input),

    addCompetitorToBracket: async (input: AddCompetitorToBracketInput) =>
        ipcRenderer.invoke('add-competitor-to-bracket', input),

    removeCompetitorFromBracket: async (input: RemoveCompetitorFromBracketInput) =>
        ipcRenderer.invoke('remove-competitor-from-bracket', input),

    randomizeCompetitors: async (input: RandomizeCompetitorsInput) =>
        ipcRenderer.invoke('randomize-competitors', input),

    // misc
    getSavedValue: async (key: string) => ipcRenderer.invoke('get-saved-value', key),

    saveKeyValue: async (input: SaveKeyValueInput) =>
        ipcRenderer.invoke('save-key-value', input),

    openUrl: async (url: string) => ipcRenderer.invoke('open-url', url),

    saveFile: async (filename: string, data: string) =>
        ipcRenderer.invoke('save-file', filename, data),

    loadFile: async (fileExtension: string) =>
        ipcRenderer.invoke('load-file', fileExtension),

    getZoomLevel: async () => ipcRenderer.invoke('get-zoom-level'),

    setZoomLevel: async (zoomPercent: number) =>
        ipcRenderer.invoke('set-zoom-level', zoomPercent),

    // aers
    exportToAERS: async (input: ExportToAERSInput) => ipcRenderer.invoke('export-to-AERS', input),

    exportToPDF: async (input: ExportToPDFInput) => ipcRenderer.invoke('export-to-pdf', input),
    exportToJPG: async (input: ExportToPDFInput) => ipcRenderer.invoke('export-to-jpg', input),

    // window controls
    windowMinimize: () => ipcRenderer.invoke('window-minimize'),
    windowMaximize: () => ipcRenderer.invoke('window-maximize'),
    windowClose: () => ipcRenderer.invoke('window-close'),
    windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
});
