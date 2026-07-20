import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Menu, X, Bell, User, LogOut, LayoutDashboard, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-slate-950/90 backdrop-blur-md shadow-md border-b border-slate-800'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <span className="font-black text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>CareerBridge</span>
              <span className="font-black gradient-text" style={{ fontFamily: 'Poppins, sans-serif' }}> AI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!isAuthenticated && (
              <>
                <a href="#features" className="btn-ghost text-sm">Features</a>
                <a href="#journey" className="btn-ghost text-sm">Journey</a>
                <a href="#faq" className="btn-ghost text-sm">FAQ</a>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard/notifications'}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
                >
                  <Bell size={18} />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[100px] truncate">
                      {user?.full_name || user?.email}
                    </span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-52 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-slate-800">
                          <p className="font-semibold text-slate-100 text-sm truncate">{user?.full_name || 'User'}</p>
                          <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            to={isAdmin ? '/admin' : '/dashboard'}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <LayoutDashboard size={15} /> Dashboard
                          </Link>
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <User size={15} /> Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/auth/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/auth/signup" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-4 space-y-2"
          >
            {!isAuthenticated ? (
              <>
                <a href="#features" className="block nav-item">Features</a>
                <a href="#how-it-works" className="block nav-item">How It Works</a>
                <a href="#faq" className="block nav-item">FAQ</a>
                <div className="pt-2 flex flex-col gap-2">
                  <Link to="/auth/login" className="btn-ghost w-full justify-center">Sign In</Link>
                  <Link to="/auth/signup" className="btn-primary w-full justify-center">Get Started</Link>
                </div>
              </>
            ) : (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="block nav-item">Dashboard</Link>
                <Link to="/dashboard/profile" className="block nav-item">Profile</Link>
                <button onClick={handleLogout} className="w-full nav-item text-red-600">Sign Out</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
