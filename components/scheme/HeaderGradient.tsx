import Image from 'next/image';

interface HeaderGradientProps {
  ministry: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function HeaderGradient({
  ministry,
  title,
  description,
  imageUrl,
}: HeaderGradientProps) {
  return (
    <div className="relative w-full bg-gradient-to-br from-[#4568F0] via-[#5A78FF] to-[#6B87FF] rounded-3xl shadow-xl overflow-hidden mb-8 md:mb-10 lg:mb-12 md:min-h-64 lg:min-h-72">
      {/* Background Image with Premium Overlay */}
      {imageUrl && (
        <div className="absolute inset-0 opacity-25">
          <Image
            src={imageUrl}
            alt="scheme"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#4568F0]/20 to-[#2c3aa1]/30 pointer-events-none"></div>

      {/* Content */}
      <div className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 text-white h-full flex flex-col justify-center">
        {/* Ministry Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20 w-fit">
          <span className="text-xl">🏛️</span>
          <span className="text-xs font-semibold opacity-95">{ministry}</span>
        </div>

        {/* Title - Premium Typography */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Description - Premium Typography */}
        <p className="text-base md:text-lg lg:text-xl leading-relaxed opacity-95 max-w-3xl font-light">
          {description}
        </p>
      </div>
    </div>
  );
}
