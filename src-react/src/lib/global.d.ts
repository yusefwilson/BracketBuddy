export { };

declare global {
    interface Window {
        electron: {
            loadAllTournaments: () => Promise<string[]>;
            saveTournament: (tournamentName: string, serializedTournamentData: string) => Promise<void>;
            deleteTournament: (tournamentName: string) => Promise<void>;
            getSaveData: () => Promise<Record<string, any>>;
            saveKeyValue: (key: string, value: any) => Promise<Record<string, any>>;
        };
    }
}