import vine from '@vinejs/vine'

export const coverageCheck = vine.compile(
  vine.object({
    longitude: vine.number(),
    latitude: vine.number(),
  })
)
