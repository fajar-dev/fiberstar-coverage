import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'

export default class Sync extends BaseCommand {
  static commandName = 'sync:fiberstar'
  static description = 'Sync data dari home_pass ke coverages (Bali) + normalisasi coordinate'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Mulai sync home_pass → coverages (Bali)')

    const sql = `
      WITH src AS (
          SELECT
              hp.*,
              trim(
                  regexp_replace(hp.homepassed_coordinate, 'Â°', '', 'g')
              ) AS cleaned_coord
          FROM home_pass hp
      )
      INSERT INTO coverages (
          homepass_id,
          name,
          address,
          coordinate,
          coordinate_geo,
          type
      )
      SELECT
          s.homepass_id,
          s.resident_name AS name,
          CONCAT(
              s.street_name, ' ', s.no, ', ',
              s.sub_district, ', ',
              s.district, ', ',
              s.city, ', ',
              s.province, ', ',
              s.postal_code
          ) AS address,
          CASE
              WHEN s.cleaned_coord ~ '^-?[0-9.]+\\s+-?[0-9.]+$' THEN
                  format(
                      '%s, %s',
                      split_part(s.cleaned_coord, ' ', 1),
                      split_part(s.cleaned_coord, ' ', 2)
                  )
              ELSE
                  s.homepassed_coordinate
          END AS coordinate,
          s.homepassed_coordinate_geo AS coordinate_geo,
          'Fiberstar'::public.type_enum AS type
      FROM src s
      WHERE NOT EXISTS (
          SELECT 1
          FROM coverages c
          WHERE c.homepass_id = s.homepass_id
      );
    `

    const result = await db.rawQuery(sql)
    const inserted = (result as any).rowCount ?? 0

    this.logger.success(`Sync selesai. Rows inserted: ${inserted}`)
  }
}
