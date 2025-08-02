import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DisputePage from '../components/DisputePage';
import ResolutionPage from '../pages/ResolutionPage';
import DashboardPage from '../pages/DashboardPage';
import HelpPage from '../pages/HelpPage';
import HomePage from '../pages/HomePage';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/disputes" element={<DisputePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/resolution/:id" element={<ResolutionPage />} />
      <Route path="/help" element={<HelpPage />} />
    </Routes>
  </Router>
);

export default AppRouter;
