import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SchemeCardProps {
  scheme: {
    id: number;
    title: string;
    ministry: string;
    description: string;
  };
}

export default function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <Link href={`/scheme/${scheme.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#4568F0]/30 hover:shadow-md transition-all">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-[#4568F0]/10 to-[#4568F0]/5 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🏛️</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
              {scheme.title}
            </h3>
            <p className="text-xs text-gray-500 mb-2">{scheme.ministry}</p>
            <p className="text-xs text-gray-600 line-clamp-2">
              {scheme.description}
            </p>
          </div>
          <div className="flex-shrink-0 self-center">
            <ArrowRight className="w-5 h-5 text-[#4568F0]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
