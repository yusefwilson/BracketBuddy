import { serialize, deserialize } from './utils';
import Bracket from './Bracket';
import Round from './Round';
import Match from './Match';

class Tournament {

    __class: string = 'Tournament'

    name: string;
    date: Date;
    brackets: Bracket[];

    constructor(name: string = '', date: Date = new Date()) {
        this.name = name;
        this.date = date;
        this.brackets = [];
    }

    async addBracket(bracket: Bracket) {
        this.brackets.push(bracket);
        await this.save();
    }

    async removeBracket(bracket: Bracket) {
        this.brackets = this.brackets.filter(b => b !== bracket);
        await this.save();
    }

    // serialization and deserialization
    serialize(): string {
        return serialize(this);
    }

    static deserialize(serialized: string): Tournament {
        console.log('about to deserialize tournament data');
        const tournament = deserialize(serialized, { Tournament, Bracket, Round, Match }) as Tournament;
        // Rewire bracket references
        tournament.brackets.forEach(bracket => {
            bracket.tournament = tournament;
        });

        return tournament;
    }

    // saving and loading
    async save() {
        await window.electron.saveTournament(this.name, this.serialize());
    }

    async delete() {
        await window.electron.deleteTournament(this.name);
        console.log('Deleted tournament ' + this.name);
    }

    static async loadAllTournaments(): Promise<Tournament[]> {
        console.log('Loading all tournaments');
        const tournaments = await window.electron.loadAllTournaments();
        console.log('Loaded all tournaments: ', tournaments);
        const deserializedTournaments = tournaments.map((tournament: string) => Tournament.deserialize(tournament));
        console.log('Deserialized all tournaments: ', deserializedTournaments);
        return deserializedTournaments;
    }

}

export default Tournament;