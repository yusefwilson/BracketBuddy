type Gender = 'Male' | 'Female' | 'Mixed';

type Hand = 'Left' | 'Right';

type ExperienceLevel = 'Youth' | 'Novice' | 'Amateur' | 'Semipro' | 'Pro' | 'Master' | 'Grandmaster' | 'Senior Grandmaster';

type WeightLimit = number | 'Superheavyweight';

type MatchStatus = 'UNDECIDED' | 'PLAYER_1_WON' | 'PLAYER_2_WON' | 'PLAYER_1_DROPOUT' | 'PLAYER_2_DROPOUT' | 'PLAYER_1_NO_SHOW' | 'PLAYER_2_NO_SHOW';

type BracketType = 'DoubleEliminationBracket' | 'SingleEliminationBracket' | 'RoundRobinBracket';

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
    status: MatchStatus;
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
interface RandomizeCompetitorsInput {
    tournamentId: string;
    bracketId: string;
}

interface EnterRoundRobinResultInput {
    tournamentId: string;
    bracketId: string;
    matchId: string;
    player1Score: number;
    player2Score: number;
}

interface ResetRoundRobinMatchInput {
    tournamentId: string;
    bracketId: string;
    matchId: string;
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
        type: BracketType;
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

interface ExportToAERSInput {
    tournamentId: string;
}

interface ExportTournamentInput {
    tournamentId: string;
}

interface ExportToPDFInput {
    tournamentId: string;
}

// misc

interface SaveKeyValueInput {
    key: string;
    value: any;
}

// API Response types
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

interface ApiError {
    message: string;
    code?: string;
    field?: string; // Optional field identifier for form validation errors
}

export type {
    Gender, Hand, ExperienceLevel, WeightLimit, MatchStatus, BracketType,
    ExternalMatch, SlotCoordinates,
    UpdateBracketInput, AddCompetitorToBracketInput, RemoveCompetitorFromBracketInput, RandomizeCompetitorsInput, EnterRoundRobinResultInput, ResetRoundRobinMatchInput,
    CreateTournamentInput, DeleteTournamentInput, AddBracketsToTournamentInput, RemoveBracketFromTournamentInput,
    SaveKeyValueInput, ExportToAERSInput, ExportTournamentInput, ExportToPDFInput,
    ApiResponse
};