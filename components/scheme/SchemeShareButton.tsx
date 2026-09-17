'use client';

import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SchemeShareButtonProps {
  title: string;
  url: string;
}

export default function SchemeShareButton({ title, url }: SchemeShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    // Build absolute URL if relative path provided
    const absoluteUrl = url.startsWith('http') 
      ? url 
      : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this scheme: ${title}`,
          url: absoluteUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy absolute URL to clipboard
      navigator.clipboard.writeText(absoluteUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all"
      title="Share this scheme"
    >
      {showCopied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
