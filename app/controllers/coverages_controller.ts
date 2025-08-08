import type { HttpContext } from '@adonisjs/core/http'
import Response from '#helpers/response'
import { inject } from '@adonisjs/core'
import { HomepassService } from '#services/homepass_service'

@inject()
export default class CoveragesController {
  constructor(private homepassService: HomepassService) {}

  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const result = await this.homepassService.find(98.6001287, 3.5524864, page, limit)
    return Response.ok(response, result, 'Messages retrieved successfully')
  }
}
