import { useEffect, useRef, useState, useCallback } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StarRatingProps {
  initialValue?: number;
  onRate: (rating: number) => void;
}

type StarState = 'full' | 'half' | 'empty';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAR_COUNT = 5;
const STAR_INDICES = Array.from({ length: STAR_COUNT }, (_, i) => i);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStarState(displayValue: number, starIndex: number): StarState {
  if (displayValue >= starIndex + 1) return 'full';
  if (displayValue >= starIndex + 0.5) return 'half';
  return 'empty';
}

/**
 * Derives a star rating value (e.g. 2.5, 3) from a mouse event on an
 * individual star element. Used for desktop hover.
 */
function resolveValueFromMouseEvent(
  e: React.MouseEvent<HTMLDivElement>,
  starIndex: number
): number {
  const { left, width } = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - left;
  const isHalf = x < width / 2;
  return starIndex + (isHalf ? 0.5 : 1);
}

/**
 * Derives a star rating value from a clientX position relative to the
 * container element. Used for touch events, which fire on the originating
 * element regardless of where the finger actually is.
 */
function resolveValueFromClientX(
  clientX: number,
  containerRect: DOMRect
): number | null {
  const x = clientX - containerRect.left;
  if (x < 0 || x > containerRect.width) return null;

  const starWidth = containerRect.width / STAR_COUNT;
  const starIndex = Math.floor(x / starWidth);
  const clampedIndex = Math.min(starIndex, STAR_COUNT - 1);
  const posWithinStar = x - clampedIndex * starWidth;
  const isHalf = posWithinStar < starWidth / 2;

  return clampedIndex + (isHalf ? 0.5 : 1);
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useStarRating(
  initialValue: number,
  onRate: (rating: number) => void,
  containerRef: React.RefObject<HTMLDivElement>
) {
  // committedValue: the saved rating after a click or tap.
  // hoverValue: the live preview shown while the pointer/finger is moving.
  const [committedValue, setCommittedValue] = useState<number>(initialValue);
  const [hoverValue, setHoverValue] = useState<number>(initialValue);

  useEffect(() => {
    setCommittedValue(initialValue);
    setHoverValue(initialValue);
  }, [initialValue]);

  const commit = useCallback(
    (value: number) => {
      setCommittedValue(value);
      setHoverValue(value);
      onRate(value);
    },
    [onRate]
  );

  // ── Desktop handlers (per-star) ──────────────────────────────────────────

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
      setHoverValue(resolveValueFromMouseEvent(e, starIndex));
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    // Reset preview to the committed value, not the prop, so a previous
    // click is visually preserved while the user continues interacting.
    setHoverValue(committedValue);
  }, [committedValue]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
      commit(resolveValueFromMouseEvent(e, starIndex));
    },
    [commit]
  );

  // ── Mobile handlers (container-level) ───────────────────────────────────
  // Touch events are captured by the element where the touch began, so we
  // cannot rely on individual star handlers when the finger slides across
  // stars. Attaching handlers at the container and using clientX to
  // recalculate position solves this entirely.

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      e.preventDefault(); // prevent page scroll while rating
      const touch = e.touches[0];
      const value = resolveValueFromClientX(
        touch.clientX,
        containerRef.current.getBoundingClientRect()
      );
      if (value !== null) setHoverValue(value);
    },
    [containerRef]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const touch = e.changedTouches[0];
      const value = resolveValueFromClientX(
        touch.clientX,
        containerRef.current.getBoundingClientRect()
      );
      if (value !== null) commit(value);
    },
    [containerRef, commit]
  );

  return {
    hoverValue,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleTouchMove,
    handleTouchEnd,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StarIconRendererProps {
  state: StarState;
}

function StarIconRenderer({ state }: StarIconRendererProps) {
  const baseClass = 'text-content-notice';

  if (state === 'full') {
    return <StarIcon fontSize="large" className={baseClass} />;
  }
  if (state === 'half') {
    return <StarHalfIcon fontSize="large" className={baseClass} />;
  }
  return (
    <StarBorderIcon
      fontSize="large"
      className={`${baseClass} text-stroke-secondary opacity-30`}
    />
  );
}

interface StarProps {
  index: number;
  state: StarState;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
}

function Star({ index, state, onMouseMove, onClick }: StarProps) {
  return (
    <div
      className="cursor-pointer text-amber-400 transition-transform active:scale-90"
      onMouseMove={(e) => onMouseMove(e, index)}
      onClick={(e) => onClick(e, index)}
    >
      <StarIconRenderer state={state} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StarRating({ initialValue = 0, onRate }: StarRatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    hoverValue,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleTouchMove,
    handleTouchEnd,
  } = useStarRating(initialValue, onRate, containerRef);

  return (
    <div
      ref={containerRef}
      className="flex gap-1"
      onMouseLeave={handleMouseLeave}
      // Touch events are handled at container level so sliding across
      // multiple stars works correctly on mobile.
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {STAR_INDICES.map((index) => (
        <Star
          key={index}
          index={index}
          state={resolveStarState(hoverValue, index)}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}