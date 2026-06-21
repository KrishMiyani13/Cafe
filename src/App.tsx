import React, { useState, useEffect } from 'react';
import { CafeProvider } from './context/CafeContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CustomerMenu } from './pages/CustomerMenu';

import { OfflineIndicator } from './components/OfflineIndicator';

const AppContent: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Parse Routing
  // Pattern 1: Customer Menu - #/cafe/:cafeId/table/:tableNum
  const customerMenuMatch = route.match(/^#\/cafe\/([^/]+)\/table\/([^/]+)$/);
  
  if (customerMenuMatch) {
    const cafeId = customerMenuMatch[1];
    const tableNum = parseInt(customerMenuMatch[2]);
    
    if (cafeId && !isNaN(tableNum)) {
      return <CustomerMenu cafeId={cafeId} tableNum={tableNum} />;
    }
  }

  // Pattern 2: Manager Dashboard - #/dashboard
  if (route.startsWith('#/dashboard')) {
    return <Dashboard />;
  }

  // Fallback: Landing Page
  return <LandingPage />;
};

function App() {
  return (
    <CafeProvider>
      <OfflineIndicator />
      <AppContent />
    </CafeProvider>
  );
}

export default App;
