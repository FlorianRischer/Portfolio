// Author: Florian Rischer
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import { TransitionProvider } from './components/PageTransition/TransitionContext';
import HomePage from './pages/HomePage';
import WorksPage from './pages/WorksPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import { imagesAPI } from './services/api';
import './styles/global.css';
import './components/PageTransition/PageTransition.css';

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

  return (
    <TransitionProvider>
      <div className="app">
        <Header />
        <Routes>
          {/* Redirect root to home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Public routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<ProjectDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </TransitionProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
