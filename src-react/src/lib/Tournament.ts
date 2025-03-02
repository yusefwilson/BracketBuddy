import { parse, stringify } from 'flatted';
import { deepSerialize, deepDeserialize } from './utils';
import Bracket from './Bracket';
import Round from './Round';
import Match from './Match';

class Tournament {

    name: string;
    date: Date;
    brackets: Bracket[];

    constructor(name: string, date: Date) {
        this.name = name;
        this.date = date;
        this.brackets = [];
    }

    addBracket(bracket: Bracket) {
        this.brackets.push(bracket);
    }

    async saveToFile(filePath: string) {

        const serializedString = this.serialize();
        await window.electron.writeFile(filePath, serializedString);

        console.log('Saved tournament to ' + filePath);
    }

    static async loadFromFile(filePath: string): Promise<Tournament> {

        const data = await window.electron.readFile(filePath);
        console.log('Loaded tournament from ' + filePath);

        return this.deserialize(data);
    }

    serialize(): string {
        return stringify(deepSerialize(this));
    }

    static deserialize(serialized: string): Tournament {
        return deepDeserialize(parse(serialized), { Tournament, Bracket, Round, Match, Date }) as Tournament;
    }

}

export default Tournament;