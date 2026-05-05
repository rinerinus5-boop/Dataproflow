"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ScrollReveal from "../ui/ScrollReveal";

const testimonials = [
  {
    name: "Emma Wilson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    image: "/emma.jpg",
    quote:
      "DataProFlow has transformed how we track our social media performance. The unified dashboard saves us hours every week.",
  },
  {
    name: "Brian Chen",
    role: "Growth Manager",
    company: "ScaleUp Agency",
    image: "/brian.jpg",
    quote:
      "Finally, a tool that brings all our marketing data together. The insights we get are invaluable for our clients.",
  },
  {
    name: "John Martinez",
    role: "Founder & CEO",
    company: "Digital Ventures",
    image: "/jhon.jpg",
    quote:
      "The ease of setup and the quality of visualizations exceeded our expectations. Highly recommend for any marketing team.",
  },
  {
    name: "Sarah Thompson",
    role: "Social Media Manager",
    company: "BrandBoost Co.",
    image: "/emma.jpg",
    quote:
      "I used to spend hours compiling reports from different platforms. DataProFlow does it all automatically. Game changer!",
  },
  {
    name: "Michael Lee",
    role: "Digital Marketing Lead",
    company: "GrowthHive",
    image: "/brian.jpg",
    quote:
      "The real-time analytics and beautiful visualizations help us make faster, smarter decisions for our campaigns.",
  },
  {
    name: "Jessica Adams",
    role: "Agency Owner",
    company: "Pixel Perfect Agency",
    image: "/jhon.jpg",
    quote:
      "Our clients love the reports we generate with DataProFlow. It's professional, clean, and incredibly easy to use.",
  },
  {
    name: "David Kim",
    role: "E-commerce Manager",
    company: "ShopSmart",
    image: "/emma.jpg",
    quote:
      "Tracking our social media ROI has never been easier. DataProFlow connects all our channels in one beautiful dashboard.",
  },
];

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slidesPerView = 3;
  const totalSlides = Math.ceil(testimonials.length / slidesPerView);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const getVisibleTestimonials = () => {
    const start = currentSlide * slidesPerView;
    return testimonials.slice(start, start + slidesPerView);
  };

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Customer <span className="text-primary">Reviews</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="mt-6 text-lg text-muted-foreground">
              See what our customers are saying about DataProFlow
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={200}>
          <div className="mt-16 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500">
              {getVisibleTestimonials().map((testimonial, index) => (
                <div
                  key={`${currentSlide}-${index}`}
                  className="group bg-secondary rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 h-full flex flex-col"
                  style={{
                    animation: "fadeInUp 0.5s ease-out forwards",
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                      <p className="text-sm text-primary">{testimonial.company}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed flex-1">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-3 mt-10">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === index
                      ? "bg-primary w-8"
                      : "bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
