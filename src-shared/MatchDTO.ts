import { MatchStatus } from './types';
import { CompetitorDTO } from './CompetitorDTO';

interface MatchDTO {

    id: string
    number: number
    round: number
    match: number
    competitor1: CompetitorDTO | null
    competitor2: CompetitorDTO | null
    competitor1Score: number | null
    competitor2Score: number | null
    status: MatchStatus
    win?: {
        round: number,
        match: number
    }
    loss?: {
        round: number,
        match: number
    }
    slot1GenericName: string
    slot2GenericName: string
}
export type { MatchDTO };