import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Coverage extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'homepass_id' })
  declare homepassId: string | null

  @column({ columnName: 'service_id' })
  declare serviceId: string | null

  @column({ columnName: 'splitter_id' })
  declare splitterId: string | null

  @column({ columnName: 'customer_id' })
  declare customerId: string | null

  @column({ columnName: 'name' })
  declare name: string | null

  @column({ columnName: 'address' })
  declare address: string | null

  @column({ columnName: 'coordinate' })
  declare coordinate: string

  @column({ columnName: 'distance_meters' })
  declare distanceMeters?: number

  @column({ columnName: 'type' })
  declare type: string
}
