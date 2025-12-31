import User from '#models/user'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface UserSerializeInterface {
  id: number
  name: string | null
  email: string
  picture: string | null
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
  data: UserSerializeInterface[]
}

export default class UserSerialize {
  async single(user: User): Promise<UserSerializeInterface> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    }
  }

  async collection(users: User[]): Promise<UserSerializeInterface[]> {
    return Promise.all(users.map((user) => this.single(user)))
  }

  async paginate(users: ModelPaginatorContract<User>): Promise<PaginatedResponse> {
    return {
      meta: users.getMeta(),
      data: await Promise.all(users.all().map((user) => this.single(user))),
    }
  }
}
