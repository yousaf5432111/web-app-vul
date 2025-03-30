import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiAward, FiFlag, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from './api';
import Confetti from 'react-confetti';
import AIAssistant from './AIAssistant';

export default function ChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300);
  const [challengeResult, setChallengeResult] = useState('');
  const [challengeDetails, setChallengeDetails] = useState({
    title: '',
    instructions: '',
    difficulty: '',
    max_score: 0,
    type: 'practical',
    options: [],
    correct_answers: [],
    matching_pairs: []
  });
  const [challengePassed, setChallengePassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(null);
  const [matchingPairs, setMatchingPairs] = useState([]);
  const [availableOptions, setAvailableOptions] = useState([]);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      try {
        const response = await api.get(`/challenges/${id}`);
        setChallengeDetails(response.data);
        
        if (response.data.type === 'matching') {
          const pairs = JSON.parse(response.data.matching_pairs);
          const options = pairs.map(pair => pair.right);
          setMatchingPairs(pairs.map(pair => ({ left: pair.left, right: '' })));
          setAvailableOptions(options.sort(() => Math.random() - 0.5));
        }
      } catch (error) {
        console.error("Failed to fetch challenge details", error);
      }
    };
    fetchChallengeDetails();

    if (timeLeft > 0 && !challengePassed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [id, timeLeft, challengePassed]);

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const userId = localStorage.getItem('userId');
    
    let payload;
    switch (challengeDetails.type) {
      case 'mcq':
        payload = selectedOption;
        break;
      case 'true_false':
        payload = trueFalseAnswer;
        break;
      case 'matching':
        payload = JSON.stringify(matchingPairs);
        break;
      default:
        payload = userInput;
    }
  
    try {
      const response = await api.post(`/challenges/${id}/evaluate`, { 
        payload,
        user_id: userId
      });
      
      if (response.data.result) {
        setChallengePassed(true);
        setChallengeResult("Challenge passed! Well done!");
        await updateProgress();
      } else {
        setChallengeResult(response.data.message || "Challenge failed. Try again.");
      }
    } catch (error) {
      console.error("Challenge evaluation failed", error);
      setChallengeResult("Challenge evaluation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProgress = async () => {
    try {
      await api.post('/progress', {
        user_id: localStorage.getItem('userId'),
        challenge_id: id,
        completed: true,
        score: challengeDetails.max_score
      });
    } catch (error) {
      console.error("Failed to update progress", error);
    }
  };

  const getDifficultyColor = () => {
    switch(challengeDetails.difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMatchSelect = (leftItem, selectedRight) => {
    setMatchingPairs(prev => 
      prev.map(pair => 
        pair.left === leftItem ? { ...pair, right: selectedRight } : pair
      )
    );
  };

  const renderChallengeForm = () => {
    switch (challengeDetails.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {JSON.parse(challengeDetails.options).map((option, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === option 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOption(option)}
              >
                {option}
              </div>
            ))}
          </div>
        );
        
      case 'true_false':
        return (
          <div className="flex space-x-4">
            <button
              className={`px-6 py-3 rounded-lg text-lg font-medium ${
                trueFalseAnswer === true 
                  ? 'bg-green-100 text-green-800 border-green-500 border-2' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setTrueFalseAnswer(true)}
            >
              True
            </button>
            <button
              className={`px-6 py-3 rounded-lg text-lg font-medium ${
                trueFalseAnswer === false 
                  ? 'bg-red-100 text-red-800 border-red-500 border-2' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setTrueFalseAnswer(false)}
            >
              False
            </button>
          </div>
        );
        
      case 'matching':
        return (
          <div className="space-y-4">
            {matchingPairs.map((pair, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-1/2 p-3 bg-gray-100 rounded-lg">
                  {pair.left}
                </div>
                <select
                  value={pair.right}
                  onChange={(e) => handleMatchSelect(pair.left, e.target.value)}
                  className="w-1/2 p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select match</option>
                  {availableOptions.map((option, i) => (
                    <option 
                      key={i} 
                      value={option}
                      disabled={matchingPairs.some(p => p.right === option && p.left !== pair.left)}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );
        
      default: // practical
        return (
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter your payload here..."
            rows={5}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Confetti Celebration */}
      <AnimatePresence>
        {challengePassed && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Challenges
          </button>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor()}`}>
            {challengeDetails.difficulty}
          </div>
        </div>

        {/* Challenge Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Challenge Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {challengeDetails.title || "Challenge"}
            </h1>
            
            <div className="flex items-center mt-4 md:mt-0">
              <FiAward className="text-yellow-500 mr-2" />
              <span className="font-medium">Max Score: {challengeDetails.max_score}</span>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiClock className="text-blue-500 mr-2" />
                <span className="font-medium">Time Remaining</span>
              </div>
              <span className="text-xl font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <motion.div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 300) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Challenge Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiFlag className="mr-2 text-blue-500" /> Challenge Instructions
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {challengeDetails.instructions || "No challenge instructions available."}
                </p>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <motion.form 
            onSubmit={handleChallengeSubmit}
            className="bg-white rounded-xl shadow-md p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold">
              {challengeDetails.type === 'mcq' ? 'Select the correct answer' : 
               challengeDetails.type === 'true_false' ? 'Select True or False' :
               challengeDetails.type === 'matching' ? 'Match the items' : 'Your Solution'}
            </h3>
            
            {renderChallengeForm()}
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting || 
                (challengeDetails.type === 'mcq' && !selectedOption) ||
                (challengeDetails.type === 'true_false' && trueFalseAnswer === null) ||
                (challengeDetails.type === 'matching' && matchingPairs.some(p => !p.right))}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Submit Solution"
              )}
            </motion.button>
          </motion.form>

          {/* Result Message */}
          {challengeResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-center ${
                challengeResult.includes("passed") || challengeResult.includes("Correct") 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {challengeResult.includes("passed") || challengeResult.includes("Correct") ? (
                <FiCheckCircle className="mr-2 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="mr-2 flex-shrink-0" />
              )}
              <span>{challengeResult}</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {challengePassed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Challenge Complete!</h3>
                <p className="text-gray-600 mb-6">
                  You've earned {challengeDetails.max_score} points for completing this challenge!
                </p>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => navigate('/challenges')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View More Challenges
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AIAssistant />
    </div>
  );
}
