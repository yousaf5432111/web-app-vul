import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiAward, FiPlay, FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';
import Leaderboard from './Leaderboard';
import api from './api';
import AIAssistant from './AIAssistant';

export default function UserDashboard() {
  const [username, setUsername] = useState('Learner');
  const [progress, setProgress] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [completedItems, setCompletedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        // Fetch user details
        const userResponse = await api.get('user-details', { params: { user_id: userId } });
        setUsername(userResponse.data.name || 'Learner');

        // Fetch progress
        const progressResponse = await api.get(`/progress/${userId}`);
        const completed = progressResponse.data.filter(item => item.completed).map(item => item.item_id);
        setCompletedItems(completed);

        // Calculate progress percentage
        const lessonsResponse = await api.get('/lessons');
        const challengesResponse = await api.get('/challenges');
        const totalItems = lessonsResponse.data.length + challengesResponse.data.length;
        const percentage = totalItems > 0 ? (completed.length / totalItems) * 100 : 0;
        console.log("Progress percentage:", percentage);
        setProgress(percentage);
        setLessons(lessonsResponse.data.map(lesson => ({
          ...lesson,
          open: false,
          resources: Array.isArray(JSON.parse(lesson.resources)) ? 
            JSON.parse(lesson.resources) : 
            []
        })));
        setChallenges(challengesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const toggleLesson = (lessonId) => {
    setLessons(lessons.map(lesson => 
      lesson.id === lessonId ? { ...lesson, open: !lesson.open } : lesson
    ));
  };

  const markAsComplete = async (itemId, type) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.post('/progress', { user_id: userId, item_id: itemId, item_type: type, completed: true });
      setCompletedItems([...completedItems, itemId]);
      
      // Update progress
      const totalItems = lessons.length + challenges.length;
      const newPercentage = ((completedItems.length + 1) / totalItems) * 100;
      setProgress(newPercentage);
    } catch (error) {
      console.error("Error marking as complete:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Welcome back, {username}!
          </motion.h1>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'lessons' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <FiBook className="inline mr-2" /> Lessons
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'challenges' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <FiAward className="inline mr-2" /> Challenges
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Your Learning Progress</h2>
            <span className="text-blue-600 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div 
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {completedItems.length} of {lessons.length + challenges.length} items completed
          </p>
        </motion.div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons/Challenges List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {activeTab === 'lessons' ? (
                <motion.div
                  key="lessons"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Learning Modules</h2>
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <motion.div
                        key={lesson.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden"
                      >
                        <div 
                          className="p-5 cursor-pointer flex justify-between items-center"
                          onClick={() => toggleLesson(lesson.id)}
                        >
                          <div className="flex items-center">
                            {completedItems.includes(lesson.id) ? (
                              <FiCheckCircle className="text-green-500 mr-3 text-xl" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                            )}
                            <h3 className="text-lg font-semibold">{lesson.title}</h3>
                          </div>
                          {lesson.open ? (
                            <FiChevronUp className="text-gray-500" />
                          ) : (
                            <FiChevronDown className="text-gray-500" />
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {lesson.open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5">
                                <p className="text-gray-600 mb-4">{lesson.description}</p>
                                
                                <div className="space-y-3">
                                  {lesson.resources.map((resource, index) => (
                                    <div 
                                      key={index}
                                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                      onClick={() => setSelectedVideo(resource.url)}
                                    >
                                      <FiPlay className="text-blue-500 mr-3" />
                                      <span className="font-medium">{resource.title}</span>
                                      <span className="ml-auto text-sm text-gray-500">{resource.duration}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                {!completedItems.includes(lesson.id) && (
                                  <button
                                    onClick={() => markAsComplete(lesson.id, 'lesson')}
                                    className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                  >
                                    Mark as Complete
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="challenges"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Security Challenges</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenges.map((challenge) => (
                      <motion.div
                        key={challenge.id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start mb-3">
                            {completedItems.includes(challenge.id) ? (
                              <FiCheckCircle className="text-green-500 mr-3 text-xl mt-1" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3 mt-1"></div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold">{challenge.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{challenge.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {challenge.difficulty}
                            </span>
                            <Link
                              to={`/challenges/${challenge.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Start Challenge
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Video Player / Recent Activity */}
          <div className="space-y-6">
          <Leaderboard />
            {selectedVideo ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-5">
                  <h3 className="font-semibold mb-3">Now Playing</h3>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={selectedVideo.replace("watch?v=", "embed/")}
                      title="Video Player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-5"
              >
                <h3 className="font-semibold mb-3">Quick Start</h3>
                <p className="text-gray-600 mb-4">
                  Select a lesson or challenge from the left to begin your learning journey.
                </p>
                <div className="space-y-3">
                  {lessons.slice(0, 3).map(lesson => (
                    <div 
                      key={lesson.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setActiveTab('lessons');
                        setLessons(lessons.map(l => 
                          l.id === lesson.id ? { ...l, open: true } : l
                        ));
                      }}
                    >
                      <FiBook className="text-blue-500 mr-3" />
                      <span className="font-medium">{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-5"
            >
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              {completedItems.length > 0 ? (
                <div className="space-y-3">
                  {lessons
                    .filter(lesson => completedItems.includes(lesson.id))
                    .slice(0, 3)
                    .map(lesson => (
                      <div key={lesson.id} className="flex items-center">
                        <FiCheckCircle className="text-green-500 mr-3" />
                        <span className="text-sm">Completed: {lesson.title}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent activity yet</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
