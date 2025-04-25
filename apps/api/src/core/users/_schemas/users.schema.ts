import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserState } from '../_enums/user-state.enum'
import { Types } from 'mongoose'

@Schema({
  collection: 'users',
  versionKey: false,
})
export class User {
  public readonly _id: Types.ObjectId

  @Prop({
    type: String,
    required: [true, 'User id is required'],
  })
  public uuid: string

  @Prop({
    type: String,
    required: [true, 'User name is required'],
  })
  public name: string

  @Prop({
    type: Number,
    enum: Object.keys(UserState)
      .filter((key) => isNaN(Number(key)))
      .map((key) => UserState[key]),
    default: UserState.DISABLED,
  })
  public state: number = UserState.DISABLED

  @Prop({
    type: Number,
    default: 0,
  })
  public currency: number

  @Prop({
    type: [String],
    default: [],
  })
  public roles: string[]

  @Prop({
    type: [String],
    default: [],
  })
  public staffRoles: string[]

  @Prop({
    type: String,
    default: null,
  })
  public publicLink: string

  @Prop({
    type: Object,
    default: {},
  })
  public metadata: object
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.virtual('isActive').get(function (this: User): boolean {
  return this.state >= UserState.ENABLED
})
