import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, GraduationCap } from 'lucide-react';
import { authService } from '@/services/auth';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full text-center"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">ScholarBridge</span>
        </div>
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">Your email has been verified. You can now sign in.</p>
            <Link to="/auth/login" className="btn-primary w-full justify-center py-3 rounded-2xl">Sign In</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={36} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">The link may have expired. Try signing up again.</p>
            <Link to="/auth/signup" className="btn-primary w-full justify-center py-3 rounded-2xl">Sign Up Again</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
