import { useContext, useState } from 'react';
import { CURRENT_STATE } from '../components/App';

import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import YGuideLines from '../components/YGuideLines';

import Bracket from '../lib/Bracket';

import {
  MatchAndPosition,
  isPowerOfTwo, calculateInitialRoundsMatchPositions, calculateMatchPositionsFromParentAverages, calculateMatchPositionsFromParentStaggered,
  WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET, LOSER_HORIZONTAL_OFFSET, LOSER_VERTICAL_OFFSET, HORIZONTAL_GAP,
} from '../lib/utils';
import FinalPlacings from '../components/FinalPlacings';

export default function BracketView() {
  // state
  const state = useContext(CURRENT_STATE);
  const { bracket } = state || {};

  console.log('bracket: ', bracket);

  // local state. DO NOT try to load bracket info into here, since this can run before bracket is loaded from context.
  const [refreshTick, setRefreshTick] = useState(0);

  console.log('bracket.competitorNames: ', bracket?.competitorNames);

  // update the winner of a match (this calls a recursive method on the Match class which updates all dependent matches)
  const updateMatch = async (matchId: number, winner: number): Promise<void> => {
    // find winner
    const matchToBeUpdated = bracket?.findMatchById(matchId);

    // manually update finals since they're weird. if the match is the finals, check the winner to see how you should populate the final rematch
    if (matchId === bracket?.final?.id) {

      // update winner
      matchToBeUpdated?.updateWinner(winner);
    }

    // let recursive function handle normal matchess
    else {
      matchToBeUpdated?.updateWinnerRecursively(winner);
    }

    console.log('updated bracket with match result should be: ', bracket);
    console.log('bracket.tournament, which should have the updated match results, is: ', bracket?.tournament);

    // save changes to tournament
    await bracket?.tournament?.save();

    // hacky way to trigger refresh, and also to trigger tournament save in App useEffect
    setRefreshTick(refreshTick + 1);
  };

  let winnerMatches: MatchAndPosition[] = [], loserMatches: MatchAndPosition[] = [], WINNERS_BOTTOM = 0, LAST_WINNER_Y = 0, WINNERS_RIGHTMOST = 0;

  if (bracket?.competitorNames && bracket?.competitorNames.length >= 2) {
    // {match, x, y}[][]
    const winnerRounds = calculateInitialRoundsMatchPositions(bracket as Bracket, 'winner', WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
    const initialWinnerMatches = winnerRounds.slice();

    // iteratively calculate the positions of the rest of the matches by referencing and taking averages of the heights of their parents
    for (
      let roundIndex = isPowerOfTwo(bracket?.competitorNames.length) ? 1 : 2;
      roundIndex < (bracket?.winnersBracket.length || 0);
      roundIndex++
    ) {
      const previousRound = winnerRounds[roundIndex - 1];

      if (!previousRound || previousRound.length === 0) {
        console.warn(`No matches found for round index ${roundIndex - 1}`);
        continue;
      }
      const nextRound = calculateMatchPositionsFromParentAverages(previousRound, bracket?.winnersBracket[roundIndex].matches || [], roundIndex);

      winnerRounds.push(nextRound);
    }

    // flatten the winnerMatches array
    winnerMatches = winnerRounds.flat();
    // find max y value (lowest point) to use as reference point for losers bracket
    // find max x value (rightmost point) to use as reference point for the finals matches
    WINNERS_BOTTOM = Math.max(...winnerMatches.map((m) => m?.y || 0)) + 100;
    WINNERS_RIGHTMOST = Math.max(...winnerMatches.map((m) => m?.x || 0));
    LAST_WINNER_Y = winnerMatches[winnerMatches.length - 1]?.y || 0;

    // **** RENDER LOSERS BRACKET ****
    // {match, x, y}[][]
    const loserRounds = calculateInitialRoundsMatchPositions(
      bracket as Bracket,
      'loser',
      LOSER_HORIZONTAL_OFFSET,
      WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET
    );
    const initialLoserRounds = loserRounds.slice();

    // figure out whether match numbers stay constant or halve on even rounds based on index-1 match numbers
    let halving: boolean;
    if (initialWinnerMatches[initialWinnerMatches.length - 1]?.length === initialLoserRounds[initialLoserRounds.length - 1]?.length || isPowerOfTwo(bracket?.competitorNames.length)) {
      halving = true;
    } else {
      halving = false;
    }

    for (let roundIndex = loserRounds.length === 1 ? 1 : 2; roundIndex < (bracket?.losersBracket.length || 0); roundIndex++) {
      const previousRoundMatches = loserRounds[roundIndex - 1];
      // if previous round somehow didn't exist or is empty
      if (!previousRoundMatches || previousRoundMatches.length === 0) continue;

      const nextRound = halving
        ? calculateMatchPositionsFromParentAverages(previousRoundMatches, bracket?.losersBracket[roundIndex].matches || [], roundIndex)
        : calculateMatchPositionsFromParentStaggered(previousRoundMatches, bracket?.losersBracket[roundIndex].matches || [], roundIndex);

      loserRounds.push(nextRound);
      halving = !halving;
    }

    loserMatches = loserRounds.flat();
  }

  const final = {
    match: bracket?.final,
    x: WINNERS_RIGHTMOST + HORIZONTAL_GAP,
    y: LAST_WINNER_Y,
  };

  const finalRematch = {
    match: bracket?.finalRematch,
    x: WINNERS_RIGHTMOST + 2 * HORIZONTAL_GAP,
    y: LAST_WINNER_Y,
  };

  console.log('current match id: ', bracket?.getLowestIdUnfilledMatch());
  return (
    <div className='h-full flex gap-6 p-4 bg-slate-800 rounded-lg shadow-inner'>

      {/* Controls Panel */}
      <div className='bg-slate-700 rounded-lg p-4 shadow-md flex flex-col gap-4'>
        {/* Bracket Details (Gender, Hand, Experience Level, etc.) */}
        <p className='self-center text-lg font-bold'>{bracket?.gender + ' | ' + bracket?.hand + ' | ' + bracket?.experienceLevel + ' | ' + bracket?.weightLimit}</p>

        <h2 className='text-white text-lg font-semibold text-center'>Competitors</h2>
        <div className='h-[45%]'>
          <CompetitorInput
            competitors={bracket?.competitorNames ?? []}
            setCompetitors={(names) => {
              bracket?.setCompetitorNames(names);
              bracket?.tournament?.save();
              setRefreshTick((tick) => tick + 1);
            }}
          />
        </div>
        {/* Final Placings */}
        {
          <FinalPlacings first={bracket?.getFirstPlace()} second={bracket?.getSecondPlace()} third={bracket?.getThirdPlace()} />
        }

      </div>

      {/* Bracket Display */}
      <div className='flex-1 bg-slate-700 rounded-lg p-4 shadow-md relative overflow-auto'>
        {bracket?.competitorNames && bracket?.competitorNames.length < 2 ? (
          <div className='text-white text-center font-semibold text-lg py-12'>
            Not enough competitors yet.
            <br />
            Add at least two to begin the bracket.
          </div>
        ) : (
          <>
            {/* <YGuideLines
              yLevels={[
                50, 100, 150, 200, 250, 300, 350, 400, 450,
                500, 550, 600, 650, 700, 750, 800, 850, 900,
              ]}
            /> */}

            {/* Winner Matches */}
            {winnerMatches?.map(({ match, x, y }) => (
              <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket?.getLowestIdUnfilledMatch()} />
            ))}

            {/* Separators */}
            {/* <div
              className='absolute left-0 w-full border-t border-red-400'
              style={{ top: WINNERS_BOTTOM }}
            />
            <div
              className='absolute top-0 h-full border-l border-red-400'
              style={{ left: WINNERS_RIGHTMOST + 200 }}
            /> */}

            {/* Loser Matches */}
            {loserMatches?.map(({ match, x, y }) => (
              <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket?.getLowestIdUnfilledMatch()} />
            ))}

            {/* Final and Rematch */}
            {final.match && (
              <MatchView match={final.match} updateMatch={updateMatch} x={final.x} y={final.y} currentMatchId={bracket?.getLowestIdUnfilledMatch()} />

            )}
            {finalRematch.match &&
              bracket?.finalRematchNeeded() &&
              (
                <MatchView match={finalRematch.match} updateMatch={updateMatch} x={finalRematch.x} y={finalRematch.y} currentMatchId={bracket?.getLowestIdUnfilledMatch()} />
              )}
          </>
        )}
      </div>
    </div>
  );
}
