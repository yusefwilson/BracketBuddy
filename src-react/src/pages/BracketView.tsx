import { DoubleEliminationBracket, SVGViewer, Match as MatchComponent } from '@replydev/react-tournament-brackets';
import { ReactNode } from 'react';

export default function BracketView() {

  const matches = {
    upper: [
      {
        id: 1,
        name: "Upper Semi Final",
        nextMatchId: 3, // links to the Final
        nextLooserMatchId: 2, // loser drops to lower bracket
        tournamentRoundText: "1",
        startTime: "2021-05-30",
        state: "DONE",
        participants: [
          {
            id: "p1",
            name: "Alice",
            isWinner: true,
            resultText: "WON",
            status: null,
          },
          {
            id: "p2",
            name: "Bob",
            isWinner: false,
            resultText: "LOST",
            status: null,
          },
        ],
      },
      {
        id: 3,
        name: "Upper Final",
        nextMatchId: null, // final upper bracket
        nextLooserMatchId: undefined,
        tournamentRoundText: "2",
        startTime: "2021-06-01",
        state: "SCORE_DONE",
        participants: [
          { id: "p1", name: "Alice", isWinner: false, resultText: "LOST", status: null },
          { id: "p3", name: "Charlie", isWinner: true, resultText: "WON", status: null },
        ],
      },
    ],
    lower: [
      {
        id: 2,
        name: "Lower Bracket Match",
        nextMatchId: 3, // feeds into the upper final
        nextLooserMatchId: undefined,
        tournamentRoundText: "1",
        startTime: "2021-05-31",
        state: "DONE",
        participants: [
          { id: "p2", name: "Bob", isWinner: true, resultText: "WON", status: null },
          { id: "p4", name: "Dan", isWinner: false, resultText: "LOST", status: null },
        ],
      },
    ],
  };

  return (
    <DoubleEliminationBracket
      matches={matches}
      matchComponent={MatchComponent}
      svgWrapper={({ children, ...props }: { children: ReactNode;[key: string]: any }) => (
        <SVGViewer width={500} height={500} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
}