import { BaseSchema } from '@adonisjs/lucid/schema'

export default class HomePass extends BaseSchema {
  protected tableName = 'home_pass'

  public async up() {
    // Buat ENUM type di PostgreSQL jika belum ada
    this.schema.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_enum') THEN
          CREATE TYPE type_enum AS ENUM ('Fiberstar', 'CGS', 'SIP');
        END IF;
      END$$;
    `)

    // Buat tabel utama
    this.schema.createTable(this.tableName, (table) => {
      table.string('homepass_id').primary()
      table.string('project_id')
      table.string('project_name')
      table.string('region')
      table.string('sub_region')
      table.string('area_name')
      table.string('province')
      table.string('city').index()
      table.string('district')
      table.string('sub_district')
      table.integer('postal_code')
      table.string('homepassed_coordinate')
      table.specificType('homepassed_coordinate_geo', 'geometry(Point,4326)')
      table.string('homepass_type')
      table.string('resident_type').index()
      table.string('resident_name')
      table.string('street_name')
      table.string('no')
      table.string('unit').nullable()
      table.string('pop_id')
      table.string('splitter_id')
      table.string('spliter_distribusi_koordinat')
      table.specificType('spliter_distribusi_koordinat_geo', 'geometry(Point,4326)')
      table.date('rfs_date')

      table.specificType('type', 'type_enum').notNullable().defaultTo('Fiberstar')
    })

    // Buat helper PostGIS trigger & index
    const coordColumns = ['homepassed_coordinate', 'spliter_distribusi_koordinat']

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
    // 1️⃣ Hapus trigger & index dulu
    this.schema.raw(`
      DROP TRIGGER IF EXISTS ${this.tableName}_set_geoms_trg ON ${this.tableName};
      DROP FUNCTION IF EXISTS ${this.tableName}_set_geoms();
    `)

    this.schema.raw(`DROP INDEX IF EXISTS ${this.tableName}_homepassed_geom_gist`)
    this.schema.raw(`DROP INDEX IF EXISTS ${this.tableName}_spliter_distribusi_koordinat_geom_gist`)

    // 2️⃣ Hapus tabel
    this.schema.dropTable(this.tableName)

    // 3️⃣ Opsional — hapus ENUM type kalau tidak dipakai tabel lain
    this.schema.raw(`DROP TYPE IF EXISTS type_enum`)
  }
}
