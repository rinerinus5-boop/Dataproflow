"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
}

interface ImageSliderProps {
  slides: Slide[];
  autoSlideInterval?: number;
  className?: string;
}

export default function ImageSlider({
  slides,
  autoSlideInterval = 5000,
  className = "",
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(goToNext, autoSlideInterval);
    return () => clearInterval(interval);
  }, [goToNext, autoSlideInterval]);

  // Handle image load state
  const handleImageLoad = (index: number) => {
    setIsLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-[#1a1f3c] shadow-2xl ${className}`}>
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="w-full shrink-0 relative aspect-[4/3]"
          >
            {/* Skeleton loader */}
            {!isLoaded[index] && (
              <div className="absolute inset-0 bg-[#1a1f3c] animate-pulse rounded-3xl" />
            )}
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
              className={`object-cover object-center rounded-3xl transition-opacity duration-300 ${
                isLoaded[index] ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => handleImageLoad(index)}
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}
