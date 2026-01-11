import React from "react";
import { Skeleton } from "./SkeletonLoader";
import "./styles/skeleton.css";

/**
 * TableSkeleton Component
 * Premium skeleton loader for table/list views with wave animation
 */
const TableSkeleton = ({
  rows = 5,
  columns = 5,
  showHeader = true,
  className = "",
}) => {
  // Varied widths for natural look
  const getWidth = (colIndex) => {
    const widths = ["85%", "70%", "90%", "65%", "80%", "75%", "60%", "95%"];
    return widths[colIndex % widths.length];
  };

  return (
    <div className={`skeleton-table-wrapper ${className}`} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      <table className="table skeleton-table mb-0" style={{ marginBottom: 0 }}>
        {showHeader && (
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th key={`header-${colIndex}`} style={{ padding: '14px 16px', borderBottom: '1px solid #eef2f6' }}>
                  <Skeleton 
                    width={getWidth(colIndex)} 
                    height="12px"
                    style={{ borderRadius: 6 }}
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr 
              key={`row-${rowIndex}`}
              style={{ 
                background: rowIndex % 2 === 0 ? '#ffffff' : '#fafbfc'
              }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td 
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={{ 
                    padding: '14px 16px', 
                    borderBottom: rowIndex < rows - 1 ? '1px solid #f0f2f5' : 'none'
                  }}
                >
                  <Skeleton 
                    width={getWidth(colIndex + rowIndex)} 
                    height="12px"
                    className="skeleton-cell"
                    style={{ 
                      borderRadius: 6,
                      animationDelay: `${rowIndex * 75}ms`
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Compact Table Skeleton
 * For smaller tables or item lists with avatars
 */
export const CompactTableSkeleton = ({ rows = 3, className = "" }) => {
  return (
    <div className={className} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div 
          key={index} 
          className="d-flex align-items-center gap-3"
          style={{ 
            padding: '16px 20px',
            borderBottom: index < rows - 1 ? '1px solid #f0f2f5' : 'none',
            background: index % 2 === 0 ? '#ffffff' : '#fafbfc'
          }}
        >
          <Skeleton 
            width="44px" 
            height="44px" 
            style={{ borderRadius: 12, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <Skeleton 
              width="55%" 
              height="14px" 
              style={{ marginBottom: 8, borderRadius: 6 }} 
            />
            <Skeleton 
              width="35%" 
              height="10px" 
              style={{ borderRadius: 4 }}
            />
          </div>
          <Skeleton 
            width="70px" 
            height="30px" 
            style={{ borderRadius: 8 }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * List Skeleton
 * For simple list items with clean design
 */
export const ListSkeleton = ({ rows = 5, showIcon = true, className = "" }) => {
  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, index) => (
        <div 
          key={index}
          className="d-flex align-items-center gap-3"
          style={{ 
            padding: '14px 0',
            borderBottom: index < rows - 1 ? '1px solid #f0f2f5' : 'none'
          }}
        >
          {showIcon && (
            <Skeleton 
              width="40px" 
              height="40px" 
              style={{ 
                borderRadius: 10, 
                flexShrink: 0,
                background: 'linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%)'
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <Skeleton 
              width={`${65 + (index % 3) * 10}%`} 
              height="12px"
              style={{ 
                borderRadius: 6,
                animationDelay: `${index * 50}ms` 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
