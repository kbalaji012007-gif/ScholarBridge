import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-ghost">
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <Home size={16} /> Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
