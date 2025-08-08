import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class HomePass extends BaseModel {
  static get table() {
    return 'home_pass'
  }

  @column({ isPrimary: true })
  declare homepassId: string

  @column()
  declare projectId: string

  @column()
  declare projectName: string

  @column()
  declare region: string

  @column()
  declare subRegion: string

  @column()
  declare areaName: string

  @column()
  declare province: string

  @column()
  declare city: string

  @column()
  declare district: string

  @column()
  declare subDistrict: string

  @column()
  declare postalCode: number

  @column()
  declare homepassedCoordinate: string

  @column()
  declare homepassType: string

  @column()
  declare residentType: string

  @column()
  declare residentName: string

  @column()
  declare streetName: string

  @column()
  declare no: string

  @column()
  declare unit: string | null

  @column()
  declare popId: string

  @column()
  declare splitterId: string

  @column()
  declare spliterDistribusiKoordinat: string

  @column()
  declare rfsDate: Date

  @column()
  declare distance_meters?: number
}
