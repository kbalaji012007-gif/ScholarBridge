import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, GraduationCap, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">ScholarBridge</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              If an account exists with that email, we've sent a password reset link.
            </p>
            <Link to="/auth/login" className="btn-primary w-full justify-center py-3 rounded-2xl">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                    type="email"
                    placeholder="you@example.com"
                    className="input-field pl-9"
                    id="forgot-email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-2xl">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/auth/login" className="flex items-center gap-2 justify-center mt-4 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
