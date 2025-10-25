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
  StartBracketInput,
  RandomizeCompetitorsInput,
  SaveKeyValueInput,
} from './types';

declare global {
  interface Window {
    electron: {
      // tournament
      loadAllTournaments: () => Promise<TournamentDTO[]>;
      createTournament: (input: CreateTournamentInput) => Promise<TournamentDTO>;
      deleteTournament: (input: DeleteTournamentInput) => Promise<void>;
      addBracketToTournament: (input: AddBracketsToTournamentInput) => Promise<TournamentDTO>;
      removeBracketFromTournament: (input: RemoveBracketFromTournamentInput) => Promise<TournamentDTO>;

      // bracket
      addCompetitorToBracket: (input: AddCompetitorToBracketInput) => Promise<TournamentDTO>;
      removeCompetitorFromBracket: (input: RemoveCompetitorFromBracketInput) => Promise<TournamentDTO>;
      startBracket: (input: StartBracketInput) => Promise<TournamentDTO>;
      enterResult: (input: UpdateBracketInput) => Promise<TournamentDTO>;
      randomizeCompetitors: (input: RandomizeCompetitorsInput) => Promise<TournamentDTO>;

      // misc
      getSaveData: () => Promise<Record<string, any>>;
      saveKeyValue: (input: SaveKeyValueInput) => Promise<Record<string, any>>;
      openUrl: (url: string) => Promise<void>;
    };
  }
}
