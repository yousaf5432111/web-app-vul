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
  FiUserPlus
} from 'react-icons/fi';
import api from './api';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentFont, setCurrentFont] = useState('default');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fontOptions = [
    { name: 'Default', value: 'default', class: 'font-sans' },
    { name: 'Serif', value: 'serif', class: 'font-serif' },
    { name: 'Mono', value: 'mono', class: 'font-mono' },
    { name: 'Roboto', value: 'roboto', class: 'font-roboto' },
    { name: 'Open Sans', value: 'open-sans', class: 'font-open-sans' }
  ];

  // Load user preferences on initial render
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    const savedFont = localStorage.getItem('font') || 'default';
    setCurrentFont(savedFont);
    applyFontToDocument(savedFont);

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

  const changeFont = (fontValue) => {
    setCurrentFont(fontValue);
    localStorage.setItem('font', fontValue);
    applyFontToDocument(fontValue);
    setShowFontMenu(false);
  };

  const applyFontToDocument = (fontValue) => {
    document.body.classList.remove('font-sans', 'font-serif', 'font-mono', 'font-roboto', 'font-open-sans');
    const fontClass = fontOptions.find(font => font.value === fontValue)?.class || 'font-sans';
    document.body.classList.add(fontClass);
  };

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
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                WebVulnLearn
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-8">
                <Link 
                  to="/" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <FiHome className="mr-1" /> Home
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <FiInfo className="mr-1" /> About
                </Link>
                <Link 
                  to="/feedback" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <FiMessageSquare className="mr-1" /> Feedback
                </Link>
                {isLoggedIn && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                    >
                      <FiUser className="mr-1" /> Profile
                    </Link>
                  </>
                )}
              </nav>

              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
              
              {/* Font Selector */}
              <div className="relative">
                <button 
                  onClick={() => setShowFontMenu(!showFontMenu)}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
                >
                  <span className="mr-1">Aa</span>
                  <FiChevronDown className={`h-4 w-4 transition-transform ${showFontMenu ? 'transform rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showFontMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="py-1">
                        {fontOptions.map((font) => (
                          <button
                            key={font.value}
                            onClick={() => changeFont(font.value)}
                            className={`${
                              currentFont === font.value 
                                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-700 dark:text-gray-200'
                            } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${font.class}`}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FiLogIn className="mr-1" /> Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all"
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
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
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
                  </div>
                ) : (
                  <div className="px-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <Link
                        to="/login"
                        className="w-full px-4 py-2 text-center text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <FiLogIn className="inline mr-2" /> Login
                      </Link>
                      <Link
                        to="/register"
                        className="w-full px-4 py-2 text-center text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700"
                      >
                        Sign Up
                      </Link>
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
