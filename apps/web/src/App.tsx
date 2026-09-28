import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingView } from './views/LandingView';
import { CommandCenterView } from './views/CommandCenterView';
import { RegimeStudioView } from './views/RegimeStudioView';
import { ForecastStudioView } from './views/ForecastStudioView';
import { ComparisonLabView } from './views/ComparisonLabView';
import { AgentRoomView } from './views/AgentRoomView';
import { EvaluationLabView } from './views/EvaluationLabView';
import { DistrictGuidanceView } from './views/DistrictGuidanceView';
import { SihDemoView } from './views/SihDemoView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#071522] text-[#F5FAFF] flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto bg-[#071522]">
              <Routes>
                <Route path="/" element={<LandingView />} />
                <Route path="/command-center" element={<CommandCenterView />} />
                <Route path="/regime-studio" element={<RegimeStudioView />} />
                <Route path="/forecast-studio" element={<ForecastStudioView />} />
                <Route path="/comparison-lab" element={<ComparisonLabView />} />
                <Route path="/agent-room" element={<AgentRoomView />} />
                <Route path="/evaluation-lab" element={<EvaluationLabView />} />
                <Route path="/district-guidance" element={<DistrictGuidanceView />} />
                <Route path="/sih-demo" element={<SihDemoView />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
