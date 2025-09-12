interface MatchDTO {

    round: number
    match: number
    player1: string | number | null
    player2: string | number | null
    winner: number // 1 if player1 won, 0 if player2 won, -1 if it is undetermined
    win?: {
        round: number,
        match: number
    }
    loss?: {
        round: number,
        match: number
    }
}
export type { MatchDTO };