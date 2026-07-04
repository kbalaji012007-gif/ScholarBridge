import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, User, Search, BookmarkCheck, FileText,
  FolderOpen, Bell, LogOut, GraduationCap, X, Settings,
  ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const studentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/scholarships', icon: Search, label: 'Find Scholarships' },
  { to: '/dashboard/scholarships/saved', icon: BookmarkCheck, label: 'Saved' },
  { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
  { to: '/dashboard/documents', icon: FolderOpen, label: 'Document Wallet' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: User, label: 'Students' },
  { to: '/admin/scholarships', icon: GraduationCap, label: 'Scholarships' },
  { to: '/admin/documents', icon: FolderOpen, label: 'Documents' },
];

export default function Sidebar({ isOpen, onClose, isAdmin = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-glow">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-base gradient-text">ScholarBridge</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <X size={18} />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-950/30 dark:to-indigo-950/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {user?.full_name || 'Student'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        {!isAdmin && user?.profile_completion !== undefined && (
          <div className="mt-3 px-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 dark:text-gray-400">Profile</span>
              <span className="font-semibold text-primary-600">{user.profile_completion}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${user.profile_completion}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-2">
            Admin Panel
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        {isAdmin && (
          <div className="mb-2 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Admin Mode</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-72 bg-white dark:bg-gray-900 h-full shadow-2xl z-10"
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}
    </>
  );
}
