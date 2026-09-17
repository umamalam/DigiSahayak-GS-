import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  bgColor?: string;
}

export default function SectionCard({
  title,
  icon: Icon,
  children,
  bgColor = 'bg-white',
}: SectionCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl shadow-sm border border-gray-100 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 hover:shadow-md transition-all duration-200`}>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-5 md:mb-6 lg:mb-7 flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-[#4568F0] flex-shrink-0" />}
        <span>{title}</span>
      </h2>
      <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-1">{children}</div>
    </div>
  );
}
