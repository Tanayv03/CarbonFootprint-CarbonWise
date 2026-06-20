/**
 * Centralized AppError class to standardize backend error handling.
 * Ensures consistent error shapes across the entire application.
 */
class AppError extends Error {
  /**
   * Create an AppError.
   * @param {string} message - Error description.
   * @param {number} statusCode - HTTP status code.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
