import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './_schemas/users.schema'
import { FlattenMaps, Model } from 'mongoose'
import { MinecraftProfile } from '../auth/_strategies/minecraft.strategy'
import { UserState } from './_enums/user-state.enum'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { omit } from 'radash'

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
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
  ) {}

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
      throw new UnauthorizedException("User is not active")
    }

    return user.toJSON()
  }

  public async findAllWithMinecraftHeads(): Promise<UserWithoutMetadata[]> {
    const users = await this.userModel.find().exec()
    return Promise.all(users.map(async user => {
      const userJson = user.toJSON()
      const metadata = userJson.metadata as UserMetadata
      const userWithoutMetadata = omit(userJson, ['metadata'])
      try {
        const response = await firstValueFrom(
          this.httpService.get<Buffer>(`https://mineskin.eu/avatar/${metadata.name}/100.png`, {
            responseType: 'arraybuffer'
          })
        )
        const base64 = Buffer.from(response.data).toString('base64')
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
}
