import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Home, GraduationCap, FileText, FolderOpen, Bell,
  BookmarkCheck, User, LayoutDashboard, ChevronDown, ChevronRight,
  Brain, Briefcase, Zap, Map, Trophy, Bot, BarChart3, Code2,
  BadgeCheck, X, Menu, Target, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavSection {
  label: string;
  color: string;
  items: NavItem[];
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    color: 'text-slate-500',
    items: [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/dashboard/profile', icon: User, label: 'My Profile' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  },
  {
    label: 'Scholarships',
    color: 'text-primary-500',
    items: [
      { to: '/dashboard/scholarships', icon: GraduationCap, label: 'Browse Scholarships' },
      { to: '/dashboard/scholarships/saved', icon: BookmarkCheck, label: 'Saved' },
      { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
      { to: '/dashboard/documents', icon: FolderOpen, label: 'Documents' },
    ]
  },
  {
    label: 'Career',
    color: 'text-accent-500',
    items: [
      { to: '/dashboard/resume', icon: Brain, label: 'Resume Analyzer', badge: 'AI', badgeColor: 'bg-secondary-950 text-secondary-400 border-secondary-700/30' },
      { to: '/dashboard/career', icon: Briefcase, label: 'Career Match' },
      { to: '/dashboard/skills', icon: Zap, label: 'Skill Gap Analyzer' },
      { to: '/dashboard/roadmap', icon: Map, label: 'Learning Roadmap', badge: 'AI', badgeColor: 'bg-secondary-950 text-secondary-400 border-secondary-700/30' },
    ]
  },
  {
    label: 'Placement',
    color: 'text-amber-500',
    items: [
      { to: '/dashboard/interview', icon: Trophy, label: 'Interview Prep' },
      { to: '/dashboard/projects', icon: Code2, label: 'Project Ideas' },
      { to: '/dashboard/certifications', icon: BadgeCheck, label: 'Certifications' },
    ]
  },
  {
    label: 'AI Tools',
    color: 'text-secondary-500',
    items: [
      { to: '/dashboard/ai-assistant', icon: Bot, label: 'AI Assistant', badge: 'Gemini', badgeColor: 'bg-gradient-to-r from-secondary-950 to-primary-950 text-secondary-400 border-secondary-700/30' },
      { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    ]
  }
];

function NavItemLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        active
          ? 'bg-gradient-to-r from-primary-950/80 to-secondary-950/60 text-primary-300 border border-primary-700/30'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
      }`}
    >
      <item.icon size={16} className={active ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold border ${item.badgeColor}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const toggleSection = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const profilePercent = user?.profile_completion ?? 0;

  return (
    <aside className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow-violet">
          <Rocket size={18} className="text-white" />
        </div>
        <div>
          <span className="font-black text-slate-100 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>CareerBridge</span>
          <span className="font-black gradient-text text-base" style={{ fontFamily: 'Poppins, sans-serif' }}> AI</span>
        </div>
      </div>

      {/* User Profile Mini Card */}
      <div className="px-3 py-3 border-b border-slate-800">
        <Link to="/dashboard/profile" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-100 text-sm truncate">{user?.full_name || 'Student'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </Link>
        {/* Profile completion bar */}
        {profilePercent < 100 && (
          <div className="mt-2 px-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Profile</span>
              <span className="text-xs text-primary-400 font-medium">{profilePercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${profilePercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => {
          const isCollapsed = collapsed[section.label];
          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-2 mb-1.5 group"
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${section.color}`}>
                  {section.label}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-slate-600 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItemLink key={item.to} item={item} active={isActive(item.to)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom AI promo */}
      <div className="px-3 py-3 border-t border-slate-800">
        <Link
          to="/dashboard/ai-assistant"
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary-950/80 to-primary-950/60 border border-secondary-700/30 hover:border-secondary-600/50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-600 to-primary-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-secondary-300">AI Career Assistant</p>
            <p className="text-xs text-slate-500 truncate">Ask me anything...</p>
          </div>
          <Sparkles size={14} className="text-secondary-500 group-hover:text-secondary-300 transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
