type Gender = 'Male' | 'Female' | 'Mixed';

type Hand = 'Left' | 'Right';

type ExperienceLevel = 'Youth' | 'Novice' | 'Amateur' | 'Semipro' | 'Pro' | 'Master' | 'Grandmaster' | 'Senior Grandmaster';

type WeightLimit = number | 'Superheavyweight';

type ExternalMatch = {
    round: number,
    match: number,
    player1: string | null,
    player2: string | null,
    win?: {
        round: number,
        match: number
    },
    loss?: {
        round: number,
        match: number
    }
}

type SlotCoordinates = {
    round: number,
    match: number,
    slot: 1 | 2
}

export type { Gender, Hand, ExperienceLevel, WeightLimit, ExternalMatch, SlotCoordinates };