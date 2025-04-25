import { InjectRedis } from '@nestjs-modules/ioredis'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Interval } from '@nestjs/schedule'
import { InjectRcon } from '@the-software-compagny/nestjs_module_rcon'
import Redis from 'ioredis'
import { FlattenMaps, Model, Types } from 'mongoose'
import { omit } from 'radash'
import { Rcon } from 'rcon-client'
import { firstValueFrom } from 'rxjs'
import { MinecraftProfile } from '../auth/_strategies/minecraft.strategy'
import { UserState } from './_enums/user-state.enum'
import { User } from './_schemas/users.schema'

interface UserMetadata {
  id: string;
  name: string;
  [key: string]: any;
}

type UserWithoutMetadata = Omit<FlattenMaps<User>, 'metadata'> & {
  _minecraftHead: string | null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
    @InjectRedis() private readonly _redis: Redis,
    @InjectRcon() private _rcon: Rcon,
  ) {
    this.handleIntervalWhitelist()
    this.logger.verbose('UsersService initialized 🔴')
  }

  @Interval(1_000 * 60 * 5)
  private async handleIntervalWhitelist() {
    const regex = /(\d+)\swhitelisted\splayer\(s\):\s(.+)/
    const list = await this._rcon.send('whitelist list')
    const matched = list.match(regex)
    let playersList: string[] = []

    if (matched) {
      const [_, total, players] = matched
      this.logger.verbose(`Whitelist list: ${total} players`)
      playersList = players.split(', ')

      for (const player of playersList) {
        const user = await this.userModel.findOne({ name: player })
        if (!user) {
          this.logger.warn(`Player ${player} not found in database, removing from whitelist !`)
          await this._rcon.send(`whitelist remove ${player}`)
          continue
        }

        if (user.state !== UserState.WHITELISTED) {
          this.logger.warn(`Player ${player} is not whitelisted, adding whitelist state to database !`)
          this.userModel.updateOne(
            { name: player },
            { $set: { state: UserState.WHITELISTED } },
          ).exec()
          continue
        }
      }

      const users = await this.userModel.find({ state: UserState.WHITELISTED })
      for (const user of users) {
        if (playersList.includes(user.name)) {
          this.logger.debug(`Player ${user.name} is already whitelisted !`)
          continue
        }
        this.logger.warn(`Adding player ${user.name} to whitelist !`)
        await this._rcon.send(`whitelist add ${user.name}`)
      }
    }

    this.logger.verbose('Verifying users from database to whitelist...')
    const users = await this.userModel.find({ state: UserState.WHITELISTED })
    for (const user of users) {
      if (playersList.includes(user.name)) {
        this.logger.debug(`Player ${user.name} is already whitelisted !`)
        continue
      }
      this.logger.warn(`Adding player ${user.name} to whitelist !`)
      await this._rcon.send(`whitelist add ${user.name}`)
    }

    this.logger.verbose('endof <handleIntervalWhitelist> !')
  }

  public async findOne(query: object, projection?: object): Promise<User> {
    return this.userModel.findOne(query, projection).exec()
  }

  public async findOrCreateWithMinecraftProfile(metadata: MinecraftProfile): Promise<FlattenMaps<User>> {
    let user = (await this.userModel
      .findOneAndUpdate(
        {
          'metadata.id': metadata.id,
        },
        { $set: { metadata } },
        { new: true },
      )
      .exec())
    if (!user) {
      user = (await this.userModel.findOneAndUpdate(
        { name: metadata.name },
        {
          $set: { metadata },
          $setOnInsert: {
            name: metadata.name,
            state: UserState.DISABLED,
          },
        },
        {
          new: true,
          upsert: true,
        },
      ).exec())
    }
    if (user && !(user as any).isActive) {
      throw new UnauthorizedException("Votre compte est en attente de validation par un administrateur")
    }

    return user.toJSON()
  }

  public async findAllWithMinecraftHeads(options?: { staff: boolean, roles: string[] }): Promise<UserWithoutMetadata[]> {
    let projection = { staffRoles: 0 } as any
    let filters = {
      'metadata.premium': true,
    } as any
    if (options?.roles && options.roles.length > 0) {
      filters = {
        ...filters,
        roles: { $in: options.roles },
      }
    }
    if (options?.staff) {
      filters = {
        ...filters,
        staffRoles: { $exists: true, $ne: [] },
      }
      projection = {}
    }
    const users = await this.userModel.find(filters, projection).exec()

    return Promise.all(users.map(async user => {
      const userJson = user.toJSON()
      const metadata = userJson.metadata as UserMetadata
      const userWithoutMetadata = omit(userJson, ['metadata'])
      try {
        let base64 = await this._redis.get(`minecraft-head:${user.name}`)
        if (base64) {
          this.logger.debug(`Minecraft head for ${metadata.name} found in Redis !`)
        } else {
          const response = await firstValueFrom(
            this.httpService.get<Buffer>(`https://mineskin.eu/avatar/${metadata.name}/100.png`, {
              responseType: 'arraybuffer'
            })
          )
          base64 = Buffer.from(response.data).toString('base64')
          this._redis.set(`minecraft-head:${user.name}`, base64, 'EX', 60 * 60 * 24 * 7) // 7 days
          this.logger.debug(`Minecraft head for ${metadata.name} cached in Redis !`)
        }

        return {
          ...userWithoutMetadata,
          _minecraftHead: `data:image/png;base64,${base64}`
        }
      } catch (error) {
        return {
          ...userWithoutMetadata,
          _minecraftHead: null
        }
      }
    }))
  }

  public async findByIdAndUpdate(
    id: string | Types.ObjectId,
    payload: any,
    options?: any,
  ) {
    return await this.userModel.findByIdAndUpdate(id, payload, options).exec()
  }
}
