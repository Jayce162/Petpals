
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, PawPrint, User, ArrowLeft } from 'lucide-react';

interface SignUpProps {
  onSignUp: () => void;
  onBackToLogin: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignUp, onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // In a real app, perform API registration here.
    onSignUp();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 font-sans relative">
      
      <button 
        onClick={onBackToLogin}
        className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
           <PawPrint size={40} className="text-coral-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Join Petpals</h1>
      </div>

      {/* Headings */}
      <div className="w-full max-w-sm mb-6 text-center">
        <p className="text-gray-500 text-base">Create an account for your furry friend.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Owner Name</label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={20} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-6 text-gray-900 focus:outline-none focus:border-coral-300 focus:ring-4 focus:ring-coral-50 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Email</label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-6 text-gray-900 focus:outline-none focus:border-coral-300 focus:ring-4 focus:ring-coral-50 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Password</label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-12 text-gray-900 focus:outline-none focus:border-coral-300 focus:ring-4 focus:ring-coral-50 transition-all shadow-sm"
              required
            />
             <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-12 text-gray-900 focus:outline-none focus:border-coral-300 focus:ring-4 focus:ring-coral-50 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div className="pt-4">
            <button
            type="submit"
            className="w-full bg-coral-500 text-white font-bold text-lg py-4 rounded-full shadow-xl shadow-coral-200 hover:bg-coral-600 transform transition-all active:scale-95 active:shadow-md"
            >
            Create Account
            </button>
        </div>
      </form>

      <p className="mt-8 text-gray-500 font-medium text-sm">
        Already have an account? <button onClick={onBackToLogin} className="text-coral-500 font-bold hover:underline">Log In</button>
      </p>
    </div>
  );
};
