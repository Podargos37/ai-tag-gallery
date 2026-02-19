"use client";

import { useLayoutEffect, useState } from "react";
import { findScrollParent } from "@/lib/dom";

const DEFAULT_VIEW_HEIGHT =
  typeof window !== "undefined" ? window.innerHeight : 2000;

export interface ContainerScrollState {
  containerWidth: number;
  scrollTop: number;
  containerOffset: number;
  viewHeight: number;
}

export function useContainerScrollState(
  containerRef: React.RefObject<HTMLDivElement | null>
): ContainerScrollState {
  const [state, setState] = useState<ContainerScrollState>({
    containerWidth: 800,
    scrollTop: 0,
    containerOffset: 0,
    viewHeight: DEFAULT_VIEW_HEIGHT,
  });

  useLayoutEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;

      const containerWidth = el.offsetWidth;
      const scrollEl = findScrollParent(el);

      if (scrollEl) {
        const containerRect = el.getBoundingClientRect();
        const scrollRect = scrollEl.getBoundingClientRect();
        const containerOffset =
          containerRect.top - scrollRect.top + scrollEl.scrollTop;
        setState({
          containerWidth,
          scrollTop: scrollEl.scrollTop,
          containerOffset,
          viewHeight: scrollEl.clientHeight,
        });
      } else {
        const containerRect = el.getBoundingClientRect();
        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        setState({
          containerWidth,
          scrollTop: scrollY,
          containerOffset: containerRect.top + scrollY,
          viewHeight: DEFAULT_VIEW_HEIGHT,
        });
      }
    };

    update();
    const el = containerRef.current;
    const scrollEl = el ? findScrollParent(el) : null;
    const ro = el ? new ResizeObserver(update) : null;

    if (el && ro) ro.observe(el);

    if (scrollEl) {
      scrollEl.addEventListener("scroll", update, { passive: true });
      const scrollRo = new ResizeObserver(update);
      scrollRo.observe(scrollEl);
      return () => {
        ro?.disconnect();
        scrollEl.removeEventListener("scroll", update);
        scrollRo.disconnect();
      };
    }

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [containerRef]);

  return state;
}
