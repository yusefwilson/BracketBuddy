import { MatchStatus } from './types';

interface MatchDTO {

    id: string
    number: number
    round: number
    match: number
    player1: string | number | null
    player2: string | number | null
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