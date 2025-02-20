import Bracket from "./Bracket";

class Tournament {

    name: string;
    date: Date;
    brackets?: Bracket[];

    constructor(name: string, date: Date) {
        this.name = name;
        this.date = date;
    }

    addBracket(bracket: Bracket) {
        if (!this.brackets) {
            this.brackets = [];
        }
        this.brackets.push(bracket);
    }

    save() {
        // save to database

    }

    static load(filename: string): Tournament {
        // load from database
        return new Tournament('Tournament', new Date());
    }

}

export default Tournament;