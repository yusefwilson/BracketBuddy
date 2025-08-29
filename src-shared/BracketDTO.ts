import { Gender, Hand, ExperienceLevel, RenderableBracket } from './types';

import { MatchDTO } from './MatchDTO'

interface BracketDTO {

    id: string

    tournamentId: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit

    competitorNames: string[]

    renderableBracket: RenderableBracket

    final: MatchDTO
    finalRematch: MatchDTO
}

export type { BracketDTO }