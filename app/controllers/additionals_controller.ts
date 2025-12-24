import { AdditionalService } from '#services/additional_service'
import { inject } from '@adonisjs/core'
import Response from '#helpers/response'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AdditionalsController {
  constructor(private additionalService: AdditionalService) {}

  async typeEnum({ response }: HttpContext) {
    const result = await this.additionalService.getTypeEnumValues()
    const values = result.map((r: any) => ({
      label: r.enumlabel,
      value: r.enumlabel,
      count: parseInt(r.count) || 0
    }))

    return Response.ok(response, values, 'Type Enum retrieved successfully')
  }
}