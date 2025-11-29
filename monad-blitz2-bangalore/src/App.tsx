import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisputePage from './components/DisputePage';
import ResolutionPage from './pages/ResolutionPage';
import HelpPage from './pages/HelpPage';
import Home from './pages/HomePage';
import JurorPage from './pages/JurorPage';

function App() {
  return (
    <div className="w-screen min-h-screen m-0 p-0 text-center">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/disputes" element={<DisputePage />} />
          <Route path="/juror" element={<JurorPage />} />
          <Route path="/resolution/:id" element={<ResolutionPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
