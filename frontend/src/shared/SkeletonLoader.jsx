import React from "react";
import "./styles/skeleton.css";

/**
 * Base Skeleton Component
 * Renders a rectangular skeleton with shimmer animation
 */
export const Skeleton = ({
  width = "100%",
  height = "16px",
  borderRadius = "4px",
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

/**
 * Skeleton Text Line
 * For simulating text content loading
 */
export const SkeletonText = ({
  width = "100%",
  size = "md", // sm, md, lg, xl
  className = "",
}) => {
  const sizeClass = size !== "md" ? size : "";
  return (
    <div
      className={`skeleton skeleton-text ${sizeClass} ${className}`}
      style={{ width }}
    />
  );
};

/**
 * Skeleton Circle
 * For avatars, icons, profile pictures
 */
export const SkeletonCircle = ({
  size = "md", // sm (32px), md (48px), lg (64px) or custom number
  className = "",
}) => {
  const sizeValue = typeof size === "number" ? `${size}px` : undefined;
  const sizeClass = typeof size === "string" ? size : "";

  return (
    <div
      className={`skeleton skeleton-circle ${sizeClass} ${className}`}
      style={sizeValue ? { width: sizeValue, height: sizeValue } : {}}
    />
  );
};

/**
 * Skeleton Heading
 * For simulating heading/title loading
 */
export const SkeletonHeading = ({ width = "60%", className = "" }) => {
  return (
    <div
      className={`skeleton skeleton-heading ${className}`}
      style={{ width }}
    />
  );
};

/**
 * Skeleton Button
 * For simulating button loading
 */
export const SkeletonButton = ({
  width = "120px",
  height = "44px",
  className = "",
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: "6px" }}
    />
  );
};

/**
 * Skeleton Image
 * For simulating image loading
 */
export const SkeletonImage = ({
  width = "100%",
  height = "200px",
  borderRadius = "8px",
  className = "",
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonHeading,
  SkeletonButton,
  SkeletonImage,
};
