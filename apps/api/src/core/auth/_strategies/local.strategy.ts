import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../auth.service'
import { IVerifyOptions, Strategy } from 'passport-local'

export type LocalDoneCallback = (err: null | Error, data: any, options?: IVerifyOptions) => void

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name)

  public constructor(private readonly _service: AuthService) {
    super({
      passReqToCallback: true,
    })
  }

  public async validate(
    _req: Request,
    username: string,
    password: string,
    done: LocalDoneCallback,
  ): Promise<void> {
    this.logger.verbose(`Authenticate with Local <${username}>...`)

    let err = null
    const user = await this._service.checkUserAvailabilityLocal({ username, password })

    if (!user) {
      err = new UnauthorizedException("Utilisateur introuvable !")
    }

    return done(err, user)
  }
}
