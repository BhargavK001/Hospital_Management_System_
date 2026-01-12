import toast from "react-hot-toast";

/**
 * useToast Hook
 * Centralized toast notification utility with consistent styling
 * 
 * Usage:
 * import { showToast } from "../utils/useToast";
 * 
 * showToast.success("Profile updated successfully!");
 * showToast.error("Failed to save changes");
 * showToast.loading("Saving...");
 * showToast.promise(asyncFn(), { loading: "Saving...", success: "Saved!", error: "Failed" });
 */

/**
 * Success toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional toast options
 */
export const success = (message, options = {}) => {
  return toast.success(message, {
    duration: 3000,
    ...options,
  });
};

/**
 * Error toast notification
 * @param {string} message - The error message to display
 * @param {object} options - Optional toast options
 */
export const error = (message, options = {}) => {
  return toast.error(message || "Something went wrong", {
    duration: 4000,
    ...options,
  });
};

/**
 * Loading toast notification
 * @param {string} message - The loading message to display
 * @param {object} options - Optional toast options
 * @returns {string} Toast ID for dismissing later
 */
export const loading = (message = "Loading...", options = {}) => {
  return toast.loading(message, options);
};

/**
 * Info/default toast notification
 * @param {string} message - The message to display
 * @param {object} options - Optional toast options
 */
export const info = (message, options = {}) => {
  return toast(message, {
    duration: 3000,
    icon: "ℹ️",
    ...options,
  });
};

/**
 * Warning toast notification
 * @param {string} message - The warning message to display
 * @param {object} options - Optional toast options
 */
export const warning = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    icon: "⚠️",
    style: {
      background: "#f59e0b",
      color: "#ffffff",
    },
    ...options,
  });
};

/**
 * Promise-based toast for async operations
 * Shows loading, then success or error based on promise result
 * 
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Messages for each state { loading, success, error }
 * @param {object} options - Optional toast options
 */
export const promise = (promiseToTrack, messages = {}, options = {}) => {
  return toast.promise(
    promiseToTrack,
    {
      loading: messages.loading || "Processing...",
      success: messages.success || "Success!",
      error: (err) => {
        // Handle error message extraction
        if (typeof messages.error === "function") {
          return messages.error(err);
        }
        return messages.error || err?.response?.data?.message || err?.message || "Something went wrong";
      },
    },
    {
      success: {
        duration: 3000,
      },
      error: {
        duration: 4000,
      },
      ...options,
    }
  );
};

/**
 * Dismiss a specific toast or all toasts
 * @param {string} toastId - Optional specific toast ID to dismiss
 */
export const dismiss = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Update an existing toast
 * @param {string} toastId - The toast ID to update
 * @param {object} options - New options for the toast
 */
export const update = (toastId, options) => {
  toast.dismiss(toastId);
  
  if (options.type === "success") {
    return success(options.message, options);
  } else if (options.type === "error") {
    return error(options.message, options);
  } else {
    return info(options.message, options);
  }
};

/**
 * Custom toast with JSX content
 * @param {function} render - Function that receives toast object and returns JSX
 * @param {object} options - Optional toast options
 */
export const custom = (render, options = {}) => {
  return toast.custom(render, options);
};

// Export as a single object for convenience
export const showToast = {
  success,
  error,
  loading,
  info,
  warning,
  promise,
  dismiss,
  update,
  custom,
};

// Default export
export default showToast;
