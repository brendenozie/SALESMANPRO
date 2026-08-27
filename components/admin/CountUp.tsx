'use client';

import { animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

type Props = {
  from?: number;
  to: number;
  duration?: number;
  format?: (value: number) => string;
};

export default function CountUp({ from = 0, to, duration = 1.5, format }: Props) {
  // Change the ref type to HTMLDivElement
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Use the starting value as the initial text content before animation
    node.textContent = format ? format(from) : from.toFixed(0);

    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate(value) {
        // Ensure the value is formatted correctly before setting textContent
        node.textContent = format ? format(value) : value?.toFixed(0);
      },
    });

    return () => controls.stop();
  }, [from, to, duration, format]);

  // Change the rendered element from <p> to <div>
  return <div ref={nodeRef} />;
}