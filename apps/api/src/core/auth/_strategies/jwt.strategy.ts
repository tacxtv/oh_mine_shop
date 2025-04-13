import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from 'jsonwebtoken'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  protected logger: Logger = new Logger(JwtStrategy.name)

  public constructor(
    private readonly auth: AuthService,
    _config: ConfigService,
  ) {
    super({
      secretOrKey: _config.get('jwt.options.secret'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  public async validate(
    _: Request,
    payload: JwtPayload & { scopes: string[] },
    done: VerifiedCallback,
  ): Promise<void> {
    this.logger.verbose(`Atempt to authenticate with JTI: <${payload.sub}>`)

    if (!payload?.sub) return done(new UnauthorizedException(), false)

    const user = await this.auth.verifyIdentity(payload)

    if (!user) return done(new ForbiddenException(), false)

    return done(null, user)
  }
}
