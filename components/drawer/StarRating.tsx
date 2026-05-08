import { useEffect, useState } from 'react';

import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface StarRatingProps {
  initialValue?: number; 
  onRate: (rating: number) => void;
}

export function StarRating({ initialValue = 0, onRate }: StarRatingProps) {
  const [hover, setHover] = useState(initialValue);

  useEffect(() => {
    setHover(initialValue);
  }, [initialValue]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const isHalf = x < width / 2;
    setHover(starIndex + (isHalf ? 0.5 : 1));
  };

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(initialValue)}>
      {[0, 1, 2, 3, 4].map((i) => {
        const displayValue = hover;
        const isFull = displayValue >= i + 1;
        const isHalf = displayValue >= i + 0.5 && !isFull;

        return (
          <div
            key={i}
            className="cursor-pointer text-amber-400 transition-transform active:scale-90"
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={() => onRate(hover)}
          >
            {isFull ? (
              <StarIcon fontSize="large" className="text-content-notice" />
            ) : isHalf ? (
              <StarHalfIcon fontSize="large" className="text-content-notice" />
            ) : (
              <StarBorderIcon fontSize="large" className="text-stroke-secondary text-content-notice opacity-30" />
            )}
          </div>
        );
      })}
    </div>
  );
}