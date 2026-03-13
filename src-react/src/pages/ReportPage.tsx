import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import { safeApiCall } from '../utils/apiHelpers';
import TournamentReport from '../components/TournamentReport';

export default function ReportPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<TournamentDTO | null>(null);

  useEffect(() => {
    if (!tournamentId) return;
    const load = async () => {
      const [result] = await safeApiCall(window.electron.loadTournament(tournamentId));
      if (result) setTournament(result);
    };
    load();
  }, [tournamentId]);

  useEffect(() => {
    if (tournament) {
      (window as any).__reportReady = true;
    }
  }, [tournament]);

  if (!tournament) return null;

  return <TournamentReport tournament={tournament} />;
}
