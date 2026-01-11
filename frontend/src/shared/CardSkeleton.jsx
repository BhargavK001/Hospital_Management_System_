import React from "react";
import { Skeleton } from "./SkeletonLoader";
import "./styles/skeleton.css";

/**
 * CardSkeleton Component
 * Premium dashboard stat card skeleton with refined styling
 */
const CardSkeleton = ({ className = "" }) => {
  return (
    <div className={`skeleton-stats-card ${className}`}>
      {/* Icon placeholder - Styled circle with gradient */}
      <div 
        className="skeleton" 
        style={{ 
          width: 56, 
          height: 56, 
          borderRadius: 14,
          background: 'linear-gradient(135deg, #e8f0fe 0%, #d4e4fc 100%)',
          flexShrink: 0
        }} 
      />
      
      {/* Content area */}
      <div style={{ flex: 1 }}>
        {/* Label - Smaller text */}
        <Skeleton 
          width="65%" 
          height="12px" 
          style={{ marginBottom: 12, borderRadius: 6 }}
        />
        {/* Value - Larger number */}
        <Skeleton 
          width="40%" 
          height="28px" 
          style={{ borderRadius: 8 }}
        />
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Grid Skeleton
 * Renders multiple card skeletons in a responsive grid
 */
export const DashboardStatsSkeleton = ({ 
  count = 4, 
  columns = { xl: 3, md: 6, sm: 12 } 
}) => {
  return (
    <div className="row g-4 mb-4">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`col-xl-${columns.xl} col-md-${columns.md} col-${columns.sm || 12}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
};

/**
 * Simple Card Skeleton
 * For general purpose card loading with clean lines
 */
export const SimpleCardSkeleton = ({ 
  showHeader = true,
  lines = 3,
  className = "" 
}) => {
  return (
    <div className={`skeleton-card ${className}`}>
      {showHeader && (
        <Skeleton 
          width="35%" 
          height="18px" 
          style={{ marginBottom: 20, borderRadius: 6 }} 
        />
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          width={`${90 - i * 15}%`} 
          height="12px" 
          style={{ marginBottom: i < lines - 1 ? 12 : 0, borderRadius: 6 }} 
        />
      ))}
    </div>
  );
};

export default CardSkeleton;
