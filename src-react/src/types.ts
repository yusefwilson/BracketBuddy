enum Gender {
    Male = 'Male',
    Female = 'Female',
    Mixed = 'Mixed'
}

enum AgeGroup {
    Junior = 'Junior',
    Senior = 'Senior',
    Master = 'Master',
    Grandmaster = 'Grandmaster',
    SeniorGrandmaster = 'Senior Grandmaster',
}

enum Hand {
    Right = 'Right',
    Left = 'Left',
}

interface Match {
    competitor0Name?: string,
    competitor1Name?: string,
    winner?: number // 0 for competitor0, 1 for competitor1
}

interface Round {
    winnerSide: Match[],
    loserSide?: Match[]
}

interface Bracket {
    gender: Gender,
    ageGroup: AgeGroup,
    hand: Hand,
    weightLimit: number, // in lbs, -1 for no limit
    rounds: Round[]
}

export type { Bracket, Match, Round, Gender, AgeGroup, Hand };