import { Gender, Hand, ExperienceLevel } from './types';

import Match from './Match'

interface Bracket {

    tournamentId: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit

    competitorNames: string[]

    final: Match | null
    finalRematch: Match | null
}

export default Bracket;