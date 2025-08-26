import HomePass from '#models/home_pass'
import db from '@adonisjs/lucid/services/db'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export class HomepassService {
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
  ): Promise<ModelPaginatorContract<HomePass>> {
    const pointSql = 'ST_SetSRID(ST_MakePoint(?, ?), 4326)'

    const query = HomePass.query()
      .select(
        '*',
        db.rawQuery(
          `ST_Distance(homepassed_coordinate_geo::geography, ${pointSql}::geography) AS distance_meters`,
          [longitude, latitude]
        )
      )
      .whereNotNull('homepassed_coordinate_geo')
      .orderByRaw(`homepassed_coordinate_geo <-> ${pointSql}`, [longitude, latitude])
      .paginate(page, limit)

    return query
  }

  /**
   * @param longitude number
   * @param latitude number
   * @param limit number
   */
  async find(longitude: number, latitude: number, limit: number): Promise<HomePass[]> {
    const pointSql = 'ST_SetSRID(ST_MakePoint(?, ?), 4326)'

    const query = await HomePass.query()
      .select(
        '*',
        db.rawQuery(
          `ST_Distance(homepassed_coordinate_geo::geography, ${pointSql}::geography) AS distance_meters`,
          [longitude, latitude]
        )
      )
      .whereNotNull('homepassed_coordinate_geo')
      .orderByRaw(`homepassed_coordinate_geo <-> ${pointSql}`, [longitude, latitude])
      .limit(limit)

    return query
  }
}
