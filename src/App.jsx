import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Explore from './pages/Explore';
import DevMap from './pages/DevMap';

import Notifications from './pages/Notifications';
import NavBar from './components/layout/NavBar';
import { AppProvider, useAppContext } from './context/AppContext';

// Guard component for authenticated routes
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    // Redirect to auth if not logged in, but save the location they tried to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-[#0f0f11] text-white selection:bg-purple-500/30">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/feed" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pt-20 pb-20 md:pb-0 md:pl-[88px] min-h-screen"><Feed /></div>
              </ProtectedRoute>
            } />
            <Route path="/explore" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pt-20 pb-20 md:pb-0 md:pl-[88px] min-h-screen"><Explore /></div>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pt-20 pb-20 md:pb-0 md:pl-[88px] min-h-screen"><DevMap /></div>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pt-20 pb-20 md:pb-0 md:pl-[88px] min-h-screen"><Notifications /></div>
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pt-20 pb-20 md:pb-0 md:pl-[88px] min-h-screen"><CreatePost /></div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pb-20 md:pb-0 md:pl-[88px] min-h-screen"><Profile /></div>
              </ProtectedRoute>
            } />
            <Route path="/u/:username" element={
              <ProtectedRoute>
                <NavBar />
                <div className="pb-20 md:pb-0 md:pl-[88px] min-h-screen"><PublicProfile /></div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;