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
    competitor1Name?: string, // if undefined and competitor0 not undefined, competitor0 gets a bye, winner will also be set to 0 on creation if match is bye
    winner?: number // 0 for competitor0, 1 for competitor, -1 or undefined for TBD
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

export type { Bracket, Match, Round, Gender, AgeGroup, Hand };