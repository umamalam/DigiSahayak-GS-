'use client';

import { useState } from 'react';
import SupportModal from './SupportModal';

interface SupportModalWrapperProps {
  schemeId: number;
  schemeName: string;
}

export default function SupportModalWrapper({ schemeId, schemeName }: SupportModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Contact Support
      </button>
      <SupportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        schemeId={schemeId}
        schemeName={schemeName}
      />
    </>
  );
}
