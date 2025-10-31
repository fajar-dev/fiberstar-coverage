import db from '@adonisjs/lucid/services/db'

export class AdditionalService {
  /**
   * Ambil semua nilai dari enum PostgreSQL bernama `type_enum`
   */
  public async getTypeEnumValues() {
    const rows = await db
      .from('pg_enum')
      .join('pg_type', 'pg_type.oid', '=', 'pg_enum.enumtypid')
      .where('pg_type.typname', 'type_enum')
      .select('pg_enum.enumlabel')
      .orderBy('pg_enum.enumsortorder')

    return rows
  }
}
