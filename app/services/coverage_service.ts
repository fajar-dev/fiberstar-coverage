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
    limit: number | null
  ): Promise<Coverage[]> {
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

    // Jika ada radius → filter pakai ST_DWithin
    if (radius) {
      query.andWhereRaw(`ST_DWithin(coordinate_geo::geography, ${pointSql}::geography, ?)`, [
        longitude,
        latitude,
        radius,
      ])
    }

    // Urutkan berdasarkan jarak terdekat
    query.orderByRaw(`coordinate_geo <-> ${pointSql}`, [longitude, latitude])

    // Jika ada limit → batasi jumlah hasil
    if (limit) {
      query.limit(limit)
    }

    return await query
  }
}
