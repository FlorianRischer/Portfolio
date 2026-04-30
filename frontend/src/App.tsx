// Author: Florian Rischer
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import Header from './components/Header';
import { TransitionProvider } from './components/PageTransition/TransitionContext';
import HomePage from './pages/HomePage';
import WorksPage from './pages/WorksPage';
import AboutPage from './pages/AboutPage';
import ImpressumPage from './pages/ImpressumPage';
import DatenschutzPage from './pages/DatenschutzPage';
import { imagesAPI } from './services/api';
import './styles/global.css';
import './components/PageTransition/PageTransition.css';

function AppContent() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    (window as unknown as Record<string, unknown>).__lenis = lenis;
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as unknown as Record<string, unknown>).__lenis;
    };
  }, []);

  useEffect(() => {
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
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
