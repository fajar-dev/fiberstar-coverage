import type { HttpContext } from '@adonisjs/core/http'
import Response from '#helpers/response'
import { inject } from '@adonisjs/core'
import { CoverageService } from '#services/coverage_service'
import { coverageCheck } from '#validators/coverage'
import CoverageSerialize from '#serializers/coverages_serializer'
import { Parser as Json2CsvParser } from 'json2csv'

@inject()
export default class CoveragesController {
  constructor(
    private coverageService: CoverageService,
    private coverageSerializer: CoverageSerialize
  ) {}

  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const payload = await request.validateUsing(coverageCheck)
    const result = await this.coverageService.findAll(
      payload.longitude,
      payload.latitude,
      page,
      limit
    )
    return Response.ok(
      response,
      await this.coverageSerializer.paginate(result),
      'Home Pass retrieved successfully'
    )
  }

  async find({ request, response }: HttpContext) {
    const longitude = Number(request.input('longitude'))
    const latitude = Number(request.input('latitude'))
    const radius = request.input('radius') ? Number(request.input('radius')) : null
    const limit = request.input('limit') ? Number(request.input('limit')) : null

    if (!longitude || !latitude) {
      return Response.badRequest(response, 'Longitude and latitude are required')
    }

    const result = await this.coverageService.find(longitude, latitude, radius, limit)

    return Response.ok(
      response,
      await this.coverageSerializer.collection(result),
      'Home Pass retrieved successfully'
    )
  }

  async export({ request, response }: HttpContext) {
    const longitude = Number(request.input('longitude'))
    const latitude = Number(request.input('latitude'))
    const radius = request.input('radius') ? Number(request.input('radius')) : null
    const limit = request.input('limit') ? Number(request.input('limit')) : null
    const typeParam = request.input('type')

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return Response.badRequest(response, 'Longitude and latitude are required')
    }

    const result = await this.coverageService.find(longitude, latitude, radius, limit)

    let filteredResult = result

    if (typeParam) {
      const allowedTypes = String(typeParam)
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)

      filteredResult = result.filter((item) =>
        allowedTypes.includes(String(item.type).toLowerCase())
      )
    }

    const rawData = await this.coverageSerializer.collection(filteredResult)

    const data = rawData.map((item) => ({
      serviceId: item.serviceId ?? item.serviceId ?? null,
      homepassId: item.homepassId ?? item.homepassId ?? null,
      splitterId: item.splitterId ?? item.splitterId ?? null,
      customerId: item.customerId ?? item.customerId ?? null,
      name: item.name,
      address: item.address,
      coordinate: item.coordinate,
      type: item.type,
    }))

    const fields = [
      'serviceId',
      'homepassId',
      'splitterId',
      'customerId',
      'name',
      'address',
      'coordinate',
      'type',
    ]

    const parser = new Json2CsvParser({
      fields,
      delimiter: ';',
    })

    const csv = parser.parse(data ?? [])

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', 'attachment; filename="coverage.csv"')

    return response.send(csv)
  }
}
