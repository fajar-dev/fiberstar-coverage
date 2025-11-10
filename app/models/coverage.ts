import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Coverage extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare coordinate: string

  @column()
  declare distanceMeters?: number

  @column()
  declare type: string
}
