import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import Confetti from 'react-confetti';

export default function ChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300);
  const [challengeResult, setChallengeResult] = useState('');
  const [challengeDetails, setChallengeDetails] = useState({
    title: '',
    instructions: '',
    difficulty: '',
    max_score: 0
  });
  const [challengePassed, setChallengePassed] = useState(false);

  useEffect(() => {
    // Fetch challenge details based on the challenge ID
    const fetchChallengeDetails = async () => {
      try {
        const response = await api.get(`/challenges/${id}`);
        setChallengeDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch challenge details", error);
      }
    };
    fetchChallengeDetails();

    // Countdown timer for the challenge
    if (timeLeft > 0 && !challengePassed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [id, timeLeft, challengePassed]);

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    const userInput = e.target.elements[0].value;
    const userId = localStorage.getItem('userId');
  
    try {
      const response = await api.post(`/challenges/${id}/evaluate`, { 
        payload: userInput,
        user_id: userId
      });
      
      if (response.data.result) {
        setChallengePassed(true);
        setChallengeResult("Challenge passed! Well done!");
      } else {
        setChallengeResult(response.data.message || "Challenge failed. Try again.");
      }
    } catch (error) {
      console.error("Challenge evaluation failed", error);
      setChallengeResult("Challenge evaluation failed.");
    }
  };

  console.log(localStorage.getItem('userId'));
  const updateProgress = async () => {
    try {
      await api.post('/progress', {
        user_id: localStorage.getItem('userId'),  // Assuming user ID is stored in localStorage
        challenge_id: id,
        completed: true,
        score: challengeDetails.max_score
      });
      console.log("Progress updated successfully");
    } catch (error) {
      console.error("Failed to update progress", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">{challengeDetails.title || "Challenge"}</h1>
      
      {challengePassed && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <div className="bg-white shadow-lg rounded p-4">
        <h2 className="font-semibold">Challenge Details</h2>
        <p>{challengeDetails.instructions || "No challenge instructions available."}</p>
        <p><strong>Difficulty:</strong> {challengeDetails.difficulty}</p>
        <p><strong>Max Score:</strong> {challengeDetails.max_score}</p>
      </div>
      
      <form onSubmit={handleChallengeSubmit} className="bg-white shadow-lg rounded p-4 space-y-4">
        <textarea className="w-full p-2 border rounded" placeholder="Enter your SQL injection payload here..."></textarea>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Submit</button>
      </form>
      
      {challengeResult && <div className="p-4 bg-green-100 text-green-800 rounded">{challengeResult}</div>}
      
      <div className="bg-white shadow-lg rounded p-4">
        <p>Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
        <div className="w-full bg-gray-200 rounded h-2 mt-2">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${(timeLeft / 300) * 100}%` }}></div>
        </div>
      </div>

      {challengePassed && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-500">Congratulations!</h2>
            <p className="mt-4">You've successfully completed the challenge!</p>
            <button
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
