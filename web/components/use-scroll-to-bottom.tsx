"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollToBottom<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      if (scrollBottom > 200) {
        setShouldAutoScroll(false);
      } else if (scrollBottom < 10) {
        setShouldAutoScroll(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!shouldAutoScroll || !endRef.current) return;

    endRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  });

  return [containerRef, endRef] as const;
}
