'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle2, CreditCard, Wallet, FileText, Home, Users, Camera, Car, Vote, Plane } from 'lucide-react';

interface UserDocument {
  id: number;
  documentType: string;
  sourceLabel?: string | null;
  filePath: string;
  status: string;
}

interface RequiredDocumentsInteractiveProps {
  requiredDocuments: string;
  schemeId: number;
}

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  'aadhaar': 'aadhaar',
  'aadhar': 'aadhaar',
  'pan': 'pan',
  'pan card': 'pan',
  'passbook': 'passbook',
  'bank passbook': 'passbook',
  'income': 'income',
  'income certificate': 'income',
  'land': 'land',
  'land document': 'land',
  'address': 'address',
  'address proof': 'address',
  'caste': 'caste',
  'caste certificate': 'caste',
  'ration': 'ration',
  'ration card': 'ration',
  'photo': 'photo',
  'photograph': 'photo',
  'passport': 'passport',
  'driving license': 'driving_license',
  'voter id': 'voter_id',
  'voter card': 'voter_id',
};

const DOCUMENT_ICONS: Record<string, React.ComponentType<any>> = {
  'aadhaar': CreditCard,
  'pan': CreditCard,
  'passbook': Wallet,
  'income': FileText,
  'land': FileText,
  'address': Home,
  'caste': FileText,
  'ration': Wallet,
  'photo': Camera,
  'driving_license': Car,
  'voter_id': Vote,
  'passport': Plane,
};

function normalizeDocumentType(docName: string): string {
  const normalized = docName.toLowerCase().trim();
  
  // Direct match
  if (DOCUMENT_TYPE_MAP[normalized]) {
    return DOCUMENT_TYPE_MAP[normalized];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(DOCUMENT_TYPE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // No match found - create normalized key from the document name
  return normalized
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

export default function RequiredDocumentsInteractive({ requiredDocuments, schemeId }: RequiredDocumentsInteractiveProps) {
  const [userDocs, setUserDocs] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Split by bullet points (•) or newlines (\n) to handle both formats
  const docs = requiredDocuments
    .split(/[•\n]/)
    .map(d => d.trim())
    .filter(d => d.length > 0);

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      const response = await fetch('/api/documents/user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDocs(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = (docType: string) => {
    fileInputRefs.current[docType]?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, docType: string, originalLabel: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingDoc(docType);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);
      formData.append('sourceLabel', originalLabel);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh documents
        await fetchUserDocuments();
        // Reset file input
        if (fileInputRefs.current[docType]) {
          fileInputRefs.current[docType]!.value = '';
        }
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const isDocumentUploaded = (docName: string): boolean => {
    const normalizedDocType = normalizeDocumentType(docName);
    
    // Check if user has uploaded this document (exact match on normalized type)
    const hasExactMatch = userDocs.some(doc => doc.documentType === normalizedDocType);
    if (hasExactMatch) return true;
    
    // Also check source label for flexible matching
    const hasSourceMatch = userDocs.some(doc => 
      doc.sourceLabel && doc.sourceLabel.toLowerCase().includes(docName.toLowerCase())
    );
    return hasSourceMatch;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  const getDocumentIcon = (docType: string) => {
    return DOCUMENT_ICONS[docType] || FileText;
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {docs.map((doc, i) => {
        const docType = normalizeDocumentType(doc);
        const isUploaded = isDocumentUploaded(doc);
        const isUploading = uploadingDoc === docType;
        const IconComponent = getDocumentIcon(docType);

        return (
          <div
            key={i}
            className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
              isUploaded
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50/50 border-red-200/50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isUploaded ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <IconComponent className={`w-5 h-5 ${
                  isUploaded ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{doc}</p>
                <p className={`text-xs ${
                  isUploaded ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isUploaded ? '✓ Uploaded' : 'Not uploaded'}
                </p>
              </div>
            </div>

            {/* Action Button - Always shown */}
            <div className="flex-shrink-0">
              <button
                onClick={() => handleUploadClick(docType)}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {isUploaded ? 'Re-upload' : 'Upload'}
                  </>
                )}
              </button>
              <input
                ref={(el) => { fileInputRefs.current[docType] = el; }}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => handleFileChange(e, docType, doc)}
                className="hidden"
              />
            </div>
          </div>
        );
      })}

      {/* Upload Info */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Tip:</strong> Upload all documents once and use them for any scheme application.
          </span>
        </p>
      </div>
    </div>
  );
}
