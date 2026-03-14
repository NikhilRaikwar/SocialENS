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
      className="fixed bottom-24 right-6 z-[90] p-3 rounded-full bg-primary/80 backdrop-blur-md text-primary-content shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 animate-fade-in group border border-white/20 active:scale-95"
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
};
