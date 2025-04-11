import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import UserDashboard from './UserDashboard';
import VulnerabilityLessonsPage from './VulnerabilityLessonsPage';
import ChallengePage from './ChallengePage';
import UserProfilePage from './UserProfilePage';
import AboutPage from './AboutPage';
import FeedbackPage from './FeedbackPage';
import AdminPage from './AdminPage';
import SecurityReportPage from './SecurityReportPage';
import { useEffect } from 'react';
// import Leaderboard from './Leaderboard';

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'blue';
    document.documentElement.classList.add(`theme-${savedTheme}`);
  }, []);
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/lessons/:lessonId" element={<VulnerabilityLessonsPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/challenges/:id" element={<ChallengePage />} /> {/* Ensure dynamic ID path */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/about" element={<AboutPage/>} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/security-report" element={<SecurityReportPage />} />
            {/* <Route path='/leaderboard' element={<Leaderboard />} /> */}
            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
