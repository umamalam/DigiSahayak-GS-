'use client';

import { User, Phone, FileText, Award } from 'lucide-react';

interface UserProfileProps {
  name?: string;
  mobile?: string;
  memberSince?: string;
  schemesEligible?: number;
  totalSchemes?: number;
  documentsUploaded?: number;
  totalDocuments?: number;
}

export default function UserProfileCard({ 
  name = 'Rajesh Kumar', 
  mobile = '+91 98765 43210',
  memberSince,
  schemesEligible = 0,
  totalSchemes = 0,
  documentsUploaded = 0,
  totalDocuments = 9
}: UserProfileProps) {
  // Format date to show month and year
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nov 2024';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return 'Nov 2024';
    }
  };

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-[#4568F0] to-[#5A78FF] p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Member Since</p>
            <p className="text-sm font-semibold">{formatDate(memberSince)}</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1">{name}</h2>
        <p className="text-sm opacity-90">Active User</p>
      </div>

      {/* Content */}
      <div className="bg-white p-6 space-y-4">
        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#4568F0]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Mobile Number</p>
              <p className="text-sm font-semibold text-gray-900">{mobile}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Documents Uploaded</p>
              <p className="text-sm font-semibold text-gray-900">{documentsUploaded} of {totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
            <Award className="w-5 h-5 text-[#4568F0] mx-auto mb-1" />
            <p className="text-xs text-gray-600">Schemes Eligible</p>
            <p className="text-lg font-bold text-gray-900">{schemesEligible}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center">
            <FileText className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Total Schemes</p>
            <p className="text-lg font-bold text-gray-900">{totalSchemes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
