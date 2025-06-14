import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';
import Match from '../lib/Match';
import { useContext, useEffect, useState } from 'react';
import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import YGuideLines from '../components/YGuideLines';

const HORIZONTAL_GAP = 200;
const INITIAL_VERTICAL_GAP = 100;
const EXTRA_VERTICAL_OFFSET = 25;

const WINNER_HORIZONTAL_OFFSET = 25;
const WINNER_VERTICAL_OFFSET = 25;
const LOSER_HORIZONTAL_OFFSET = 25;
const LOSER_VERTICAL_OFFSET = 25;

const isPowerOfTwo = (n: number) => { return n > 0 && (n & (n - 1)) === 0; };
type MatchAndPosition = { match: Match, x: number, y: number };

// given information about a round, calculate where on the screen the match should be placed.
const calculateMatchPosition = (roundIndex: number, matchIndex: number, staggered: boolean, horizontal_offset: number, vertical_offset: number): number[] => {

  let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
  let y = matchIndex * INITIAL_VERTICAL_GAP + vertical_offset + (staggered ? EXTRA_VERTICAL_OFFSET : 0);
  return [x, y];
}

const calculateMatchPositionFromParents = (roundIndex: number, parentMatch0Height: number, parentMatch1Height: number, horizontal_offset: number): number[] => {
  let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
  let y = (parentMatch0Height + parentMatch1Height) / 2;
  return [x, y];
}

const calculateMatchPositionFromSingleParent = (roundIndex: number, staggered: boolean, parentMatchHeight: number, horizontal_offset: number): number[] => {
  let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
  let y = parentMatchHeight + (staggered ? EXTRA_VERTICAL_OFFSET : 0);
  return [x, y];
}

const calculateInitialRoundsMatchPositions = (bracket: Bracket, side: 'winner' | 'loser', horizontal_offset: number, vertical_offset: number): (MatchAndPosition[] | undefined)[] => {
  const matches = [];
  let numberOfCompetitors, subBracket;

  console.log('in calculateInitialRoundsMatchPositions with bracket: ', bracket);
  console.log('calculating initial rounds match positions for side: ', side);
  console.log('winnersBracket: ', bracket?.winnersBracket);
  console.log('losersBracket: ', bracket?.losersBracket);

  subBracket = side === 'winner' ? bracket?.winnersBracket : bracket?.losersBracket;

  if (!subBracket || subBracket.length === 0) {
    console.warn(`No subBracket found for side: ${side}`);
    return [];
  }

  numberOfCompetitors = side === 'winner' ? (bracket?.competitorNames.length || 0) : ((bracket?.winnersBracket[0].matches.length || 0) + (bracket?.winnersBracket[1].matches.length || 0));


  // calculate initial rounds positions (if power of 2, only one round, if not power of 2, two rounds)
  if (!isPowerOfTwo(numberOfCompetitors)) {
    matches.push(subBracket[0].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(0, index, true, horizontal_offset, vertical_offset);
      return { match, x, y };
    }));
    matches.push(subBracket[1].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(1, index, false, horizontal_offset, vertical_offset);
      return { match, x, y };
    }));
  }
  else {
    matches.push(subBracket[0].matches.map((match, index) => {
      let [x, y] = calculateMatchPosition(0, index, false, horizontal_offset, vertical_offset);
      return { match, x, y };
    }));
  }

  return matches;
}

const calculateMatchPositionsFromParentAverages = (previousRoundMatches: MatchAndPosition[], matches: Match[], roundIndex: number) => {
  return matches.map((match, index) => {

    // edge case when there is one parent
    if (previousRoundMatches.length === 1) {
      const parentMatch = previousRoundMatches[0];
      const [x, y] = calculateMatchPositionFromParents(roundIndex, parentMatch.y, parentMatch.y, WINNER_HORIZONTAL_OFFSET);
      return { match, x, y };
    }

    // find parent matches using winnerMatches last round
    const parentMatch0 = previousRoundMatches[index * 2];
    const parentMatch1 = previousRoundMatches[index * 2 + 1];

    if (!parentMatch0 || !parentMatch1) {
      console.warn(`Parent matches not found for round index ${roundIndex} and match index ${index}`);
      return { match, x: 0, y: 0 }; // fallback
    }

    const [x, y] = calculateMatchPositionFromParents(roundIndex, parentMatch0.y, parentMatch1.y, WINNER_HORIZONTAL_OFFSET);
    return { match, x, y };
  });
}

