import { Gender, Hand, ExperienceLevel } from './types';
import { BracketType } from './types';

interface BracketDTO {

    id: string
    type: BracketType

    tournamentId: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number | 'Superheavyweight' // in lbs, -1 for no limit

    competitorNames: string[]

    // every bracket type resolves final placings; concrete DTOs populate these
    firstPlace: string | undefined
    secondPlace: string | undefined
    thirdPlace: string | undefined
}

export type { BracketDTO }