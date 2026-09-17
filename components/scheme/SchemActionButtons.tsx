'use client';

import { useState, useCallback } from 'react';
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-2xl">
        <div className="max-w-sm md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto flex gap-3">
          <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg active:scale-95">
            Apply Now
          </button>
          <button 
            onClick={handleOpenHelp}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all active:scale-95"
          >
            Get Help & Support
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
