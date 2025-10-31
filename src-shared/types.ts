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

// endpoint input types

// bracket
interface UpdateBracketInput {
    tournamentId: string;
    bracketId: string;
    matchId: string;
    winner: number;
}

interface AddCompetitorToBracketInput {
    tournamentId: string;
    bracketId: string;
    competitorName: string;
}

interface RemoveCompetitorFromBracketInput {
    tournamentId: string;
    bracketId: string;
    competitorName: string;
}

interface StartBracketInput {
    tournamentId: string;
    bracketId: string;
}

interface RandomizeCompetitorsInput {
    tournamentId: string;
    bracketId: string;
}

// tournament

interface CreateTournamentInput {
    name: string;
    date: Date;
}

interface DeleteTournamentInput {
    tournamentId: string;
}

interface AddBracketsToTournamentInput {
    tournamentId: string;
    brackets: {
        gender: Gender;
        experienceLevel: ExperienceLevel;
        hand: Hand;
        weightLimit: WeightLimit;
        competitorNames: string[];
    }[];
}

interface RemoveBracketFromTournamentInput {
    tournamentId: string;
    bracketId: string;
}

interface ConvertToAERSInput {
    tournamentId: string;
}

// misc

interface SaveKeyValueInput {
    key: string;
    value: any;
}
export type {
    Gender, Hand, ExperienceLevel, WeightLimit,
    ExternalMatch, SlotCoordinates,
    UpdateBracketInput, AddCompetitorToBracketInput, RemoveCompetitorFromBracketInput, StartBracketInput, RandomizeCompetitorsInput,
    CreateTournamentInput, DeleteTournamentInput, AddBracketsToTournamentInput, RemoveBracketFromTournamentInput,
    SaveKeyValueInput, ConvertToAERSInput
};