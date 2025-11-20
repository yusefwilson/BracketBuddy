export { };

import { BracketDTO } from './BracketDTO';
import { TournamentDTO } from './TournamentDTO';
import type {
  CreateTournamentInput,
  DeleteTournamentInput,
  AddBracketsToTournamentInput,
  RemoveBracketFromTournamentInput,
  UpdateBracketInput,
  AddCompetitorToBracketInput,
  RemoveCompetitorFromBracketInput,
  RandomizeCompetitorsInput,
  SaveKeyValueInput,
  ExportToAERSInput,
  ExportTournamentInput,
  ImportTournamentInput,
  ApiResponse
} from './types';

declare global {
  interface Window {
    electron: {
      // tournament
      loadAllTournaments: () => Promise<ApiResponse<TournamentDTO[]>>;
      createTournament: (input: CreateTournamentInput) => Promise<ApiResponse<TournamentDTO>>;
      deleteTournament: (input: DeleteTournamentInput) => Promise<ApiResponse<void>>;
      addBracketsToTournament: (input: AddBracketsToTournamentInput) => Promise<ApiResponse<TournamentDTO>>;
      removeBracketFromTournament: (input: RemoveBracketFromTournamentInput) => Promise<ApiResponse<TournamentDTO>>;
      exportTournament: (input: ExportTournamentInput) => Promise<ApiResponse<{ canceled: boolean; filePath?: string }>>;
      importTournament: (input: ImportTournamentInput) => Promise<ApiResponse<TournamentDTO>>;

      // bracket
      addCompetitorToBracket: (input: AddCompetitorToBracketInput) => Promise<ApiResponse<TournamentDTO>>;
      removeCompetitorFromBracket: (input: RemoveCompetitorFromBracketInput) => Promise<ApiResponse<TournamentDTO>>;
      enterResult: (input: UpdateBracketInput) => Promise<ApiResponse<TournamentDTO>>;
      randomizeCompetitors: (input: RandomizeCompetitorsInput) => Promise<ApiResponse<TournamentDTO>>;

      // misc
      getSaveData: () => Promise<ApiResponse<Record<string, any>>>;
      saveKeyValue: (input: SaveKeyValueInput) => Promise<ApiResponse<Record<string, any>>>;
      openUrl: (url: string) => Promise<void>;
      saveCsv: (filename: string, data: string) => Promise<ApiResponse<{ canceled: boolean; filePath?: string }>>;
      saveFile: (filename: string, data: string) => Promise<ApiResponse<{ canceled: boolean; filePath?: string }>>;
      loadFile: (fileExtension: string) => Promise<ApiResponse<{ canceled: boolean; data?: string; filePath?: string }>>;
      getZoomLevel: () => Promise<ApiResponse<number>>;
      setZoomLevel: (zoomPercent: number) => Promise<ApiResponse<void>>;

      // aers
      exportToAERS: (input: ExportToAERSInput) => Promise<ApiResponse<{ canceled: boolean; filePath?: string }>>;
    };
  }
}
