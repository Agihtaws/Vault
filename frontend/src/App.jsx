import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Setup } from './pages/Setup';
import { Unlock } from './pages/Unlock';
import { Dashboard } from './pages/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Notification } from './components/Notification';
import { useAuthStore, useVaultStore } from './store/useStore';

function App() {
  const { isConnected } = useAuthStore();
  const { isUnlocked } = useVaultStore();

  return (
    <Router>
      <LoadingSpinner />
      <Notification />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/setup" 
          element={isConnected ? <Setup /> : <Navigate to="/" />} 
        />
        <Route 
          path="/unlock" 
          element={isConnected ? <Unlock /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard" 
          element={isConnected && isUnlocked ? <Dashboard /> : <Navigate to="/unlock" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
