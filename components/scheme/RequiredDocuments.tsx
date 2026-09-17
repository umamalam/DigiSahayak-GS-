'use client';

import { FileText, AlertCircle } from 'lucide-react';

interface RequiredDocumentsProps {
  documents?: string;
}

export default function RequiredDocuments({ documents }: RequiredDocumentsProps) {
  const defaultDocs = 'Aadhaar • Bank account details • Income certificate • Residential proof';
  const docText = documents || defaultDocs;
  
  const docList = docText
    .split(/[•,]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return (
    <div className="space-y-4">
      <ul className="space-y-2 md:space-y-3 lg:grid lg:grid-cols-2 lg:gap-4">
        {docList.map((doc, idx) => (
          <li key={idx} className="flex gap-3 items-start">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm md:text-base text-gray-700 leading-relaxed">{doc}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3 bg-blue-50 rounded-xl p-4 md:p-5 lg:p-6 border border-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <span className="text-xs md:text-sm text-blue-900 leading-relaxed">
          <strong>Note:</strong> Required documents may vary by state and individual circumstances. Always verify on the official website before submission.
        </span>
      </div>
    </div>
  );
}
