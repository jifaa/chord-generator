'use client';

import { useRef, useState, useCallback, useEffect, CSSProperties } from 'react';

type Falloff = 'linear' | 'smooth' | 'sharp';

export interface LineSidebarProps {
  items?: string[];
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: Falloff;
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  defaultActive?: number | null;
  onItemClick?: (index: number, label: string) => void;
  className?: string;
}

const FALLOFF_CURVES: Record<Falloff, (p: number) => number> = {
  linear: p => p,
  smooth: p => p * p * (3 - 2 * p),
  sharp: p => p * p * p
};

const LineSidebar = ({
  items = [],
  accentColor = '#A855F7',
  textColor = '#c4c4c4',
  markerColor = '#6c6c6c',
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = 'smooth',
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  defaultActive = null,
  onItemClick,
  className = ''
}: LineSidebarProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const activeRef = useRef<number | null>(defaultActive);
  const smoothingRef = useRef(smoothing);
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActive);

  activeRef.current = activeIndex;
  smoothingRef.current = smoothing;

  // Initialize effect values on mount
  useEffect(() => {
    targetsRef.current = new Array(items.length).fill(0);
    currentRef.current = new Array(items.length).fill(0);

    itemRefs.current.forEach((el) => {
      if (el) {
        el.style.setProperty('--effect', '0');
      }
    });

    if (activeRef.current !== null && itemRefs.current[activeRef.current]) {
      itemRefs.current[activeRef.current]!.style.setProperty('--effect', '1');
      currentRef.current[activeRef.current] = 1;
    }
  }, [items.length]);

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const itemsList = itemRefs.current;
    for (let i = 0; i < itemsList.length; i++) {
      const el = itemsList[i];
      if (!el) continue;
      const target = activeRef.current === i ? 1 : (targetsRef.current[i] || 0);
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty('--effect', value.toFixed(4));
      if (!settled) moving = true;
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
      const itemsList = itemRefs.current;
      for (let i = 0; i < itemsList.length; i++) {
        const el = itemsList[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / proximityRadius));
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index: number, label: string) => {
      setActiveIndex(index);
      onItemClick?.(index, label);
    },
    [onItemClick]
  );

  useEffect(() => {
    startLoop();
  }, [activeIndex, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const tickClass = showMarker
    ? `after:absolute after:left-[calc(-1*var(--marker-length)-var(--marker-gap)] after:top-[calc(100%+var(--item-gap)/2] after:h-px after:opacity-50 after:content-[''] last:after:content-none after:bg-[var(--marker-color)] after:w-[calc(var(--marker-length)*var(--tick-scale)] ${scaleTick ? 'after:origin-left after:[transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.6)]' : 'after:-translate-y-1/2'}`
    : '';

  return (
    <nav
      className={`relative flex justify-start ${showMarker ? `pl-[calc(var(--marker-length)+var(--marker-gap)]` : ''} ${className}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`
      } as CSSProperties}
    >
      <ul
        ref={listRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="m-0 flex list-none flex-col py-4"
        style={{ gap: `${itemGap}px` }}
      >
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            ref={el => { itemRefs.current[index] = el; }}
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => handleClick(index, label)}
            className={`relative cursor-pointer before:absolute before:-inset-x-12 before:-inset-y-[6px] before:content-[''] ${tickClass}`}
            style={{ '--effect': activeIndex === index ? 1 : 0 } as React.CSSProperties}
          >
            {showMarker && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 h-px origin-left -translate-y-1/2"
                style={{
                  left: `calc(-1 * ${markerLength}px - ${markerGap}px)`,
                  width: `${markerLength}px`,
                  backgroundColor: markerColor,
                  transform: `translateY(-50%) scaleX(${(activeIndex === index ? 1 : 0.7) * 0.5 + 0.7})`
                }}
              />
            )}
            <span
              className="relative inline-flex items-baseline leading-[1.2]"
              style={{
                color: activeIndex === index ? accentColor : textColor,
                fontSize: `${fontSize}rem`,
                transform: `translateX(${(activeIndex === index ? 1 : 0) * maxShift}px)`
              }}
            >
              {showIndex && (
                <span
                  className="mr-[0.6rem] font-mono text-[0.85em]"
                  style={{ opacity: activeIndex === index ? 1 : 0.55 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              )}
              <span>{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LineSidebar;
