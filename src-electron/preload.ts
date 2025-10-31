import { contextBridge, ipcRenderer } from 'electron';
import type {
    CreateTournamentInput,
    DeleteTournamentInput,
    AddBracketsToTournamentInput,
    RemoveBracketFromTournamentInput,
    UpdateBracketInput,
    AddCompetitorToBracketInput,
    RemoveCompetitorFromBracketInput,
    StartBracketInput,
    RandomizeCompetitorsInput,
    SaveKeyValueInput,
    ConvertToAERSInput
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

    addBracketToTournament: async (input: AddBracketsToTournamentInput) =>
        ipcRenderer.invoke('add-bracket-to-tournament', input),

    removeBracketFromTournament: async (input: RemoveBracketFromTournamentInput) =>
        ipcRenderer.invoke('remove-bracket-from-tournament', input),

    // bracket
    enterResult: async (input: UpdateBracketInput) =>
        ipcRenderer.invoke('update-bracket', input),

    addCompetitorToBracket: async (input: AddCompetitorToBracketInput) =>
        ipcRenderer.invoke('add-competitor-to-bracket', input),

    removeCompetitorFromBracket: async (input: RemoveCompetitorFromBracketInput) =>
        ipcRenderer.invoke('remove-competitor-from-bracket', input),

    startBracket: async (input: StartBracketInput) =>
        ipcRenderer.invoke('start-bracket', input),

    randomizeCompetitors: async (input: RandomizeCompetitorsInput) =>
        ipcRenderer.invoke('randomize-competitors', input),

    // misc
    getSaveData: async () => ipcRenderer.invoke('get-save-data'),

    saveKeyValue: async (input: SaveKeyValueInput) =>
        ipcRenderer.invoke('save-key-value', input),

    openUrl: async (url: string) => ipcRenderer.invoke('open-url', url),

    saveCsv: async (data: string, filename: string) => ipcRenderer.invoke('save-csv', data, filename),

    // aers
    convertToAERS: async (input: ConvertToAERSInput) => ipcRenderer.invoke('convert-to-AERS', input),
});
