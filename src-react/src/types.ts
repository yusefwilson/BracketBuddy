enum Gender {
    Male,
    Female,
    Mixed
}

enum AgeGroup {
    Junior,
    Senior,
    Master,
    Grandmaster,
    SeniorGrandmaster
}

enum Hand {
    Right,
    Left
}

interface Match {
    competitor0: string,
    competitor1: string,
    winner?: number // 0 for competitor1, 1 for competitor2
}

interface Round {
    winnerSide: Match[],
    loserSide: Match[]
}

interface Bracket {
    gender: Gender,
    ageGroup: AgeGroup,
    hand: Hand,
    weightLimit: number, // in lbs, -1 for no limit
    rounds: Round[]
}

export type { Bracket };