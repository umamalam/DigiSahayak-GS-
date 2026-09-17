import { CheckCircle2 } from 'lucide-react';

interface BenefitListProps {
  text: string;
}

export default function BenefitList({ text }: BenefitListProps) {
  // Parse benefits - split only by bullet points, not newlines
  const benefits = text
    .split(/[•]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  if (benefits.length <= 1) {
    return (
      <div className="flex gap-3 items-start">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
        <span className="text-sm md:text-base text-gray-700 leading-relaxed">{text}</span>
      </div>
    );
  }

  return (
    <ul className="space-y-2 md:space-y-3 lg:grid lg:grid-cols-2 lg:gap-4">
      {benefits.map((benefit, idx) => (
        <li key={idx} className="flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm md:text-base text-gray-700 leading-relaxed">{benefit}</span>
        </li>
      ))}
    </ul>
  );
}
