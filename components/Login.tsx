
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, PawPrint, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { PetProfile } from '../types';

interface LoginProps {
  onLogin: (userProfile?: PetProfile) => void;
  onGoToSignUp: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGoToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API authentication delay for manual login
    setTimeout(() => {
      // Hardcoded Test Account Check
      if (email.toLowerCase() === 'test' && password === '1') {
        onLogin(); // No specific profile, uses default in App
      } else {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
      setSocialLoading(provider);
      setError(null);
      
      try {
          let userProfile: PetProfile | undefined;
          
          if (provider === 'google') {
              userProfile = await authService.loginWithGoogle();
          } else if (provider === 'facebook') {
              userProfile = await authService.loginWithFacebook();
          } else if (provider === 'apple') {
              userProfile = await authService.loginWithApple();
          }

          if (userProfile) {
              onLogin(userProfile);
          }
      } catch (err) {
          setError("Social login failed. Please try again.");
      } finally {
          setSocialLoading(null);
      }
  };

  const fillTestCredentials = () => {
    setEmail('test');
    setPassword('1');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 font-sans selection:bg-coral-100 selection:text-coral-900">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8 transform transition-all hover:scale-105 duration-300">
        <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-red-100 border border-red-100">
           <PawPrint size={48} className="text-coral-500" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Petpals</h1>
      </div>

      {/* Headings */}
      <div className="w-full max-w-sm mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back!</h2>
        <p className="text-gray-500 text-base">Login to continue to your pet's world.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Email/Username Field */}
        <div className="space-y-2 group">
          <label className="text-xs font-bold text-gray-500 ml-5 uppercase tracking-wide transition-colors group-focus-within:text-coral-500">Username or Email</label>
          <div className="relative transition-transform focus-within:scale-[1.02] duration-200">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-coral-500 transition-colors duration-300 pointer-events-none">
              <Mail size={20} strokeWidth={2.5} />
            </div>
            <input
              type="text" 
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user account"
              className={`w-full bg-gray-50 border rounded-full py-4 pl-12 pr-6 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-coral-50/50 transition-all shadow-sm ${error ? 'border-red-200 focus:border-red-300' : 'border-gray-100 focus:border-coral-300'}`}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2 group">
          <label className="text-xs font-bold text-gray-500 ml-5 uppercase tracking-wide transition-colors group-focus-within:text-coral-500">Password</label>
          <div className="relative transition-transform focus-within:scale-[1.02] duration-200">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-coral-500 transition-colors duration-300 pointer-events-none">
              <Lock size={20} strokeWidth={2.5} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full bg-gray-50 border rounded-full py-4 pl-12 pr-12 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-coral-50/50 transition-all shadow-sm ${error ? 'border-red-200 focus:border-red-300' : 'border-gray-100 focus:border-coral-300'}`}
              required
            />
             <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-3 rounded-full hover:bg-gray-200/50 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-between items-center px-2">
            <button 
              type="button" 
              onClick={fillTestCredentials}
              className="text-xs font-bold text-gray-400 hover:text-coral-500 transition-colors uppercase tracking-wider"
            >
               Use Test Account
            </button>
            <button type="button" className="text-sm font-bold text-coral-500 hover:text-coral-600 hover:underline transition-all">
                Forgot Password?
            </button>
        </div>

        <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !!socialLoading}
              className="w-full bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold text-lg py-4 rounded-full shadow-xl shadow-coral-200 hover:shadow-2xl hover:shadow-coral-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Log In"}
            </button>
        </div>
      </form>
      
      {/* Divider */}
      <div className="w-full max-w-sm flex items-center gap-4 my-8 px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200 flex-1"></div>
          <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">Or continue with</span>
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent flex-1"></div>
      </div>

      {/* Social Login */}
      <div className="flex gap-5 mb-8">
          <SocialButton 
            onClick={() => handleSocialLogin('google')}
            isLoading={socialLoading === 'google'}
            isDisabled={!!socialLoading || isLoading}
            icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />} 
            label="Google"
          />
          <SocialButton 
            onClick={() => handleSocialLogin('facebook')}
            isLoading={socialLoading === 'facebook'}
            isDisabled={!!socialLoading || isLoading}
            icon={<img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" alt="Facebook" />} 
            label="Facebook"
          />
          <SocialButton 
            onClick={() => handleSocialLogin('apple')}
            isLoading={socialLoading === 'apple'}
            isDisabled={!!socialLoading || isLoading}
            icon={<img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-6 h-6" alt="Apple" />} 
            label="Apple"
          />
      </div>

      <p className="text-gray-500 font-medium text-sm">
        Don't have an account? <button onClick={onGoToSignUp} className="text-coral-500 font-bold hover:underline ml-1">Sign Up</button>
      </p>
    </div>
  );
};

interface SocialButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
}

const SocialButton = ({ icon, label, onClick, isLoading, isDisabled }: SocialButtonProps) => (
  <button 
    onClick={onClick}
    disabled={isDisabled}
    className="w-16 h-16 rounded-2xl border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-200 hover:shadow-md transition-all duration-300 active:scale-90 group relative disabled:opacity-70 disabled:active:scale-100"
    aria-label={`Login with ${label}`}
    title={label}
  >
      {isLoading ? (
          <Loader2 size={24} className="animate-spin text-coral-500" />
      ) : (
          <div className="transform transition-transform group-hover:scale-110">
            {icon}
          </div>
      )}
  </button>
);
