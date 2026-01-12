// src/alertToToast.js
// Comprehensive toast override system with robust error handling
import toast from "react-hot-toast";
import { openConfirmModal } from "../toasterjsfiles/confirmAPI";

// Track initialization status
let toastReady = false;

// Auto-detect type from plain string messages
function detectTypeFromMessage(message) {
  const text = String(message || "").toLowerCase();

  if (
    text.includes("error") ||
    text.includes("failed") ||
    text.includes("fail") ||
    text.includes("invalid") ||
    text.includes("not found") ||
    text.includes("cannot") ||
    text.includes("unable")
  ) {
    return "error";
  }

  if (
    text.includes("success") ||
    text.includes("saved") ||
    text.includes("added") ||
    text.includes("updated") ||
    text.includes("created") ||
    text.includes("done") ||
    text.includes("copied") ||
    text.includes("booked") ||
    text.includes("cancelled") ||
    text.includes("deleted")
  ) {
    return "success";
  }

  if (text.includes("warning") || text.includes("caution")) {
    return "warning";
  }

  return "default";
}

// Helper: treat strings/numbers as primitive, rest (JSX, objects) as non-primitive
function ReactIsPrimitive(val) {
  const t = typeof val;
  return val == null || t === "string" || t === "number" || t === "boolean";
}

// Safe toast wrapper that handles cases when toast might not be ready
function safeToast(type, message, options = {}) {
  try {
    toastReady = true;
    
    switch (type) {
      case "success":
        return toast.success(message, options);
      case "error":
        return toast.error(message, options);
      case "loading":
        return toast.loading(message, options);
      case "warning":
        return toast(message, { icon: "⚠️", ...options });
      default:
        return toast(message, options);
    }
  } catch (err) {
    // Fallback: log to console if toast fails
    console.warn("[Toast Fallback]", type, message, err);
    return null;
  }
}

// ✅ Global alert override
const originalAlert = window.alert;
window.alert = (arg) => {
  // ---- Object / JSX based API ----
  // ex: alert({ type: 'success', message: <b>Saved!</b> })
  // ex: alert({ type: 'promise', promise: apiCall(), loading: 'Saving...', success: 'Saved', error: 'Failed' })
  if (typeof arg === "object" && arg !== null && !ReactIsPrimitive(arg)) {
    const {
      type,
      message,
      promise: promiseArg,
      loading,
      success,
      error,
      ...options
    } = arg;

    // Promise mode → wraps toast.promise
    if (type === "promise" && promiseArg && typeof promiseArg.then === "function") {
      try {
        return toast.promise(
          promiseArg,
          {
            loading: loading || "Please wait...",
            success: success || "Done successfully",
            error: error || "Something went wrong",
          },
          options
        );
      } catch (err) {
        console.warn("[Toast Promise Fallback]", err);
        return promiseArg;
      }
    }

    const finalMessage = message || "";

    // Explicit type
    switch (type) {
      case "success":
        return safeToast("success", finalMessage, options);
      case "error":
        return safeToast("error", finalMessage, options);
      case "loading":
        return safeToast("loading", finalMessage, options);
      case "custom":
        return safeToast("default", finalMessage, options);
      default: {
        // No type? Try to guess from message text
        const guessed = detectTypeFromMessage(finalMessage);
        return safeToast(guessed, finalMessage, options);
      }
    }
  }

  // ---- Plain string alert("something") ----
  const message = String(arg || "");
  
  // If toast isn't available yet, use original alert as fallback
  if (!toastReady && typeof originalAlert === "function") {
    try {
      // Try toast first
      const guessed = detectTypeFromMessage(message);
      const result = safeToast(guessed, message);
      if (result !== null) return result;
    } catch {
      // If toast completely fails, fall back to original
      console.warn("[Alert] Toast not ready, using native alert");
      return originalAlert.call(window, message);
    }
  }

  const guessed = detectTypeFromMessage(message);
  return safeToast(guessed, message);
};

// ✅ Global confirm override
const originalConfirm = window.confirm;
window.confirm = async (message) => {
  try {
    const result = await openConfirmModal({
      title: "Please Confirm",
      message: message || "Do you want to continue?",
      variant: "danger",
      okText: "OK",
      cancelText: "Cancel",
    });
    return result;
  } catch (err) {
    // If confirm modal fails (not mounted yet), fall back to native
    console.warn("[Confirm Fallback] Modal not ready, using native confirm:", err.message || err);
    return originalConfirm.call(window, message);
  }
};

// Export a function to check if toast system is ready (for debugging)
export function isToastReady() {
  return toastReady;
}

// Mark toast as ready after a short delay to allow React to mount
setTimeout(() => {
  toastReady = true;
}, 100);