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
    createTournament: async (name: string, date: string, brackets: BracketDTO[]) => {
        return await ipcRenderer.invoke('create-tournament', name, date, brackets);
    },
    deleteTournament: async (tournamentName: string) => {
        return await ipcRenderer.invoke('delete-tournament', tournamentName);
    },

    addBracketToTournament: async (
        tournamentId: string,
        brackets: {
            gender: Gender,
            experienceLevel: ExperienceLevel,
            hand: Hand,
            weightLimit: number,
            competitorNames: string[]
        }[]
    ) => {
        return await ipcRenderer.invoke('add-bracket-to-tournament', tournamentId, brackets);
    },
    removeBracketFromTournament: async (tournamentId: string, bracketId: string) => {
        return await ipcRenderer.invoke('remove-bracket-from-tournament', tournamentId, bracketId);
    },

    // bracket
    enterResult: async (tournamentId: string, bracketId: string, matchId: string, player1Won: boolean) => {
        return await ipcRenderer.invoke('update-bracket', tournamentId, bracketId, matchId, player1Won);
    },
    addCompetitorToBracket: async (tournamentId: string, bracketId: string, competitorName: string) => {
        return await ipcRenderer.invoke('add-competitor-to-bracket', tournamentId, bracketId, competitorName);
    },
    removeCompetitorFromBracket: async (tournamentId: string, bracketId: string, competitorName: string) => {
        return await ipcRenderer.invoke('remove-competitor-from-bracket', tournamentId, bracketId, competitorName);
    },
    startBracket: async (tournamentId: string, bracketId: string) => {
        return await ipcRenderer.invoke('start-bracket', tournamentId, bracketId);
    },
    randomizeCompetitors: async (tournamentId: string, bracketId: string) => {
        return await ipcRenderer.invoke('randomize-competitors', tournamentId, bracketId);
    },

    // misc
    getSaveData: async () => {
        return await ipcRenderer.invoke('get-save-data');
    },
    saveKeyValue: async (key: string, value: any) => {
        return await ipcRenderer.invoke('save-key-value', key, value);
    },
});
