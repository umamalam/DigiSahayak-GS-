"use client";

import { FC } from "react";
import { ArrowRight } from "lucide-react";

const ViewMoreButton: FC = () => {
  return (
    <button className="flex flex-col items-center justify-center w-[100px] h-[120px] rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg shrink-0 group snap-start active:scale-[0.98]">
      <span className="text-xs font-bold mb-1.5 tracking-wide">View More</span>
      <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
};

export default ViewMoreButton;
