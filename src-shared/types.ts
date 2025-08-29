type Gender = 'Male' | 'Female' | 'Mixed';

type Hand = 'Left' | 'Right';

type ExperienceLevel = 'Youth' | 'Novice' | 'Amateur' | 'Semipro' | 'Pro' | 'Master' | 'Grandmaster' | 'Senior Grandmaster';


type MatchState = 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE';

type ParticipantStatus = 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null;

interface BracketParticipant {
    id: string; // UUID or unique string
    resultText: string | null;
    isWinner: boolean;
    status: ParticipantStatus;
    name: string;
}

interface BracketMatch {
    id: number;
    name: string;
    nextMatchId: number | null | undefined;
    nextLooserMatchId: number | null | undefined;
    startTime: string; // ISO date string
    state: MatchState;
    participants: BracketParticipant[];
    tournamentRoundText?: string; // only appears in lower bracket sometimes
}

interface RenderableBracket {
    upper: BracketMatch[];
    lower: BracketMatch[];
}

export type { Gender, Hand, ExperienceLevel, RenderableBracket };