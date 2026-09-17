'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  User,
  Loader,
  MessageSquare,
  TrendingUp,
  Filter,
  Search,
  Plus,
  ClipboardList,
  Zap,
  CheckSquare,
  AlertTriangle,
  LayoutGrid,
  Home,
  Clock3,
} from 'lucide-react';

interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  assignedTo?: number;
}

export default function EmployeeDashboard() {
  const [userName, setUserName] = useState<string>('Employee');
  const [userId, setUserId] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  // search removed per requirement (no search in employee dashboard)
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<Ticket['status']>('in_progress');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('medium');
  const [activeNavTab, setActiveNavTab] = useState<'new' | 'in_progress' | 'solved' | 'issue'>('new');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check-session');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!data.authenticated || !data.user) {
        router.push('/login');
        return;
      }
      if (data.user.role !== 'employee' && data.user.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUserName(data.user.name);
      setUserId(data.user.id);
      fetchTickets();
    } catch (err) {
      console.error('Auth check failed:', err);
      router.push('/login');
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/login');
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      const result = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority,
          response,
          assignedTo: userId,
        }),
      });

      if (result.ok) {
        fetchTickets();
        setShowTicketModal(false);
        setSelectedTicket(null);
        setResponse('');
        setNewPriority('medium');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: any; color: string }> = {
      open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle, color: 'text-blue-500' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, color: 'text-yellow-500' },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, color: 'text-green-500' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle, color: 'text-gray-500' },
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  // Filter tickets based on active tab (no search)
  const filteredTickets = tickets.filter((ticket) => {
    let matchesStatus = true;
    if (activeTab === 'all') matchesStatus = true;
    else if (activeTab === 'open') matchesStatus = ticket.status === 'open';
    else if (activeTab === 'in_progress') matchesStatus = ticket.status === 'in_progress';
    else if (activeTab === 'resolved') matchesStatus = ticket.status === 'resolved';
    else if (activeTab === 'closed') matchesStatus = ticket.status === 'closed';
    return matchesStatus;
  });

  // Combine both filters - use top tabs for desktop, bottom nav for mobile
  const displayedTickets = filteredTickets;

  const stats = [
    {
      label: 'Total Tickets',
      value: tickets.length,
      color: 'bg-blue-500',
    },
    {
      label: 'Open',
      value: tickets.filter((t) => t.status === 'open').length,
      color: 'bg-orange-500',
    },
    {
      label: 'In Progress',
      value: tickets.filter((t) => t.status === 'in_progress').length,
      color: 'bg-yellow-500',
    },
    {
      label: 'Resolved',
      value: tickets.filter((t) => t.status === 'resolved').length,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8 bg-[#4568F0] rounded-2xl shadow-lg p-6 md:p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h2>
              <p className="text-blue-100 text-sm md:text-base">
                Help citizens access government schemes through excellent support
              </p>
            </div>
            <MessageSquare className="w-12 h-12 md:w-16 md:h-16 opacity-20 hidden md:block" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-md p-4 md:p-6 border-2 border-gray-100 hover:border-[#4568F0] hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-gray-700 font-semibold text-xs md:text-sm">{stat.label}</h3>
                <div className={`${stat.color} p-2 md:p-3 rounded-xl`}>
                  <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl md:text-4xl font-bold text-[#4568F0]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
          {/* Header */}
          <div className="px-4 md:px-8 py-4 md:py-6 border-b-2 border-gray-100 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Citizen Support Requests</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Help users access government schemes</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#4568F0] rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>

            {/* Filter tabs removed - using bottom navigation instead */}
          </div>

          {/* Tickets List */}
          <div className="divide-y-2 divide-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : displayedTickets.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-semibold">No tickets found</p>
                <p className="text-gray-500">No matching support tickets at the moment</p>
              </div>
            ) : (
              displayedTickets.map((ticket) => {
                const statusInfo = getStatusColor(ticket.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setNewStatus(ticket.status);
                      setNewPriority(ticket.priority);
                      setResponse(ticket.response || '');
                      setShowTicketModal(true);
                    }}
                    className="px-4 md:px-8 py-4 md:py-6 hover:bg-blue-50 transition-all cursor-pointer border-l-4 border-transparent hover:border-[#4568F0]"
                  >
                    <div className={`grid gap-4 items-center ${
                      ticket.status === 'open' || activeTab === 'all' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-5'
                    }`}>
                      {/* Ticket Info */}
                      <div className={ticket.status === 'open' ? 'md:col-span-2' : 'md:col-span-2'}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`${statusInfo.color} p-2 rounded-lg`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
                              {ticket.subject}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-[#4568F0] rounded-full">
                                {ticket.ticketNumber}
                              </span>
                              <span className="text-xs text-gray-600">
                                👤 {ticket.userName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-start md:justify-center">
                        <span
                          className={`text-xs font-bold px-4 py-2 rounded-full border-2 ${statusInfo.bg} ${statusInfo.text} shadow-md`}
                        >
                          {ticket.status === 'closed' ? 'ISSUE' : ticket.status === 'resolved' ? 'SOLVED' : ticket.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Priority - Show only if ticket is not in Open status AND not in Dashboard (all) view */}
                      {ticket.status !== 'open' && activeTab !== 'all' && (
                        <div className="flex items-center justify-start md:justify-center">
                          <span
                            className={`text-xs font-bold px-4 py-2 rounded-full border-2 ${getPriorityColor(
                              ticket.priority
                            )} shadow-md`}
                          >
                            {ticket.priority === 'low' && '🟢'} 
                            {ticket.priority === 'medium' && '🟡'} 
                            {ticket.priority === 'high' && '🟠'} 
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Action */}
                      <div className="flex items-center justify-end">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors">
                          <MoreVertical className="w-5 h-5 text-[#4568F0]" />
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 text-xs text-gray-500 flex gap-4">
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>⏰ {new Date(ticket.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto border-2 border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {selectedTicket.subject}
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-semibold">
                  📋 {selectedTicket.ticketNumber}
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl font-bold hover:bg-gray-100 p-2 rounded-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* User Info */}
              <div className="p-4 md:p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">👤 Citizen Information</h4>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {selectedTicket.userName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {selectedTicket.userEmail}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">📝 Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Status, Priority & Existing Response */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">
                    📊 Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as Ticket['status'])
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0] font-semibold bg-white transition-all text-sm"
                  >
                    <option value="open" className="font-semibold">🔵 Open</option>
                    <option value="in_progress" className="font-semibold">🟡 In Progress</option>
                    <option value="resolved" className="font-semibold">🟢 Solved</option>
                    <option value="closed" className="font-semibold">⚫ Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">
                    🔥 Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as Ticket['priority'])
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0] font-semibold bg-white transition-all text-sm"
                  >
                    <option value="low" className="font-semibold">🟢 Low</option>
                    <option value="medium" className="font-semibold">🟡 Medium</option>
                    <option value="high" className="font-semibold">🟠 High</option>
                  </select>
                </div>
              </div>

              {/* Previous Response Display */}
              {selectedTicket.response && (
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">📬 Previous Response</h4>
                  <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100">
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedTicket.response}</p>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">
                  ✍️ Your Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Provide your response to help the citizen..."
                  rows={4}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0] font-medium transition-all resize-none text-sm"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t-2 border-gray-100 flex gap-3">
              <button
                onClick={() => setShowTicketModal(false)}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTicket}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-[#4568F0] text-white rounded-2xl font-bold hover:bg-blue-600 hover:shadow-lg transition-all text-sm md:text-base"
              >
                ✅ Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
