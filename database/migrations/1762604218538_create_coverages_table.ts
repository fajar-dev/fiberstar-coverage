// 0004_coverages.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coverages'

  public async up() {
    this.schema.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_enum') THEN
          CREATE TYPE type_enum AS ENUM (
            'Fiberstar', 'CGS', 'SIP',
            'CGS Splitter', 'SIP Splitter', 'Fiberstar Splitter',
            'CGS Customer', 'SIP Customer', 'Fiberstar Customer'
          );
        END IF;
      END$$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('homepass_id').nullable()
      table.string('service_id').nullable()
      table.string('splitter_id').nullable()
      table.string('name').nullable()
      table.string('address').nullable()

      table.string('coordinate')
      // ⬇⬇⬇ penting: geography, bukan geometry
      table.specificType('coordinate_geo', 'geography(Point,4326)')

      table.specificType('type', 'type_enum').notNullable().defaultTo('Fiberstar')
    })

    const coordColumns = ['coordinate']

    this.schema.raw(`
      SELECT create_spatial_indexes('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    this.schema.raw(`
      SELECT create_geom_trigger_function('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    this.schema.raw(`
      SELECT create_geom_trigger('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    this.schema.raw(`
      SELECT update_existing_geoms('${this.tableName}', ARRAY['${coordColumns.join("','")}']::TEXT[])
    `)

    this.schema.raw(`ANALYZE ${this.tableName}`)
  }

  public async down() {
    this.schema.raw(`
      DROP TRIGGER IF EXISTS ${this.tableName}_set_geoms_trg ON ${this.tableName};
      DROP FUNCTION IF EXISTS ${this.tableName}_set_geoms();
    `)
    this.schema.raw(`DROP INDEX IF EXISTS ${this.tableName}_coordinate_geom_gist`)
    this.schema.dropTable(this.tableName)
  }
}
