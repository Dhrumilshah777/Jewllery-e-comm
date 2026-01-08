import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Logged in successfully');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login to LuxeGems</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Email Address</label>
          <input
            type="email"
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Login
        </button>
      </form>
      
      <div className="mt-4 flex flex-col items-center">
        <div className="w-full border-t border-gray-300 my-4 relative">
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500 text-sm">Or</span>
        </div>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const result = await googleLogin(credentialResponse.credential);
            if (result.success) {
              toast.success('Logged in with Google');
              navigate('/');
            } else {
              toast.error(result.message);
            }
          }}
          onError={() => {
            toast.error('Google Login Failed');
          }}
        />
      </div>

      <p className="mt-4 text-center">
        Don't have an account? <Link to="/register" className="text-indigo-600">Register</Link>
      </p>
    </div>
  );
};

export default Login;
