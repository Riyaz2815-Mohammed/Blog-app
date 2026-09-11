import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Nav from './components/Nav.jsx';
import Auth from './pages/Auth.jsx';
import Feed from './pages/Feed.jsx';
import Explore from './pages/Explore.jsx';
import Profile from './pages/Profile.jsx';

function Protected({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={<Protected><div className="layout"><Nav /><div className="main-content"><Feed /></div></div></Protected>} />
      <Route path="/explore" element={<Protected><div className="layout"><Nav /><div className="main-content"><Explore /></div></div></Protected>} />
      <Route path="/profile/:username" element={<Protected><div className="layout"><Nav /><div className="main-content"><Profile /></div></div></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
