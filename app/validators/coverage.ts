import vine from '@vinejs/vine'

export const retrieve = vine.compile(
  vine.object({
    longitude: vine.number(),
    latitude: vine.number(),
  })
)
