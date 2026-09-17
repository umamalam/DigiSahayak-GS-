'use client';

import { ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ApplicationStatusCardProps {
  schemeName: string;
  status: string;
  appliedAt: string;
  onViewClick?: () => void;
}

const statusConfig: Record<string, {
  color: string;
  textColor: string;
  badgeColor: string;
  icon: any;
  buttonText: string;
  label: string;
}> = {
  'submitted': {
    color: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    buttonText: 'View Status',
    label: 'Submitted',
  },
  'under_review': {
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: Clock,
    buttonText: 'View Status',
    label: 'Under Review',
  },
  'approved': {
    color: 'bg-green-50',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    buttonText: 'View Details',
    label: 'Approved',
  },
  'rejected': {
    color: 'bg-red-50',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700',
    icon: AlertCircle,
    buttonText: 'View Details',
    label: 'Rejected',
  },
  'on_hold': {
    color: 'bg-orange-50',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-700',
    icon: AlertCircle,
    buttonText: 'View Details',
    label: 'On Hold',
  },
};

export default function ApplicationStatusCard({
  schemeName,
  status,
  appliedAt,
  onViewClick,
}: ApplicationStatusCardProps) {
  const config = statusConfig[status.toLowerCase()] || statusConfig['submitted'];
  const Icon = config.icon;
  const appliedDate = new Date(appliedAt);
  const formattedDate = appliedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`${config.color} border border-gray-200 rounded-2xl p-4 md:p-5`}>
      <div className="flex items-start gap-4">
        <div className={`${config.textColor} flex-shrink-0`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate mb-1">
            {schemeName}
          </h3>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`${config.badgeColor} text-xs font-semibold px-3 py-1 rounded-full`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-500">
              Applied on {formattedDate}
            </span>
          </div>

          <button
            onClick={onViewClick}
            className={`inline-flex items-center gap-2 text-sm font-semibold ${config.textColor} hover:opacity-80 transition-opacity`}
          >
            {config.buttonText}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
