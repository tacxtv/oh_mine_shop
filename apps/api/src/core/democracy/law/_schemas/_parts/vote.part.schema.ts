import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { VoteType } from '../../_enums/vote-type.enum'

export class LawVotePart extends Document {
  @Prop({
    type: Types.ObjectId,
    required: [true, 'User vote id is required'],
  })
  public id: Types.ObjectId

  @Prop({
    type: String,
    required: [true, 'User vote name is required'],
  })
  public name: string

  @Prop({
    type: Number,
    enum: Object.keys(VoteType)
      .filter((key) => isNaN(Number(key)))
      .map((key) => VoteType[key]),
    required: [true, 'User vote type is required'],
  })
  public type: number

  @Prop({
    type: Date,
    required: [true, 'User vote date is required'],
  })
  public votedAt: Date
}

export const LawVotePartSchema = SchemaFactory.createForClass(LawVotePart)
