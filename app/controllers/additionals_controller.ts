import { AdditionalService } from '#services/additional_service'
import { inject } from '@adonisjs/core'
import Response from '#helpers/response'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AdditionalsController {
  constructor(private additionalService: AdditionalService) {}

  async typeEnum({ response }: HttpContext) {
    const result = await this.additionalService.getTypeEnumValues()
    const values = result.map((r) => ({
      label: r.enumlabel,
      value: r.enumlabel,
    }))

    return Response.ok(response, values, 'Type Enum retrieved successfully')
  }
}
