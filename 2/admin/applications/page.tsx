'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Filter, ChevronDown, 
  Eye, CheckCircle, XCircle, Clock, AlertCircle 
} from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  under_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  on_hold: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [selectedStatus, searchQuery, applications]);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.applicationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.scheme?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleReview = (app: any) => {
    setSelectedApp(app);
    setReviewStatus(app.status);
    setReviewNotes(app.reviewNotes || '');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedApp) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
        }),
      });

      if (res.ok) {
        setShowReviewModal(false);
        fetchApplications();
      }
    } catch (err) {
      console.error('Error updating application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Management
          </h1>
          <p className="text-gray-600">
            Review and manage scheme applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'blue' },
            { label: 'Submitted', value: stats.submitted, color: 'blue' },
            { label: 'Under Review', value: stats.under_review, color: 'yellow' },
            { label: 'Approved', value: stats.approved, color: 'green' },
            { label: 'Rejected', value: stats.rejected, color: 'red' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by application number, name, or scheme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const colors = statusColors[app.status] || statusColors.submitted;
              return (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {app.applicationNumber}
                        </span>
                        <div className={`px-2 py-0.5 rounded-full ${colors.bg} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                          <span className={`text-xs font-medium ${colors.text} capitalize`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {app.scheme?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Applicant: {app.user?.name} ({app.user?.email})
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied: {new Date(app.appliedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReview(app)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review Application
            </h2>

            <div className="space-y-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Application Number</p>
                <p className="font-mono font-medium text-gray-900">
                  {selectedApp.applicationNumber}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Scheme</p>
                <p className="text-gray-900">{selectedApp.scheme?.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Applicant</p>
                <p className="text-gray-900">
                  {selectedApp.user?.name} ({selectedApp.user?.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about this application review..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
