import { XCircle } from 'lucide-react';

interface NotEligibleListProps {
  text: string;
}

export default function NotEligibleList({ text }: NotEligibleListProps) {
  const items = text
    .split(/[•]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  if (items.length <= 1) {
    return (
      <div className="flex gap-3 items-start">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <span className="text-sm md:text-base text-gray-700 leading-relaxed">{text}</span>
      </div>
    );
  }

  return (
    <ul className="space-y-2 md:space-y-3 lg:grid lg:grid-cols-2 lg:gap-4">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-3 items-start">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm md:text-base text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
