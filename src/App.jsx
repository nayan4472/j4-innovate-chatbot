import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import J4InnovateBot from "./J4InnovateBot.jsx";
import AdminPanel from "./AdminPanel.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<J4InnovateBot />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;