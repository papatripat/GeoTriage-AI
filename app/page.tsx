import Link from 'next/link';

export default function Home() {
  const features = [
    'Protect Nature',
    'Report Properly',
    'AI-Powered Tracking',
    'Save Lives',
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=80&w=400', // Flood
    'https://images.unsplash.com/photo-1602980068989-cb21ea5dcbc9?auto=format&fit=crop&q=80&w=400', // Fire
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400', // Rubble
    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=400', // Storm
    'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&q=80&w=400', // Landslide
    'https://images.unsplash.com/photo-1469125155630-7ed37e065743?auto=format&fit=crop&q=80&w=400', // Nature / Aftermath
  ];

  return (
    <div className="relative min-h-screen bg-[#060a11] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 md:pt-32 max-w-5xl mx-auto flex-1 justify-center w-full">
        
        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold tracking-widest text-blue-400">⚡ PROJECT GEOTRIAGE</span>
        </div>

        {/* Big Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold tracking-tight text-white leading-tight md:leading-[1.1] mb-6">
          Your Quick <span className="inline-flex align-middle mx-2 rounded-2xl bg-white/10 border border-white/20 p-2 shadow-2xl backdrop-blur-md w-14 h-14 md:w-20 md:h-20 items-center justify-center"><img src="/logo.png" alt="Icon" className="w-full h-full object-cover rounded-xl" /></span> Actions<br />
          Can Help Indonesia<br />
          <span className="text-blue-400">Stay Safe & Prepared</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base md:text-lg text-gray-400 mb-10 leading-relaxed">
          Report disasters properly and help us protect the community.<br className="hidden md:block" />
          Snap a photo, let AI identify it, and map it for a better future.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
          <Link 
            href="/lapor" 
            className="rounded-full bg-blue-600 px-8 py-4 text-sm md:text-base font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
          >
            START REPORTING
          </Link>
          <Link 
            href="/dashboard"
            className="text-sm md:text-base font-bold text-white flex items-center gap-2 hover:text-blue-400 transition-colors"
          >
            SEE HOW IT WORKS <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Features list */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-t border-white/10 pt-8 w-full max-w-3xl">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery Row */}
      <div className="w-full overflow-hidden mt-16 pb-8 md:mt-24 md:pb-12">
        <div className="flex gap-4 px-4 w-full justify-center group">
          {galleryImages.map((src, i) => (
            <div key={i} className="w-32 md:w-56 h-24 md:h-36 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0 transition-all duration-500 filter grayscale opacity-60 group-hover:opacity-100 hover:!grayscale-0 hover:!opacity-100 cursor-pointer">
               <img src={src} alt="Disaster Scene" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
