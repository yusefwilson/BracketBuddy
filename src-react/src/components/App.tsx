import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";

import Home from "../pages/Home";
import Navbar from "./Navbar";

import Tournament from "../lib/Tournament";
import Bracket from "../lib/Bracket";
import TournamentView from "../pages/TournamentView";
import BracketView from "../pages/BracketView";

export const CURRENT_STATE = createContext<{
  tournament: Tournament | null, bracket: Bracket | null,
  setTournament: (tournament: Tournament) => void,
  setBracket: (bracket: Bracket) => void
} | null>(null);

export default function App() {

  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [currentBracket, setCurrentBracket] = useState<Bracket | null>(null);

  return (
    <CURRENT_STATE.Provider value={{ tournament: currentTournament, bracket: currentBracket, setTournament: setCurrentTournament, setBracket: setCurrentBracket }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/tournament' element={<TournamentView tournament={currentTournament} />} />
          <Route path='/bracket' element={<BracketView initialBracket={currentBracket} />} />
        </Routes>
      </Router>
    </CURRENT_STATE.Provider>
  )
}