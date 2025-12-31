import { OAuth2Client } from 'google-auth-library'
import env from '#start/env'

export class GoogleService {
  private CLIENT_ID = env.get('GOOGLE_CLIENT_ID')
  private SECRET_KEY = env.get('GOOGLE_SECRET_KEY')

  private getOauth2Client() {
    const oAuth2Client = new OAuth2Client(
      this.CLIENT_ID,
      this.SECRET_KEY,
      'postmessage'
    )
    return oAuth2Client
  }

  async verify(code: string): Promise<any> {
    const oAuth2Client = this.getOauth2Client()
    const result = await oAuth2Client.getToken(code)
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: result.tokens.id_token!,
      audience: this.CLIENT_ID,
    })
    const payload = ticket.getPayload()
    return payload
  }
}