import Coverage from '#models/coverage'
import db from '@adonisjs/lucid/services/db'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export class CoverageService {
  /**
   * @param longitude number
   * @param latitude number
   * @param page number
   * @param limit number
   */
  async findAll(
    longitude: number,
    latitude: number,
    page: number,
    limit: number
  ): Promise<ModelPaginatorContract<Coverage>> {
    const pointSql = 'ST_SetSRID(ST_MakePoint(?, ?), 4326)'

    const query = Coverage.query()
      .select(
        '*',
        db.rawQuery(
          `ST_Distance(coordinate_geo::geography, ${pointSql}::geography) AS distance_meters`,
          [longitude, latitude]
        )
      )
      .whereNotNull('coordinate_geo')
      .orderByRaw(`coordinate_geo <-> ${pointSql}`, [longitude, latitude])
      .paginate(page, limit)

    return query
  }

  async create(
    homepassId: string | null,
    serviceId: string | null,
    splitterId: string | null,
    customerId: string | null,
    name: string | null,
    address: string | null,
    longitude: number,
    latitude: number,
    type: string
  ): Promise<Coverage> {
    const coordinate = `${latitude}, ${longitude}`

    const existing = await Coverage
      .query()
      .where('coordinate', coordinate)
      .where('type', type)
      .first()

    if (existing) {
      existing.merge({
        homepassId,
        serviceId,
        splitterId,
        customerId,
        name,
        address,
      })

      await existing.save()
      return existing
    }

    return Coverage.create({
      homepassId,
      serviceId,
      splitterId,
      customerId,
      name,
      address,
      coordinate,
      type,
    })
  }

  /**
   * @param longitude number
   * @param latitude number
   * @param radius number (meter)
   * @param limit number
   */
  async find(
    longitude: number,
    latitude: number,
    radius: number | null,
    limit: number | null,
    bounds?: {
      neLat: number
      neLng: number
      swLat: number
      swLng: number
    }
  ): Promise<Coverage[]> {
    const pointSql = 'ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography'

    const query = Coverage.query()
      .select(
        '*',
        db.rawQuery(`ST_Distance(coordinate_geo, ${pointSql}) AS distance_meters`, [
          longitude,
          latitude,
        ])
      )
      .whereNotNull('coordinate_geo')

    if (bounds) {
      query.andWhereRaw(
        'coordinate_geo::geometry @ ST_MakeEnvelope(?, ?, ?, ?, 4326)',
        [bounds.swLng, bounds.swLat, bounds.neLng, bounds.neLat]
      )
    } else if (radius) {
      query.andWhereRaw(`ST_DWithin(coordinate_geo, ${pointSql}, ?)`, [longitude, latitude, radius])
    }

    query.orderByRaw(`coordinate_geo <-> ${pointSql}`, [longitude, latitude])

    if (limit) {
      query.limit(limit)
    }

    return await query
  }
}
