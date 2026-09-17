'use client';

import { Clock, Calendar, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SchemeStatsBarProps {
  processingTime?: string;
  validity?: string;
  launchYear?: string;
}

interface Stat {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

export default function SchemeStatsBar({
  processingTime,
  validity,
  launchYear,
}: SchemeStatsBarProps) {
  const stats: Stat[] = [];

  if (processingTime) {
    stats.push({ icon: Clock, label: 'Processing', value: processingTime, color: 'from-blue-500 to-blue-600' });
  }
  if (validity) {
    stats.push({ icon: Calendar, label: 'Validity', value: validity, color: 'from-emerald-500 to-emerald-600' });
  }
  if (launchYear) {
    stats.push({ icon: Zap, label: 'Launched', value: launchYear, color: 'from-purple-500 to-purple-600' });
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white shadow-md hover:shadow-lg transition-shadow`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3.5 h-3.5 opacity-90" />
              <span className="text-xs font-medium opacity-90">{stat.label}</span>
            </div>
            <p className="text-sm font-bold truncate">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
