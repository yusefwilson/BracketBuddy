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
}

export type { BracketDTO }