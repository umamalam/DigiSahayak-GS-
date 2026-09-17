'use client';

import { FileText, Check, AlertTriangle, AlertCircle } from 'lucide-react';

interface DocumentStatusIndicatorProps {
  documents?: Array<{ name: string; status: 'uploaded' | 'partial' | 'missing' }>;
}

const DEFAULT_DOCS = [
  { name: 'Aadhaar', status: 'missing' as const },
  { name: 'PAN Card', status: 'missing' as const },
  { name: 'Bank Passbook', status: 'missing' as const },
  { name: 'Income Certificate', status: 'missing' as const },
  { name: 'Land Records', status: 'missing' as const },
  { name: 'Address Proof', status: 'missing' as const },
  { name: 'Mobile Linked to Aadhaar', status: 'missing' as const },
];

export default function DocumentStatusIndicator({
  documents = DEFAULT_DOCS,
}: DocumentStatusIndicatorProps) {
  const uploadedCount = documents.filter(d => d.status === 'uploaded').length;
  const partialCount = documents.filter(d => d.status === 'partial').length;
  const missingCount = documents.filter(d => d.status === 'missing').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'missing':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      case 'missing':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200 hover:shadow-sm transition-all">
          <p className="text-2xl font-bold text-green-600">{uploadedCount}</p>
          <p className="text-xs font-semibold text-green-700 mt-1">Uploaded</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200 hover:shadow-sm transition-all">
          <p className="text-2xl font-bold text-yellow-600">{partialCount}</p>
          <p className="text-xs font-semibold text-yellow-700 mt-1">Partial</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200 hover:shadow-sm transition-all">
          <p className="text-2xl font-bold text-red-600">{missingCount}</p>
          <p className="text-xs font-semibold text-red-700 mt-1">Missing</p>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <div key={idx} className={`flex items-center justify-between gap-3 rounded-lg p-3 border ${getStatusColor(doc.status)}`}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{doc.name}</span>
            </div>
            {getStatusIcon(doc.status)}
          </div>
        ))}
      </div>

      {/* Action Note */}
      {missingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-900 font-medium">
            <strong>Upload Required:</strong> You still need {missingCount} document{missingCount !== 1 ? 's' : ''} to apply for this scheme. Visit your dashboard to upload them.
          </p>
        </div>
      )}
    </div>
  );
}
