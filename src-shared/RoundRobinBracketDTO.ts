import { BracketDTO } from './BracketDTO';
import { MatchDTO } from './MatchDTO';
import { RoundRobinStanding } from './types';

interface RoundRobinBracketDTO extends BracketDTO {

    rounds: MatchDTO[][]

    standings: RoundRobinStanding[]

    currentMatchNumber: number

    firstPlace: string | undefined
    secondPlace: string | undefined
    thirdPlace: string | undefined
}

export type { RoundRobinBracketDTO, RoundRobinStanding }
