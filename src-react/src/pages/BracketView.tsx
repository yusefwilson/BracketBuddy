import { DoubleEliminationBracket, Match as MatchComponent, SVGViewer } from '@g-loot/react-tournament-brackets';
import { ReactNode } from 'react';
import Manager from 'tournament-organizer';
import { SettableTournamentValues } from 'tournament-organizer/interfaces';
import { Player } from 'tournament-organizer/components';

export default function BracketView() {

  const players = [new Player('player1', 'player1'), new Player('player2', 'player2'), new Player('player3', 'player3'), new Player('player4', 'player4')];
  const tournamentValues: SettableTournamentValues = {
    matches: [],
    name: 'test',
    players: players,
    //round?: number,
    scoring: {
      bestOf: 1,
      //bye?: number;
      //draw?: number;
      //loss?: number;
      //     tiebreaks?: (
      //         | "median buchholz"
      //         | "solkoff"
      //         | "sonneborn berger"
      //         | "cumulative"
      //         | "versus"
      //         | "game win percentage"
      //         | "opponent game win percentage"
      //         | "opponent match win percentage"
      //         | "opponent opponent match win percentage")[];
      //     win?: number;
    },
    //seating?: boolean;
    //sorting?: "none" | "ascending" | "descending";
    stageOne: {
      //consolation?: boolean;
      format: "double-elimination",
      //initialRound?: number;
      //maxPlayers?: number;
      //rounds?: number;
    },
    stageTwo: {
      advance: {
        method: "points",
        //value?: number;
      },
      //consolation?: boolean;
      format: "double-elimination"
    },
    // status?:
    //     | "setup"
    //     | "stage-one"
    //     | "stage-two"
    //     | "complete";
  };
  const manager = new Manager();
  const tournament = manager.createTournament('test tournament', tournamentValues)
  tournament.start();

  console.log(tournament);

  const matches = { upper: [], lower: [] };
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