'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface SimilarScheme {
  id: number;
  title: string;
  ministry: string;
  description: string;
}

interface SimilarSchemesProps {
  schemes?: SimilarScheme[];
}

const SAMPLE_SCHEMES: SimilarScheme[] = [
  {
    id: 1,
    title: 'Kisan Credit Card',
    ministry: 'Ministry of Agriculture',
    description: 'Easy credit access for agriculture needs',
  },
  {
    id: 2,
    title: 'Pradhan Mantri Fasal Bima',
    ministry: 'Ministry of Agriculture',
    description: 'Crop insurance scheme for farmers',
  },
  {
    id: 3,
    title: 'Soil Health Card',
    ministry: 'Ministry of Agriculture',
    description: 'Free soil testing and health cards',
  },
];

export default function SimilarSchemes({ schemes = SAMPLE_SCHEMES }: SimilarSchemesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-[#4568F0]" />
        <h3 className="font-bold text-lg text-gray-900">Similar Schemes You Might Like</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.slice(0, 3).map((scheme, idx) => (
          <Link
            key={idx}
            href={`/scheme/${scheme.id}`}
            className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-[#4568F0] rounded-xl p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{scheme.ministry}</p>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#4568F0] transition-colors mt-1">
                  {scheme.title}
                </h4>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#4568F0] flex-shrink-0 transition-colors group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{scheme.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
