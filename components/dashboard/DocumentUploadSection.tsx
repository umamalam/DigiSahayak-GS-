'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, FileCheck, Check, X } from 'lucide-react';

const DOCUMENT_TYPES = [
  { display: 'Aadhaar Card', apiType: 'aadhaar', icon: '🆔' },
  { display: 'PAN Card', apiType: 'pan', icon: '📄' },
  { display: 'Voter ID', apiType: 'voter_id', icon: '🗳️' },
  { display: 'Passport', apiType: 'passport', icon: '✈️' },
  { display: 'Driving License', apiType: 'driving_license', icon: '🚗' },
  { display: 'Bank Passbook', apiType: 'passbook', icon: '🏦' },
  { display: 'Income Certificate', apiType: 'income', icon: '💼' },
  { display: 'Ration Card', apiType: 'ration', icon: '🍚' },
  { display: 'Caste Certificate', apiType: 'caste', icon: '📋' },
];

interface UploadedDoc {
  id: number;
  documentType: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  status: string;
  uploadedAt: Date;
}

export default function DocumentUploadSection() {
  const [uploadedDocs, setUploadedDocs] = useState<Map<string, UploadedDoc>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    fetch('/api/documents/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const docsMap = new Map<string, UploadedDoc>();
        (data.documents || []).forEach((doc: UploadedDoc) => {
          docsMap.set(doc.documentType, doc);
        });
        setUploadedDocs(docsMap);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch documents:', err);
        setIsLoading(false);
      });
  };

  const handleFileSelected = async (file: File) => {
    if (!selectedDocType) return;

    setUploading(selectedDocType);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', selectedDocType);

    try {
      setUploadProgress(30); // Show progress
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      setUploadProgress(70);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      setUploadProgress(100);

      // Refresh documents list
      await fetchDocuments();

      setShowModal(false);
      setSelectedDocType(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">Loading documents...</p>
      </div>
    );
  }

  const uploadedCount = uploadedDocs.size;
  const totalCount = DOCUMENT_TYPES.length;
  const remainingCount = totalCount - uploadedCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="w-5 h-5 text-[#4568F0]" />
        <h3 className="font-semibold text-gray-900">Your Documents</h3>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-[#4568F0]/5 to-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-600">Documents Uploaded</p>
            <p className="text-lg font-bold text-gray-900">{uploadedCount}/{totalCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Remaining</p>
            <p className="text-lg font-bold text-red-600">{remainingCount}</p>
          </div>
        </div>
        <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#4568F0] to-blue-500 h-full transition-all duration-300"
            style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-3">
        {DOCUMENT_TYPES.map(({ display, apiType, icon }) => {
          const isUploading = uploading === apiType;
          const isUploaded = uploadedDocs.has(apiType);
          const doc = uploadedDocs.get(apiType);

          return (
            <div
              key={apiType}
              className={`rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                isUploaded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-medium text-sm text-gray-900">{display}</p>
                  <p className="text-xs text-gray-600">
                    {isUploaded ? `✓ ${doc?.fileName || 'Uploaded'}` : 'Not uploaded'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isUploaded ? (
                  <div className="flex items-center gap-2">
                    {doc?.filePath && (
                      <a
                        href={doc.filePath}
                        download={doc.fileName}
                        className="text-[#4568F0] hover:text-[#3a56d4] transition-colors"
                        title="Download document"
                      >
                        <span className="text-xl">📥</span>
                      </a>
                    )}
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDocType(apiType);
                      setShowModal(true);
                    }}
                    disabled={isUploading}
                    className="bg-[#4568F0] hover:bg-[#3a56d4] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-900">
          💡 <strong>Tip:</strong> Upload all documents once and use them for any scheme application.
        </p>
      </div>

      {/* Footer */}
      {remainingCount > 0 && (
        <p className="text-sm text-gray-600 text-center">
          You still need <strong className="text-red-600">{remainingCount} document{remainingCount !== 1 ? 's' : ''}</strong> to apply for schemes.
        </p>
      )}

      {/* Upload Modal */}
      {showModal && selectedDocType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Upload {DOCUMENT_TYPES.find(d => d.apiType === selectedDocType)?.display}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {uploading && uploadProgress > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-2">Uploading... {uploadProgress}%</p>
                  <div className="bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={openFileSelector}
                disabled={uploading !== null}
                className="w-full bg-[#4568F0] hover:bg-[#3a56d4] disabled:opacity-50 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-5 h-5" />
                Choose from Device
              </button>

              <button
                onClick={openCamera}
                disabled={uploading !== null}
                className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-900 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-xl">📷</span>
                Take Photo with Camera
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
