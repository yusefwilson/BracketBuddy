export { };

import { Bracket } from './Bracket';
import { Tournament } from './Tournament';
import { Gender, Hand, ExperienceLevel } from './types';

declare global {
    interface Window {
        electron: {
            // tournament
            loadAllTournaments: () => Promise<Tournament[]>;
            createTourament: (name: string, date: Date, brackets: Bracket[]) => Promise<Tournament>;
            deleteTournament: (tournamentId: string) => Promise<void>;

            // bracket
            addBracketToTournament: (
                tournamentId: string,
                gender: Gender,
                experienceLevel: ExperienceLevel,
                hand: Hand,
                weightLimit: number,
                competitorNames: string[]
            ) => Promise<Tournament>;
            removeBracketFromTournament: (
                tournamentId: string,
                bracketId: string
            ) => Promise<Tournament>;

            // misc
            getSaveData: () => Promise<Record<string, any>>;
            saveKeyValue: (key: string, value: any) => Promise<Record<string, any>>;
        };
    }
}