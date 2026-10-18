import React from 'react';

/**
 * Reusable bright golden-yellow StarRating component.
 * Uses exact color #FFC107 with fully filled SVG paths.
 */
export default function StarRating({ rating = 5, size = 'w-4 h-4', className = '' }) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${safeRating} out of 5 stars`}
      title={`${safeRating} / 5 stars`}
    >
      {[...Array(safeRating)].map((_, i) => (
        <svg
          key={i}
          className={`${size} shrink-0`}
          viewBox="0 0 24 24"
          fill="#FFC107"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
