import { Download, FileText } from 'lucide-react';

interface PdfDownloadProps {
  schemeName?: string;
  pdfUrl?: string | null;
}

export default function PdfDownload({
  schemeName = 'Government Scheme',
  pdfUrl,
}: PdfDownloadProps) {
  if (!pdfUrl) {
    return (
      <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200">
        💡 <strong>Note:</strong> Official PDF guidelines are coming soon. Please check the official website for detailed information.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600">Official Guidelines</p>
            <p className="text-sm font-bold text-gray-900">{schemeName}</p>
          </div>
        </div>
        <Download className="w-5 h-5 text-orange-600 group-hover:translate-y-1 transition-transform" />
      </a>

      {/* Info Note */}
      <div className="text-xs text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-200">
        💡 <strong>Tip:</strong> Download the official guidelines PDF to understand all the requirements and step-by-step application process for this scheme.
      </div>
    </div>
  );
}
