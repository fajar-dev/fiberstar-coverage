import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Helper function: konversi "lat, lon" (TEXT) menjadi geometry(Point,4326)
    this.schema.raw(`
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
    `)
  }

  async down() {
    this.schema.raw('DROP FUNCTION IF EXISTS to_point4326(TEXT)')
  }
}
