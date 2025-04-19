import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-minecraft'
import { AuthService } from '../auth.service'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { pick } from 'radash'

export type MinecraftDoneCallback = (err: null | Error, data: any) => void

export interface MinecraftProfile {
  [key: string]: any

  id?: string
  name?: string

  skins?: {
    [key: string]: any

    id: string
    state: 'ACTIVE' | string
    url: string

    textureKey?: string
    variant?: 'CLASSIC' | string
  }[]

  capes?: {
    [key: string]: any

    id: string
    state: 'ACTIVE' | string
    url: string
    alias: string
  }[]

  profileActions?: {
    [key: string]: any
  }

  token: string
  premium: boolean
  createdAt?: string

  xuid: string
  gamerTag: string
}

// @see https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
@Injectable()
export class MinecraftStrategy extends PassportStrategy(Strategy, 'minecraft') {
  private readonly logger = new Logger(MinecraftStrategy.name)

  public constructor(
    private readonly _service: AuthService,
    private readonly _config: ConfigService,
  ) {
    super({
      ..._config.get('passport.strategies.minecraft'),
      authorizationURL: 'https://login.live.com/oauth20_authorize.srf?prompt=select_account',
      passReqToCallback: true,
      session: false,
    })
  }

  public async validate(
    _req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: MinecraftProfile,
    done: MinecraftDoneCallback,
  ): Promise<void> {
    this.logger.verbose(`Authenticate with Minecraft <${JSON.stringify(pick(profile, ['id', 'name', 'premium']))}>...`)

    let err = null
    delete profile.token

    if (!profile.premium) {
      throw new UnauthorizedException('Vous devez posséder un compte premium (possédé Minecraft ou le GamePass) !')
    }

    const user = await this._service.checkUserAvailabilityMinecraft(profile)

    if (!user) {
      err = new UnauthorizedException("Utilisateur introuvable !")
    }

    return done(err, user)
  }
}
