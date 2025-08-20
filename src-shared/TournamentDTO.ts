import { BracketDTO } from "./BracketDTO";

interface TournamentDTO {
    id: string;
    name: string;
    date: Date;

    brackets: BracketDTO[]
}

export type { TournamentDTO };