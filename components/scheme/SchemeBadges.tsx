'use client';

interface SchemeBadgesProps {
  isPopular?: boolean;
  isActive?: boolean;
  category?: string;
}

export default function SchemeBadges({
  isPopular = true,
  isActive = true,
  category,
}: SchemeBadgesProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {isPopular && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
          ⭐ Popular
        </span>
      )}

      {isActive && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          ✓ Active
        </span>
      )}

      {category && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
          {category.substring(0, 15)}
        </span>
      )}
    </div>
  );
}
