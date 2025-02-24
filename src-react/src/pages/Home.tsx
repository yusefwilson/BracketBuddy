import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Navbar from "../components/Navbar";

export default function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}