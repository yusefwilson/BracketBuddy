import { Bracket } from "./Bracket";

interface Tournament {
    id: string;
    name: string;
    date: Date;

    brackets: Bracket[]
}

export type { Tournament };