import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface SignupForm {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const result = await signup(data.email, data.password, data.full_name) as any;
      setDone(true);
      toast.success('Account created! Check your email for verification.');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full text-center p-10"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Account Created!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your account has been created successfully. You can now sign in to start discovering scholarships.
          </p>
          <Link to="/auth/login" className="btn-primary w-full justify-center py-3 rounded-2xl">
            Go to Sign In <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-primary-600 to-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative text-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Join ScholarBridge</h1>
          <p className="text-indigo-100 text-lg mb-10">
            Discover hundreds of scholarships tailored just for you.
          </p>
          {['Free to use, always', 'AI-powered eligibility matching', 'Secure document storage', 'Real-time application tracking'].map((t) => (
            <div key={t} className="flex items-center gap-3 mb-3 text-left">
              <CheckCircle2 size={18} className="text-indigo-200 shrink-0" />
              <span className="text-indigo-100">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">ScholarBridge</span>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('full_name', { required: 'Full name is required' })} type="text" placeholder="Rahul Sharma" className="input-field pl-9" id="signup-name" />
              </div>
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email', { required: 'Email required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} type="email" placeholder="you@example.com" className="input-field pl-9" id="signup-email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="input-field pl-9 pr-10" id="signup-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('confirmPassword', { required: 'Please confirm password', validate: (v) => v === password || 'Passwords do not match' })} type="password" placeholder="Repeat password" className="input-field pl-9" id="signup-confirm" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input {...register('terms', { required: 'Accept terms to continue' })} type="checkbox" id="terms" className="mt-1 rounded accent-primary-600" />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3 rounded-2xl">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
