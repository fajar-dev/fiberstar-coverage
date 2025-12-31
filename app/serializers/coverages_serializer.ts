import Coverage from '#models/coverage'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface CoverageSerializeInterface {
  id: string
  serviceId: string | null
  homepassId: string
  splitterId: string
  customerId: string | null
  name: string | null
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
  async single(homePass: Coverage, isLoggedIn: boolean = false): Promise<CoverageSerializeInterface> {
    return {
      id: homePass.id,
      serviceId: isLoggedIn ? homePass.service_id : null,
      homepassId: homePass.homepass_id,
      splitterId: homePass.splitter_id,
      customerId: isLoggedIn ? homePass.customer_id : null,
      name: isLoggedIn ? homePass.name : null,
      address: homePass.address,
      coordinate: homePass.coordinate,
      distance: homePass.distanceMeters ?? 0,
      type: homePass.type,
    }
  }

  // untuk array biasa (misalnya hasil limit)
  async collection(datas: Coverage[], isLoggedIn: boolean = false): Promise<CoverageSerializeInterface[]> {
    return Promise.all(datas.map((coverage: Coverage) => this.single(coverage, isLoggedIn)))
  }

  // untuk hasil paginate()
  async paginate(datas: ModelPaginatorContract<Coverage>, isLoggedIn: boolean = false): Promise<PaginatedResponse> {
    return {
      meta: datas.getMeta(),
      data: await Promise.all(datas.all().map((coverage: Coverage) => this.single(coverage, isLoggedIn))),
    }
  }
}
