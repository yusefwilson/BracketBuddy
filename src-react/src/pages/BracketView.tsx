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


  switch (bracket.type) {
    case 'DoubleEliminationBracket':
      return <DoubleEliminationBracketView />;
    default:
      return <div>Bracket type not found</div>;

  }
