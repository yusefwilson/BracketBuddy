import { useContext, useRef, useState } from 'react';
import { HiChevronLeft as ChevronLeftIcon, HiChevronRight as ChevronRightIcon } from 'react-icons/hi2';

import { calculateRoundRobinPositions } from '../../../src-shared/utils';
import { isRoundRobinBracketStarted } from '../../../src-shared/bracketHelpers';
import { RoundRobinBracketDTO } from '../../../src-shared/RoundRobinBracketDTO';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import RoundRobinMatchView from '../components/RoundRobinMatchView';
import FinalPlacings from '../components/FinalPlacings';
import BracketHotSwapBar from '../components/BracketHotSwapBar';
import BracketResetWarningModal from '../components/BracketResetWarningModal';

export default function RoundRobinBracketView({ bracket }: { bracket: RoundRobinBracketDTO }) {
  const state = useContext(CURRENT_STATE);
  const { tournament, setTournament = () => { }, setBracketId = () => { } } = state || {};
  const { showError, ErrorToastContainer } = useErrorToast();
  const [controlsOpen, setControlsOpen] = useState(true);
  const [placingsOpen, setPlacingsOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => { }
  });

  const updateMatchScore = async (matchId: string, player1Score: number, player2Score: number): Promise<void> => {
    const [newTournament, error] = await safeApiCall(
      window.electron.enterRoundRobinResult({
        tournamentId: bracket.tournamentId,
        bracketId: bracket.id,
        matchId,
        player1Score,
        player2Score
      })
    );

    if (error) {
      showError(error);
      return;
    }

    if (newTournament) {
      setTournament(newTournament);
    }
  };

  const resetMatch = async (matchId: string): Promise<void> => {
    const [newTournament, error] = await safeApiCall(
      window.electron.resetRoundRobinMatch({
        tournamentId: bracket.tournamentId,
        bracketId: bracket.id,
        matchId
      })
    );

    if (error) {
      showError(error);
      return;
    }

    if (newTournament) {
      setTournament(newTournament);
    }
  };

  const { matches, roundLabels } = calculateRoundRobinPositions(bracket);

  return (
    <>
      <ErrorToastContainer />
      <BracketResetWarningModal
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal({ ...warningModal, isOpen: false })}
        onConfirm={warningModal.onConfirm}
        message={warningModal.message}
      />
      <div className='flex flex-col h-full gap-4 p-8 bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner'>

        {/* Left Toggle Button */}
        <button
          onClick={() => setControlsOpen(!controlsOpen)}
          className='absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 z-10'
          title={controlsOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {controlsOpen ? <ChevronLeftIcon className='h-4 w-4' strokeWidth={4} /> : <ChevronRightIcon className='h-4 w-4' strokeWidth={4} />}
        </button>

        {/* Right Toggle Button */}
        <button
          onClick={() => setPlacingsOpen(!placingsOpen)}
          className='absolute right-4 top-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 z-10'
          title={placingsOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {placingsOpen ? <ChevronRightIcon className='h-4 w-4' strokeWidth={4} /> : <ChevronLeftIcon className='h-4 w-4' strokeWidth={4} />}
        </button>

        {/* Top: Controls + Bracket Display */}
        <div className='flex flex-1 gap-6 relative overflow-hidden'>

          {/* Controls Panel */}
          <div
            className={`flex flex-col bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 shadow-xl gap-4 items-center transition-all
            ${controlsOpen ? 'min-w-[300px]' : 'w-0 opacity-0 p-0 overflow-hidden'}`}
          >
            <p className='text-lg font-bold text-white'>
              {bracket.gender + ' | ' + bracket.hand + ' | ' + bracket.experienceLevel + ' | ' + bracket.weightLimit}
            </p>

            <div className='flex-1 w-full min-h-0'>
              <CompetitorInput
                competitors={bracket.competitorNames ?? []}
                bracketStarted={isRoundRobinBracketStarted(bracket)}
                addCompetitor={async (name) => {
                  const [newTournament, error] = await safeApiCall(
                    window.electron.addCompetitorToBracket({
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
          </div>

          {/* Bracket Display */}
          <div className='bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 shadow-xl relative overflow-auto flex-1' ref={containerRef}>
            {bracket.competitorNames && bracket.competitorNames.length < 2 ? (
              <div className='text-white text-center font-semibold text-lg py-12'>
                Not enough competitors yet.
                <br />
                Add at least two to begin the round robin.
              </div>
            ) : (
              <>
                {/* Round labels */}
                {roundLabels.map(({ x, label }) => (
                  <div
                    key={label}
                    className='absolute top-0 text-white font-bold text-sm bg-slate-600 px-3 py-1 rounded'
                    style={{ left: `${x}px` }}
                  >
                    {label}
                  </div>
                ))}

                {/* Matches */}
                {matches.map(({ match, x, y }) => (
                  <RoundRobinMatchView
                    key={match.id}
                    match={match}
                    updateMatchScore={updateMatchScore}
                    resetMatch={resetMatch}
                    x={x}
                    y={y}
                    currentMatchId={bracket.currentMatchNumber}
                  />
                ))}
              </>
            )}
          </div>

          {/* Placings Panel */}
          <div
            className={`flex flex-col bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 shadow-xl gap-4 items-center transition-all
            ${placingsOpen ? 'overflow-y-auto' : 'w-0 opacity-0 p-0 overflow-hidden'}`}
          >
            <p className='text-lg font-bold text-white'>Final Placings</p>
            <FinalPlacings first={bracket.firstPlace} second={bracket.secondPlace} third={bracket.thirdPlace} />

            {/* Standings table */}
            <div className='w-full bg-slate-900/50 rounded-lg p-3 border border-slate-600/30 mt-2'>
              <h3 className='text-white text-sm font-semibold mb-2'>Standings</h3>
              <table className='w-full text-xs text-gray-200'>
                <thead>
                  <tr className='text-gray-400 text-left'>
                    <th className='py-1'>#</th>
                    <th className='py-1'>Name</th>
                    <th className='py-1 text-right'>Pts</th>
                    <th className='py-1 text-right'>W-L</th>
                  </tr>
                </thead>
                <tbody>
                  {bracket.standings.map((s, index) => (
                    <tr key={s.name} className='border-t border-slate-700/50'>
                      <td className='py-1 pr-2'>{index + 1}</td>
                      <td className='py-1 pr-2 truncate max-w-[120px]'>{s.name}</td>
                      <td className='py-1 text-right font-semibold'>{s.points}</td>
                      <td className='py-1 text-right'>{s.wins}-{s.losses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Hot-Swap Bar */}
        {tournament && (
          <BracketHotSwapBar
            tournament={tournament}
            currentBracketId={bracket.id}
            onBracketChange={setBracketId}
          />
        )}
      </div>
    </>
  );
}
