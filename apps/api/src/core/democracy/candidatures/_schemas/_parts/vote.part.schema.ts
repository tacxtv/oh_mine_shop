import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export class ElectionVotePart extends Document {
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
    type: String,
    required: [true, 'User vote candidat is required'],
  })
  public candidat: string

  @Prop({
    type: Date,
    required: [true, 'User vote date is required'],
  })
  public votedAt: Date
}

export const ElectionVotePartSchema = SchemaFactory.createForClass(ElectionVotePart)
