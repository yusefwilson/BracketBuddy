import type { CompetitorDTO } from './CompetitorDTO';

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

interface RoundRobinStanding {
    competitorId: string
    name: string
    points: number
    wins: number
    losses: number
}

// endpoint input types

// bracket
interface UpdateBracketInput {
    tournamentId: string;
    bracketId: string;
    matchId: string;
    status: MatchStatus;
}

// provide exactly one of:
//  - competitorId: attach a competitor that is already registered in the tournament
//  - competitor: register a new competitor (if one with the same name is already registered, that one is reused)
interface AddCompetitorToBracketInput {
    tournamentId: string;
    bracketId: string;
    competitorId?: string;
    competitor?: CompetitorDTO;
}

// edit a competitor everywhere they appear (name, gender, weight, paid)
interface UpdateCompetitorInput {
    tournamentId: string;
    competitorId: string;
    updates: Partial<Omit<CompetitorDTO, 'id'>>;
}

// remove a competitor from every bracket and from the tournament
interface DeleteCompetitorInput {
    tournamentId: string;
    competitorId: string;
}

interface RemoveCompetitorFromBracketInput {
    tournamentId: string;
    bracketId: string;
    competitorId: string;
}
interface RandomizeCompetitorsInput {
    tournamentId: string;
    bracketId: string;
}

interface EnterRoundRobinResultInput {
    tournamentId: string;
    bracketId: string;
    matchId: string;
    competitor1Score: number;
    competitor2Score: number;
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
    ExternalMatch, SlotCoordinates, RoundRobinStanding,
    UpdateBracketInput, AddCompetitorToBracketInput, RemoveCompetitorFromBracketInput, RandomizeCompetitorsInput, EnterRoundRobinResultInput, ResetRoundRobinMatchInput,
    UpdateCompetitorInput, DeleteCompetitorInput,
    CreateTournamentInput, DeleteTournamentInput, AddBracketsToTournamentInput, RemoveBracketFromTournamentInput,
    SaveKeyValueInput, ExportToAERSInput, ExportTournamentInput, ExportToPDFInput,
    ApiResponse
};