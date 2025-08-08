import app from '@adonisjs/core/services/app'
import Response from '#helpers/response'
import { errors as vineErrors } from '@vinejs/vine'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    /**
     * Self handle the validation exception
     */
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return Response.validationError(ctx.response, error.messages)
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return Response.notFound(ctx.response, error.message)
    }

    if (error.code === 'E_ROW_NOT_FOUND') {
      return Response.notFound(ctx.response, error.message)
    }

    if (error.code === 'E_INVALID_API_TOKEN') {
      return Response.unauthorized(ctx.response, error.message)
    }

    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return Response.unauthorized(ctx.response, error.message)
    }

    /**
     * Forward rest of the exceptions to the parent class
     */
    return Response.internalServerError(ctx.response, error.message, error.stack)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
