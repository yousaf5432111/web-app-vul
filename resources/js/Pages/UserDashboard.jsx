import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

export default function UserDashboard() {
  const [username, setUsername] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        // Get the userId from localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error("No user ID found");
          return;
        }
        
        // Call the correct endpoint with the user_id parameter
        const userResponse = await api.get('user-details', {
          params: { user_id: userId }
        });
        console.log(userResponse.data);
        
        setUsername(userResponse.data.name || 'User');
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    // Fetch user progress
    const fetchUserProgress = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error("No user ID found");
          return;
        }
        
        const progressResponse = await api.get(`/progress/${userId}`);
        const totalItems = 2 + challenges.length; // 2 lessons + all challenges
        
        // Count completed items (both lessons and challenges)
        const completedItems = progressResponse.data.filter(item => item.completed).length;
        
        // Calculate percentage
        const percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        setProgress(percentage);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    // Fetch lessons
    const fetchLessons = async () => {
      try {
        const lessonsResponse = await api.get('/lessons');
        setLessons(lessonsResponse.data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };

    // Fetch challenges
    const fetchChallenges = async () => {
      try {
        const challengesResponse = await api.get('/challenges');
        setChallenges(challengesResponse.data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchUserDetails();
    fetchUserProgress();
    fetchLessons();
    fetchChallenges();
  }, []);

  const handleVideoClick = (url) => {
    setSelectedVideo(url);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold">Welcome, {username}</h1>
      
      {/* Progress Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="font-semibold mb-2">Your Progress</h2>
        <div className="w-full bg-gray-200 rounded h-2">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{progress.toFixed(0)}% of lessons completed</p>
      </div>

      {/* Lessons and Videos Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="font-semibold mb-2">Learning Topics</h2>
        {lessons.map((lesson) => (
  <div key={lesson.id} className="border-t border-gray-300 pt-4 mt-4">
    <h3
      className="text-lg font-semibold cursor-pointer text-blue-600 hover:underline"
      onClick={() => setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, open: !l.open } : l)))}
    >
      {lesson.title}
    </h3>
    {lesson.open && (
      <div className="mt-2 space-y-2 pl-4">
        {/* Check if resources is an array before mapping */}
        {(Array.isArray(JSON.parse(lesson.resources)) ? JSON.parse(lesson.resources) : []).map((video, index) => (
          <p
            key={index}
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => handleVideoClick(video.url)}
          >
            {video.title}
          </p>
        ))}
      </div>
    )}
  </div>
))}

      </div>

      {/* Video Player Section */}
      {selectedVideo && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
          <h2 className="font-semibold mb-4">Video Player</h2>
          <div className="relative w-full max-w-lg h-64 md:h-80 lg:h-96 mx-auto">
            <iframe
              src={selectedVideo.replace("watch?v=", "embed/")}
              title="Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
        </div>
      )}

      {/* Challenges Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
        <h2 className="font-semibold mb-2">Available Challenges</h2>
        {challenges.map((challenge) => (
          <div key={challenge.id} className="mb-4">
            <Link to={`/challenges/${challenge.id}`} className="text-blue-600 hover:underline">
              {challenge.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
