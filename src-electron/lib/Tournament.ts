import Bracket from './Bracket';
import Manager from 'tournament-organizer';

class Tournament {

    name: string;
    date: Date;

    manager: Manager // manages all the sub-brackets - be careful as the tournament-organizer package calls a bracket a 'Tournament'

    brackets: Bracket[];

    constructor(name: string = '', date: Date = new Date()) {
        this.name = name;
        this.date = date;
        this.brackets = [];
        this.manager = new Manager();
    }

    async addBracket(bracket: Bracket) {
        this.brackets.push(bracket);
        await this.save();
    }

    async removeBracket(bracket: Bracket) {
        this.brackets = this.brackets.filter(b => b !== bracket);
        await this.save();
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

        const tournament = new Tournament(raw.name, new Date(raw.date));
        tournament.brackets = raw.brackets.map(bData =>
            Bracket.deserialize(bData, tournament)
        );
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