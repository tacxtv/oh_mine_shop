import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ _id: false })
export class ParticipationPart extends Document {
  @Prop({
    type: String,
    required: [true, 'Player name is required'],
  })
  public player: string

  @Prop({
    type: Number,
    default: 0,
  })
  public amount: number
}

export const ParticipationPartSchema = SchemaFactory.createForClass(ParticipationPart)
