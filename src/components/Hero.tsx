import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import logoWatermark from '@/assets/logo-watermark.png';

export const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = Math.max(0, 1 - scrollY / 500);
  const scale = Math.max(0.8, 1 - scrollY / 1000);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden grain-texture">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 text-center px-4"
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div className="mb-12 animate-fade-in flex justify-center">
          <img
            src="/images/logo-diana-new.png"
            alt="Diana Beauty"
            className="w-full max-w-3xl object-contain opacity-90 hover:scale-105 transition-transform duration-700"
          />
        </div>
        <p className="text-lg md:text-xl text-cream/90 max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          L'Art du Parfum. L'Excellence du Skincare.
        </p>

        <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#bestsellers"
              className="px-8 py-4 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-full transition-all duration-300"
            >
              Découvrir la Collection
            </a>
            <a
              href="#about"
              className="px-8 py-4 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold rounded-full transition-all duration-300"
            >
              Notre Histoire
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ opacity }}
      >
        <ChevronDown className="w-8 h-8 text-foreground/60" />
      </div>
    </section>
  );
};
