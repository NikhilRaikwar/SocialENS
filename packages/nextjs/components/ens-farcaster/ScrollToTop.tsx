"use client";

import { useEffect, useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-primary text-primary-content shadow-[0_0_20px_rgba(var(--p),0.5)] hover:shadow-[0_0_30px_rgba(var(--p),0.7)] hover:-translate-y-1 transition-all duration-300 animate-fade-in group"
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="w-6 h-6 group-hover:scale-125 transition-transform" />
    </button>
  );
};
