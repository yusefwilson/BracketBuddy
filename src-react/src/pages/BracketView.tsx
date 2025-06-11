import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';
import { useContext, useEffect, useState } from 'react';
import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import Match from '../lib/Match';

const HORIZONTAL_GAP = 200;
const INITIAL_VERTICAL_GAP = 100;
const EXTRA_VERTICAL_OFFSET = 25;

const WINNER_HORIZONTAL_OFFSET = 25;
const WINNER_VERTICAL_OFFSET = 25;
const LOSER_HORIZONTAL_OFFSET = 25;
const LOSER_VERTICAL_OFFSET = 25;

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; }

// given information about a round, calculate where on the screen the match should be placed.
const calculateMatchPosition = (roundIndex: number, matchIndex: number, staggered: boolean, horizontal_offset: number, vertical_offset: number): number[] => {

  let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
  let y = matchIndex * INITIAL_VERTICAL_GAP + vertical_offset + (staggered ? EXTRA_VERTICAL_OFFSET : 0);
  return [x, y];
}

const calculateMatchPositionFromParentHeights = (roundIndex: number, parentMatch0Height: number, parentMatch1Height: number, horizontal_offset: number): number[] => {
  let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
  let y = (parentMatch0Height + parentMatch1Height) / 2;
  return [x, y];
}

const calculateMatchPositionFromSingleParentHeight = (roundIndex: number, staggered: boolean, parentMatchHeight: number, horizontal_offset: number): number[] => {
  let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
  let y = parentMatchHeight + (staggered ? EXTRA_VERTICAL_OFFSET : 0);
  return [x, y];
}

