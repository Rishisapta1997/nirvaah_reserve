"use client";

import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useRef } from "react";

export function useScrollDirection() {
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState<"up" | "down">("down");
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > lastScrollY.current) {
      setDirection("down");
    } else if (latest < lastScrollY.current) {
      setDirection("up");
    }
    lastScrollY.current = latest;
  });

  return direction;
}
