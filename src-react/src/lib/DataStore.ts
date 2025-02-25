import SuperJSON from "superjson";

import Tournament from "./Tournament";
import Bracket from "./Bracket";
import Match from "./Match";

class DataStore {

    private static tournamentData: Map<number, Tournament> = new Map<number, Tournament>();
    private static nextTournamentId: number = 0;

    private static bracketData: Map<number, Bracket> = new Map<number, Bracket>();
    private static nextBracketId: number = 0;

    private static matchData: Map<number, Match> = new Map<number, Match>();
    private static nextMatchId: number = 0;

    public static Instance = new DataStore();
    private filePath: string;

    constructor() {
        this.filePath = 'data.json';
        this.load();
    }

    static getInstance(): DataStore {
        if (!DataStore.Instance) {
            DataStore.Instance = new DataStore();
        }
        return DataStore.Instance;
    }

    getTournament(id: number): Tournament | null {
        return DataStore.tournamentData.get(id) || null;
    }

    getBracket(id: number): Bracket {
        const bracket = DataStore.bracketData.get(id);
        if (!bracket) throw new Error('Bracket not found in DataStore in getBracket');
        if (!bracket.nextMatchId) throw new Error('Bracket does not have a nextMatchId in getBracket');
        return bracket;
    }

    getMatch(id: number): Match | null {
        return DataStore.matchData.get(id) || null;
    }

    addTournament(tournament: Tournament): number {
        const id = DataStore.nextTournamentId++;
        DataStore.tournamentData.set(id, tournament);
        return id;
    }

    addBracket(bracket: Bracket): number {
        const id = DataStore.nextBracketId++;
        DataStore.bracketData.set(id, bracket);
        return id;
    }

    addMatch(match: Match): number {
        const id = DataStore.nextMatchId++;
        DataStore.matchData.set(id, match);
        return id;
    }

    async load() {

        const fileExists = await window.electron.fileExists(this.filePath);

        if (!fileExists) {
            return;
        }

        const data = SuperJSON.parse(await window.electron.readFile(this.filePath)) as {
            tournamentData: Map<number, Tournament>,
            bracketData: Map<number, Bracket>,
            matchData: Map<number, Match>,
            nextTournamentId: number,
            nextBracketId: number,
            nextMatchId: number
        };
        DataStore.tournamentData = data.tournamentData;
        DataStore.bracketData = data.bracketData;
        DataStore.matchData = data.matchData;
        DataStore.nextTournamentId = data.nextTournamentId;
        DataStore.nextBracketId = data.nextBracketId;
        DataStore.nextMatchId = data.nextMatchId;
    }

    async save() {
        const data = {
            tournamentData: DataStore.tournamentData,
            bracketData: DataStore.bracketData,
            matchData: DataStore.matchData,
            nextTournamentId: DataStore.nextTournamentId,
            nextBracketId: DataStore.nextBracketId,
            nextMatchId: DataStore.nextMatchId
        };

        await window.electron.writeFile(this.filePath, SuperJSON.stringify(data));
    }
}

export default DataStore;