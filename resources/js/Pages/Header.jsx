import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from './api';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentFont, setCurrentFont] = useState('default');
  const [showFontMenu, setShowFontMenu] = useState(false);
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
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Load font preference
    const savedFont = localStorage.getItem('font') || 'default';
    setCurrentFont(savedFont);
    applyFontToDocument(savedFont);

    checkAuthStatus();
  }, []);

  // Check authentication status whenever route changes
  useEffect(() => {
    checkAuthStatus();
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
    // Remove all font classes
    document.body.classList.remove('font-sans', 'font-serif', 'font-mono', 'font-roboto', 'font-open-sans');
    
    // Add the selected font class
    const fontClass = fontOptions.find(font => font.value === fontValue)?.class || 'font-sans';
    document.body.classList.add(fontClass);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 dark:bg-gray-900 text-white transition-colors duration-200">
      <Link to="/" className="text-2xl font-bold">WebVulnLearn</Link>
      
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50">
          {alertMessage}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        
        {/* Font Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="p-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors flex items-center"
            title="Change Font"
          >
            <span className="mr-1">Aa</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFontMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
              <div className="py-1">
                {fontOptions.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => changeFont(font.value)}
                    className={`${
                      currentFont === font.value ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                    } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${font.class}`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/feedback" className="hover:underline">Feedback</Link></li>
            {isLoggedIn ? (
              <>
                <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
                <li><Link to="/profile" className="hover:underline">Profile</Link></li>
                <li className="hover:underline text-gray-300">{username}</li>
                <li>
                  <button onClick={handleLogout} className="hover:underline text-red-300">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:underline">Login</Link></li>
                <li><Link to="/register" className="hover:underline">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
