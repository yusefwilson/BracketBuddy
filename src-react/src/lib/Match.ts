class Match {

    __class: string = 'Match'

    id: number // in ascending numerical order, starting from 0, indicating order that matches should be played in. this ensures that matches must be created in the order they are to be played
    competitor0Name?: string
    competitor1Name?: string
    winner?: number // 0 for competitor0, 1 for competitor, -1 or undefined for TBD
    winnerChild?: Match
    loserChild?: Match

    competitor0Parent?: Match
    competitor1Parent?: Match
    competitor0PreviouslyWinner?: boolean
    competitor1PreviouslyWinner?: boolean

    constructor(id: number = -1, competitor0Name?: string, competitor1Name?: string, winner?: number, winnerChild?: Match, loserChild?: Match,
        competitor0Parent?: Match, competitor1Parent?: Match, competitor0PreviouslyWinner?: boolean, competitor1PreviouslyWinner?: boolean) {
        this.id = id;
        this.competitor0Name = competitor0Name;
        this.competitor1Name = competitor1Name;
        this.winner = winner;
        this.winnerChild = winnerChild;
        this.loserChild = loserChild;
        this.competitor0Parent = competitor0Parent;
        this.competitor1Parent = competitor1Parent;
        this.competitor0PreviouslyWinner = competitor0PreviouslyWinner;
        this.competitor1PreviouslyWinner = competitor1PreviouslyWinner;
    }

    static createLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, parent1: Match, parent1Winner: boolean) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), parent1Winner ? parent1.getWinner() : parent1.getLoser(), undefined);

        // link parents to child
        if (parent0Winner) {
            parent0.winnerChild = newMatch;
        }
        else {
            parent0.loserChild = newMatch;
        }

        if (parent1Winner) {
            parent1.winnerChild = newMatch;
        }
        else {
            parent1.loserChild = newMatch;
        }

        // link child to parents
        newMatch.competitor0Parent = parent0;
        newMatch.competitor1Parent = parent1;
        newMatch.competitor0PreviouslyWinner = parent0Winner;
        newMatch.competitor1PreviouslyWinner = parent1Winner;

        //console.log('creating new linked match with id ' + id + ' and competitors ' + newMatch.competitor0Name + ' and ' + newMatch.competitor1Name + ' and parent0.id ' + parent0.id + ' and parent0Winner  ' + parent0Winner + ' and parent1.id ' + parent1.id + ' and parent1Winner ' + parent1Winner);

        return newMatch;
    }

    static createHalfLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, competitor1Name: string) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), competitor1Name, undefined);

        // link parents to child
        if (parent0Winner) {
            parent0.winnerChild = newMatch;
        }
        else {
            parent0.loserChild = newMatch;
        }

        // link child to parents
        newMatch.competitor0Parent = parent0;
        newMatch.competitor0PreviouslyWinner = parent0Winner;

        //console.log('creating new half linked match with id ' + id + ' and competitors ' + newMatch.competitor0Name + ' and ' + newMatch.competitor1Name + ' and parent0.id ' + parent0.id + ' and parent0Winner ' + parent0Winner);

        return newMatch;
    }

    static createUnlinkedMatch(id: number, competitor0Name: string, competitor1Name: string) {

        // create new match
        //console.log('creating new unlinked match with id ' + id + ' and competitors ' + competitor0Name + ' and ' + competitor1Name);
        return new Match(id, competitor0Name, competitor1Name);
    }

    getWinner() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Winner of match ' + this.id;
        }

        // if winner is set to 0 or 1, then the corresponding competitor name is definitely not undefined
        return (this.winner === 0 ? this.competitor0Name : this.competitor1Name) as string;
    }

    getLoser() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Loser of match ' + this.id;
        }
        return this.winner === 0 ? this.competitor1Name : this.competitor0Name;
    }

    // update the winner of this match and then trigger a recursive update of all children matches' competitor names
    updateWinner(winner: number) {
        this.winner = winner;

        if (this.winnerChild) {
            //console.log('updating winner child which has id ' + this.winnerChild.id);
            this.winnerChild.updateNames();
        }

        if (this.loserChild) {
            //console.log('updating loser child which has id ' + this.loserChild.id);
            this.loserChild.updateNames();
        }
    }

    // update the winner of this match and all its children recursively
    updateNames() {

        if (this.competitor0Parent) {
            this.competitor0Name = this.competitor0PreviouslyWinner ? this.competitor0Parent.getWinner() : this.competitor0Parent.getLoser();
        }
        if (this.competitor1Parent) {
            this.competitor1Name = this.competitor1PreviouslyWinner ? this.competitor1Parent.getWinner() : this.competitor1Parent.getLoser();
        }

        //console.log('updated names for match ' + this.id + ' to ' + this.competitor0Name + ' and ' + this.competitor1Name);

        if (this.winnerChild) {
            this.winnerChild.updateNames();
        }
        if (this.loserChild) {
            this.loserChild.updateNames();
        }
    }
}

export default Match;