import { useState, useEffect } from 'react';
import ThemeProvider from './components/ThemeProvider';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import NavigationSidebar from './components/NavigationSidebar';
import TrackVisualization from './pages/TrackVisualization';
import RaceInsights from './pages/RaceInsights';
import StrategyPredictions from './pages/StrategyPredictions';
import DataSelection from './pages/DataSelection';
import DriverSummary from './pages/DriverSummary';
import { RaceDataProvider, useRaceData } from './contexts/RaceDataContext';
import { RaceDatabaseProvider } from './contexts/RaceDatabaseContext';

function AppContent() {
  const [activePage, setActivePage] = useState('3d');
  const { dataLoaded, trackLoaded, sessionData } = useRaceData();

  // Log state changes
  useEffect(() => {
    console.log(`🎯 [App] State changed:`, { trackLoaded, dataLoaded, hasSessionData: !!sessionData });
  }, [trackLoaded, dataLoaded, sessionData]);

  const renderPage = () => {
    console.log(`📄 [App] Rendering page: ${activePage}`);
    switch (activePage) {
      case '3d':
        return <TrackVisualization />;
      case 'insights':
        return <RaceInsights />;
      case 'strategy':
        return <StrategyPredictions />;
      case 'summary':
        return <DriverSummary />;
      default:
        return <TrackVisualization />;
    }
  };

  // Show data selection if no track loaded
  if (!trackLoaded && !dataLoaded) {
    console.log(`🚪 [App] Showing data selection (no track/data loaded)`);
    return (
      <div className="relative w-full min-h-screen">
        <DataSelection />
      </div>
    );
  }

  console.log(`🏠 [App] Showing main interface (trackLoaded: ${trackLoaded}, dataLoaded: ${dataLoaded})`);


  return (
    <div className="relative w-full min-h-screen">
      <Navbar />

      <div className="flex relative">
        <NavigationSidebar activePage={activePage} onPageChange={setActivePage} />

        <main className="ml-[270px] w-[calc(100%-270px)] min-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
          {renderPage()}
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 w-full h-12 bg-black/90 border-t border-cyan-500/20 flex items-center justify-center backdrop-blur-sm z-50">
        <p className="text-xs font-mono tracking-wider text-gray-500">
          © 2025{' '}
          <span className="text-cyan-400 font-semibold">Tanush Shah</span>
          {' '}•{' '}
          <span className="text-gray-400">The Unknown God</span>
          {' '}•{' '}
          <span className="text-cyan-400 font-semibold">Toyota GR Cup 2025</span>
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RaceDatabaseProvider>
        <RaceDataProvider>
          <AnimatedBackground />
          <AppContent />
        </RaceDataProvider>
      </RaceDatabaseProvider>
    </ThemeProvider>
  );
}

export default App;
