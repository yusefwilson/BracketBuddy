import { TournamentDTO } from '../../../src-shared/TournamentDTO.js';
import { dateToLocalTimezoneString } from '../../../src-shared/utils.js';

import Bracket from './Bracket.js';
import DoubleEliminationBracket from './DoubleEliminationBracket.js';
import RoundRobinBracket from './RoundRobinBracket.js';
import Match from './Match.js';
import Competitor from './Competitor.js';
import { serialize, deserialize } from '../utils.js';
import { convertTournamentToAERS } from '../AERSUtils.js';

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

class Tournament {

    __class: string = 'Tournament'

    name: string;
    date: Date;
    id: string;

    // every competitor in the tournament. a competitor can be in several brackets (or none), and
    // each bracket holds the same Competitor instance as this list.
    competitors: Competitor[];
    brackets: Bracket[];

    constructor(name: string = '', date: Date = new Date()) {
        this.name = name;
        this.date = date;
        this.id = name + dateToLocalTimezoneString(date); // TODO: better unique id generation
        this.competitors = [];
        this.brackets = [];
    }

    // competitor registry

    getCompetitor(competitorId: string): Competitor {
        const competitor = this.competitors.find(c => c.id === competitorId);
        if (!competitor) {
            throw new Error('Competitor not found');
        }
        return competitor;
    }

    // names are compared ignoring case and extra whitespace
    findCompetitorByName(name: string): Competitor | undefined {
        const key = normalizeName(name);
        return this.competitors.find(c => normalizeName(c.name()) === key);
    }

    registerCompetitor(competitor: Competitor): Competitor {
        if (!this.competitors.some(c => c.id === competitor.id)) {
            this.competitors.push(competitor);
        }
        return competitor;
    }

    // remove a competitor from every bracket they are in and from the tournament
    removeCompetitor(competitorId: string) {
        this.getCompetitor(competitorId); // throws if unknown

        for (const bracket of this.brackets) {
            if (bracket.competitors.some(c => c.id === competitorId)) {
                bracket.removeCompetitor(competitorId);
            }
        }
        this.competitors = this.competitors.filter(c => c.id !== competitorId);
    }

    async addBracket(bracket: Bracket) {
        // throw error if bracket already exists
        if (this.brackets.find((b, index) => b.id === bracket.id)) {
            throw new Error('Bracket with these properties already exists in tournament');
        }
        this.brackets.push(bracket);
    }

    async removeBracket(bracketId: string) {
        this.brackets = this.brackets.filter(b => b.id !== bracketId);
    }

    // serialization and deserialization
    serialize(): string {
        return serialize(this);
    }

    static deserialize(serialized: string): Tournament {
        console.log('about to deserialize tournament data');
        const tournament = deserialize(serialized, { Tournament, Match, DoubleEliminationBracket, RoundRobinBracket, Competitor }) as Tournament;
        // Rewire bracket references
        tournament.brackets.forEach(bracket => {
            bracket.tournament = tournament;
        });

        // even though we assert 'as Tournament' above, it still might get deserialized and rehydrated as a legacy tournament. So, we have to migrate it no matter what.
        tournament.migrateLegacyData();
        tournament.syncCompetitorRegistry();

        return tournament;
    }

    // upgrade tournaments saved before the Competitor class existed. those stored competitors as plain
    // names (bracket.competitorNames, match.player1/player2/player1Score/player2Score). one Competitor is
    // created per distinct name, so a person in several brackets stays a single competitor.
    // a name is split on its first space: "Mary Ann Smith" -> first "Mary", last "Ann Smith".
    private migrateLegacyData() {

        const byName = new Map<string, Competitor>();
        const getOrCreate = (fullName: string, bracketGender: Bracket['gender']): Competitor => {
            const key = normalizeName(fullName);
            let competitor = byName.get(key);
            if (!competitor) {
                const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
                // old data had no gender per person, so use the class gender when it says anything
                competitor = new Competitor(undefined, bracketGender === 'Female' ? 'Female' : 'Male', firstName, rest.join(' '));
                byName.set(key, competitor);
            }
            return competitor;
        };

        for (const bracket of this.brackets) {

            const legacyBracket = bracket as any;
            if (Array.isArray(legacyBracket.competitorNames)) {
                bracket.competitors = legacyBracket.competitorNames.map((name: string) => getOrCreate(name, bracket.gender));
                delete legacyBracket.competitorNames;
            }

            for (const match of bracket.getMatches()) {
                const legacyMatch = match as any;
                if (!('player1' in legacyMatch) && !('player2' in legacyMatch)) {
                    continue;
                }
                match.competitor1 = legacyMatch.player1 ? getOrCreate(legacyMatch.player1, bracket.gender) : null;
                match.competitor2 = legacyMatch.player2 ? getOrCreate(legacyMatch.player2, bracket.gender) : null;
                match.competitor1Score = legacyMatch.player1Score ?? null;
                match.competitor2Score = legacyMatch.player2Score ?? null;
                delete legacyMatch.player1;
                delete legacyMatch.player2;
                delete legacyMatch.player1Score;
                delete legacyMatch.player2Score;
            }
        }
    }

    // make sure every competitor that is in a bracket is also in the tournament's list
    // (covers migrated data and files saved before the list existed)
    private syncCompetitorRegistry() {
        for (const bracket of this.brackets) {
            bracket.competitors.forEach(competitor => this.registerCompetitor(competitor));
        }
    }

    toDTO(): TournamentDTO {
        return {
            id: this.id,
            name: this.name,
            date: this.date,
            competitors: this.competitors.map(competitor => competitor.toDTO()),
            brackets: this.brackets.map(bracket => bracket.toDTO()),
        };
    }

    getBracket(bracketId: string): Bracket {
        const bracket = this.brackets.find(bracket => bracket.id === bracketId);
        if (!bracket) {
            throw new Error('Bracket not found');
        }
        return bracket;
    }

    getAllBrackets(): Bracket[] {
        return this.brackets;
    }

    convertToAERS(): string {
        return convertTournamentToAERS(this);
    }
}
export default Tournament;