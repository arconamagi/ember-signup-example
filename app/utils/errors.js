/**
 * Base class for errors.
 */
class BaseError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error class for HTTP request failures.
 */
export class HttpError extends BaseError {
  constructor(message = 'Unexpected http error') {
    super(message);
  }
}

/**
 * Checks if specified error is an instance of HttpError.
 * @param error
 * @return {boolean} true for HttpError.
 */
export function isHttpError(error) {
  return Boolean(error) && error instanceof HttpError;
}

/**
 * Error class for validation failures.
 */
export class ValidationErrors extends BaseError {
  constructor(errors) {
    super('ValidationErrors');
    this.errors = errors;
  }
}

/**
 * Checks if specified error is an instance of ValidationErrors.
 * @param error
 * @return {boolean} true for ValidationErrors.
 */
export function isValidationErrors(error) {
  return Boolean(error) && error instanceof ValidationErrors;
}

/**
 * Checks `error` type and extracts errors in a `field: { message }` format.
 * @param error
 * @return {{non_field_errors: string}|Object}
 */
export function normalizeResponseErrors(error) {
  if (!error) {
    return {};
  }
  if (isValidationErrors(error)) {
    return error.errors;
  }
  return {
    non_field_errors: {
      message: isHttpError(error) ? error.message : 'Unexpected server response'
    }
  };
}
