import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  code: string;
  details?: any;
  statusCode: number;
}

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
    message.includes('getaddrinfo') ||
    message.includes('database collection')
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

export class ApiErrorHandler {
  static handleError(error: unknown, context?: string): ApiError {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Database connection errors
      if (isMongoNetworkError(error)) {
        return {
          error: 'Database service is currently unavailable. Please try again later.',
          code: 'DATABASE_UNAVAILABLE',
          statusCode: 503
        };
      }

      // Validation errors
      if (message.includes('validation') || message.includes('invalid')) {
        return {
          error: 'Invalid input data provided.',
          code: 'VALIDATION_ERROR',
          details: message,
          statusCode: 400
        };
      }

      // Authentication errors
      if (message.includes('unauthorized') || message.includes('forbidden') ||
          message.includes('authentication')) {
        return {
          error: 'Authentication required or invalid credentials.',
          code: 'AUTH_ERROR',
          statusCode: 401
        };
      }

      // Not found errors
      if (message.includes('not found') || message.includes('does not exist')) {
        return {
          error: 'Requested resource not found.',
          code: 'NOT_FOUND',
          statusCode: 404
        };
      }

      // Rate limiting
      if (message.includes('rate limit') || message.includes('too many')) {
        return {
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
          statusCode: 429
        };
      }

      // Generic server error
      return {
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      };
    }

    // Unknown error type
    return {
      error: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }

  static createResponse(apiError: ApiError): NextResponse {
    const { statusCode, ...errorBody } = apiError;
    return NextResponse.json(errorBody, { status: statusCode });
  }

  static async withErrorHandler<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | NextResponse> {
    try {
      return await operation();
    } catch (error) {
      const apiError = this.handleError(error, context);
      return this.createResponse(apiError);
    }
  }
}

// Utility function for consistent API responses
export function createApiResponse(data: any, statusCode: number = 200): NextResponse {
  return NextResponse.json(data, { status: statusCode });
}

// Utility function for success responses
export function createSuccessResponse(message: string, data?: any, statusCode: number = 200): NextResponse {
  return NextResponse.json({
    message,
    ...(data !== undefined && { data }),
    success: true
  }, { status: statusCode });
}
