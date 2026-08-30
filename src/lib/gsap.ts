import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register standard GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, useGSAP, ScrollTrigger };

/**
 * Animate a numeric DOM text element or React callback with smooth easing
 */
export const animateNumber = (
  from: number,
  to: number,
  duration = 1.2,
  onUpdate: (val: number) => void,
  ease = 'power2.out'
) => {
  const obj = { val: from };
  return gsap.to(obj, {
    val: to,
    duration,
    ease,
    onUpdate: () => {
      onUpdate(Math.round(obj.val));
    },
  });
};

/**
 * Staggered entrance animation for a list of items within a container ref
 */
export const animateStaggerIn = (
  selector: string | Element[],
  options?: gsap.TweenVars
) => {
  return gsap.from(selector, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.05,
    ease: 'power3.out',
    clearProps: 'all',
    ...options,
  });
};
