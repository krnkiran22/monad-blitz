import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisputePage from '../components/DisputePage';
import ResolutionPage from '../pages/ResolutionPage';

import HelpPage from '../pages/HelpPage';
import Home from '../pages/HomePage';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/disputes" element={<DisputePage />} />
      <Route path="/resolution/:id" element={<ResolutionPage />} />
      <Route path="/help" element={<HelpPage />} />
    </Routes>
  </Router>
);

export default AppRouter;
