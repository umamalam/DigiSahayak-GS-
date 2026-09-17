"use client";

import { FC } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  emoji: string;
  title: string;
  count: number;
  href: string;
  gradient: string;
  large?: boolean;
}

const CategoryCard: FC<CategoryCardProps> = ({ emoji, title, count, href, gradient, large }) => {
  return (
    <Link href={href} className="block h-full">
      <div className={`
        relative overflow-hidden rounded-2xl p-6 h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-white/60
        bg-gradient-to-br ${gradient} backdrop-blur-sm group
      `}>
        <div className="absolute inset-0 bg-white/10 opacity-50 group-hover:opacity-30 transition-opacity" />
        
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="flex justify-between items-start">
            <span className="text-[32px] drop-shadow-sm filter leading-none">{emoji}</span>
            <div className="bg-white/40 backdrop-blur-md w-8 h-8 flex items-center justify-center rounded-full shadow-sm group-hover:bg-white/60 transition-colors">
              <ArrowRight className="w-4 h-4 text-gray-800" />
            </div>
          </div>
          
          <div className="mt-3">
            <h3 className="text-lg font-bold text-gray-900 leading-tight tracking-tight group-hover:text-blue-900 transition-colors">{title}</h3>
            <p className="text-xs font-semibold text-gray-700/80 mt-1 uppercase tracking-wider">{count} Schemes</p>
          </div>
        </div>
        
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors duration-700" />
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>
    </Link>
  );
};

export default CategoryCard;
