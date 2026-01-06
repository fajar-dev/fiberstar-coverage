import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class HomePass extends BaseModel {
  static get table() {
    return 'home_pass'
  }

  @column({ isPrimary: true })
  declare homepassId: string

  @column({ columnName: 'project_id' })
  declare projectId: string

  @column({ columnName: 'project_name' })
  declare projectName: string

  @column({ columnName: 'region' })
  declare region: string

  @column({ columnName: 'sub_region' })
  declare subRegion: string

  @column({ columnName: 'area_name' })
  declare areaName: string

  @column({ columnName: 'province' })
  declare province: string

  @column({ columnName: 'city' })
  declare city: string

  @column({ columnName: 'district' })
  declare district: string

  @column({ columnName: 'sub_district' })
  declare subDistrict: string

  @column({ columnName: 'postal_code' })
  declare postalCode: number

  @column({ columnName: 'homepassed_coordinate' })
  declare homepassedCoordinate: string

  @column({ columnName: 'homepass_type' })
  declare homepassType: string

  @column({ columnName: 'resident_type' })
  declare residentType: string

  @column({ columnName: 'resident_name' })
  declare residentName: string

  @column({ columnName: 'street_name' })
  declare streetName: string

  @column({ columnName: 'no' })
  declare no: string | null

  @column({ columnName: 'unit' })
  declare unit: string | null

  @column({ columnName: 'pop_id' })
  declare popId: string | null

  @column({ columnName: 'splitter_id' })
  declare splitterId: string | null

  @column({ columnName: 'spliter_distribusi_koordinat' })
  declare spliterDistribusiKoordinat: string | null

  @column({ columnName: 'rfs_date' })
  declare rfsDate: Date

  @column({ columnName: 'distance_meters' })
  declare distanceMeters?: number

  @column({ columnName: 'type' })
  declare type: string
}
