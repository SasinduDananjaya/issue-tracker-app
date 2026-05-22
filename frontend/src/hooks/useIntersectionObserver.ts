import { useEffect, useRef } from "react";

//hook to detect when user scrolls to bottom of list for infinite scrolling
const useIntersectionObserver = (callback: () => void, options: IntersectionObserverInit = { threshold: 0.1 }) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, options]);

  return sentinelRef;
};

export default useIntersectionObserver;
