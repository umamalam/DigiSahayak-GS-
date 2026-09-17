"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

interface SchemeCardProps {
  id: number;
  title: string;
  ministry: string;
  description: string;
  imageUrl?: string | null;
}

const SchemeCard: FC<SchemeCardProps> = ({ id, title, ministry, description, imageUrl }) => {
  const finalImageUrl = imageUrl || '/stock_images/indian_farmer_agricu_646481f5.jpg';

  return (
    <Link href={`/scheme/${id}`}>
      <div className="w-[200px] h-[120px] relative rounded-2xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-gray-100 shrink-0 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98] group snap-start bg-gray-100">
        <Image 
          src={finalImageUrl}
          alt={title}
          fill
          className="object-cover"
          loading="lazy"
          sizes="200px"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm tracking-tight line-clamp-2 drop-shadow-sm">
              {title}
            </h3>
          </div>
          <div className="text-white/80 text-xs line-clamp-1 drop-shadow-sm">
            {ministry}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SchemeCard;
