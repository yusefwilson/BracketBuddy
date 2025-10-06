export { };

import { BracketDTO } from './BracketDTO';
import { TournamentDTO } from './TournamentDTO';
import { Gender, Hand, ExperienceLevel, WeightLimit } from './types';

declare global {
    interface Window {
        electron: {
            // tournament
            loadAllTournaments: () => Promise<TournamentDTO[]>;
            createTournament: (name: string, date: Date, brackets: BracketDTO[]) => Promise<TournamentDTO>;
            deleteTournament: (tournamentId: string) => Promise<void>;
            addBracketToTournament: (
                tournamentId: string,
                brackets: {
                    gender: Gender,
                    experienceLevel: ExperienceLevel,
                    hand: Hand,
                    weightLimit: WeightLimit,
                    competitorNames: string[]
                }[]
            ) => Promise<TournamentDTO>;
            removeBracketFromTournament: (
                tournamentId: string,
                bracketId: string
            ) => Promise<TournamentDTO>;

            // bracket
            addCompetitorToBracket: (
                tournamentId: string,
                bracketId: string,
                competitorName: string
            ) => Promise<TournamentDTO>;
            removeCompetitorFromBracket: (
                tournamentId: string,
                bracketId: string,
                competitorName: string
            ) => Promise<TournamentDTO>;
            startBracket: (tournamentId: string, bracketId: string) => Promise<TournamentDTO>;
            enterResult: (tournamentId: string, bracketId: string, matchId: string, winner: number) => Promise<TournamentDTO>;
            randomizeCompetitors: (tournamentId: string, bracketId: string) => Promise<TournamentDTO>;

            // misc
            getSaveData: () => Promise<Record<string, any>>;
            saveKeyValue: (key: string, value: any) => Promise<Record<string, any>>;
        };
    }
}