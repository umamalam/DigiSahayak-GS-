'use client';

import { TrendingUp, Check, AlertCircle } from 'lucide-react';

interface EligibilityScoreProps {
  schemeName?: string;
  score?: number;
  eligibilityStatus?: 'eligible' | 'partial' | 'ineligible';
  reasons?: string[];
}

export default function EligibilityScoreCard({
  schemeName = 'PM-KISAN',
  score = 75,
  eligibilityStatus = 'partial',
  reasons = [
    'Land area: ✓ Matches requirement',
    'Income: ✓ Below limit',
    'Farmer status: ⚠ Needs verification',
    'Residency: ✓ Indian resident',
  ],
}: EligibilityScoreProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'from-green-400 to-emerald-500';
      case 'partial':
        return 'from-yellow-400 to-amber-500';
      case 'ineligible':
        return 'from-red-400 to-rose-500';
      default:
        return 'from-[#4568F0] to-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'eligible':
        return '✓ Fully Eligible';
      case 'partial':
        return '⚠ Partially Eligible';
      case 'ineligible':
        return '✗ Not Eligible';
      default:
        return 'Check Eligibility';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      case 'ineligible':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`rounded-3xl border-2 p-6 ${getStatusBgColor(eligibilityStatus)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-600">Eligibility Score</p>
          <h3 className="text-lg font-bold text-gray-900">{schemeName}</h3>
        </div>
        <TrendingUp className="w-6 h-6 text-[#4568F0]" />
      </div>

      {/* Score Circle */}
      <div className="mb-6">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`text-${
                eligibilityStatus === 'eligible'
                  ? 'green'
                  : eligibilityStatus === 'ineligible'
                    ? 'red'
                    : 'yellow'
              }-500 transition-all duration-500`}
              strokeDasharray={`${(score / 100) * 283} 283`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{score}%</p>
              <p className="text-xs text-gray-600">Match</p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm font-semibold text-gray-900">{getStatusText(eligibilityStatus)}</p>
      </div>

      {/* Eligibility Reasons */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-900 mb-3">Your Status:</p>
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <div className="mt-0.5 flex-shrink-0">
              {reason.includes('✓') ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : reason.includes('⚠') ? (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-red-300" />
              )}
            </div>
            <p className="text-gray-700">
              {reason.replace(/^[✓⚠✗]/, '').trim()}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="w-full mt-4 bg-gradient-to-r from-[#4568F0] to-blue-500 hover:shadow-lg text-white font-medium py-3 rounded-xl transition-all">
        Apply Now
      </button>
    </div>
  );
}
