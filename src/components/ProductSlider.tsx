import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/contexts/CartContext';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';

interface ProductSliderProps {
  products: Product[];
  title: string;
}

export const ProductSlider = ({ products, title }: ProductSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const next = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <div className="relative py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12 text-gold">
          {title}
        </h2>

        <div className="relative">
          {/* Navigation Buttons */}
          {products.length > itemsPerView && (
            <>
              <Button
                onClick={prev}
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full bg-background/90 border-gold/50 hover:bg-gold hover:text-primary backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={next}
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full bg-background/90 border-gold/50 hover:bg-gold hover:text-primary backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Slider Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {products.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-gold w-8'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
