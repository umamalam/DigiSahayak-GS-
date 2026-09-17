'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Ticket,
  Star,
  Clock,
  CheckCircle,
  Filter,
  Search,
  CheckCheck,
  ExternalLink,
  User,
} from 'lucide-react';
import Link from 'next/link';

interface AdminNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  entityType: string | null;
  entityId: number | null;
  createdAt: string | null;
  userId: number;
  userName: string | null;
  userEmail: string | null;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; iconColor: string }> = {
  application_status: {
    label: 'Application',
    icon: FileText,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  document_verification: {
    label: 'Document',
    icon: ShieldCheck,
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    iconColor: 'text-teal-600',
  },
  ticket_response: {
    label: 'Ticket',
    icon: Ticket,
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  new_scheme: {
    label: 'New Scheme',
    icon: Star,
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    iconColor: 'text-purple-600',
  },
  deadline: {
    label: 'Deadline',
    icon: Clock,
    bg: 'bg-red-100',
    text: 'text-red-700',
    iconColor: 'text-red-600',
  },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || {
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: Bell,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    iconColor: 'text-gray-600',
  };
}

function TypeBadge({ type }: { type: string }) {
  const cfg = getTypeConfig(type);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filtered, setFiltered] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/check-session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'admin') {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter + search
  useEffect(() => {
    let result = notifications;

    if (typeFilter !== 'all') {
      result = result.filter((n) => n.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.userName || '').toLowerCase().includes(q) ||
          (n.userEmail || '').toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [notifications, typeFilter, searchQuery]);

  const markOneRead = async (id: number) => {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification:', err);
    } finally {
      setMarkingId(null);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch('/api/admin/notifications', { method: 'PATCH' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  // Unique types for filter dropdown
  const availableTypes = Array.from(new Set(notifications.map((n) => n.type)));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.filter((n) => n.isRead).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4568F0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top nav */}
      <nav className="bg-white shadow-sm border-b-2 border-[#4568F0]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-10 h-10 bg-[#4568F0] rounded-xl flex items-center justify-center shadow">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Notifications</h1>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 bg-[#4568F0] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              {markingAll ? 'Marking...' : 'Mark all read'}
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: Bell },
            { label: 'Unread', value: stats.unread, color: 'indigo', icon: Bell },
            { label: 'Read', value: stats.read, color: 'green', icon: CheckCircle },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${s.color}-50`}>
                  <Icon className={`w-5 h-5 text-${s.color}-500`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, message, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="all">All Types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{getTypeConfig(t).label}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2.5">
            Showing {filtered.length} of {notifications.length} notifications
          </p>
        </div>

        {/* Notifications list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Bell className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No notifications found</p>
            <p className="text-sm text-gray-400 mt-1">
              {notifications.length === 0
                ? 'No notifications have been created yet.'
                : 'Try changing the search or filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((notif, idx) => {
                const cfg = getTypeConfig(notif.type);
                const Icon = cfg.icon;
                const isMarkingThis = markingId === notif.id;

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
                      notif.isRead
                        ? 'border-gray-100'
                        : 'border-blue-200'
                    }`}
                  >
                    <div className="p-4 flex items-start gap-4">
                      {/* Unread dot + icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                        </div>
                        {!notif.isRead && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title}
                          </span>
                          <TypeBadge type={notif.type} />
                          {!notif.isRead && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">{notif.message}</p>

                        {/* User + time row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {notif.userName || 'Unknown'} {notif.userEmail ? `(${notif.userEmail})` : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(notif.createdAt)}
                            {notif.createdAt && (
                              <span className="text-gray-300 ml-1">
                                · {new Date(notif.createdAt).toLocaleString('en-IN')}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Go to related page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        {!notif.isRead && (
                          <button
                            onClick={() => markOneRead(notif.id)}
                            disabled={isMarkingThis}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as read"
                          >
                            {isMarkingThis ? (
                              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {notif.isRead && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
