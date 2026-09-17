'use client';

import { useState, useCallback } from 'react';
import { HelpCircle, CheckCircle } from 'lucide-react';
import HelpModal from './HelpModal';

interface SchemeActionButtonsProps {
  schemeName: string;
}

export default function SchemeActionButtons({ schemeName }: SchemeActionButtonsProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  return (
    <>
      <div className="bg-gradient-to-b from-white/50 to-white border-t-2 border-blue-100 mt-8 md:mt-10 lg:mt-12 py-4 md:py-5">
        <div className="flex gap-3 md:gap-4">
          <button 
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-semibold text-sm md:text-base transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <CheckCircle className="w-5 h-5" />
            Apply Now
          </button>
          <button 
            onClick={handleOpenHelp}
            className="flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 hover:text-indigo-800 rounded-2xl font-semibold text-sm md:text-base border border-indigo-200 hover:border-indigo-300 transition-all hover:shadow-md active:scale-95"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Get Help</span>
            <span className="sm:hidden">Help</span>
          </button>
        </div>
      </div>

      <HelpModal
        isOpen={isHelpOpen}
        onClose={handleCloseHelp}
        schemeName={schemeName}
      />
    </>
  );
}
