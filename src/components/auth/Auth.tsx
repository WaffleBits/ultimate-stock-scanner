import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, getCurrentUser, clearCurrentUser, User } from '../../services/authService';

interface AuthProps {
  onAuthChange?: (user: User | null) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Load current user on component mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (onAuthChange) {
      onAuthChange(user);
    }
  }, [onAuthChange]);
  
  // Toggle between login and register forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (!username || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      const user = loginUser(username, password);
      setCurrentUser(user);
      setSuccess('Logged in successfully!');
      
      if (onAuthChange) {
        onAuthChange(user);
      }
      
      // Reset form
      setUsername('');
      setPassword('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while logging in');
      }
    }
  };
  
  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (!username || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      const user = registerUser(username, email, password);
      setCurrentUser(user);
      setSuccess('Registered successfully!');
      
      if (onAuthChange) {
        onAuthChange(user);
      }
      
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while registering');
      }
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    
    if (onAuthChange) {
      onAuthChange(null);
    }
  };
  
  // If user is logged in, show user info and logout button
  if (currentUser) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Your Account</h2>
        
        <div className="mb-4">
          <p className="text-gray-300">
            <span className="font-bold">Username:</span> {currentUser.username}
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Email:</span> {currentUser.email}
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Logout
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-900 text-red-300 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-900 text-green-300 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            placeholder="Enter your username"
          />
        </div>
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Enter your email"
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            placeholder="Enter your password"
          />
        </div>
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Confirm your password"
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mb-4"
        >
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      
      <div className="text-center">
        <button
          onClick={toggleForm}
          className="text-blue-400 hover:text-blue-300"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default Auth; 