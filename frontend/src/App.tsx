import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { SafetyMonitoring } from './pages/SafetyMonitoring';
import { CrackAnalysis } from './pages/CrackAnalysis';
import { Valuation } from './pages/Valuation';
import { ProjectPlanning } from './pages/ProjectPlanning';
import { DailyAssistant } from './pages/DailyAssistant';
import { WeatherAdvisory } from './pages/WeatherAdvisory';
import { KnowledgeAssistant } from './pages/KnowledgeAssistant';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="safety" element={<SafetyMonitoring />} />
          <Route path="crack-analysis" element={<CrackAnalysis />} />
          <Route path="valuation" element={<Valuation />} />
          <Route path="planning" element={<ProjectPlanning />} />
          <Route path="assistant" element={<DailyAssistant />} />
          <Route path="weather" element={<WeatherAdvisory />} />
          <Route path="knowledge" element={<KnowledgeAssistant />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
