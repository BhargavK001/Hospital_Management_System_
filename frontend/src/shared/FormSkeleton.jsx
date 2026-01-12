import React from "react";
import { Skeleton } from "./SkeletonLoader";
import "./styles/skeleton.css";

/**
 * FormSkeleton Component
 * Displays a skeleton loader for form pages
 */
const FormSkeleton = ({
  fields = 4,
  showButton = true,
  twoColumn = false,
  className = "",
}) => {
  const fieldElements = Array.from({ length: fields }).map((_, index) => (
    <div key={index} className="skeleton-form-group">
      {/* Label */}
      <Skeleton 
        width={`${25 + Math.random() * 15}%`} 
        height="14px"
        className="skeleton-form-label"
        style={{ marginBottom: "8px" }}
      />
      {/* Input */}
      <Skeleton 
        width="100%" 
        height="42px"
        className="skeleton-form-input"
        borderRadius="6px"
      />
    </div>
  ));

  if (twoColumn) {
    return (
      <div className={`${className}`}>
        <div className="row">
          {fieldElements.map((field, index) => (
            <div key={index} className="col-md-6">
              {field}
            </div>
          ))}
        </div>
        {showButton && (
          <div className="mt-4">
            <Skeleton width="120px" height="44px" borderRadius="6px" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {fieldElements}
      {showButton && (
        <div className="mt-4">
          <Skeleton width="120px" height="44px" borderRadius="6px" />
        </div>
      )}
    </div>
  );
};

/**
 * Profile Form Skeleton
 * For profile edit pages with avatar
 */
export const ProfileFormSkeleton = ({ className = "" }) => {
  return (
    <div className={`${className}`}>
      {/* Avatar Section */}
      <div className="text-center mb-4">
        <Skeleton 
          width="120px" 
          height="120px" 
          borderRadius="50%"
          style={{ margin: "0 auto" }}
        />
        <Skeleton 
          width="100px" 
          height="32px"
          style={{ margin: "16px auto 0" }}
          borderRadius="6px"
        />
      </div>

      {/* Form Fields */}
      <div className="row">
        <div className="col-md-6">
          <FormSkeleton fields={3} showButton={false} />
        </div>
        <div className="col-md-6">
          <FormSkeleton fields={3} showButton={false} />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4 d-flex justify-content-end">
        <Skeleton width="140px" height="44px" borderRadius="6px" />
      </div>
    </div>
  );
};

/**
 * Settings Form Skeleton
 * For settings pages with sections
 */
export const SettingsFormSkeleton = ({ sections = 2, className = "" }) => {
  return (
    <div className={className}>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="mb-5">
          {/* Section Title */}
          <Skeleton 
            width="30%" 
            height="24px"
            style={{ marginBottom: "20px" }}
          />
          
          {/* Section Fields */}
          <div className="row">
            {Array.from({ length: 2 }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="col-md-6">
                <div className="skeleton-form-group">
                  <Skeleton 
                    width="40%" 
                    height="14px"
                    style={{ marginBottom: "8px" }}
                  />
                  <Skeleton 
                    width="100%" 
                    height="42px"
                    borderRadius="6px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="d-flex justify-content-end">
        <Skeleton width="140px" height="44px" borderRadius="6px" />
      </div>
    </div>
  );
};

export default FormSkeleton;
