import Bracket from './Bracket.js';
import Manager from 'tournament-organizer';
import { TournamentDTO } from '../../src-shared/TournamentDTO.js';

class Tournament {

    name: string;
    date: Date;
    id: string;

    manager: Manager // manages all the sub-brackets - be careful as the tournament-organizer package calls a bracket a 'Tournament'

    brackets: Bracket[];

    constructor(name: string = '', date: Date = new Date()) {
        this.name = name;
        this.date = date;
        console.log('about to try to isostring date: ', date);
        this.id = name + date.toISOString().slice(0, 10);
        this.brackets = [];
        this.manager = new Manager();
    }

    async addBracket(bracket: Bracket) {
        this.brackets.push(bracket);
    }

    async removeBracket(bracketId: string) {
        this.brackets = this.brackets.filter(b => b.id !== bracketId);
    }

    // Tournament class
    serialize(): string {
        // Extract only plain JSON-safe data (no methods, no cyclic refs)
        const plainData = {
            name: this.name,
            date: this.date.toISOString(),
            brackets: this.brackets.map(b => b.serialize()),
        };
        return JSON.stringify(plainData);
    }

    static deserialize(serialized: string): Tournament {
        const raw: {
            name: string;
            date: string;
            brackets: unknown[];
        } = JSON.parse(serialized);

        console.log('deserializing tournament: ', raw);

        const tournament = new Tournament(raw.name, new Date(raw.date));
        tournament.brackets = raw.brackets.map(bData =>
            Bracket.deserialize(bData, tournament)
        );
        return tournament;
    }

    toDTO(): TournamentDTO {
        return {
            id: this.id,
            name: this.name,
            date: this.date,
            brackets: this.brackets.map(bracket => bracket.toDTO()),
        };
    }
}
export default Tournament;