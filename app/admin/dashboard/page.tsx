'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Activity,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalEmployees: number;
  totalTickets: number;
  activeTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
  }>;
  recentTickets: Array<{
    id: number;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    userName: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userName, setUserName] = useState<string>('Admin');

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check-session');
      const data = await res.json();
      
      if (!data.authenticated || data.user?.role !== 'admin') {
        router.push('/login');
        return;
      }
      
      setUserName(data.user.name);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      
      if (res.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4568F0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/users',
    },
    {
      label: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Briefcase,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/employees',
    },
    {
      label: 'Total Tickets',
      value: stats?.totalTickets || 0,
      icon: Ticket,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/tickets',
    },
    {
      label: 'Active Tickets',
      value: stats?.activeTickets || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/admin/tickets?status=open',
    },
    {
      label: 'Pending Review',
      value: stats?.pendingTickets || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/admin/tickets?status=in_progress',
    },
    {
      label: 'Resolved',
      value: stats?.resolvedTickets || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/tickets?status=resolved',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b-2 border-[#4568F0]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#4568F0] rounded-2xl flex items-center justify-center shadow">
              <BarChart3 className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">DigiSahayak Admin</h1>
              <p className="text-xs text-gray-600">Administrator Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/admin/notifications"
              className="relative p-2 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link
              href="/admin/settings"
              className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-gray-900 text-sm md:text-base">{userName}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-[#4568F0] to-[#5A78FF] rounded-2xl shadow-lg p-6 md:p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h2>
              <p className="text-blue-100 text-sm md:text-base">
                Manage users, employees, and tickets from your admin dashboard
              </p>
            </div>
            <Activity className="w-12 h-12 md:w-16 md:h-16 opacity-20 hidden md:block" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 mb-6 md:mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.link}
                className="bg-white rounded-2xl shadow-md p-4 md:p-6 border-2 border-gray-100 hover:border-[#4568F0] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-gray-700 font-semibold text-xs md:text-sm">{stat.label}</h3>
                  <div className={`${stat.color} p-2 md:p-3 rounded-xl`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl md:text-4xl font-bold text-[#4568F0]">{stat.value}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-6 md:mb-8">
          <Link
            href="/admin/users"
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <Users className="w-7 h-7 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-xs text-gray-600">View and edit user accounts</p>
          </Link>
          <Link
            href="/admin/employees"
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-gray-100 hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <Briefcase className="w-7 h-7 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Employees</h3>
            <p className="text-xs text-gray-600">Add and assign employee roles</p>
          </Link>
          <Link
            href="/admin/tickets"
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-gray-100 hover:border-orange-500 hover:shadow-lg transition-all group"
          >
            <Ticket className="w-7 h-7 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Tickets</h3>
            <p className="text-xs text-gray-600">Manage support tickets</p>
          </Link>
          <Link
            href="/admin/documents"
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-gray-100 hover:border-teal-500 hover:shadow-lg transition-all group"
          >
            <ShieldCheck className="w-7 h-7 text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Verify Docs</h3>
            <p className="text-xs text-gray-600">Approve user documents</p>
          </Link>
          <Link
            href="/admin/schemes"
            className="bg-white rounded-2xl shadow-md p-5 border-2 border-gray-100 hover:border-indigo-500 hover:shadow-lg transition-all group"
          >
            <BookOpen className="w-7 h-7 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Schemes</h3>
            <p className="text-xs text-gray-600">Create and manage schemes</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100">
            <div className="px-6 py-4 border-b-2 border-gray-100 bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                </div>
                <Link href="/admin/users" className="text-sm text-[#4568F0] hover:underline">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent registrations</p>
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100">
            <div className="px-6 py-4 border-b-2 border-gray-100 bg-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Recent Tickets</h3>
                </div>
                <Link href="/admin/tickets" className="text-sm text-[#4568F0] hover:underline">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {stats?.recentTickets && stats.recentTickets.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{ticket.subject}</p>
                          <p className="text-xs text-gray-600">{ticket.userName}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            ticket.status === 'open'
                              ? 'bg-blue-100 text-blue-700'
                              : ticket.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : ticket.status === 'resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{ticket.ticketNumber}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent tickets</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
