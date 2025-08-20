import { contextBridge, ipcRenderer } from 'electron';
import { Gender, Hand, ExperienceLevel } from '../src-shared/types';
import { BracketDTO } from '../src-shared/BracketDTO';

//TODO: THESE FUNCTIONS SURELY NEED RETURN STATEMENTS SO THEY CAN ACTUALLY GIVE BACK WHAT global.d.ts THINKS THEY DO RIGHT?

contextBridge.exposeInMainWorld('electron', {

    // tournament
    loadAllTournaments: async () => {
        await ipcRenderer.invoke('load-all-tournaments');
    },
    loadTournament: async (tournamentId: string) => {
        await ipcRenderer.invoke('load-tournament', tournamentId);
    },
    createTournament: async (name: string, date: Date, brackets: BracketDTO[]) => {
        await ipcRenderer.invoke('create-tournament', name, date, brackets);
    },
    deleteTournament: async (tournamentName: string) => {
        await ipcRenderer.invoke('delete-tournament', tournamentName);
    },

    // bracket
    addBracketToTournament: async (tournamentId: string, gender: Gender,
        experienceLevel: ExperienceLevel,
        hand: Hand,
        weightLimit: number, // in lbs, -1 for no limit
        competitorNames: string[]) => {
        await ipcRenderer.invoke('add-bracket-to-tournament', tournamentId, gender, experienceLevel, hand, weightLimit, competitorNames);
    },
    removeBracketFromTournament: async (tournamentId: string, bracketId: string) => {
        await ipcRenderer.invoke(tournamentId, bracketId)
    },

    // misc
    getSaveData: async () => {
        await ipcRenderer.invoke('get-save-data')
    },
    saveKeyValue: async (key: string, value: any) => {
        await ipcRenderer.invoke('save-key-value', key, value)
    },
})