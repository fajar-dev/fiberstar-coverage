import User from "#models/user"
import { DateTime } from "luxon"

export class UserService {
  async findOrCreateUser(name: string, email: string, picture: string, sub: string, lastLoginIp: string, lastLoginAt: DateTime) {
    const user = await User.query().where('email', email).first()
    if (user) {
      return user
    }
    return await User.create({ name, email, picture, sub, lastLoginIp, lastLoginAt })
  }
}