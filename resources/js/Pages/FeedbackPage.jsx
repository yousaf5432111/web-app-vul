import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and fill form with their data
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        setIsLoggedIn(true);
        try {
          const response = await api.get('user-details', {
            params: { user_id: userId }
          });
          
          setFormData(prev => ({
            ...prev,
            name: response.data.name || '',
            email: response.data.email || '',
            user_id: userId
          }));
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Test endpoint - use this to check if basic API calls work
  const testEndpoint = async () => {
    try {
      setDebugInfo('Testing endpoint...');
      const response = await api.post('/feedback/test', {
        test: 'This is a test',
        ...formData
      });
      setDebugInfo(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setDebugInfo(`Error: ${error.message}\n${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    setDebugInfo('Submitting...');

    try {
      // Make sure user_id is set
      const userId = localStorage.getItem('userId') || 0;

      // Prepare payload
      const payload = {
        user_id: userId,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating
      };
      
      setDebugInfo('Submitting with payload: ' + JSON.stringify(payload, null, 2));
      
      const response = await api.post('/feedback', payload);
      
      setDebugInfo(prevDebug => prevDebug + '\nResponse: ' + JSON.stringify(response.data, null, 2));
      
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your feedback! We appreciate your input.'
      });
      
      // Reset form if not logged in
      if (!isLoggedIn) {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          rating: 5
        });
      } else {
        // Just clear subject and message if logged in
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      }
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setDebugInfo(prevDebug => prevDebug + '\nError: ' + error.message + 
        '\nResponse: ' + JSON.stringify(error.response?.data || {}, null, 2));
      
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'There was an error submitting your feedback. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-100 dark:bg-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Give Feedback</h1>
      
      {submitStatus.message && (
        <div className={`mb-6 p-4 rounded ${
          submitStatus.type === 'success' 
            ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'
        }`}>
          {submitStatus.message}
        </div>
      )}
      
      {/* Debug section */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded overflow-auto max-h-40">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <pre className="text-xs">{debugInfo}</pre>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-700 shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                required
                readOnly={isLoggedIn}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                required
                readOnly={isLoggedIn}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="What's your feedback about?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Please share your thoughts, suggestions, or report any issues you've encountered."
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              How would you rate your experience?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-8 w-8 ${
                      star <= formData.rating 
                        ? 'text-yellow-400' 
                        : 'text-gray-300 dark:text-gray-500'
                    }`}
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={testEndpoint}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Test Connection
            </button>
            
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
