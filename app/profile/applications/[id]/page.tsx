'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, Calendar, Tag, Download, 
  CheckCircle2, XCircle, Clock, AlertCircle 
} from 'lucide-react';

const statusIcons: Record<string, any> = {
  submitted: Clock,
  under_review: AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
  on_hold: Clock,
};

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  submitted: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
  under_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
  on_hold: { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-600' },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, []);

  const fetchApplicationDetails = async () => {
    try {
      const res = await fetch(`/api/applications/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Application not found</p>
        </div>
      </div>
    );
  }

  const status = application.status || 'submitted';
  const colors = statusColors[status] || statusColors.submitted;
  const StatusIcon = statusIcons[status] || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Applications</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <div className={`${colors.bg} rounded-xl p-6 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <StatusIcon className={`w-8 h-8 ${colors.icon}`} />
              <div>
                <p className="text-sm text-gray-600">Application Status</p>
                <p className={`text-2xl font-bold ${colors.text} capitalize`}>
                  {status.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Tag className="w-4 h-4" />
              <span className="font-medium">Application ID:</span>
              <span>{application.applicationNumber}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scheme Details
              </h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {application.scheme?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {application.scheme?.ministry}
                </p>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {application.scheme?.description}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Applied</p>
                    <p className="text-sm text-gray-600">
                      {new Date(application.appliedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                {application.updatedAt && application.updatedAt !== application.appliedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(application.updatedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {application.documents && application.documents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Attached Documents
                </h2>
                <div className="space-y-2">
                  {application.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.documentType}</p>
                          <p className="text-sm text-gray-600">{doc.fileName}</p>
                        </div>
                      </div>
                      <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.reviewNotes && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Review Notes
                </h2>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-gray-700">{application.reviewNotes}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
