import { useContext } from 'react';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';

import { BracketDTO } from '../../../src-shared/BracketDTO';

import {
  MatchAndPosition,
  isPowerOfTwo, calculateInitialRoundsMatchPositions, calculateMatchPositionsFromParentAverages, calculateMatchPositionsFromParentStaggered,
  WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET, LOSER_HORIZONTAL_OFFSET, LOSER_VERTICAL_OFFSET, HORIZONTAL_GAP,
} from '../../../src-shared/utils';
import FinalPlacings from '../components/FinalPlacings';

export default function BracketView() {
  // state
  const state = useContext(CURRENT_STATE);
  const { bracketIndex, tournament, setTournament = () => { } } = state || {};

  if (!tournament || bracketIndex === null || bracketIndex === undefined) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading bracket...
      </div>
    );
  }

  const bracket = tournament.brackets[bracketIndex];
  if (!bracket) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Bracket not found
      </div>
    );
  }

  console.log('bracket: ', bracket);
  console.log('bracket.competitorNames: ', bracket.competitorNames);

  if (!bracket) {
    throw new Error('Bracket not found');
  }

  // update the winner of a match (this calls a recursive method on the Match class which updates all dependent matches)
  const updateMatch = async (matchId: string, winner: number): Promise<void> => {

    const newTournament = await window.electron.enterResult(bracket.tournamentId, bracket.id, matchId.toString(), winner);

    // hacky way to trigger refresh, and also to trigger tournament save in App useEffect
    setTournament(newTournament);
  };

  let winnerMatches: MatchAndPosition[] = [], loserMatches: MatchAndPosition[] = [], WINNERS_BOTTOM = 0, LAST_WINNER_Y = 0, WINNERS_RIGHTMOST = 0;

  if (bracket.competitorNames && bracket.competitorNames.length >= 2) {
    // {match, x, y}[][]
    const winnerRounds = calculateInitialRoundsMatchPositions(bracket as BracketDTO, 'winner', WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
    const initialWinnerMatches = winnerRounds.slice();

    // iteratively calculate the positions of the rest of the matches by referencing and taking averages of the heights of their parents
    for (
      let roundIndex = isPowerOfTwo(bracket.competitorNames.length) ? 1 : 2;
      roundIndex < (bracket.winnersBracket.length || 0);
      roundIndex++
    ) {
      const previousRound = winnerRounds[roundIndex - 1];

      if (!previousRound || previousRound.length === 0) {
        console.warn(`No matches found for round index ${roundIndex - 1}`);
        continue;
      }
      const nextRound = calculateMatchPositionsFromParentAverages(previousRound, bracket.winnersBracket[roundIndex] || [], roundIndex);

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
      bracket as BracketDTO,
      'loser',
      LOSER_HORIZONTAL_OFFSET,
      WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET
    );
    const initialLoserRounds = loserRounds.slice();

    // figure out whether match numbers stay constant or halve on even rounds based on index-1 match numbers
    let halving: boolean;
    if (initialWinnerMatches[initialWinnerMatches.length - 1]?.length === initialLoserRounds[initialLoserRounds.length - 1]?.length || isPowerOfTwo(bracket.competitorNames.length)) {
      halving = true;
    } else {
      halving = false;
    }

    for (let roundIndex = loserRounds.length === 1 ? 1 : 2; roundIndex < (bracket.losersBracket.length || 0); roundIndex++) {
      const previousRoundMatches = loserRounds[roundIndex - 1];
      // if previous round somehow didn't exist or is empty
      if (!previousRoundMatches || previousRoundMatches.length === 0) continue;

      const nextRound = halving
        ? calculateMatchPositionsFromParentAverages(previousRoundMatches, bracket.losersBracket[roundIndex] || [], roundIndex)
        : calculateMatchPositionsFromParentStaggered(previousRoundMatches, bracket.losersBracket[roundIndex] || [], roundIndex);

      loserRounds.push(nextRound);
      halving = !halving;
    }

    loserMatches = loserRounds.flat();
  }

  const final = {
    match: bracket.final,
    x: WINNERS_RIGHTMOST + HORIZONTAL_GAP,
    y: LAST_WINNER_Y,
  };

  const finalRematch = {
    match: bracket.finalRematch,
    x: WINNERS_RIGHTMOST + 2 * HORIZONTAL_GAP,
    y: LAST_WINNER_Y,
  };

  //import YGuideLines from '../components/YGuideLines';

  //console.log('current match id: ', bracket.getLowestIdUnfilledMatch());
  return (
    <div className='h-full flex gap-6 p-4 bg-slate-800 rounded-lg shadow-inner'>

      {/* Controls Panel */}
      <div className='bg-slate-700 rounded-lg p-4 shadow-md flex flex-col gap-4'>

        {/* Bracket Details (Gender, Hand, Experience Level, etc.) */}
        <p className='self-center text-lg font-bold'>{bracket.gender + ' | ' + bracket.hand + ' | ' + bracket.experienceLevel + ' | ' + bracket.weightLimit}</p>

        <h2 className='text-white text-lg font-semibold text-center'>Competitors</h2>
        <div className='h-[45%]'>
          {<CompetitorInput
            competitors={bracket.competitorNames ?? []}
            addCompetitor={async (name) => {
              const newTournament = await window.electron.addCompetitorToBracket(bracket.tournamentId, bracket.id, name);
              setTournament(newTournament);
            }}
            removeCompetitor={async (name) => {
              const newTournament = await window.electron.removeCompetitorFromBracket(bracket.tournamentId, bracket.id, name);
              setTournament(newTournament);
            }}
          />}
        </div>
        {/* Final Placings */}
        {
          /*<FinalPlacings first={bracket.getFirstPlace()} second={bracket.getSecondPlace()} third={bracket.getThirdPlace()} />*/
        }

        {/* Start Bracket Button  */}
        <button onClick={async () => {
          const newTournament = await window.electron.startBracket(bracket.tournamentId, bracket.id);
          setTournament(newTournament);
        }} className='bg-slate-800 text-white rounded-lg p-4 shadow-md'>Start Bracket</button>

      </div>

      {/* Bracket Display */}
      <div className='flex-1 bg-slate-700 rounded-lg p-4 shadow-md relative overflow-auto'>
        {bracket.competitorNames && bracket.competitorNames.length < 2 ? (
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
              <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket.currentMatchNumber} />
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
              <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket.currentMatchNumber} />
            ))}

            {/* Final and Rematch */}
            {final.match && (
              <MatchView match={final.match} updateMatch={updateMatch} x={final.x} y={final.y} currentMatchId={bracket.currentMatchNumber} />

            )}
            {finalRematch.match &&
              bracket.finalRematchNeeded &&
              (
                <MatchView match={finalRematch.match} updateMatch={updateMatch} x={finalRematch.x} y={finalRematch.y} currentMatchId={bracket.currentMatchNumber} />
              )}
          </>
        )}
      </div>
    </div>
  );
}