'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface DocumentListProps {
  documents?: string[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  const defaultDocs = [
    'Government ID (Aadhaar/PAN)',
    'Bank Account Details',
    'Income Certificate',
    'Residential Proof',
  ];

  const docList = documents && documents.length > 0 ? documents : defaultDocs;

  return (
    <div className="space-y-3">
      {docList.map((doc, idx) => (
        <div key={idx} className="flex gap-3 items-start bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700">{doc}</span>
        </div>
      ))}
      <div className="flex gap-3 items-start bg-amber-50 rounded-xl p-3 border border-amber-200 mt-4">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <span className="text-xs text-amber-900">
          Required documents may vary. Always verify on the official website before submission.
        </span>
      </div>
    </div>
  );
}
