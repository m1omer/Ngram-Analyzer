import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Predict from './pages/Predict';

export default function App() {
  const [ngrams, setNgrams] = useState({});
  const [previewText, setPreviewText] = useState("");

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              setNgrams={setNgrams}
              setPreviewText={setPreviewText}
              previewText={previewText}
            />
          }
        />
        <Route path="/stats" element={<Stats ngrams={ngrams} />} />
        <Route path="/predict" element={<Predict />} />
      </Routes>
    </Router>
  );
}
