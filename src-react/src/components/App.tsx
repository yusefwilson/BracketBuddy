import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Bracket from "../lib/Bracket";
import Tournament from "../lib/Tournament"
import TournamentView from "../pages/TournamentView";
import Navbar from "./Navbar";

export default function App() {

  const tournament = new Tournament('Tournament 1', new Date());
  const bracket = new Bracket('Female', 'Amateur', 'Left', 120, ['Alice', 'Jenny', 'Cathy', 'Sue']);
  tournament.addBracket(bracket);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<TournamentView tournament={tournament} />} />
      </Routes>
    </Router>
  )
}