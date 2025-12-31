import vine from '@vinejs/vine'

export const login = vine.compile(
  vine.object({
    code: vine.string(),
  })
)
