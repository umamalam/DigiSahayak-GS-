interface TimelineStepsProps {
  text: string;
}

export default function TimelineSteps({ text }: TimelineStepsProps) {
  // Parse steps - split by newlines or "Step X:" pattern
  const steps = text
    .split(/[\n]|Step \d+:?/i)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  if (steps.length <= 1) {
    return <div className="text-sm md:text-base text-gray-700 leading-relaxed">{text}</div>;
  }

  return (
    <div className="space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex gap-4 relative pb-6 md:pb-8 lg:pb-0">
          {/* Timeline Circle */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4568F0] to-[#5A78FF] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md border-4 border-white">
              {idx + 1}
            </div>
            {/* Timeline Line */}
            {idx < steps.length - 1 && (
              <div className="w-1 h-12 bg-gradient-to-b from-[#4568F0] to-gray-200 mt-2 lg:hidden"></div>
            )}
          </div>

          {/* Step Content */}
          <div className="pt-2 pb-4">
            <p className="text-sm font-medium text-gray-900 mb-1">Step {idx + 1}</p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">{step}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
