declare module '@g-loot/react-tournament-brackets' {
    import * as React from 'react';

    export interface Participant {
        id: string;
        resultText: string | null;
        isWinner: boolean;
        status: 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null;
        name: string;
    }

    export type MatchState = 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE';

    export interface Match {
        id: number | string;
        name: string;
        nextMatchId: number | string | null | undefined;
        nextLooserMatchId: number | string | null | undefined;
        tournamentRoundText?: string;
        startTime: string;
        state: MatchState;
        participants: Participant[];
    }

    export interface BracketData {
        upper: Match[];
        lower: Match[];
    }

    // Also export the components if you want to type them:
    export const DoubleEliminationBracket: React.FC<{
        matches: BracketData;
        matchComponent?: React.ComponentType<any>;
        svgWrapper?: React.FC<React.SVGProps<SVGSVGElement> & { children: React.ReactNode }>;
    }>;

    export const Match: React.FC<any>;
    export const MatchContainer: React.FC<any>;
    export const SVGViewer: React.FC<React.SVGProps<SVGSVGElement>>;
}
