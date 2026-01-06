import vine from '@vinejs/vine'

export const coverageCheck = vine.compile(
  vine.object({
    longitude: vine.number(),
    latitude: vine.number(),
  })
)

export const coverageCreate = vine.compile(
  vine.object({
    homepassId: vine.string().nullable(),
    serviceId: vine.string().nullable(),
    splitterId: vine.string().nullable(),
    customerId: vine.string().nullable(),
    name: vine.string().nullable(),
    address: vine.string().nullable(),
    longitude: vine.number(),
    latitude: vine.number(),
    type: vine.string(),
  })
)