import { BracketDTO } from './BracketDTO';
import { CompetitorDTO } from './CompetitorDTO';

interface TournamentDTO {
    id: string;
    name: string;
    date: Date;

    // every competitor registered in the tournament (a competitor may be in several brackets, or none)
    competitors: CompetitorDTO[]
    brackets: BracketDTO[]
}

export type { TournamentDTO };
