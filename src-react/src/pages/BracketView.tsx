import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import Match from '../lib/Match';

type RoundType = 'initialWinner' | 'initialLoser' | 'winner' | 'loserOdd' | 'loserEven';
function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; }

export default function BracketView() {

  // state
  const state = useContext(CURRENT_STATE);
  const { bracket, setBracket = () => { }, tournament, setTournament = () => { } } = state || {};

  // local state
  const [competitorNames, setCompetitorNames] = useState<string[]>(bracket?.competitorNames || []);

  // update the winner of a match (this calls a recursive method on the Match class which updates all dependent matches)
  const updateMatch = (matchId: number, winner: number): void => {

    // find winner
    const matchToBeUpdated = bracket?.findMatchById(matchId);

    // update winner
    matchToBeUpdated?.updateWinner(winner);

    // hacky way to trigger refresh, and also to trigger tournament save in App useEffect
    setBracket(bracket?.markUpdated() as Bracket);
    setTournament(tournament?.markUpdated() as Tournament);
  }

  // update the competitor names in the bracket whenever they change, which will also update the matches
  useEffect(() => {
    // every time the bracket members are updated, update the bracket
    if (bracket) {
      console.log('updating competitornames from bracketview');
      bracket.setCompetitorNames(competitorNames);
      setBracket(bracket.markUpdated());
    }
  }, [competitorNames]);

  const HORIZONTAL_GAP = 200;
  const INITIAL_VERTICAL_GAP = 100;
  const EXTRA_VERTICAL_OFFSET = 25;

  const WINNER_HORIZONTAL_OFFSET = 25;
  const WINNER_VERTICAL_OFFSET = 25;

  // given information about a round, calculate where on the screen the match should be placed.
  const calculateInitialWinnerPosition = (roundIndex: number, matchIndex: number, roundType: RoundType,): number[] => {

    let x = roundIndex * HORIZONTAL_GAP + WINNER_HORIZONTAL_OFFSET;
    let y = matchIndex * INITIAL_VERTICAL_GAP + WINNER_VERTICAL_OFFSET + (roundType === 'initialWinner' ? EXTRA_VERTICAL_OFFSET : 0);
    return [x, y];
  }

  const calculateWinnerPosition = (roundIndex: number, parentMatch0Height: number, parentMatch1Height: number): number[] => {
    let x = roundIndex * HORIZONTAL_GAP + WINNER_HORIZONTAL_OFFSET;
    let y = (parentMatch0Height + parentMatch1Height) / 2;
    return [x, y];
  }

  // {match, x, y}[][]
  const winnerMatches = [];

  // calculate initial rounds positions (if power of 2, only one round, if not power of 2, two rounds)
  if (!isPowerOfTwo(competitorNames.length)) {
    winnerMatches.push(bracket?.winnersBracket[0].matches.map((match, index) => {
      let [x, y] = calculateInitialWinnerPosition(0, index, 'initialWinner');
      return { match, x, y };
    }));
    winnerMatches.push(bracket?.winnersBracket[1].matches.map((match, index) => {
      let [x, y] = calculateInitialWinnerPosition(1, index, 'winner');
      return { match, x, y };
    }));
  }
  else {
    winnerMatches.push(bracket?.winnersBracket[0].matches.map((match, index) => {
      let [x, y] = calculateInitialWinnerPosition(0, index, 'winner');
      return { match, x, y };
    }));
  }

  // iteratively calculate the positions of the rest of the matches by referencing and taking averages of the heights of their parents
  for (let roundIndex = isPowerOfTwo(competitorNames.length) ? 1 : 2; roundIndex < (bracket?.winnersBracket.length || 0); roundIndex++) {
    const previousRoundMatches = winnerMatches[roundIndex - 1];

    if (!previousRoundMatches || previousRoundMatches.length === 0) {
      console.warn(`No matches found for round index ${roundIndex - 1}`);
      continue;
    }

    winnerMatches.push(bracket?.winnersBracket[roundIndex].matches.map((match, index) => {

      // edge case when there is one parent
      if (previousRoundMatches.length === 1) {
        const parentMatch = previousRoundMatches[0];
        const [x, y] = calculateWinnerPosition(roundIndex, parentMatch.y, parentMatch.y);
        return { match, x, y };
      }


      // find parent matches using winnerMatches last round
      const parentMatch0 = previousRoundMatches[index * 2];
      const parentMatch1 = previousRoundMatches[index * 2 + 1];

      if (!parentMatch0 || !parentMatch1) {
        console.warn(`Parent matches not found for round index ${roundIndex} and match index ${index}`);
        return { match, x: 0, y: 0 }; // fallback
      }

      const [x, y] = calculateWinnerPosition(roundIndex, parentMatch0.y, parentMatch1.y);
      return { match, x, y };
    }));
  }

  // flatten the winnerMatches array
  const flattenedWinnerMatches = winnerMatches.flat();

  console.log('about to render bracket ', bracket);

  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-row gap-4 h-full max-h-[92%]'>

      <div className='bg-gray-400 flex flex-col p-2 rounded-md'>
        <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
      </div>

      {/* <Bracket display */}
      <div className='bg-gray-400 rounded-md flex flex-col gap-4 h-full w-full relative overflow-auto'>

        {/* Y-level guide lines */}
        {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900].map((y, idx) => (
          <div
            key={idx}
            className="absolute left-0 w-full border-t border-dashed border-white text-xs text-white"
            style={{ top: y }}
          >
            Y: {y}
          </div>
        ))}

        {flattenedWinnerMatches.map(element => {
          let { match, x, y } = element as { match: Match, x: number, y: number };
          console.log('about to render MATCHVIEW with x: ', x, ' and y: ', y);
          return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} />
        })}

      </div>
    </div>
  )
}