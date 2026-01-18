import { enqueueSnackbar } from "notistack";

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any, userMessage?: string): void {
    console.error("Error occurred:", error);

    // Determine error message
    let message = userMessage || "An unexpected error occurred";

    if (error?.message) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    // Check for specific error types
    if (error?.code === "PGRST301") {
      message = "Authentication required. Please login again.";
    } else if (error?.code === "PGRST116") {
      message =
        "Access denied. You do not have permission to perform this action.";
    } else if (error?.statusCode === 404) {
      message = "The requested resource was not found.";
    } else if (error?.statusCode === 500) {
      message = "Server error. Please try again later.";
    } else if (error?.statusCode === 429) {
      message = "Too many requests. Please wait a moment and try again.";
    }

    // Show error to user
    enqueueSnackbar(message, { variant: "error" });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      this.logToService(error, message);
    }
  }

  static logToService(error: any, message: string): void {
    // Integrate with Sentry, LogRocket, or other error tracking service
    // Example:
    // Sentry.captureException(error, {
    //   tags: { type: 'handled_error' },
    //   extra: { message },
    // })
    console.log("Would log to error service:", { error, message });
  }

  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, errorMessage);
      return null;
    }
  }
}

// Axios/Fetch interceptor for global error handling
export const apiErrorInterceptor = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    if (status === 401) {
      // Unauthorized - redirect to login
      window.location.href = "/login";
    } else if (status === 403) {
      ErrorHandler.handle(
        error,
        "You do not have permission to perform this action",
      );
    } else if (status === 404) {
      ErrorHandler.handle(error, "Resource not found");
    } else if (status === 429) {
      ErrorHandler.handle(error, "Too many requests. Please slow down.");
    } else if (status >= 500) {
      ErrorHandler.handle(error, "Server error. Please try again later.");
    } else {
      ErrorHandler.handle(error);
    }
  } else if (error.request) {
    // Request made but no response
    ErrorHandler.handle(error, "Network error. Please check your connection.");
  } else {
    // Other errors
    ErrorHandler.handle(error);
  }

  return Promise.reject(error);
};
