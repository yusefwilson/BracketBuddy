import Bracket from './Bracket';
import DataStore from './DataStore';

class Tournament {

    name: string;
    date: Date;
    brackets: Bracket[];
    id: number;

    constructor(name: string, date: Date) {
        this.name = name;
        this.date = date;
        this.brackets = [];
        this.id = DataStore.Instance.addTournament(this);
    }

    addBracket(bracket: Bracket) {
        this.brackets.push(bracket);
    }
}

export default Tournament;