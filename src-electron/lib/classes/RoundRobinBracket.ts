import { RoundRobinBracketDTO } from '../../../src-shared/RoundRobinBracketDTO.js';
import { Gender, Hand, ExperienceLevel, WeightLimit, BracketType, RoundRobinStanding } from '../../../src-shared/types.js';

import Match from './Match.js';
import Bracket from './Bracket.js';
import Tournament from './Tournament.js';
import { serialize } from '../utils.js';
import { prepareRoundRobinMatches } from '../roundRobinUtils.js';
import Competitor from './Competitor.js';

class RoundRobinBracket extends Bracket {

    __class: string = 'RoundRobinBracket'

    type: BracketType = 'RoundRobinBracket'

    rounds: Match[][]

    constructor(tournament: Tournament = new Tournament(), gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: WeightLimit = 0, competitors: Competitor[] = []) {

        super(tournament, gender, experienceLevel, hand, weightLimit, competitors);

        this.rounds = [];
    }

    // create the initial round robin schedule
    initialize() {

        // need at least 2 competitors to schedule any matches
        if (this.competitors.length <= 1) {
            this.rounds = [];
            return;
        }

        this.rounds = prepareRoundRobinMatches(this.competitors);
    }

    // return all matches flattened and in no particular order
    getMatches(): Match[] {
        return this.rounds.flat();
    }

    // enter point scores for a match; winner is auto-derived (no draws)
    updateMatchScore(matchId: string, player1Score: number, player2Score: number) {
        const match = this.findMatchById(matchId);
        match.updateScore(player1Score, player2Score);
    }

    // clear a match's result back to undecided
    resetMatch(matchId: string) {
        const match = this.findMatchById(matchId);
        match.resetScore();
    }

    // whether any match has had a result entered
    hasAnyResult(): boolean {
        return this.getMatches().some(match => match.status !== 'UNDECIDED');
    }

    // standings ranked by total points scored across all decided matches
    getStandings(): RoundRobinStanding[] {

        // keyed by competitor id (not name) so two competitors with the same name stay separate
        const standingsById = new Map<string, RoundRobinStanding>();
        for (const competitor of this.competitors) {
            standingsById.set(competitor.id, { competitorId: competitor.id, name: competitor.name(), points: 0, wins: 0, losses: 0 });
        }

        for (const match of this.getMatches()) {

            // only decided matches with scores contribute
            if (match.status === 'UNDECIDED' || match.competitor1 === null || match.competitor2 === null) {
                continue;
            }

            const player1Standing = standingsById.get(match.competitor1.id);
            const player2Standing = standingsById.get(match.competitor2.id);

            if (player1Standing) {
                player1Standing.points += match.competitor1Score ?? 0;
            }
            if (player2Standing) {
                player2Standing.points += match.competitor2Score ?? 0;
            }

            if (match.status === 'PLAYER_1_WON') {
                if (player1Standing) player1Standing.wins++;
                if (player2Standing) player2Standing.losses++;
            } else if (match.status === 'PLAYER_2_WON') {
                if (player2Standing) player2Standing.wins++;
                if (player1Standing) player1Standing.losses++;
            }
        }

        return [...standingsById.values()].sort((a, b) => b.points - a.points);
    }

    getFirstPlaceName(): string | undefined {
        if (!this.hasAnyResult()) {
            return undefined;
        }
        return this.getStandings()[0]?.name;
    }

    getSecondPlaceName(): string | undefined {
        if (!this.hasAnyResult()) {
            return undefined;
        }
        return this.getStandings()[1]?.name;
    }

    getThirdPlaceName(): string | undefined {
        if (!this.hasAnyResult() || this.competitors.length < 3) {
            return undefined;
        }
        return this.getStandings()[2]?.name;
    }

    serialize(): string {
        return serialize(this);
    }

    toDTO(): RoundRobinBracketDTO {
        return {
            id: this.id,
            type: this.type,
            tournamentId: this.tournament.id,
            gender: this.gender,
            experienceLevel: this.experienceLevel,
            hand: this.hand,
            weightLimit: this.weightLimit,
            competitors: this.competitors.map(c => c.toDTO()),
            rounds: this.rounds.map(round => round.map(match => match.toDTO())),
            standings: this.getStandings(),
            currentMatchNumber: this.getLowestUnfilledMatchNumber(),
            firstPlace: this.getFirstPlaceName(),
            secondPlace: this.getSecondPlaceName(),
            thirdPlace: this.getThirdPlaceName(),
        };
    }
}

export default RoundRobinBracket;
