import Bracket from "./Bracket";

class Tournament {

    name: string;
    date: Date;
    brackets?: Bracket[];

    constructor(name: string, date: Date) {
        this.name = name;
        this.date = date;
    }

}

export default Tournament;