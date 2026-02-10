import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const result = await register(name, email, password, phone);
    if (result.success) {
      toast.success('OTP sent to your email');
      setUserId(result.userId);
      setStep(2);
    } else {
      toast.error(result.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const result = await verifyOtp(userId, otp);
    if (result.success) {
      toast.success('Registration successful');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {step === 1 ? 'Create Account' : 'Verify OTP'}
      </h2>
      
      {step === 1 ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-2 border focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-2 border focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-2 border focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-2 border focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-2 border focus:outline-none focus:ring-1 focus:ring-indigo-600"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Register
          </button>
          <p className="mt-4 text-center">
            Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <p className="text-center text-gray-600 mb-4">
              We have sent a 4-digit code to {email}
            </p>
            <label className="block text-gray-700">Enter OTP</label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-2 border focus:outline-none focus:ring-1 focus:ring-indigo-600 text-center tracking-widest text-xl"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={4}
              required
              placeholder="0000"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Verify OTP
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full px-4 py-2 font-semibold text-indigo-600 border border-indigo-600 mt-2 hover:bg-indigo-50"
          >
            Back to Register
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
