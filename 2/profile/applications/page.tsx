'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Calendar, Tag, ArrowRight, AlertCircle } from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  under_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  on_hold: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  on_hold: 'On Hold',
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-8">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Track your scheme applications and their status
          </p>
        </div>

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-12 text-center"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No applications yet
            </h2>
            <p className="text-gray-600 mb-6">
              Browse schemes and submit your first application to get started
            </p>
            <button
              onClick={() => router.push('/schemes')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Schemes
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => {
              const status = app.status || 'submitted';
              const colors = statusColors[status] || statusColors.submitted;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/profile/applications/${app.id}`)}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {app.scheme?.imageUrl ? (
                      <img
                        src={app.scheme.imageUrl}
                        alt={app.scheme.title}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {app.scheme?.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {app.scheme?.ministry}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${colors.bg} flex items-center gap-1.5 flex-shrink-0`}>
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {statusLabels[status]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4" />
                          <span>{app.applicationNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {app.reviewNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{app.reviewNotes}</p>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
