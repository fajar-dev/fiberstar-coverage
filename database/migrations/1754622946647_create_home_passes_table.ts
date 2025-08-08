import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'home_pass'

  public async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS postgis')

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
    })

    // Index spasial
    this.schema.raw(
      `CREATE INDEX IF NOT EXISTS ${this.tableName}_homepassed_geom_gist
       ON ${this.tableName} USING GIST (homepassed_coordinate_geo)`
    )
    this.schema.raw(
      `CREATE INDEX IF NOT EXISTS ${this.tableName}_splitter_geom_gist
       ON ${this.tableName} USING GIST (spliter_distribusi_koordinat_geo)`
    )

    // === Functions & Trigger ===
    this.schema.raw(`
      -- Helper: konversi "lat, lon" (TEXT) menjadi geometry(Point,4326)
      CREATE OR REPLACE FUNCTION to_point4326(coord TEXT)
      RETURNS geometry AS $$
      DECLARE
        lat DOUBLE PRECISION;
        lon DOUBLE PRECISION;
        arr TEXT[];
      BEGIN
        IF coord IS NULL OR btrim(coord) = '' THEN
          RETURN NULL;
        END IF;

        -- Split aman: buang spasi sekitar koma
        arr := regexp_split_to_array(coord, '\\s*,\\s*');
        IF array_length(arr, 1) <> 2 THEN
          RETURN NULL;
        END IF;

        lat := arr[1]::DOUBLE PRECISION;
        lon := arr[2]::DOUBLE PRECISION;

        RETURN ST_SetSRID(ST_MakePoint(lon, lat), 4326);
      EXCEPTION WHEN others THEN
        -- Jangan blok transaksi kalau parsing gagal
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      -- Trigger function: set kolom geometry dari string koordinat
      CREATE OR REPLACE FUNCTION ${this.tableName}_set_geoms()
      RETURNS trigger AS $$
      BEGIN
        NEW.homepassed_coordinate_geo :=
          to_point4326(NEW.homepassed_coordinate);

        NEW.spliter_distribusi_koordinat_geo :=
          to_point4326(NEW.spliter_distribusi_koordinat);

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger: jalan saat INSERT atau saat kolom koordinat di-UPDATE
      DROP TRIGGER IF EXISTS ${this.tableName}_set_geoms_trg ON ${this.tableName};
      CREATE TRIGGER ${this.tableName}_set_geoms_trg
      BEFORE INSERT OR UPDATE OF homepassed_coordinate, spliter_distribusi_koordinat
      ON ${this.tableName}
      FOR EACH ROW
      EXECUTE FUNCTION ${this.tableName}_set_geoms();
    `)

    this.schema.raw(`
      UPDATE ${this.tableName}
      SET
        homepassed_coordinate_geo = to_point4326(homepassed_coordinate),
        spliter_distribusi_koordinat_geo = to_point4326(spliter_distribusi_koordinat)
      WHERE (homepassed_coordinate IS NOT NULL AND btrim(homepassed_coordinate) <> '')
        OR (spliter_distribusi_koordinat IS NOT NULL AND btrim(spliter_distribusi_koordinat) <> '');
    `)

    this.schema.raw(`ANALYZE ${this.tableName}`)
  }

  public async down() {
    this.schema.raw(`
      DROP TRIGGER IF EXISTS ${this.tableName}_set_geoms_trg ON ${this.tableName};
      DROP FUNCTION IF EXISTS ${this.tableName}_set_geoms();
      DROP FUNCTION IF EXISTS to_point4326(TEXT);
    `)

    this.schema.raw(`DROP INDEX IF EXISTS ${this.tableName}_homepassed_geom_gist`)
    this.schema.raw(`DROP INDEX IF EXISTS ${this.tableName}_splitter_geom_gist`)

    this.schema.dropTable(this.tableName)

    // this.schema.raw('DROP EXTENSION IF EXISTS postgis')
  }
}
