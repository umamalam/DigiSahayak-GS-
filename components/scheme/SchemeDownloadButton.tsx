'use client';

import { Download } from 'lucide-react';

interface SchemeDownloadButtonProps {
  schemeName: string;
  pdfUrl?: string | null;
}

export default function SchemeDownloadButton({ schemeName, pdfUrl }: SchemeDownloadButtonProps) {
  if (!pdfUrl) {
    return null; // Don't show button if no PDF available
  }

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title={`Download ${schemeName} guidelines`}
    >
      <Download className="w-5 h-5 text-gray-600" />
    </a>
  );
}
