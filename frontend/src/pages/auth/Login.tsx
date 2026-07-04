import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 🎓');
      // Navigate based on role - need to read fresh user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(user.is_admin ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="relative text-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Welcome Back!</h1>
          <p className="text-primary-100 text-lg">
            Continue your scholarship journey. Thousands of opportunities await.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Active Scholarships', value: '500+' },
              { label: 'Students Helped', value: '50K+' },
              { label: 'Funds Facilitated', value: '₹10Cr+' },
              { label: 'Success Rate', value: '98%' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="text-primary-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
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

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Sign In</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            New to ScholarBridge?{' '}
            <Link to="/auth/signup" className="text-primary-600 font-semibold hover:underline">Create account</Link>
          </p>

          {/* Demo credentials */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <p><strong>Student:</strong> student@example.com / Student@123</p>
              <p><strong>Admin:</strong> admin@scholarbridge.com / Admin@123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-9"
                  id="login-email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-10"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3 rounded-2xl">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
