import Coverage from '#models/coverage'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface CoverageSerializeInterface {
  id: string
  serviceId: string
  homepassId: string
  name: string
  address: string
  coordinate: string
  distance: number
  type: string
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

interface PaginatedResponse {
  meta: PaginationMeta
  data: CoverageSerializeInterface[]
}

export default class CoverageSerialize {
  async single(homePass: Coverage): Promise<CoverageSerializeInterface> {
    return {
      id: homePass.id,
      serviceId: homePass.service_id,
      homepassId: homePass.homepass_id,
      name: homePass.name,
      address: homePass.address,
      coordinate: homePass.coordinate,
      distance: homePass.distanceMeters ?? 0,
      type: homePass.type,
    }
  }

  // untuk array biasa (misalnya hasil limit)
  async collection(datas: Coverage[]): Promise<CoverageSerializeInterface[]> {
    return Promise.all(datas.map((coverage: Coverage) => this.single(coverage)))
  }

  // untuk hasil paginate()
  async paginate(datas: ModelPaginatorContract<Coverage>): Promise<PaginatedResponse> {
    return {
      meta: datas.getMeta(),
      data: await Promise.all(datas.all().map((coverage: Coverage) => this.single(coverage))),
    }
  }
}
