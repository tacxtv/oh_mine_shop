import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { MinecraftProfile } from './_strategies/minecraft.strategy'
import { User } from '../users/_schemas/users.schema'
import { FlattenMaps, Types } from 'mongoose'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { createHash, randomBytes } from 'node:crypto'
import { JwtPayload } from 'jsonwebtoken'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  public constructor(
    private readonly _user: UsersService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  public async checkUserAvailabilityMinecraft(profile: MinecraftProfile): Promise<FlattenMaps<User>> {
    const user = (await this._user.findOne(
      { name: profile.name },
      { state: true },
    )) as User
    if (user && !(user as any).isActive) throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur')

    return this._user.findOrCreateWithMinecraftProfile(profile)
  }

  public async checkUserAvailabilityLocal(payload: { username: string, password: string }): Promise<FlattenMaps<User>> {
    const user = (await this._user.findOne(
      { name: payload.username },
      { metadata: false },
    )) as User

    if (user && !(user as any).isActive) throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur')
    if (!user) throw new UnauthorizedException('Utilisateur introuvable !')
    if ('test' !== payload.password) throw new UnauthorizedException('Mot de passe incorrect !')

    return user
  }

  public async tokensDelivery(user: any, refresh_token?: string) {
    this.logger.verbose(`Atempt to deliver tokens for user <${user._id}>`)
    if (!Types.ObjectId.isValid(`${user._id}`)) throw new BadRequestException()

    if (!refresh_token) {
      refresh_token = this.jwtService.sign({}, {
        subject: `${user._id}`,
        expiresIn: 60 * 60 * 4,
        jwtid: randomBytes(16).toString('hex'),
      } as JwtSignOptions)
      await this.redis.set(
        this.generateRefreshKeyPath(user._id, refresh_token),
        JSON.stringify({ user }),
        'EX',
        60 * 60 * 4,
      )
    }

    return {
      refresh_token,
      access_token: this.jwtService.sign(
        {},
        {
          subject: `${user._id}`,
          expiresIn: 60 * 5,
        },
      ),
    }
  }

  public async refreshUserToken(body: { refresh_token: string }) {
    let currentRefreshToken = body.refresh_token
    try {
      await this.jwtService.verifyAsync(currentRefreshToken)
    } catch (e) {
      throw new UnauthorizedException('Unable to verify refresh token')
    }

    const refreshToken = this.jwtService.decode(currentRefreshToken)
    if (typeof refreshToken !== 'object' || !Types.ObjectId.isValid(refreshToken.sub)) {
      this.logger.error('Invalid refresh token', refreshToken)
      throw new BadRequestException()
    }

    const refreshKeyPath = this.generateRefreshKeyPath(
      refreshToken.sub,
      body.refresh_token,
    )
    const session = await this.redis.get(refreshKeyPath)
    try {
      const payload = JSON.parse(session)
      if ((await this.redis.ttl(refreshKeyPath)) < 60) {
        currentRefreshToken = null
        await this.redis.del(refreshKeyPath)
      }

      return await this.tokensDelivery(payload.user, currentRefreshToken)
    } catch (e) {
      throw new UnauthorizedException()
    }
  }

  public async getSessionData(_id: string | Types.ObjectId): Promise<FlattenMaps<User>> {
    if (!Types.ObjectId.isValid(`${_id}`)) {
      this.logger.error('Invalid user id', _id)
      throw new BadRequestException('Identifiant invalide, veuillez contacter un administrateur')
    }

    const user = await this._user.findOne(
      { _id },
      {
        projection: {
          metadata: 0,
        },
      },
    )
    if (!user) throw new UnauthorizedException('User not found')
    if (!(user as any).isActive) throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur')

    return user
  }

  public async verifyIdentity(payload: JwtPayload & { scopes?: string[] }): Promise<FlattenMaps<User> | JwtPayload & { scopes?: string[] } | null> {
    if ([...payload?.scopes || []].includes('offline')) {
      return payload
    }

    return await this.getSessionData(payload.sub)
  }

  public async logoutUser(jwt: string): Promise<void> {
    try {
      await this.jwtService.verifyAsync(jwt)
      const refresh_token = this.jwtService.decode(jwt)
      await this.redis.del(
        this.generateRefreshKeyPath(refresh_token.sub, jwt),
      )
    } finally {
    }
  }

  private generateRefreshKeyPath(
    _id: string | Types.ObjectId,
    refresh_token: string,
  ): string {
    return [
      'taskmanager',
      'auth',
      'user',
      _id,
      'refresh',
      createHash('sha256').update(refresh_token).digest('hex'),
    ].join('.')
  }
}
