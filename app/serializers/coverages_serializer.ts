import HomePass from '#models/home_pass'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface CoverageSerializeInterface {
  id: string
  projectId: string
  projectName: string
  region: string
  subRegion: string
  areaName: string
  province: string
  city: string
  district: string
  subDistrict: string
  postalCode: number
  homepassedCoordinate: string
  homepassType: string
  residentType: string
  residentName: string
  streetName: string
  no: string
  unit: string | null
  popId: string
  splitterId: string
  spliterDistribusiKoordinat: string
  rfsDate: Date
  distance: number
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
  async single(homePass: HomePass): Promise<CoverageSerializeInterface> {
    return {
      id: homePass.homepassId,
      projectId: homePass.projectId,
      projectName: homePass.projectName,
      region: homePass.region,
      subRegion: homePass.subRegion,
      areaName: homePass.areaName,
      province: homePass.province,
      city: homePass.city,
      district: homePass.district,
      subDistrict: homePass.subDistrict,
      postalCode: homePass.postalCode,
      homepassedCoordinate: homePass.homepassedCoordinate,
      homepassType: homePass.homepassType,
      residentType: homePass.residentType,
      residentName: homePass.residentName,
      streetName: homePass.streetName,
      no: homePass.no,
      unit: homePass.unit,
      popId: homePass.popId,
      splitterId: homePass.splitterId,
      spliterDistribusiKoordinat: homePass.spliterDistribusiKoordinat,
      rfsDate: homePass.rfsDate,
      distance: homePass.distanceMeters ?? 0,
    }
  }

  async collection(datas: ModelPaginatorContract<HomePass>): Promise<PaginatedResponse> {
    return {
      meta: datas.getMeta(),
      data: await Promise.all(datas.all().map((homePass: HomePass) => this.single(homePass))),
    }
  }
}
