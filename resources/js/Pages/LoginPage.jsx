import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check for admin credentials first
    if (email === 'admin@admin.com' && password === 'admin') {
      // Set admin flag and dummy admin ID
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('userId', 'admin');
      alert('Admin login successful!');
      navigate('/admin');
      return;
    }
    
    // Normal login for non-admin users:
    try {
      const response = await api.post('login', { email, password });
      // Assuming backend returns a user_id
      localStorage.setItem('userId', response.data.user_id);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Login to WebVulnLearn
        </h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
            Log in
          </button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
