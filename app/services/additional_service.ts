import db from '@adonisjs/lucid/services/db'

export class AdditionalService {
  /**
   * Ambil semua nilai dari enum PostgreSQL bernama `type_enum`
   * beserta jumlah data di table coverages untuk masing-masing type
   */
  public async getTypeEnumValues() {
  const rows = await db.rawQuery(`
    SELECT 
      pg_enum.enumlabel,
      COUNT(coverages.id) as count
    FROM pg_enum
    INNER JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
    LEFT JOIN coverages ON coverages.type::text = pg_enum.enumlabel::text
    WHERE pg_type.typname = ?
    GROUP BY pg_enum.enumlabel, pg_enum.enumsortorder
    ORDER BY pg_enum.enumsortorder
  `, ['type_enum'])

  return rows.rows
}
}