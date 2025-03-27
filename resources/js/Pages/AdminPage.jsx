import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all feedback entries
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback');
      // If using Laravel's paginate you might need to access response.data.data
      setFeedbacks(response.data.data || response.data);
      setLoading(false);
    } catch (e) {
      setError('Error fetching feedback data');
      setLoading(false);
    }
  };

  // Mark a feedback as resolved
  const handleMarkResolved = async (feedbackId) => {
    try {
      await api.put(`/feedback/${feedbackId}`, { is_resolved: true });
      fetchFeedback();
    } catch (err) {
      alert('Error marking feedback as resolved');
    }
  };

  // Delete a feedback entry
  const handleDelete = async (feedbackId) => {
    try {
      await api.delete(`/feedback/${feedbackId}`);
      fetchFeedback();
    } catch (err) {
      alert('Error deleting feedback');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  useEffect(() => {
    // If admin flag is not set, redirect to login
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/login');
    }
    fetchFeedback();
  }, [navigate]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Loading feedback...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Subject</th>
                <th className="py-2 px-4 border-b">Message</th>
                <th className="py-2 px-4 border-b">Rating</th>
                <th className="py-2 px-4 border-b">Resolved</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-2 px-4 border-b">{fb.id}</td>
                  <td className="py-2 px-4 border-b">{fb.name}</td>
                  <td className="py-2 px-4 border-b">{fb.email}</td>
                  <td className="py-2 px-4 border-b">{fb.subject}</td>
                  <td className="py-2 px-4 border-b">{fb.message}</td>
                  <td className="py-2 px-4 border-b">{fb.rating}</td>
                  <td className="py-2 px-4 border-b">
                    {fb.is_resolved ? 'Yes' : 'No'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {!fb.is_resolved && (
                      <button
                        onClick={() => handleMarkResolved(fb.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(fb.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
