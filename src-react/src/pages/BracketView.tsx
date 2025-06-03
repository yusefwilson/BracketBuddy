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

  const HORIZONTAL_GAP = 300;
  const HORIZONTAL_OFFSET = 0;
  const VERTICAL_GAP = 150;
  const VERTICAL_OFFSET = 50;
  const EXTRA_VERTICAL_OFFSET = 25

  // given information about a round, calculate where on the screen the match should be placed.
  const calculateWinnerPosition = (roundIndex: number, matchIndex: number, roundType: RoundType,): number[] => {

    let x = roundIndex * HORIZONTAL_GAP + HORIZONTAL_OFFSET;
    let y = matchIndex * VERTICAL_GAP + VERTICAL_OFFSET + (roundType === 'initialWinner' ? EXTRA_VERTICAL_OFFSET : 0);
    return [x, y];
  }

  // [roundIndex, matchIndex, roundType, match][]
  const allWinnerMatches = [];

  for (let roundIndex = 0; roundIndex < (bracket?.winnersBracket.length || 0); roundIndex++) {
    for (let matchIndex = 0; matchIndex < (bracket?.winnersBracket[roundIndex].matches.length || 0); matchIndex++) {

      let roundType = 'winner' as RoundType;
      if (!isPowerOfTwo(competitorNames.length) && roundIndex === 0) { roundType = 'initialWinner'; } // common special case for non-power of two brackets
      console.log('calculated roundType to be: ', roundType);
      let match = bracket?.winnersBracket[roundIndex].matches[matchIndex];

      allWinnerMatches.push([roundIndex, matchIndex, roundType, match]);
    }
  }

  // layout pass
  useLayoutEffect(() => {
  });

  console.log('about to render bracket ', bracket);

  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-row gap-4 h-full'>

      <div className='bg-pink-500 flex flex-col p-2'>
        <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
      </div>

      {/* <Bracket display */}
      <div className='bg-blue-400 p-2 rounded-md flex flex-col gap-4 h-full w-full relative'>

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

        {allWinnerMatches.map(element => {
          let [x, y] = calculateWinnerPosition(element[0] as number, element[1] as number, element[2] as RoundType);
          console.log('about to render MATCHVIEW with x: ', x, ' and y: ', y);
          return <MatchView match={element[3] as Match} updateMatch={updateMatch} x={x} y={y} />
        })}

      </div>
    </div>
  )
}