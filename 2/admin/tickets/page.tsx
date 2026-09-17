'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface TicketData {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userName: string;
  userEmail: string;
  createdAt: string;
  response?: string;
}

export default function TicketsManagement() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<TicketData['status']>('in_progress');

  useEffect(() => {
    checkAuth();
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTicketsList();
  }, [searchQuery, filterStatus, filterPriority, tickets]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check-session');
      const data = await res.json();
      
      if (!data.authenticated || data.user?.role !== 'admin') {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      
      if (res.ok) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTicketsList = () => {
    let filtered = [...tickets];

    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((ticket) => ticket.priority === filterPriority);
    }

    setFilteredTickets(filtered);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          response: response,
        }),
      });

      if (res.ok) {
        setTickets(tickets.map(t => 
          t.id === selectedTicket.id 
            ? { ...t, status: newStatus, response: response }
            : t
        ));
        setShowTicketModal(false);
        setResponse('');
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4568F0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b-2 border-[#4568F0]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow">
              <Ticket className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Ticket Management</h1>
              <p className="text-xs text-gray-600">{filteredTickets.length} tickets found</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6 border-2 border-gray-100">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0]"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0]"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0]"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setResponse(ticket.response || '');
                  setNewStatus(ticket.status);
                  setShowTicketModal(true);
                }}
                className="bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : ticket.priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : ticket.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {ticket.userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Ticket className="w-4 h-4" />
                        {ticket.ticketNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-500">
              No tickets found
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto border-2 border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                <p className="text-sm text-gray-600 mt-1 font-semibold">📋 {selectedTicket.ticketNumber}</p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl font-bold hover:bg-gray-100 p-2 rounded-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="p-4 md:p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">👤 User Information</h4>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-sm text-gray-600"><strong>Name:</strong> {selectedTicket.userName}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {selectedTicket.userEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">📝 Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">📊 Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketData['status'])}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0] font-semibold bg-white transition-all text-sm"
                >
                  <option value="open">🔵 Open</option>
                  <option value="in_progress">🟡 In Progress</option>
                  <option value="resolved">🟢 Resolved</option>
                  <option value="closed">⚫ Closed</option>
                </select>
              </div>

              {selectedTicket.response && (
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">📬 Previous Response</h4>
                  <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100">
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedTicket.response}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3">✍️ Admin Response</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Provide your response..."
                  rows={4}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4568F0] focus:border-[#4568F0] font-medium transition-all resize-none text-sm"
                />
              </div>
            </div>

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
