import { Gender, Hand, ExperienceLevel } from './types';
import { MatchDTO } from './MatchDTO'

interface BracketDTO {

    id: string

    tournamentId: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number | 'Superheavyweight' // in lbs, -1 for no limit

    competitorNames: string[]

    winnersBracket: MatchDTO[][]
    losersBracket: MatchDTO[][]

    final: MatchDTO | null
    finalRematch: MatchDTO | null

    currentMatchNumber: number

    finalRematchNeeded: boolean

    firstPlace: string | undefined
    secondPlace: string | undefined
    thirdPlace: string | undefined
}

export type { BracketDTO }