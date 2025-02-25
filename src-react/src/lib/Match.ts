import DataStore from "./DataStore";

class Match {

    matchNumber: number // in ascending numerical order, starting from 0, indicating order that matches should be played in. this ensures that matches must be created in the order they are to be played
    competitor0Name?: string
    competitor1Name?: string
    winner?: number // 0 for competitor0, 1 for competitor, -1 or undefined for TBD
    winnerChildId?: number
    loserChildId?: number

    competitor0ParentId?: number
    competitor1ParentId?: number
    competitor0PreviouslyWinner?: boolean
    competitor1PreviouslyWinner?: boolean

    id: number

    constructor(id: number, competitor0Name?: string, competitor1Name?: string, winner?: number, winnerChildId?: number, loserChildId?: number,
        competitor0ParentId?: number, competitor1ParentId?: number, competitor0PreviouslyWinner?: boolean, competitor1PreviouslyWinner?: boolean
    ) {
        this.matchNumber = id;
        this.competitor0Name = competitor0Name;
        this.competitor1Name = competitor1Name;
        this.winner = winner;
        this.winnerChildId = winnerChildId;
        this.loserChildId = loserChildId;
        this.competitor0ParentId = competitor0ParentId;
        this.competitor1ParentId = competitor1ParentId;
        this.competitor0PreviouslyWinner = competitor0PreviouslyWinner;
        this.competitor1PreviouslyWinner = competitor1PreviouslyWinner;

        this.id = DataStore.Instance.addMatch(this);
    }

    static createLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, parent1: Match, parent1Winner: boolean) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), parent1Winner ? parent1.getWinner() : parent1.getLoser(), undefined);

        // link parents to child
        if (parent0Winner) {
            parent0.winnerChildId = newMatch.id;
        }
        else {
            parent0.loserChildId = newMatch.id;
        }

        if (parent1Winner) {
            parent1.winnerChildId = newMatch.id;
        }
        else {
            parent1.loserChildId = newMatch.id;
        }

        // link child to parents
        newMatch.competitor0ParentId = parent0.id;
        newMatch.competitor1ParentId = parent1.id;
        newMatch.competitor0PreviouslyWinner = parent0Winner;
        newMatch.competitor1PreviouslyWinner = parent1Winner;

        console.log('creating new linked match with id ' + id + ' and competitors ' + newMatch.competitor0Name + ' and ' + newMatch.competitor1Name + ' and parent0.id ' + parent0.matchNumber + ' and parent0Winner  ' + parent0Winner + ' and parent1.id ' + parent1.matchNumber + ' and parent1Winner ' + parent1Winner);

        return newMatch;
    }

    static createHalfLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, competitor1Name: string) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), competitor1Name, undefined);

        // link parents to child
        if (parent0Winner) {
            parent0.winnerChildId = newMatch.id;
        }
        else {
            parent0.loserChildId = newMatch.id;
        }

        // link child to parents
        newMatch.competitor0ParentId = parent0.id;
        newMatch.competitor0PreviouslyWinner = parent0Winner;

        console.log('creating new half linked match with id ' + id + ' and competitors ' + newMatch.competitor0Name + ' and ' + newMatch.competitor1Name + ' and parent0.id ' + parent0.matchNumber + ' and parent0Winner ' + parent0Winner);

        return newMatch;
    }

    static createUnlinkedMatch(id: number, competitor0Name: string, competitor1Name: string) {

        // create new match
        console.log('creating new unlinked match with id ' + id + ' and competitors ' + competitor0Name + ' and ' + competitor1Name);
        return new Match(id, competitor0Name, competitor1Name);
    }

    getWinner() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Winner of match ' + this.matchNumber;
        }

        // if winner is set to 0 or 1, then the corresponding competitor name is definitely not undefined
        return (this.winner === 0 ? this.competitor0Name : this.competitor1Name) as string;
    }

    getLoser() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Loser of match ' + this.matchNumber;
        }
        return this.winner === 0 ? this.competitor1Name : this.competitor0Name;
    }

    // update the winner of this match and then trigger a recursive update of all children matches' competitor names
    updateWinner(winner: number) {
        this.winner = winner;

        if (this.winnerChildId) {
            const winnerChild = DataStore.Instance.getMatch(this.winnerChildId);
            console.log('updating winner child which has id ' + winnerChild?.matchNumber);
            winnerChild?.updateNames();
        }

        if (this.loserChildId) {
            const loserChild = DataStore.Instance.getMatch(this.loserChildId);
            console.log('updating loser child which has id ' + loserChild?.matchNumber);
            loserChild?.updateNames();
        }
    }

    // update the winner of this match and all its children recursively
    updateNames() {

        if (this.competitor0ParentId) {
            const competitor0Parent = DataStore.Instance.getMatch(this.competitor0ParentId);
            this.competitor0Name = this.competitor0PreviouslyWinner ? competitor0Parent?.getWinner() : competitor0Parent?.getLoser();
        }
        if (this.competitor1ParentId) {
            const competitor1Parent = DataStore.Instance.getMatch(this.competitor1ParentId);
            this.competitor1Name = this.competitor1PreviouslyWinner ? competitor1Parent?.getWinner() : competitor1Parent?.getLoser();
        }

        console.log('updated names for match ' + this.matchNumber + ' to ' + this.competitor0Name + ' and ' + this.competitor1Name);

        if (this.winnerChildId) {
            const winnerChild = DataStore.Instance.getMatch(this.winnerChildId);
            winnerChild?.updateNames();
        }
        if (this.loserChildId) {
            const loserChild = DataStore.Instance.getMatch(this.loserChildId);
            loserChild?.updateNames();
        }
    }
}

export default Match;