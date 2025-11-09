import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coverages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('homepass_id').primary()
      table.string('homepassed_coordinate')
      table.specificType('homepassed_coordinate_geo', 'geometry(Point,4326)')
    })

    // Gunakan helper functions untuk setup trigger dan index
    const coordColumns = ['homepassed_coordinate']

    // Buat spatial indexes
    this.schema.raw(`
      SELECT create_spatial_indexes('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    // Buat trigger function
    this.schema.raw(`
      SELECT create_geom_trigger_function('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    // Buat trigger
    this.schema.raw(`
      SELECT create_geom_trigger('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    // Update data existing (jika ada)
    this.schema.raw(`
      SELECT update_existing_geoms('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    // Analyze table
    this.schema.raw(`ANALYZE ${this.tableName}`)
  }

  public async down() {
    // Drop trigger dan function yang spesifik untuk table ini
    this.schema.raw(`
      DROP TRIGGER IF EXISTS ${this.tableName}_set_geoms_trg ON ${this.tableName};
      DROP FUNCTION IF EXISTS ${this.tableName}_set_geoms();
    `)

    // Drop index
    this.schema.raw(`DROP INDEX IF EXISTS ${this.tableName}_homepassed_geom_gist`)

    // Drop table
    this.schema.dropTable(this.tableName)
  }
}
