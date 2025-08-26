export { };

import { BracketDTO } from './BracketDTO';
import { TournamentDTO } from './TournamentDTO';
import { Gender, Hand, ExperienceLevel } from './types';

declare global {
    interface Window {
        electron: {
            // tournament
            loadAllTournaments: () => Promise<TournamentDTO[]>;
            createTournament: (name: string, date: Date, brackets: BracketDTO[]) => Promise<TournamentDTO>;
            deleteTournament: (tournamentId: string) => Promise<void>;

            // bracket
            addBracketToTournament: (
                tournamentId: string,
                gender: Gender,
                experienceLevel: ExperienceLevel,
                hand: Hand,
                weightLimit: number,
                competitorNames: string[]
            ) => Promise<TournamentDTO>;
            removeBracketFromTournament: (
                tournamentId: string,
                bracketId: string
            ) => Promise<TournamentDTO>;

            // misc
            getSaveData: () => Promise<Record<string, any>>;
            saveKeyValue: (key: string, value: any) => Promise<Record<string, any>>;
        };
    }
}