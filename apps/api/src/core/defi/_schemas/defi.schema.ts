import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ParticipationPart, ParticipationPartSchema } from './_parts/participation.part.schema'

@Schema({
  collection: 'defis',
  versionKey: false,
})
export class Defis {
  @Prop({
    type: String,
    required: [true, 'Defi name is required'],
  })
  public name: string

  @Prop({
    type: String,
    required: [true, 'Defi item is required'],
  })
  public itemId: string

  @Prop({
    type: [ParticipationPartSchema],
    default: [],
  })
  public participation: ParticipationPart[]

  @Prop({
    type: Date,
    required: [true, 'Defi start date is required'],
    default: () => new Date(),
  })
  public startAt: Date

  @Prop({
    type: Date,
    required: [true, 'Defi end date is required'],
    default: () => {
      const date = new Date()
      date.setDate(date.getDate() + 7)

      return date
    },
  })
  public endAt: Date

  @Prop({
    type: Object,
    default: {},
  })
  public metadata: object
}

export const DefisSchema = SchemaFactory.createForClass(Defis)

DefisSchema.virtual('isActive').get(function () {
  const now = new Date()

  return this.startAt <= now && this.endAt >= now
})
