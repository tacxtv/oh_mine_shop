import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ElectionVotePart, ElectionVotePartSchema } from './_parts/vote.part.schema'

@Schema({
  collection: 'election',
  versionKey: false,
})
export class Election {
  @Prop({
    type: Number,
    required: [true, 'Law applied date is required'],
  })
  public electionNumber: number

  @Prop({
    type: [ElectionVotePartSchema],
    default: [],
  })
  public votes: ElectionVotePart[]

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  public startAt: Date

  @Prop({
    type: Date,
    required: [true, 'Election start date is required'],
  })
  public endAt: Date
}

export const ElectionSchema = SchemaFactory.createForClass(Election)
