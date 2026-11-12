import { DoubleEliminationBracketDTO } from '../../../src-shared/DoubleEliminationBracketDTO.js';
import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../../src-shared/types.js';
import Competitor from './Competitor.js';
import Match from './Match.js';
import Bracket from './Bracket.js';
import Tournament from './Tournament.js';
import { serialize } from '../utils.js';
import { prepareMatches } from '../doubleEliminationUtils.js';
import { BracketType } from '../../../src-shared/types.js';

class DoubleEliminationBracket extends Bracket {

    __class: string = 'DoubleEliminationBracket'

    type: BracketType = 'DoubleEliminationBracket'

    winnersBracket: Match[][]
    losersBracket: Match[][]

    final: Match | null
    finalRematch: Match | null

    constructor(tournament: Tournament = new Tournament(), gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: WeightLimit = 0, competitors: Competitor[] = []) {

        super(tournament, gender, experienceLevel, hand, weightLimit, competitors);

        this.winnersBracket = [];
        this.losersBracket = [];

        this.final = null;
        this.finalRematch = null;
    }

    // create the initial bracket structure
    initialize() {

        // if there is only one competitor, there is no need to create a bracket
        if (this.competitors.length <= 1) {
            this.winnersBracket = [];
            this.losersBracket = [];
            this.final = null;
            this.finalRematch = null;
            return;
        }

        console.log('about to initialize bracket with competitors: ', this.competitors.map(c => c.name()));

        const { winnersBracket, losersBracket, final, finalRematch } = prepareMatches(this.competitors);

        this.winnersBracket = winnersBracket;
        this.losersBracket = losersBracket;
        this.final = final;
        this.finalRematch = finalRematch;
    }

    // return matches flattened and in no particular order
    getMatches(): Match[] {

        let matches: Match[] = [];

        matches = matches.concat(this.winnersBracket.flat());
        matches = matches.concat(this.losersBracket.flat());

        // add final and final rematch
        if (this.final) {
            matches.push(this.final);
        }
        if (this.finalRematch) {
            matches.push(this.finalRematch);
        }

        return matches;
    }

    print() {
        console.log(`Bracket with gender ${this.gender}, age group ${this.experienceLevel}, hand ${this.hand}, and weight limit ${this.weightLimit} lbs:`);

        console.log('Winners Bracket:');
        this.winnersBracket.forEach((round, i) => {
            console.log(`Round ${i + 1}:`);
            round.forEach(match => {
                console.log(`Match ${match.match}: ${match.competitor1?.name()} vs ${match.competitor2?.name()}`);
            });
        });

        console.log('Losers Bracket:');
        this.losersBracket.forEach((round, i) => {
            console.log(`Round ${i + 1}:`);
            round.forEach(match => {
                console.log(`Match ${match.match}: ${match.competitor1?.name()} vs ${match.competitor2?.name()}`);
            });
        });
    }

    serialize(): string {
        return serialize(this);
    }

    canGetWinnerFromFinal(): boolean {
        if (!this.final) {
            return false;
        }
        const winnersBracketFinal = this.winnersBracket[this.winnersBracket.length - 1][0];
        // return true if winner of final is winner of winners bracket final too
        return this.final.isDecided() && this.final.getWinningPlayer().id === winnersBracketFinal.getWinningPlayer().id;
    }

    getFirstPlaceName(): string | undefined {

        if (!this.final) {
            return undefined;
        }
        // if the final rematch has not taken place, and the final has, and the winner of the final is the winner of the last winnners bracket match
        if (this.canGetWinnerFromFinal()) {
            return this.final.getWinningPlayer().name();
        }

        if (!this.finalRematch) {
            return undefined;
        }

        // if the final rematch has taken place, then the first place is the winner of the final rematch
        if (this.finalRematch.isDecided()) {
            return this.finalRematch.getWinningPlayer().name();
        }

        // if cannot get winner from final, and final rematch has not taken place, return undefined
        return undefined;
    }

    getSecondPlaceName(): string | undefined {

        if (this.canGetWinnerFromFinal()) {
            return this.final?.getLosingPlayer().name();
        }

        if (this.finalRematch?.isDecided()) {
            return this.finalRematch?.getLosingPlayer().name();
        }

        return undefined;
    }

    getThirdPlaceName(): string | undefined {

        if (!this.finalRematch) {
            return undefined;
        }

        if (this.competitors.length === 2) {
            return undefined;
        }

        const losersBracketFinal = this.losersBracket[this.losersBracket.length - 1][0];

        if (losersBracketFinal.isDecided()) {
            return losersBracketFinal.getLosingPlayer().name();
        }

        return undefined;
    }

    finalRematchNeeded(): boolean {

        // if final is not decided, final rematch not needed
        if (!this.final?.isDecided()) {
            //console.log('returning false because final is not decided');
            return false;
        }

        // if winners bracket final is not decided, final rematch not needed
        const winnersBracketFinal = this.winnersBracket[this.winnersBracket.length - 1][0];
        if (!winnersBracketFinal.isDecided()) {
            //console.log('returning false because winners bracket final is not decided');
            return false;
        }

        // if winner of final came from winners bracket, final rematch not needed
        const winnersBracketFinalWinner = winnersBracketFinal.getWinningPlayer();
        const finalWinner = this.final.getWinningPlayer();

        //console.log('returning ', winnersBracketFinalWinner !== finalWinner, ' because winners bracket final winner is ', winnersBracketFinalWinner, ', and final winner is ', finalWinner);

        return winnersBracketFinalWinner.id !== finalWinner.id;
    }

    toDTO(): DoubleEliminationBracketDTO {

        const DTO = {
            id: this.id,
            type: this.type,
            tournamentId: this.tournament.id,
            gender: this.gender,
            experienceLevel: this.experienceLevel,
            hand: this.hand,
            weightLimit: this.weightLimit,
            competitors: this.competitors.map(c => c.toDTO()),
            winnersBracket: this.winnersBracket.map(round => round.map(match => match.toDTO())),
            losersBracket: this.losersBracket.map(round => round.map(match => match.toDTO())),
            final: this.final ? this.final.toDTO() : null,
            finalRematch: this.finalRematch ? this.finalRematch.toDTO() : null,
            currentMatchNumber: this.getLowestUnfilledMatchNumber(),
            finalRematchNeeded: this.finalRematchNeeded(),
            firstPlace: this.getFirstPlaceName(),
            secondPlace: this.getSecondPlaceName(),
            thirdPlace: this.getThirdPlaceName(),
        };

        return DTO;
    }
}

export default DoubleEliminationBracket;