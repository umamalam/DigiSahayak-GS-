'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  Filter,
  User,
  Calendar,
  FileImage,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface DocumentRecord {
  id: number;
  documentType: string;
  sourceLabel: string | null;
  filePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: string;
  verificationNotes: string | null;
  verifiedAt: string | null;
  uploadedAt: string | null;
  userId: number;
  userName: string | null;
  userEmail: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; icon: any }> = {
  uploaded: {
    label: 'Pending Review',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-400',
    icon: Clock,
  },
  pending_verification: {
    label: 'Pending',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-400',
    icon: Clock,
  },
  verified: {
    label: 'Verified',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.uploaded;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [filtered, setFiltered] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  // Review modal
  const [reviewDoc, setReviewDoc] = useState<DocumentRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Auth check
  useEffect(() => {
    fetch('/api/auth/check-session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated || (data.user?.role !== 'admin' && data.user?.role !== 'employee')) {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Apply search + status filter
  useEffect(() => {
    let result = documents;

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.userName?.toLowerCase().includes(q) ||
          d.userEmail?.toLowerCase().includes(q) ||
          d.documentType.toLowerCase().includes(q) ||
          (d.sourceLabel || '').toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [documents, statusFilter, searchQuery]);

  const openReview = (doc: DocumentRecord) => {
    setReviewDoc(doc);
    setReviewNotes(doc.verificationNotes || '');
    setSubmitError('');
  };

  const closeReview = () => {
    setReviewDoc(null);
    setReviewNotes('');
    setSubmitError('');
  };

  const submitVerdict = async (newStatus: 'verified' | 'rejected') => {
    if (!reviewDoc) return;
    if (newStatus === 'rejected' && !reviewNotes.trim()) {
      setSubmitError('Please provide a reason when rejecting a document.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`/api/admin/documents/${reviewDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, verificationNotes: reviewNotes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Update failed. Please try again.');
        return;
      }

      closeReview();
      fetchDocuments();
    } catch (err) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.status === 'uploaded' || d.status === 'pending_verification').length,
    verified: documents.filter((d) => d.status === 'verified').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
            <p className="text-gray-500 mt-1">Review and verify user-uploaded documents</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: FileText },
            { label: 'Pending Review', value: stats.pending, color: 'yellow', icon: Clock },
            { label: 'Verified', value: stats.verified, color: 'green', icon: CheckCircle },
            { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircle },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${s.color}-50`}>
                  <Icon className={`w-6 h-6 text-${s.color}-500`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, document type, or file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="uploaded">Pending Review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Showing {filtered.length} of {documents.length} documents
          </p>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <ShieldCheck className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">
                {documents.length === 0 ? 'No documents have been uploaded yet.' : 'Try changing the search or filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Document</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Uploaded</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((doc, idx) => {
                    const isImage = doc.contentType.startsWith('image/');
                    const isPdf = doc.contentType === 'application/pdf';
                    const displayLabel = doc.sourceLabel || formatDocType(doc.documentType);
                    const isVerified = doc.status === 'verified';
                    const isRejected = doc.status === 'rejected';

                    return (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        {/* Document info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              {isImage ? (
                                <FileImage className="w-5 h-5 text-blue-500" />
                              ) : (
                                <FileText className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{displayLabel}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {doc.fileName} · {formatBytes(doc.fileSize)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.userName || 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{doc.userEmail || ''}</p>
                            </div>
                          </div>
                        </td>

                        {/* Upload date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {doc.uploadedAt
                              ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={doc.status} />
                          {doc.verificationNotes && (
                            <p className="text-xs text-gray-400 mt-1 max-w-[160px] truncate" title={doc.verificationNotes}>
                              {doc.verificationNotes}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Preview button */}
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Preview document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Quick Approve */}
                            {!isVerified && (
                              <button
                                onClick={() => {
                                  setReviewDoc(doc);
                                  setReviewNotes(doc.verificationNotes || '');
                                  setSubmitError('');
                                  // directly approve without rejection-note guard
                                  setTimeout(() => {}, 0);
                                  openReview(doc);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                                title="Approve / Reject document"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Review
                              </button>
                            )}

                            {isVerified && (
                              <span className="px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-400 rounded-lg">
                                Done
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setPreviewDoc(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {previewDoc.sourceLabel || formatDocType(previewDoc.documentType)}
                  </h2>
                  <p className="text-sm text-gray-500">{previewDoc.fileName}</p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document preview */}
              <div className="p-6">
                {previewDoc.contentType.startsWith('image/') ? (
                  <img
                    src={previewDoc.filePath}
                    alt={previewDoc.fileName}
                    className="w-full rounded-xl border border-gray-200 object-contain max-h-[400px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : previewDoc.contentType === 'application/pdf' ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">PDF document — open in new tab to view</p>
                    <a
                      href={previewDoc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      Open PDF
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Preview not available for this file type.</p>
                  </div>
                )}

                {/* Meta info */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: 'User', value: `${previewDoc.userName || '—'} (${previewDoc.userEmail || '—'})` },
                    { label: 'Document Type', value: formatDocType(previewDoc.documentType) },
                    { label: 'File Size', value: formatBytes(previewDoc.fileSize) },
                    {
                      label: 'Uploaded',
                      value: previewDoc.uploadedAt
                        ? new Date(previewDoc.uploadedAt).toLocaleString('en-IN')
                        : '—',
                    },
                    { label: 'Current Status', value: STATUS_CONFIG[previewDoc.status]?.label || previewDoc.status },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{item.value}</p>
                    </div>
                  ))}
                </div>

                {previewDoc.verificationNotes && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs text-amber-600 font-semibold mb-1">Verification Notes</p>
                    <p className="text-sm text-amber-800">{previewDoc.verificationNotes}</p>
                  </div>
                )}

                {/* Actions inside preview */}
                {previewDoc.status !== 'verified' && (
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => {
                        setPreviewDoc(null);
                        openReview(previewDoc);
                      }}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Review This Document
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Review / Verdict Modal ── */}
      <AnimatePresence>
        {reviewDoc && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Review Document</h2>
                <button
                  onClick={closeReview}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Document</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {reviewDoc.sourceLabel || formatDocType(reviewDoc.documentType)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">User</span>
                  <span className="text-sm font-semibold text-gray-900">{reviewDoc.userName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Status</span>
                  <StatusBadge status={reviewDoc.status} />
                </div>
              </div>

              {/* Notes textarea */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Notes
                  <span className="text-red-500 ml-0.5">*</span>
                  <span className="text-gray-400 font-normal ml-1">(required for rejection)</span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this document (e.g., document is clear, name matches, or reason for rejection)..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              {submitError && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeReview}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitVerdict('rejected')}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Reject'}
                </button>
                <button
                  onClick={() => submitVerdict('verified')}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Approve'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
