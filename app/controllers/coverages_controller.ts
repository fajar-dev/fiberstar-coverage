import type { HttpContext } from '@adonisjs/core/http'
import Response from '#helpers/response'
import { inject } from '@adonisjs/core'
import { CoverageService } from '#services/coverage_service'
import { coverageCheck, coverageCreate, coverageFind } from '#validators/coverage'
import CoverageSerialize from '#serializers/coverages_serializer'
import { Parser as Json2CsvParser } from 'json2csv'

@inject()
export default class CoveragesController {
  constructor(
    private coverageService: CoverageService,
    private coverageSerializer: CoverageSerialize
  ) {}

  async index({ request, response, auth }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const payload = await request.validateUsing(coverageCheck)
    const result = await this.coverageService.findAll(
      payload.longitude,
      payload.latitude,
      page,
      limit
    )
    const isLoggedIn = await auth.check()
    return Response.ok(
      response,
      await this.coverageSerializer.paginate(result, isLoggedIn),
      'Home Pass retrieved successfully'
    )
  }

  async find({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(coverageFind)

    let bounds
    if (payload.ne_lat && payload.ne_lng && payload.sw_lat && payload.sw_lng) {
      bounds = {
        neLat: payload.ne_lat,
        neLng: payload.ne_lng,
        swLat: payload.sw_lat,
        swLng: payload.sw_lng,
      }
    }

    const result = await this.coverageService.find(
      payload.longitude,
      payload.latitude,
      payload.radius ?? null,
      payload.limit ?? null,
      bounds
    )

    const isLoggedIn = await auth.check()
    return Response.ok(
      response,
      await this.coverageSerializer.collection(result, isLoggedIn),
      'Home Pass retrieved successfully'
    )
  }

  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(coverageCreate)
    const result = await this.coverageService.create(payload.homepassId, payload.serviceId, payload.splitterId, payload.customerId, payload.name, payload.address, payload.longitude, payload.latitude, payload.type)
    return Response.ok(response, result, 'Home Pass created successfully')
  }

  async export({ request, response }: HttpContext) {
    const payload = await request.validateUsing(coverageFind)

    let bounds
    if (payload.ne_lat && payload.ne_lng && payload.sw_lat && payload.sw_lng) {
      bounds = {
        neLat: payload.ne_lat,
        neLng: payload.ne_lng,
        swLat: payload.sw_lat,
        swLng: payload.sw_lng,
      }
    }

    const result = await this.coverageService.find(
      payload.longitude,
      payload.latitude,
      payload.radius ?? null,
      payload.limit ?? null,
      bounds
    )

    let filteredResult = result

    if (payload.type) {
      const allowedTypes = String(payload.type)
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)

      filteredResult = result.filter((item) =>
        allowedTypes.includes(String(item.type).toLowerCase())
      )
    }

    const rawData = await this.coverageSerializer.collection(filteredResult, true)

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
