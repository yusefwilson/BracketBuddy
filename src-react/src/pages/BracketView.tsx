import { useContext, useEffect, useRef, useState } from 'react';
import { HiChevronLeft as ChevronLeftIcon, HiChevronRight as ChevronRightIcon, HiExclamationTriangle as ExclamationTriangleIcon } from 'react-icons/hi2';

import { calculateAllMatchPositions } from '../../../src-shared/utils';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';
import { isBracketStarted } from '../../../src-shared/bracketHelpers';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import FinalPlacings from '../components/FinalPlacings';
import BracketHotSwapBar from '../components/BracketHotSwapBar';
import BracketResetWarningModal from '../components/BracketResetWarningModal';
import { MatchStatus } from '@shared/types';

export default function BracketView() {
  const state = useContext(CURRENT_STATE);
  const { bracketId, tournament, setTournament = () => { }, setBracketId = () => { } } = state || {};
  const { showError, ErrorToastContainer } = useErrorToast();
  const [finalRematchJustSpawned, setFinalRematchJustSpawned] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [placingsOpen, setPlacingsOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => { }
  });

  useEffect(() => {
    if (finalRematchJustSpawned) {
      containerRef.current?.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [finalRematchJustSpawned]);

  if (!tournament || !bracketId) {
    return (
      <div className='h-full flex items-center justify-center text-white'>
        Loading bracket...
      </div>
    );
  }

  const bracket = tournament.brackets.find(b => b.id === bracketId);
  if (!bracket) {
    return (
      <div className='h-full flex items-center justify-center text-white'>
        Bracket not found
      </div>
    );
  }

  const updateMatch = async (matchId: string, status: MatchStatus): Promise<void> => {
    const [newTournament, error] = await safeApiCall(
      window.electron.enterResult({
        tournamentId: bracket.tournamentId,
        bracketId: bracket.id,
        matchId: matchId.toString(),
        status
      })
    );

    if (error) {
      showError(error);
      return;
    }

    if (newTournament) {
      const updatedBracket = newTournament.brackets.find(b => b.id === bracketId);
      const finalRematchInExistenceAfter = updatedBracket?.finalRematchNeeded || false;
      setFinalRematchJustSpawned(!bracket.finalRematchNeeded && finalRematchInExistenceAfter);
      setTournament(newTournament);
    }
  };

  const { winnerMatches, loserMatches, final, finalRematch, WINNERS_BOTTOM } = calculateAllMatchPositions(bracket);

  return (
    <>
      <ErrorToastContainer />
      <BracketResetWarningModal
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal({ ...warningModal, isOpen: false })}
        onConfirm={warningModal.onConfirm}
        message={warningModal.message}
      />
      <div className='flex flex-col h-full gap-4 p-8 bg-slate-800 shadow-inner'>

      {/* Left Toggle Button */}
      <button
        onClick={() => setControlsOpen(!controlsOpen)}
        className='absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition z-10'
        title={controlsOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {controlsOpen ? <ChevronLeftIcon className='h-4 w-4' strokeWidth={4} /> : <ChevronRightIcon className='h-4 w-4' strokeWidth={4} />}
      </button>

      {/* Right Toggle Button */}
      <button
        onClick={() => setPlacingsOpen(!placingsOpen)}
        className='absolute right-4 top-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition z-10'
        title={placingsOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {placingsOpen ? <ChevronRightIcon className='h-4 w-4' strokeWidth={4} /> : <ChevronLeftIcon className='h-4 w-4' strokeWidth={4} />}
      </button>

      {/* Top: Controls + Bracket Display */}
      <div className='flex flex-1 gap-6 relative overflow-hidden'>

        {/* Controls Panel */}
        <div
          className={`flex flex-col bg-slate-700 rounded-lg p-4 shadow-md gap-4 items-center transition-all
            ${controlsOpen ? 'min-w-[300px]' : 'w-0 opacity-0 p-0 overflow-hidden'}`}
        >
          <p className='text-lg font-bold'>
            {bracket.gender + ' | ' + bracket.hand + ' | ' + bracket.experienceLevel + ' | ' + bracket.weightLimit}
          </p>

          <div className='flex-1 w-full min-h-0'>
            <CompetitorInput
              competitors={bracket.competitorNames ?? []}
              bracketStarted={isBracketStarted(bracket)}
              addCompetitor={async (name) => {
                console.log('about to add competitor to bracket: ', name);
                const [newTournament, error] = await safeApiCall(
                  window.electron.addCompetitorToBracket({
                    tournamentId: bracket.tournamentId,
                    bracketId: bracket.id,
                    competitorName: name
                  })
                );

                console.log('got response from addCompetitorToBracket:', newTournament, error);

                if (error) {
                  showError(error);
                  return;
                }

                if (newTournament) {
                  setTournament(newTournament);
                }
              }}
              removeCompetitor={async (name) => {
                const [newTournament, error] = await safeApiCall(
                  window.electron.removeCompetitorFromBracket({
                    tournamentId: bracket.tournamentId,
                    bracketId: bracket.id,
                    competitorName: name
                  })
                );

                if (error) {
                  showError(error);
                  return;
                }

                if (newTournament) {
                  setTournament(newTournament);
                }
              }}
              randomizeCompetitors={async () => {
                const [newTournament, error] = await safeApiCall(
                  window.electron.randomizeCompetitors({
                    tournamentId: bracket.tournamentId,
                    bracketId: bracket.id
                  })
                );

                if (error) {
                  showError(error);
                  return;
                }

                if (newTournament) {
                  setTournament(newTournament);
                }
              }}
              onShowWarning={(message, onConfirm) => {
                setWarningModal({ isOpen: true, message, onConfirm });
              }}
            />
          </div>

          {/* Legend/Key */}
          <div className='w-full bg-slate-800 rounded-lg p-3 shadow-inner'>
            <h3 className='text-white text-sm font-semibold mb-2'>Key</h3>
            <div className='flex items-center gap-2 text-gray-300 text-xs'>
              <ExclamationTriangleIcon className='h-4 w-4 text-red-500' />
              <span>Dropout/Injury/No-show</span>
            </div>
          </div>
        </div>

        {/* Bracket Display */}
        <div className='bg-slate-700 rounded-lg p-4 shadow-md relative overflow-auto flex-1' ref={containerRef}>
          {bracket.competitorNames && bracket.competitorNames.length < 2 ? (
            <div className='text-white text-center font-semibold text-lg py-12'>
              Not enough competitors yet.
              <br />
              Add at least two to begin the bracket.
            </div>
          ) : (
            <>
              {/* Winners Bracket Label */}
              <div className='absolute top-0 left-0 text-white font-bold text-lg bg-slate-600 px-3 py-1 rounded'>
                Winners Bracket
              </div>

              {/* Winners Bracket Matches */}
              {winnerMatches?.map(({ match, x, y }) => (
                <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket.currentMatchNumber} />
              ))}

              {/* Dividing Line */}
              {WINNERS_BOTTOM > 0 && (
                <div
                  className='absolute left-0 right-0 border-t-2 border-slate-400'
                  style={{ top: `${WINNERS_BOTTOM}px` }}
                />
              )}

              {/* Losers Bracket Label */}
              {WINNERS_BOTTOM > 0 && (
                <div
                  className='absolute left-0 text-white font-bold text-lg bg-slate-600 px-3 py-1 rounded'
                  style={{ top: `${WINNERS_BOTTOM + 2}px` }}
                >
                  Losers Bracket
                </div>
              )}

              {/* Losers Bracket Matches */}
              {loserMatches?.map(({ match, x, y }) => (
                <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket.currentMatchNumber} />
              ))}

              {/* Finals */}
              {final.match && (
                <MatchView match={final.match} updateMatch={updateMatch} x={final.x} y={final.y} currentMatchId={bracket.currentMatchNumber} />
              )}
              {finalRematch.match && bracket.finalRematchNeeded && (
                <MatchView match={finalRematch.match} updateMatch={updateMatch} x={finalRematch.x} y={finalRematch.y} currentMatchId={bracket.currentMatchNumber} />
              )}
            </>
          )}
        </div>

        {/* Placings Panel */}
        <div
          className={`flex flex-col bg-slate-700 rounded-lg p-4 shadow-md gap-4 items-center transition-all
            ${placingsOpen ? 'overflow-y-auto' : 'w-0 opacity-0 p-0 overflow-hidden'}`}
        >
          <p className='text-lg font-bold'>Final Placings</p>
          <FinalPlacings first={bracket.firstPlace} second={bracket.secondPlace} third={bracket.thirdPlace} />
        </div>
      </div>

      {/* Bottom Hot-Swap Bar */}
      {tournament && (
        <BracketHotSwapBar
          tournament={tournament}
          currentBracketId={bracketId}
          onBracketChange={setBracketId}
        />
      )}
    </div>
    </>
  );
}
