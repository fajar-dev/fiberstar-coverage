import { GoogleService } from '#services/google_service'
import UserSerialize from '#serializers/user_serializer'
import { login } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Response from '#helpers/response'
import { UserService } from '#services/user_service'
import { DateTime } from 'luxon'
import User from '#models/user'

@inject()
export default class AuthController {
    constructor(
        private googleService: GoogleService,
        private userService: UserService,
        private userSerialize: UserSerialize
    ) {}

    async login({ request, response }: HttpContext) {
        const payload = await request.validateUsing(login)
        const result = await this.googleService.verify(payload.code)
        if (!result) {
            return Response.unauthorized(response, 'Invalid code')
        }

        const allowedDomains = ['nusa.net.id', 'nusa.id', 'nusawork.com']

        if (!result.hd || !allowedDomains.includes(result.hd)) {
            return Response.unauthorized(
            response,
            'User not authorized'
            )
        }
        const lastLoginIp = request.ip()
        const lastLoginAt = DateTime.now()
        const user = await this.userService.findOrCreateUser(result.name, result.email, result.picture, result.sub, lastLoginIp, lastLoginAt)
        const accessToken = await User.accessTokens.create(user)
        const userSerialize = await this.userSerialize.single(user)
        return Response.ok(response, { user: userSerialize, token: accessToken }, 'User logged in successfully')
    }

    async me({ response, auth }: HttpContext) {
        const user = auth.user
        if (!user) {
            return Response.unauthorized(response, 'User not found')
        }
        const userSerialize = await this.userSerialize.single(user)
        return Response.ok(response, userSerialize, 'User retrieved successfully')
    }

    async logout({ response, auth }: HttpContext) {
        const user = auth.user
        if (user && user.currentAccessToken) {
            await User.accessTokens.delete(user, user.currentAccessToken.identifier)
        }
        return Response.ok(response, null, 'User logged out successfully')
    }
}