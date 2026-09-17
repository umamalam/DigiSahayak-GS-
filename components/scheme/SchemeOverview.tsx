import { Building2 } from 'lucide-react';

interface SchemeOverviewProps {
  ministry?: string;
  description?: string;
}

export default function SchemeOverview({
  ministry,
  description,
}: SchemeOverviewProps) {
  const overviewItems = [
    ...(ministry ? [{ icon: Building2, label: 'Ministry', value: ministry }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Description */}
      {description && (
        <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">
          {description}
        </p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {overviewItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex gap-3 items-start bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-all"
            >
              <Icon className="w-5 h-5 text-[#4568F0] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
