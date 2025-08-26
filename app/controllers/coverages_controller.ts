import type { HttpContext } from '@adonisjs/core/http'
import Response from '#helpers/response'
import { inject } from '@adonisjs/core'
import { HomepassService } from '#services/homepassed_service'
import { coverageCheck } from '#validators/coverage'
import CoverageSerialize from '../serializers/coverages_serializer.js'

@inject()
export default class CoveragesController {
  constructor(
    private homepassService: HomepassService,
    private coverageSerializer: CoverageSerialize
  ) {}

  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const payload = await request.validateUsing(coverageCheck)
    const result = await this.homepassService.findAll(
      payload.longitude,
      payload.latitude,
      page,
      limit
    )
    return Response.ok(
      response,
      await this.coverageSerializer.collection(result),
      'Home Pass retrieved successfully'
    )
  }

  async find({ request, response }: HttpContext) {
    const payload = await request.validateUsing(coverageCheck)
    const result = await this.homepassService.findOne(payload.longitude, payload.latitude)
    if (!result) {
      return Response.notFound(response, 'Home Pass not found')
    }
    return Response.ok(
      response,
      await this.coverageSerializer.single(result),
      'Home Pass retrieved successfully'
    )
  }
}
