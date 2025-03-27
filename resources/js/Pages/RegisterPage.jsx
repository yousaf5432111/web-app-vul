import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      
        
      await api.post('/register', {
        name: username,
        email,
        password,
        password_confirmation: password,
      });
      
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      console.error("Registration error:", err.response);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Create an Account</h2>
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded" placeholder="Choose a username" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="Enter your email" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="Create a password" required />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">Sign Up</button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
