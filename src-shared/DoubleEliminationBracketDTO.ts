import { BracketDTO } from './BracketDTO';
import { MatchDTO } from './MatchDTO';

interface DoubleEliminationBracketDTO extends BracketDTO {

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

export type { DoubleEliminationBracketDTO }