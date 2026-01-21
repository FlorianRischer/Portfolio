// Author: Florian Rischer
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import { TransitionProvider } from './components/PageTransition/TransitionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WorksPage from './pages/WorksPage';
import SoundcloudDetailPage from './pages/SoundcloudDetailPage';
import SliceOfParadiseDetailPage from './pages/SliceOfParadiseDetailPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import { imagesAPI } from './services/api';
import './styles/global.css';
import './components/PageTransition/PageTransition.css';

// Redirect component that checks auth status
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Show nothing while checking auth
  }
  
  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const body = document.body;
    // Enable scrolling on works page
    if (location.pathname === '/works') {
      body.classList.add('app-scroll-enabled');
    } else {
      body.classList.remove('app-scroll-enabled');
    }
  }, [location]);

  useEffect(() => {
    // Set flower icon as favicon dynamically
    const flowerIcon = imagesAPI.getUrl('flower');
    const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = flowerIcon;
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(link);
    }
  }, []);

  // Always show header except on root redirect
  const showHeader = location.pathname !== '/';

  return (
    <TransitionProvider>
      <div className="app">
        {showHeader && <Header />}
        <Routes>
          {/* Root redirect based on auth status */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/works" element={
            <ProtectedRoute>
              <WorksPage />
            </ProtectedRoute>
          } />
          <Route path="/works/soundcloud" element={
            <ProtectedRoute>
              <SoundcloudDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/works/slice-of-paradise" element={
            <ProtectedRoute>
              <SliceOfParadiseDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </TransitionProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
