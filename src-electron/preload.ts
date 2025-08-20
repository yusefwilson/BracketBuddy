import { contextBridge, ipcRenderer } from 'electron';
import { Gender, Hand, ExperienceLevel } from '../src-shared/types';
import { BracketDTO } from '../src-shared/BracketDTO';

contextBridge.exposeInMainWorld('electron', {

    // tournament
    loadAllTournaments: async () => {
        return await ipcRenderer.invoke('load-all-tournaments');
    },
    loadTournament: async (tournamentId: string) => {
        return await ipcRenderer.invoke('load-tournament', tournamentId);
    },
    createTournament: async (name: string, date: Date, brackets: BracketDTO[]) => {
        return await ipcRenderer.invoke('create-tournament', name, date, brackets);
    },
    deleteTournament: async (tournamentName: string) => {
        return await ipcRenderer.invoke('delete-tournament', tournamentName);
    },

    // bracket
    addBracketToTournament: async (
        tournamentId: string,
        gender: Gender,
        experienceLevel: ExperienceLevel,
        hand: Hand,
        weightLimit: number,
        competitorNames: string[]
    ) => {
        return await ipcRenderer.invoke('add-bracket-to-tournament', tournamentId, gender, experienceLevel, hand, weightLimit, competitorNames);
    },
    removeBracketFromTournament: async (tournamentId: string, bracketId: string) => {
        return await ipcRenderer.invoke('remove-bracket-from-tournament', tournamentId, bracketId);
    },

    // misc
    getSaveData: async () => {
        return await ipcRenderer.invoke('get-save-data');
    },
    saveKeyValue: async (key: string, value: any) => {
        return await ipcRenderer.invoke('save-key-value', key, value);
    },
});
