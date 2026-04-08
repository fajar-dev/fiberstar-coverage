import vine from '@vinejs/vine'

export const coverageCheck = vine.compile(
  vine.object({
    longitude: vine.number(),
    latitude: vine.number(),
  })
)

export const coverageFind = vine.compile(
  vine.object({
    longitude: vine.number(),
    latitude: vine.number(),
    radius: vine.number().optional(),
    limit: vine.number().optional(),
    ne_lat: vine.number().optional(),
    ne_lng: vine.number().optional(),
    sw_lat: vine.number().optional(),
    sw_lng: vine.number().optional(),
    type: vine.string().optional(),
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