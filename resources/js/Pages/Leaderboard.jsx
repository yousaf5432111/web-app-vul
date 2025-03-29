import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiUser, FiTrendingUp } from 'react-icons/fi';
import api from './api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/leaderboard');
        console.log("Leaderboard data:", response.data);

        if (response.data.error) {
          console.error("Server error:", response.data.details);
          
          return;
        }
        setLeaderboard(response.data);
        
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userResponse = await api.get('user-details', { params: { user_id: userId } });
          const currentUsername = userResponse.data.name || userResponse.data.username;
          
          const userRank = response.data.findIndex(user => 
            user.name === currentUsername || user.username === currentUsername
          );
          
          if (userRank !== -1) {
            setCurrentUserRank({
              ...response.data[userRank],
              rank: userRank + 1
            });
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <FiTrendingUp className="mr-2 text-yellow-500" /> Leaderboard
        </h2>
        
        {/* Current User's Rank */}
        {currentUserRank && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-800">Your Position</h3>
                <p className="text-sm text-blue-600">Keep learning to climb higher!</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">#{currentUserRank.rank}</span>
                <p className="text-sm">{currentUserRank.name || currentUserRank.username}</p>
              </div>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                style={{ width: `${(currentUserRank.total_score / leaderboard[0]?.total_score) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Top 3 Users */}
        <div className="space-y-4">
          {leaderboard.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center p-3 rounded-lg ${
                index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-gray-50 border border-gray-200' :
                'bg-amber-50 border border-amber-100'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index === 0 ? 'bg-yellow-400 text-white' :
                index === 1 ? 'bg-gray-300 text-white' :
                'bg-amber-300 text-white'
              }`}>
                {index + 1}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-medium">{user.name || user.username}</h3>
                <p className="text-sm text-gray-500">{user.challenges_completed} challenges</p>
              </div>
              <div className="text-right">
                <span className="font-bold">{user.total_score} pts</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Users */}
        {leaderboard.length > 3 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Other Participants</h4>
            <div className="space-y-3">
              {leaderboard.slice(3, 7).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 text-right mr-3 text-gray-500">{index + 4}</span>
                    <div className="flex items-center">
                      <FiUser className="text-gray-400 mr-2" />
                      <span>{user.name || user.username}</span>
                    </div>
                  </div>
                  <span className="font-medium">{user.total_score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
