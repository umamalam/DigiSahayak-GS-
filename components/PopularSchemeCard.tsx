"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PopularSchemeCardProps {
  id: number;
  title: string;
  ministry: string;
  description: string;
  imageUrl?: string | null;
}

const PopularSchemeCard: FC<PopularSchemeCardProps> = ({ id, title, ministry, description, imageUrl }) => {
  return (
    <Link href={`/scheme/${id}`}>
      <div className="w-[280px] h-[220px] relative rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white p-6 flex flex-col justify-between border border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3">
            {ministry}
          </p>
          <p className="text-sm text-slate-600 line-clamp-2">
            {description}
          </p>
        </div>
        
        <div className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all group-hover:text-blue-700">
          View Details <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default PopularSchemeCard;