const calculateMatchPositionsFromParentStaggered = (previousRoundMatches: MatchAndPosition[], matches: Match[], roundIndex: number) => {
  return matches.map((match, index) => {
    const correspondingMatch = previousRoundMatches[index];
    if (!correspondingMatch) {
      console.warn(`Corresponding match not found for round index ${roundIndex} and match index ${index} in previous round array ${previousRoundMatches}`);
      return { match, x: 0, y: 0 }; // fallback
    }

    const [x, y] = calculateMatchPositionFromSingleParent(roundIndex, true, correspondingMatch.y, LOSER_HORIZONTAL_OFFSET);
    return { match, x, y };
  });
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


  let winnerMatches, loserMatches, WINNERS_BOTTOM;

  if (competitorNames.length >= 2) {
    // {match, x, y}[][]
    const winnerRounds = calculateInitialRoundsMatchPositions(bracket as Bracket, 'winner', WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
    const initialWinnerMatches = winnerRounds.slice();

    // iteratively calculate the positions of the rest of the matches by referencing and taking averages of the heights of their parents
    for (let roundIndex = isPowerOfTwo(competitorNames.length) ? 1 : 2; roundIndex < (bracket?.winnersBracket.length || 0); roundIndex++) {
      const previousRound = winnerRounds[roundIndex - 1];

      if (!previousRound || previousRound.length === 0) {
        console.warn(`No matches found for round index ${roundIndex - 1}`);
        continue;
      }

      let nextRound = calculateMatchPositionsFromParentAverages(previousRound, bracket?.winnersBracket[roundIndex].matches || [], roundIndex);

      winnerRounds.push(nextRound);
    }

    // flatten the winnerMatches array
    winnerMatches = winnerRounds.flat();

    // find max y value (lowest point) to use as reference point for losers bracket
    WINNERS_BOTTOM = Math.max(...winnerMatches.map(m => m?.y || 0)) + 100;

    // {match, x, y}[][]
    const loserRounds = calculateInitialRoundsMatchPositions(bracket as Bracket, 'loser', LOSER_HORIZONTAL_OFFSET, WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET);
    const initialLoserRounds = loserRounds.slice();

    // figure out whether match numbers stay constant or halve on even rounds based on index-1 match numbers
    let halving: boolean;



    if (initialWinnerMatches[initialWinnerMatches.length - 1]?.length === initialLoserRounds[initialLoserRounds.length - 1]?.length || isPowerOfTwo(competitorNames.length)) {
      halving = true; // even rounds halve, odd rounds stay constant
    }
    else {
      halving = false; // even rounds stay constant, odd rounds halve
    }

    for (let roundIndex = loserRounds.length === 1 ? 1 : 2; roundIndex < (bracket?.losersBracket.length || 0); roundIndex++) {
      const previousRoundMatches = loserRounds[roundIndex - 1];

      // if previous round somehow didn't exist or is empty
      if (!previousRoundMatches || previousRoundMatches.length === 0) {
        console.warn(`No matches found for round index ${roundIndex - 1}`);
        continue;
      }

      let nextRound;

      console.log('about to calculate round index: ', roundIndex, ' with halving: ', halving);
      console.log('previousRoundMatches: ', previousRoundMatches, ' and matches: ', bracket?.losersBracket[roundIndex].matches);

      if (halving) {
        nextRound = calculateMatchPositionsFromParentAverages(previousRoundMatches, bracket?.losersBracket[roundIndex].matches || [], roundIndex);
      }

      else {
        nextRound = calculateMatchPositionsFromParentStaggered(previousRoundMatches, bracket?.losersBracket[roundIndex].matches || [], roundIndex);
      }

      loserRounds.push(nextRound);

      halving = !halving; // toggle halving for next round
    }

    loserMatches = loserRounds.flat();
  }

  console.log('about to render bracket ', bracket);
  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-row gap-4 h-full max-h-[92%]'>

      <div className='bg-gray-400 flex flex-col p-2 rounded-md'>
        <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
      </div>

      {/* <Bracket display */}
      <div className='bg-gray-400 rounded-md flex flex-col gap-4 h-full w-full relative overflow-auto'>

        {
          competitorNames.length < 2 ?

            <div className='text-center text-white text-lg font-bold p-4'>
              Not enough competitors added yet. Please add competitors to view the bracket.
            </div>

            :

            <div>

              {/* Y-level guide lines */}
              <YGuideLines yLevels={[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900]} />

              {winnerMatches?.map(element => {
                let { match, x, y } = element as MatchAndPosition;
                //console.log('about to render WINNER MATCHVIEW with x: ', x, ' and y: ', y);
                return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} />
              })}

              {/* Winner/loser line separator */}
              <div
                className='absolute left-0 w-full border-t border-red-400 text-xs text-white'
                style={{ top: WINNERS_BOTTOM }}
              />

              {loserMatches?.map(element => {
                //console.log('about to render ELEMENT: ', element)
                if (!element) { return null; }
                let { match, x, y } = element as MatchAndPosition;
                //console.log('about to render LOSER MATCHVIEW with x: ', x, ' and y: ', y);
                return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} />
              })}

            </div>

        }

      </div>
    </div>
  )
}