import SuperJSON from "superjson";
import Bracket from "./Bracket";

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

    async save() {
        await window.electron.writeFile(this.name + '.json', SuperJSON.stringify(this));
        console.log('Saved tournament to ' + this.name + '.json');
    }

    static async load(filePath: string): Promise<Tournament> {
        const data = await window.electron.readFile(filePath);
        console.log('Loaded tournament from ' + filePath);

        const tournament = SuperJSON.parse(data) as Tournament;
        console.log(tournament);

        return tournament;
    }

}

export default Tournament;