interface MatchDTO {

    id: string | number;
    name: string;
    nextMatchId: string | number | null | undefined;
    nextLooserMatchId: string | number | null | undefined;
    startTime: string | null;
    state: 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' | null;
    participants: {
        id: string | null;
        resultText: string | null;
        isWinner: boolean;
        status: 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null;
        name: string | null;
    }[];
}
export type { MatchDTO };