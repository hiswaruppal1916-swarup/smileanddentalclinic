import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import NotificationToast from './components/NotificationToast';
import NotificationBellModal from './components/NotificationBellModal';
import PWAInstallBanner from './components/PWAInstallBanner';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Treatments from './pages/Treatments';
import TreatmentDetail from './pages/TreatmentDetail';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import BookAppointment from './pages/BookAppointment';
import AppointmentTracking from './pages/AppointmentTracking';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

// Doctor Portal Pages
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSettings from './pages/doctor/DoctorSettings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isDoctorRoute = location.pathname.startsWith('/doctor');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/treatments/:slug" element={<TreatmentDetail />} />
          <Route path="/team" element={<Team />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/track" element={<AppointmentTracking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />

          {/* Doctor Portal Routes */}
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />

          {/* 404 Fallback - Never a broken dead-end */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDoctorRoute && <FloatingActions />}
      <Footer />

      {/* Global Notification Components & PWA Install Banner */}
      <NotificationToast />
      <NotificationBellModal />
      <PWAInstallBanner />
    </div>
  );
}