const calculateInitialRoundsMatchPositions = (bracket: Bracket, side: 'winner' | 'loser'): ({ match: Match, x: number, y: number }[] | undefined)[] => {
  const matches = [];
  let numberOfCompetitors, subBracket;

  if (side === 'winner') {
    numberOfCompetitors = bracket?.competitorNames.length || 0;
    subBracket = bracket?.winnersBracket;
  }

  else {
    numberOfCompetitors = ((bracket?.winnersBracket[0].matches.length || 0) + (bracket?.winnersBracket[1].matches.length || 0)) || -1;
    subBracket = bracket?.losersBracket;
  }

  // calculate initial rounds positions (if power of 2, only one round, if not power of 2, two rounds)
  if (!isPowerOfTwo(numberOfCompetitors)) {
    matches.push(subBracket[0].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(0, index, true, WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
      return { match, x, y };
    }));
    matches.push(subBracket[1].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(1, index, false, WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
      return { match, x, y };
    }));
  }
  else {
    matches.push(subBracket[0].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(0, index, false, WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
      return { match, x, y };
    }));
  }

  return matches;
}

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

  // {match, x, y}[][]
  const winnerMatches = calculateInitialRoundsMatchPositions(bracket as Bracket, 'winner');
  const initialWinnerMatches = winnerMatches.slice();

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
        const [x, y] = calculateMatchPositionFromParentHeights(roundIndex, parentMatch.y, parentMatch.y, WINNER_HORIZONTAL_OFFSET);
        return { match, x, y };
      }

      // find parent matches using winnerMatches last round
      const parentMatch0 = previousRoundMatches[index * 2];
      const parentMatch1 = previousRoundMatches[index * 2 + 1];

      if (!parentMatch0 || !parentMatch1) {
        console.warn(`Parent matches not found for round index ${roundIndex} and match index ${index}`);
        return { match, x: 0, y: 0 }; // fallback
      }

      const [x, y] = calculateMatchPositionFromParentHeights(roundIndex, parentMatch0.y, parentMatch1.y, WINNER_HORIZONTAL_OFFSET);
      return { match, x, y };
    }));
  }

  // flatten the winnerMatches array
  const flattenedWinnerMatches = winnerMatches.flat();

  // find max y value (lowest point) to use as reference point for losers bracket
  const WINNERS_BOTTOM = Math.max(...flattenedWinnerMatches.map(m => m?.y || 0)) + 100;

  // {match, x, y}[][]
  const loserMatches = []

  //TODO: Refactor by using helper function from above

  // calculate losers bracket matches
  if (!isPowerOfTwo(((bracket?.winnersBracket[0].matches.length || 0) + (bracket?.winnersBracket[1].matches.length || 0)) || -1)) {
    loserMatches.push(bracket?.losersBracket[0].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(0, index, true, LOSER_HORIZONTAL_OFFSET, WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET);
      return { match, x, y };
    }));
    loserMatches.push(bracket?.losersBracket[1].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(1, index, false, LOSER_HORIZONTAL_OFFSET, WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET);
      return { match, x, y };
    }));
  }
  else {
    loserMatches.push(bracket?.losersBracket[0].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(0, index, false, LOSER_HORIZONTAL_OFFSET, WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET);
      return { match, x, y };
    }));
  }

  const initialLoserMatches = loserMatches.slice();

  console.log('loserMatches after initial rounds: ', loserMatches)

  // figure out whether match numbers stay constant or halve on even rounds based on index-1 match numbers
  let halving: boolean;

  console.log('last element of winnerMatches: ', winnerMatches[-1]);
  console.log('last element of loserMatches: ', loserMatches[-1]);

  if (initialWinnerMatches[initialWinnerMatches.length - 1]?.length === initialLoserMatches[initialLoserMatches.length - 1]?.length) {
    halving = true; // even rounds halve, odd rounds stay constant
  }
  else {
    halving = false; // even rounds stay constant, odd rounds halve
  }
  console.log('initialWinnerMatches: ', initialWinnerMatches);
  console.log('initialLoserMatches: ', initialLoserMatches);
  console.log('length of last initial winner round: ', initialWinnerMatches[initialWinnerMatches.length - 1]?.length);
  console.log('length of last loser round: ', initialLoserMatches[initialLoserMatches.length - 1]?.length);
  console.log('HALVING: ', halving);;

  for (let roundIndex = loserMatches.length === 1 ? 1 : 2; roundIndex < (bracket?.losersBracket.length || 0); roundIndex++) {
    const previousRoundMatches = loserMatches[roundIndex - 1];

    // if previous round somehow didn't exist or is empty
    if (!previousRoundMatches || previousRoundMatches.length === 0) {
      console.warn(`No matches found for round index ${roundIndex - 1}`);
      continue;
    }

    loserMatches.push(bracket?.losersBracket[roundIndex].matches.map((match, index) => {

      // edge case when there is one parent
      if (previousRoundMatches.length === 1) {
        const parentMatch = previousRoundMatches[0];
        const [x, y] = calculateMatchPositionFromParentHeights(roundIndex, parentMatch?.y || 0, parentMatch?.y || 0, WINNER_HORIZONTAL_OFFSET);
        return { match, x, y };
      }

      // halve matches
      if (halving) {
        // find parent matches using winnerMatches last round
        const parentMatch0 = previousRoundMatches[index * 2];
        const parentMatch1 = previousRoundMatches[index * 2 + 1];

        if (!parentMatch0 || !parentMatch1) {
          console.warn(`Parent matches not found for round index ${roundIndex} and match index ${index}`);
          return { match, x: 0, y: 0 }; // fallback
        }

        const [x, y] = calculateMatchPositionFromParentHeights(roundIndex, parentMatch0.y, parentMatch1.y, WINNER_HORIZONTAL_OFFSET);
        return { match, x, y };
      }

      // stagger matches below corresponding previous loser round matches
      else {
        const correspondingMatch = previousRoundMatches[index];
        if (!correspondingMatch) {
          console.warn(`Corresponding match not found for round index ${roundIndex} and match index ${index} in previous round array ${previousRoundMatches}`);
          return { match, x: 0, y: 0 }; // fallback
        }

        const [x, y] = calculateMatchPositionFromSingleParentHeight(roundIndex, true, correspondingMatch.y, LOSER_HORIZONTAL_OFFSET);
        return { match, x, y };
      }

    }));
    halving = !halving; // toggle halving for next round
  }

  const flattenedLoserMatches = loserMatches.flat();

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
          console.log('about to render WINNER MATCHVIEW with x: ', x, ' and y: ', y);
          return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} />
        })}

        {/* Winner/loser line separator */}
        <div
          className="absolute left-0 w-full border-t border-red-400 text-xs text-white"
          style={{ top: WINNERS_BOTTOM }}
        />

        {flattenedLoserMatches.map(element => {
          console.log('about ot render ELEMENT: ', element)
          if (!element) { return null; }
          let { match, x, y } = element as { match: Match, x: number, y: number };
          console.log('about to render LOSER MATCHVIEW with x: ', x, ' and y: ', y);
          return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} />
        })}

      </div>
    </div>
  )
}