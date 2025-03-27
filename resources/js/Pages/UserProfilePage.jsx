import { useState, useEffect } from 'react';
import api from './api';

export default function UserProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [progress, setProgress] = useState({ lessonsCompleted: 0, challengesCompleted: 0, badgesEarned: 0 });

  useEffect(() => {
    // Fetch user profile and progress
    const fetchProfileData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error("No user ID found");
          return;
        }
        
        // Use the correct endpoint to get user details
        const userResponse = await api.get('user-details', {
          params: { user_id: userId }
        });
        
        setUsername(userResponse.data.name || '');
        setEmail(userResponse.data.email || '');

        // Fetch progress data
        const progressResponse = await api.get(`/progress/${userId}`);
        
        const completedLessons = progressResponse.data.filter(
          item => item.lesson_id && item.completed
        ).length;
        
        const completedChallenges = progressResponse.data.filter(
          item => item.challenge_id && item.completed
        ).length;
        
        // Calculate badges (example logic)
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
      }
    };
    
    fetchProfileData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      
      await api.post('/update-profile', { 
        user_id: userId,
        name: username, 
        email: email 
      });
      
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage('Failed to update profile.');
      setMessageType('error');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">User Profile</h1>
      
      {message && (
        <div className={`p-4 rounded ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleProfileUpdate} className="bg-white shadow-lg rounded p-4 space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">Update Profile</button>
      </form>
      <div className="bg-white shadow-lg rounded p-4 space-y-2">
        <h2 className="text-lg font-semibold">Progress Overview</h2>
        <p>Lessons Completed: {progress.lessonsCompleted}/10</p>
        <p>Challenges Completed: {progress.challengesCompleted}/5</p>
        <p>Badges Earned: {progress.badgesEarned}</p>
      </div>
    </div>
  );
}
