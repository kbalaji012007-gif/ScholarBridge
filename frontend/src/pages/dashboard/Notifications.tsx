import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Info, AlertCircle, FileText, GraduationCap, Clock } from 'lucide-react';
import { Notification } from '@/types';
import { notificationService } from '@/services/notifications';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950/30' },
  deadline: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/30' },
  document: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950/30' },
  application: { icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/30' },
  scholarship: { icon: GraduationCap, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-950/30' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.list().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All marked as read');
  };

  const unread = notifications.filter(n => !n.is_read).length;

  if (loading) return (
    <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="section-subtitle">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-500">No notifications</h3>
          <p className="text-gray-400 text-sm mt-1">We'll notify you about deadlines, applications, and documents.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const tc = typeConfig[n.notif_type] || typeConfig.info;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                  n.is_read
                    ? 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
                    : 'bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-950/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center shrink-0`}>
                  <tc.icon size={18} className={tc.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-bold text-sm ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                      {n.title}
                    </h4>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1" />}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-gray-400 text-xs">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                    {n.action_url && (
                      <Link
                        to={n.action_url}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-600 text-xs font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
