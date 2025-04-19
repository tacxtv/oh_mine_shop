import { Prop, Schema } from '@nestjs/mongoose'

@Schema({
  collection: 'village',
  versionKey: false,
})
export class Village {
  @Prop({
    type: String,
    required: [true, 'Village name is required'],
  })
  public name: string

  @Prop({
    type: String,
    required: [true, 'Village name is required'],
  })
  public description: string

  @Prop({
    type: Number,
    default: 0,
  })
  public level: number
}
