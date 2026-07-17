import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw('DROP FUNCTION IF EXISTS to_point4326(TEXT);')
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION to_point4326(coord TEXT)
      RETURNS geography AS $$
      DECLARE
        lat DOUBLE PRECISION;
        lon DOUBLE PRECISION;
        arr TEXT[];
      BEGIN
        IF coord IS NULL OR btrim(coord) = '' THEN
          RETURN NULL;
        END IF;

        -- "lat, lon"
        arr := regexp_split_to_array(coord, '\\s*,\\s*');
        IF array_length(arr, 1) <> 2 THEN
          RETURN NULL;
        END IF;

        lat := arr[1]::DOUBLE PRECISION;
        lon := arr[2]::DOUBLE PRECISION;

        RETURN ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography;
      EXCEPTION WHEN others THEN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `)
  }

  async down() {
    this.schema.raw('DROP FUNCTION IF EXISTS to_point4326(TEXT)')
  }
}
