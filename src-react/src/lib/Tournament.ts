import { parse, stringify } from 'flatted';
import { deepSerialize, deepDeserialize } from './utils';
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
        return stringify(deepSerialize(this));
    }

    static deserialize(serialized: string): Tournament {
        return deepDeserialize(parse(serialized), { Tournament, Bracket, Round, Match, Date }) as Tournament;
    }

    // saving and loading
    async save() {
        await window.electron.saveTournament(this.name, this.serialize());
        console.log('Saved tournament ' + this.name);
    }

    async delete() {
        await window.electron.deleteTournament(this.name);
        console.log('Deleted tournament ' + this.name);
    }

    static async loadFromFile(filePath: string): Promise<Tournament> {
        const data = await window.electron.readFile(filePath);
        return Tournament.deserialize(data);
    }

    static async loadAllTournaments(): Promise<Tournament[]> {
        return (await window.electron.loadAllTournaments()).map((tournament: string) => Tournament.deserialize(tournament));
    }

    // TODO: hacky, look to replace. currently used to update reference of Bracket to trigger useState refresh.
    markUpdated(): Tournament {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this) as Tournament;
    }

}

export default Tournament;