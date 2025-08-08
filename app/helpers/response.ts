import type { HttpContext } from '@adonisjs/core/http'

/**
 * Utility class for sending standardized JSON responses.
 *
 * Each helper returns the `response` instance so that you can keep chaining
 * AdonisJS response methods if needed.
 */
export default class ApiResponse {
  /**
   * Send a successful JSON response
   *
   * @param response   – HttpContext response object
   * @param statusCode – HTTP status code
   * @param data       – Payload to return
   * @param message    – Optional human-readable message
   */
  public static sendSuccess(
    response: HttpContext['response'],
    statusCode: number,
    data: unknown,
    message?: string
  ) {
    const responseData = {
      success: true,
      message,
      data,
    }

    return response.status(statusCode).json(responseData)
  }

  /** Shorthand for **200 OK** */
  public static ok(response: HttpContext['response'], data: unknown, message?: string) {
    return this.sendSuccess(response, 200, data, message)
  }

  /** Shorthand for **201 Created** */
  public static created(response: HttpContext['response'], data: unknown, message?: string) {
    return this.sendSuccess(response, 201, data, message)
  }

  /** Shorthand for **204 No Content** */
  public static noContent(response: HttpContext['response']) {
    return this.sendSuccess(response, 204, null)
  }

  /**
   * Send an error JSON response
   *
   * @param response   – HttpContext response object
   * @param statusCode – HTTP status code
   * @param message    – Error message
   * @param errors     – Extra error details (e.g. validation errors)
   * @param data       – Additional payload (optional)
   */
  public static sendError(
    response: HttpContext['response'],
    statusCode: number,
    message: string,
    errors?: unknown,
    data?: unknown
  ) {
    const errorResponse: {
      success: boolean
      message: string
      error: {
        code: number
        errors: unknown
      }
      data?: unknown
    } = {
      success: false,
      message,
      error: {
        code: statusCode,
        errors: errors ?? null,
      },
    }

    if (data !== undefined) {
      errorResponse.data = data
    }

    return response.status(statusCode).json(errorResponse)
  }

  // ---------- Convenience helpers for common HTTP errors ---------- //

  /**
   * Send a **500 Internal Server Error** response
   *
   * If in production: only display "Internal Server Error"
   * If not in production: display a custom message and error stack
   *
   * @param response – HttpContext response object
   * @param message  – Custom error message
   * @param errors   – Stack trace or additional error details
   */
  public static internalServerError(
    response: HttpContext['response'],
    message: string = 'Internal Server Error',
    errors?: unknown
  ) {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      return this.sendError(response, 500, 'Internal Server Error')
    }
    return this.sendError(response, 500, message, errors)
  }

  /**
   * Send a **404 Not Found** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static notFound(response: HttpContext['response'], message: string = 'Not Found') {
    return this.sendError(response, 404, message)
  }

  /**
   * Send a **400 Bad Request** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static badRequest(response: HttpContext['response'], message: string = 'Bad Request') {
    return this.sendError(response, 400, message)
  }

  /**
   * Send a **401 Unauthorized** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static unauthorized(response: HttpContext['response'], message: string = 'Unauthorized') {
    return this.sendError(response, 401, message)
  }

  /**
   * Send a **403 Forbidden** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static forbidden(response: HttpContext['response'], message: string = 'Forbidden') {
    return this.sendError(response, 403, message)
  }

  /**
   * Send a **409 Conflict** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static conflict(response: HttpContext['response'], message: string = 'Conflict') {
    return this.sendError(response, 409, message)
  }

  /**
   * Send a **422 Validation Error** response
   *
   * @param response – HttpContext response object
   * @param errors   – Validation error details
   */
  public static validationError(response: HttpContext['response'], errors: unknown) {
    return this.sendError(response, 422, 'Validation Error', errors)
  }

  /**
   * Send a **405 Method Not Allowed** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static methodNotAllowed(
    response: HttpContext['response'],
    message: string = 'Method Not Allowed'
  ) {
    return this.sendError(response, 405, message)
  }

  /**
   * Send a **410 Gone** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static gone(response: HttpContext['response'], message: string = 'Gone') {
    return this.sendError(response, 410, message)
  }

  /**
   * Send a **412 Precondition Failed** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static preconditionFailed(
    response: HttpContext['response'],
    message: string = 'Precondition Failed'
  ) {
    return this.sendError(response, 412, message)
  }

  /**
   * Send a **429 Too Many Requests** response
   *
   * @param response – HttpContext response object
   * @param message  – Custom message
   */
  public static tooManyRequests(
    response: HttpContext['response'],
    message: string = 'Too Many Requests'
  ) {
    return this.sendError(response, 429, message)
  }
}
