import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'home_pass'

  async up() {
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
      table.string('homepassed_coordinate').index()
      table.string('homepass_type')
      table.string('resident_type').index()
      table.string('resident_name')
      table.string('street_name')
      table.string('no')
      table.string('unit').nullable()
      table.string('pop_id')
      table.string('splitter_id')
      table.string('spliter_distribusi_koordinat').index()
      table.date('rfs_date')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
