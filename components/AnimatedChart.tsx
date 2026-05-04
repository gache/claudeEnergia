"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface AnimatedChartProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedChart({ children, delay = 0 }: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const delayStyle = {
    animationDelay: `${delay}ms`,
  } as React.CSSProperties;

  return (
    <div
      ref={elementRef}
      className={`opacity-0 ${isVisible ? "animate-slide-up" : ""}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}
