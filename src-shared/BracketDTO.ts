import { Gender, Hand, ExperienceLevel } from './types';
import { MatchDTO } from './MatchDTO'

interface BracketDTO {

    id: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit

    started: boolean

    competitorNames: string[]

    winnersBracket: MatchDTO[][]
    losersBracket: MatchDTO[][]

    final: MatchDTO | null
    finalRematch: MatchDTO | null
}

export type { BracketDTO }