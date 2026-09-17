'use client';

import { useState, useCallback, memo } from 'react';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

interface HelpModalWrapperProps {
  schemeName: string;
}

function HelpModalWrapper({ schemeName }: HelpModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full bg-white border-2 border-[#4568F0] text-[#4568F0] hover:bg-blue-50 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        <HelpCircle className="w-5 h-5" />
        Get Help & Support
      </button>
      <HelpModal
        isOpen={isOpen}
        onClose={handleClose}
        schemeName={schemeName}
      />
    </>
  );
}

export default memo(HelpModalWrapper);
