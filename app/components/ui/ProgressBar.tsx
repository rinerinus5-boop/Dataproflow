"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setIsVisible(true);
      setProgress(0);
      
      // Animate progress
      const timer1 = setTimeout(() => setProgress(30), 50);
      const timer2 = setTimeout(() => setProgress(60), 150);
      const timer3 = setTimeout(() => setProgress(80), 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    };

    const handleComplete = () => {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    };

    handleStart();
    const completeTimer = setTimeout(handleComplete, 400);

    return () => clearTimeout(completeTimer);
  }, [pathname, searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
