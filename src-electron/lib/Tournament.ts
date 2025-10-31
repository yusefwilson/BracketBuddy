import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { dateToLocalTimezoneString } from '../../src-shared/utils.js';

import Bracket from './Bracket.js';
import Match from './Match.js';
import { serialize, deserialize } from './utils.js';
import { exportTournamentToAERS } from './AERS.js';

class Tournament {

    __class: string = 'Tournament'

    name: string;
    date: Date;
    id: string;

    brackets: Bracket[];

    constructor(name: string = '', date: Date = new Date()) {
        this.name = name;
        this.date = date;
        this.id = name + dateToLocalTimezoneString(date); // TODO: better unique id generation
        this.brackets = [];
    }

    async addBracket(bracket: Bracket) {
        // throw error if bracket already exists
        if (this.brackets.find((b, index) => b.id === bracket.id)) {
            throw new Error('Bracket with these properties already exists in tournament');
        }
        this.brackets.push(bracket);
    }

    async removeBracket(bracketId: string) {
        this.brackets = this.brackets.filter(b => b.id !== bracketId);
    }

    // serialization and deserialization
    serialize(): string {
        return serialize(this);
    }

    static deserialize(serialized: string): Tournament {
        console.log('about to deserialize tournament data');
        const tournament = deserialize(serialized, { Tournament, Bracket, Match }) as Tournament;
        // Rewire bracket references
        tournament.brackets.forEach(bracket => {
            bracket.tournament = tournament;
        });

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

    getBracket(bracketId: string): Bracket | undefined {
        return this.brackets.find(bracket => bracket.id === bracketId);
    }

    getAllBrackets(): Bracket[] {
        return this.brackets;
    }

    exportToAERS(): string {
        return exportTournamentToAERS(this);
    }
}
export default Tournament;