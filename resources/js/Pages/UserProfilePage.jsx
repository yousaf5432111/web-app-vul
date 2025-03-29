import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiAward, FiBook, FiFlag, FiSave } from 'react-icons/fi';
import api from './api';
import AIAssistant from './AIAssistant';

export default function UserProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [progress, setProgress] = useState({ 
    lessonsCompleted: 0, 
    challengesCompleted: 0, 
    badgesEarned: 0 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error("No user ID found");
        
        const [userResponse, progressResponse] = await Promise.all([
          api.get('user-details', { params: { user_id: userId } }),
          api.get(`/progress/${userId}`)
        ]);
        
        setUsername(userResponse.data.name || '');
        setEmail(userResponse.data.email || '');

        const completedLessons = progressResponse.data.filter(
          item => item.lesson_id && item.completed
        ).length;
        
        const completedChallenges = progressResponse.data.filter(
          item => item.challenge_id && item.completed
        ).length;
        
        const badgesEarned = Math.floor((completedLessons + completedChallenges) / 3);

        setProgress({ 
          lessonsCompleted: completedLessons, 
          challengesCompleted: completedChallenges, 
          badgesEarned 
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load profile data");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error("User ID not found");
      
      await api.post('/update-profile', { 
        user_id: userId,
        name: username, 
        email: email 
      });
      
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBadges = () => {
    const badges = [];
    for (let i = 0; i < progress.badgesEarned; i++) {
      badges.push(
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md"
        >
          <FiAward className="text-white text-xl" />
        </motion.div>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8"
        >
          Your Profile
        </motion.h1>
        
        {/* Notification Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 flex items-center ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {messageType === 'success' ? (
              <FiAward className="mr-2 flex-shrink-0" />
            ) : (
              <FiFlag className="mr-2 flex-shrink-0" />
            )}
            <span>{message}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiUser className="mr-2 text-blue-500" /> Personal Information
            </h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiSave className="mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiAward className="mr-2 text-blue-500" /> Learning Progress
            </h2>
            
            <div className="space-y-6">
              {/* Lessons Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <FiBook className="mr-2 text-indigo-500" />
                    <span className="font-medium">Lessons Completed</span>
                  </div>
                  <span className="text-gray-600">
                    {progress.lessonsCompleted}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                    style={{ width: `${(progress.lessonsCompleted / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Challenges Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <FiFlag className="mr-2 text-green-500" />
                    <span className="font-medium">Challenges Completed</span>
                  </div>
                  <span className="text-gray-600">
                    {progress.challengesCompleted}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-green-400 to-teal-500" 
                    style={{ width: `${(progress.challengesCompleted / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Badges */}
              <div>
                <div className="flex items-center mb-4">
                  <FiAward className="mr-2 text-yellow-500" />
                  <span className="font-medium">Badges Earned</span>
                </div>
                {progress.badgesEarned > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {renderBadges()}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Complete more lessons and challenges to earn badges!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
