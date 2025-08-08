import type { HttpContext } from '@adonisjs/core/http'
import Response from '#helpers/response'
import { inject } from '@adonisjs/core'
import { HomepassService } from '#services/homepass_service'
import { retrieve } from '#validators/coverage'

@inject()
export default class CoveragesController {
  constructor(private homepassService: HomepassService) {}

  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const payload = await request.validateUsing(retrieve)
    const result = await this.homepassService.find(payload.longitude, payload.latitude, page, limit)
    return Response.ok(response, result, 'Home Pass retrieved successfully')
  }
}
