import { CompetitorDTO } from './CompetitorDTO';
import type { TournamentDTO } from './TournamentDTO';

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

interface AddCompetitorToBracketInput {
    tournamentId: string;
    bracketId: string;
    competitor: CompetitorDTO;
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
        competitors: CompetitorDTO[];
    }[];
}

interface RemoveBracketFromTournamentInput {
    tournamentId: string;
    bracketId: string;
}

type RegistrationField = 'name' | 'gender' | 'weight' | 'classes';

// a registration csv row that could not be applied; `fields` marks which cells to highlight
interface InvalidRegistrationRow {
    rowNumber: number; // 1-based line in the csv, header is row 1
    raw: string[];
    reasons: string[];
    fields: RegistrationField[];
}

interface ImportRegistrationsInput {
    tournamentId: string;
    bracketType: BracketType;
    csv: string;
}

interface ImportRegistrationsResult {
    tournament: TournamentDTO;
    invalidRows: InvalidRegistrationRow[];
    added: number; // competitor-class pairs newly added
    alreadyPresent: number; // competitor-class pairs that were no-ops
    classesCreated: number;
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
    CreateTournamentInput, DeleteTournamentInput, AddBracketsToTournamentInput, RemoveBracketFromTournamentInput,
    RegistrationField, InvalidRegistrationRow, ImportRegistrationsInput, ImportRegistrationsResult,
    SaveKeyValueInput, ExportToAERSInput, ExportTournamentInput, ExportToPDFInput,
    ApiResponse
};