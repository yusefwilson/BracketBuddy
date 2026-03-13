import { useState, useEffect } from 'react';
import { FaRegFilePdf, FaRegFileImage } from 'react-icons/fa';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';
import TournamentReport from './TournamentReport';

interface Props {
  tournament: TournamentDTO;
  onClose: () => void;
}

export default function TournamentReportModal({ tournament, onClose }: Props) {
  const { showError, ErrorToastContainer } = useErrorToast();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [jpgLoading, setJpgLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSavePDF = async () => {
    setPdfLoading(true);
    const [result, error] = await safeApiCall(window.electron.exportToPDF({ tournamentId: tournament.id }));
    setPdfLoading(false);
    if (error) { showError(error); return; }
    if (result && !result.canceled) onClose();
  };

  const handleSaveJPEG = async () => {
    setJpgLoading(true);
    const [result, error] = await safeApiCall(window.electron.exportToJPG({ tournamentId: tournament.id }));
    setJpgLoading(false);
    if (error) { showError(error); return; }
    if (result && !result.canceled) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 gap-4">
      <ErrorToastContainer />

      {/* Action bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSavePDF}
          disabled={pdfLoading || jpgLoading}
          className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200"
          type="button"
        >
          <FaRegFilePdf />
          {pdfLoading ? 'Generating…' : 'Save as PDF'}
        </button>
        <button
          onClick={handleSaveJPEG}
          disabled={pdfLoading || jpgLoading}
          className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200"
          type="button"
        >
          <FaRegFileImage />
          {jpgLoading ? 'Generating…' : 'Save as JPEG'}
        </button>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-all duration-200 font-semibold"
          type="button"
        >
          Close
        </button>
      </div>

      {/* Scrollable preview */}
      <div className="overflow-y-auto rounded-xl shadow-2xl max-h-[80vh]">
        <TournamentReport tournament={tournament} />
      </div>
    </div>
  );
}
