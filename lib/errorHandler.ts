/**
 * Checks if an error is a MongoDB network/connection error
 */
export function isMongoNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('ENOTFOUND') ||
    message.includes('MongoNetworkError') ||
    message.includes('connect') ||
    message.includes('ECONNREFUSED') ||
    message.includes('getaddrinfo')
  );
}

/**
 * Gets a user-friendly error message based on the error type
 */
export function getErrorMessage(error: unknown): string {
  if (isMongoNetworkError(error)) {
    return 'Database service is currently unavailable. Please try again later.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Gets the appropriate HTTP status code for the error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isMongoNetworkError(error)) {
    return 503; // Service Unavailable
  }
  return 500; // Internal Server Error
}
