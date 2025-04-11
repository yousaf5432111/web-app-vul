import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSun, 
  FiMoon, 
  FiChevronDown, 
  FiLogOut, 
  FiUser,
  FiHome,
  FiInfo,
  FiMessageSquare,
  FiLogIn,
  FiShield,
  FiDroplet // Using FiDroplet instead of FiPalette
} from 'react-icons/fi';
import api from './api';

// Theme configuration
const themes = {
  blue: {
    name: 'Blue',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-600',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-600',
    gradientHoverFrom: 'hover:from-blue-700',
    gradientHoverTo: 'hover:to-indigo-700',
    darkPrimary: 'dark:bg-blue-400',
    darkPrimaryHover: 'dark:hover:bg-blue-500',
    darkPrimaryText: 'dark:text-blue-400',
  },
  green: {
    name: 'Green',
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    primaryText: 'text-green-600',
    primaryBorder: 'border-green-600',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-emerald-600',
    gradientHoverFrom: 'hover:from-green-700',
    gradientHoverTo: 'hover:to-emerald-700',
    darkPrimary: 'dark:bg-green-400',
    darkPrimaryHover: 'dark:hover:bg-green-500',
    darkPrimaryText: 'dark:text-green-400',
  },
  red: {
    name: 'Red',
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    primaryText: 'text-red-600',
    primaryBorder: 'border-red-600',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-pink-600',
    gradientHoverFrom: 'hover:from-red-700',
    gradientHoverTo: 'hover:to-pink-700',
    darkPrimary: 'dark:bg-red-400',
    darkPrimaryHover: 'dark:hover:bg-red-500',
    darkPrimaryText: 'dark:text-red-400',
  },
  purple: {
    name: 'Purple',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    primaryText: 'text-purple-600',
    primaryBorder: 'border-purple-600',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-violet-600',
    gradientHoverFrom: 'hover:from-purple-700',
    gradientHoverTo: 'hover:to-violet-700',
    darkPrimary: 'dark:bg-purple-400',
    darkPrimaryHover: 'dark:hover:bg-purple-500',
    darkPrimaryText: 'dark:text-purple-400',
  },
  orange: {
    name: 'Orange',
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryText: 'text-orange-600',
    primaryBorder: 'border-orange-600',
    gradientFrom: 'from-orange-600',
    gradientTo: 'to-amber-600',
    gradientHoverFrom: 'hover:from-orange-700',
    gradientHoverTo: 'hover:to-amber-700',
    darkPrimary: 'dark:bg-orange-400',
    darkPrimaryHover: 'dark:hover:bg-orange-500',
    darkPrimaryText: 'dark:text-orange-400',
  },
};

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user preferences on initial render
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    const savedTheme = localStorage.getItem('theme') || 'blue';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);

    checkAuthStatus();
  }, []);

  // Check authentication status whenever route changes
  useEffect(() => {
    checkAuthStatus();
    setMobileMenuOpen(false); // Close mobile menu on route change
  }, [location]);

  // Apply dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const checkAuthStatus = async () => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      setIsLoggedIn(true);
      
      try {
        const response = await api.get('user-details', {
          params: { user_id: userId }
        });
        setUsername(response.data.name || 'User');
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  };

  const handleLogout = () => {
    setAlertMessage('You have been successfully logged out.');
    setShowAlert(true);
    
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    
    setTimeout(() => {
      setShowAlert(false);
      navigate('/login');
    }, 2000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('theme', themeKey);
    applyTheme(themeKey);
    setShowThemeMenu(false);
  };

  const applyTheme = (themeKey) => {
    // Remove all theme classes from root element
    Object.keys(themes).forEach(theme => {
      document.documentElement.classList.remove(`theme-${theme}`);
    });
    // Add current theme class
    document.documentElement.classList.add(`theme-${themeKey}`);
  };

  const getCurrentTheme = () => themes[currentTheme] || themes.blue;

  return (
    <>
      {/* Alert Notification */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-3 z-50 shadow-md"
          >
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 theme-${currentTheme}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className={`text-2xl font-bold bg-gradient-to-r ${getCurrentTheme().gradientFrom} ${getCurrentTheme().gradientTo} bg-clip-text text-transparent`}
              >
                WebVulnLearn
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-8">
                <Link 
                  to="/" 
                  className={`text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors flex items-center`}
                >
                  <FiHome className="mr-1" /> Home
                </Link>
                <Link 
                  to="/about" 
                  className={`text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors flex items-center`}
                >
                  <FiInfo className="mr-1" /> About
                </Link>
                <Link 
                  to="/security-report" 
                  className={`text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors flex items-center`}
                >
                  <FiShield className="mr-1" /> Security Report
                </Link>
                <Link 
                  to="/feedback" 
                  className={`text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors flex items-center`}
                >
                  <FiMessageSquare className="mr-1" /> Feedback
                </Link>
                {isLoggedIn && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors flex items-center`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors flex items-center`}
                    >
                      <FiUser className="mr-1" /> Profile
                    </Link>
                  </>
                )}
              </nav>

              {/* Theme Selector */}
              <div className="relative">
                <button 
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
                >
                  <FiDroplet className="mr-1" />
                  <FiChevronDown className={`h-4 w-4 transition-transform ${showThemeMenu ? 'transform rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showThemeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="py-1">
                        {Object.entries(themes).map(([key, theme]) => (
                          <button
                            key={key}
                            onClick={() => changeTheme(key)}
                            className={`${
                              currentTheme === key 
                                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-700 dark:text-gray-200'
                            } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                          >
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${theme.primary}`}></span>
                            {theme.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>

              {/* User Section */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 dark:text-gray-300">{username}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    <FiLogOut className="mr-1" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className={`flex items-center text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover transition-colors`}
                  >
                    <FiLogIn className="mr-1" /> Login
                  </Link>
                  <Link 
                    to="/register" 
                    className={`px-3 py-1 bg-gradient-to-r ${getCurrentTheme().gradientFrom} ${getCurrentTheme().gradientTo} text-white rounded-md ${getCurrentTheme().gradientHoverFrom} ${getCurrentTheme().gradientHoverTo} transition-all`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-7 00 dark:text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <FiHome className="inline mr-2" /> Home
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <FiInfo className="inline mr-2" /> About
                </Link>
                <Link
                  to="/security-report"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <FiShield className="inline mr-2" /> Security Report
                </Link>
                <Link
                  to="/feedback"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <FiMessageSquare className="inline mr-2" /> Feedback
                </Link>
                {isLoggedIn && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <FiUser className="inline mr-2" /> Profile
                    </Link>
                  </>
                )}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                {isLoggedIn ? (
                  <div className="px-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                        {username}
                      </div>
                      <div className="flex space-x-4">
                        <button 
                          onClick={toggleDarkMode}
                          className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <FiLogOut className="mr-1" /> Logout
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(themes).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => changeTheme(key)}
                          className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                            currentTheme === key 
                              ? 'bg-gray-100 dark:bg-gray-700' 
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${theme.primary}`}></span>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <Link
                        to="/login"
                        className={`w-full px-4 py-2 text-center text-base font-medium text-gray-700 dark:text-gray-300 ${getCurrentTheme().darkPrimaryText}-hover`}
                      >
                        <FiLogIn className="inline mr-2" /> Login
                      </Link>
                      <Link
                        to="/register"
                        className={`w-full px-4 py-2 text-center text-base font-medium text-white bg-gradient-to-r ${getCurrentTheme().gradientFrom} ${getCurrentTheme().gradientTo} rounded-md ${getCurrentTheme().gradientHoverFrom} ${getCurrentTheme().gradientHoverTo}`}
                      >
                        Sign Up
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(themes).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => changeTheme(key)}
                          className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                            currentTheme === key 
                              ? 'bg-gray-100 dark:bg-gray-700' 
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${theme.primary}`}></span>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button 
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
