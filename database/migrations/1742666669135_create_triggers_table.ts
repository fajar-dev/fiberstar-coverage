import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Function untuk membuat trigger function secara dinamis per table
    // Ini akan dipanggil dari migration table yang membutuhkan
    this.schema.raw(`
      -- Function helper untuk membuat trigger function per table
      -- Parameter: table_name, array of coordinate columns
      CREATE OR REPLACE FUNCTION create_geom_trigger_function(
        table_name TEXT,
        coord_columns TEXT[]
      )
      RETURNS void AS $$
      DECLARE
        func_name TEXT;
        set_statements TEXT := '';
        col TEXT;
        col_geo TEXT;
      BEGIN
        func_name := table_name || '_set_geoms';
        
        -- Build SET statements untuk setiap kolom koordinat
        FOREACH col IN ARRAY coord_columns
        LOOP
          col_geo := col || '_geo';
          set_statements := set_statements || format(
            '  NEW.%I := to_point4326(NEW.%I);%s',
            col_geo, col, E'\\n'
          );
        END LOOP;

        -- Create trigger function
        EXECUTE format($func$
          CREATE OR REPLACE FUNCTION %I()
          RETURNS trigger AS $body$
          BEGIN
%s
            RETURN NEW;
          END;
          $body$ LANGUAGE plpgsql;
        $func$, func_name, set_statements);
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Function helper untuk membuat trigger
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION create_geom_trigger(
        table_name TEXT,
        coord_columns TEXT[]
      )
      RETURNS void AS $$
      DECLARE
        trigger_name TEXT;
        func_name TEXT;
        column_list TEXT;
      BEGIN
        trigger_name := table_name || '_set_geoms_trg';
        func_name := table_name || '_set_geoms';
        column_list := array_to_string(coord_columns, ', ');

        -- Drop trigger jika sudah ada
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_name, table_name);

        -- Create trigger
        EXECUTE format($trig$
          CREATE TRIGGER %I
          BEFORE INSERT OR UPDATE OF %s
          ON %I
          FOR EACH ROW
          EXECUTE FUNCTION %I()
        $trig$, trigger_name, column_list, table_name, func_name);
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Function helper untuk update data existing
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION update_existing_geoms(
        table_name TEXT,
        coord_columns TEXT[]
      )
      RETURNS void AS $$
      DECLARE
        set_clause TEXT := '';
        where_clause TEXT := '';
        col TEXT;
        col_geo TEXT;
        first BOOLEAN := TRUE;
      BEGIN
        FOREACH col IN ARRAY coord_columns
        LOOP
          col_geo := col || '_geo';
          
          IF NOT first THEN
            set_clause := set_clause || ', ';
            where_clause := where_clause || ' OR ';
          END IF;
          
          set_clause := set_clause || format(
            '%I = to_point4326(%I)',
            col_geo, col
          );
          
          where_clause := where_clause || format(
            '(%I IS NOT NULL AND btrim(%I) <> '''')',
            col, col
          );
          
          first := FALSE;
        END LOOP;

        EXECUTE format(
          'UPDATE %I SET %s WHERE %s',
          table_name, set_clause, where_clause
        );
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Function helper untuk create spatial index
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION create_spatial_indexes(
        table_name TEXT,
        coord_columns TEXT[]
      )
      RETURNS void AS $$
      DECLARE
        col TEXT;
        col_geo TEXT;
        index_name TEXT;
      BEGIN
        FOREACH col IN ARRAY coord_columns
        LOOP
          col_geo := col || '_geo';
          index_name := table_name || '_' || replace(col, '_coordinate', '') || '_geom_gist';
          
          EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I USING GIST (%I)',
            index_name, table_name, col_geo
          );
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `)
  }

  async down() {
    this.schema.raw('DROP FUNCTION IF EXISTS create_spatial_indexes(TEXT, TEXT[])')
    this.schema.raw('DROP FUNCTION IF EXISTS update_existing_geoms(TEXT, TEXT[])')
    this.schema.raw('DROP FUNCTION IF EXISTS create_geom_trigger(TEXT, TEXT[])')
    this.schema.raw('DROP FUNCTION IF EXISTS create_geom_trigger_function(TEXT, TEXT[])')
  }
}
