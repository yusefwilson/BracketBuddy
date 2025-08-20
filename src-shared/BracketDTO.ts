// TODO: do the compilation of these and how best to bundle/import them into the frontend and backend need to be considered? (yes, do it)

import { Gender, Hand, ExperienceLevel } from './types';

import { MatchDTO } from './MatchDTO'

interface BracketDTO {

    id: string

    tournamentId: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit

    competitorNames: string[]

    final: MatchDTO | null
    finalRematch: MatchDTO | null
}

export type { BracketDTO }