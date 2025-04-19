import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { LawVotePart, LawVotePartSchema } from './_parts/vote.part.schema'
import { LawMetadataPart, LawMetadataPartSchema } from './_parts/metadata.part.schema'

@Schema({
  collection: 'law',
  versionKey: false,
})
export class Law {
  @Prop({
    type: String,
    required: [true, 'Law number is required'],
  })
  public lawnum: string

  @Prop({
    type: String,
    required: [true, 'Law title is required'],
  })
  title: string

  @Prop({
    type: String,
    required: [true, 'Law content is required'],
  })
  content: string // is HTML

  @Prop({
    type: [String],
    default: [],
  })
  public abrogatedLawnums: string[]

  @Prop({
    type: String,
    required: [true, 'User proposing the law is required'],
  })
  public proposedBy: string // user with maire role

  @Prop({
    type: [LawVotePartSchema],
    default: [],
  })
  public votes: LawVotePart[]

  @Prop({
    type: Date,
    required: [true, 'Law applied date is required'],
    default: () => new Date(),
  })
  public appliedAt: Date // 24h after the vote

  @Prop({
    type: LawMetadataPartSchema,
    default: {},
  })
  public metadata: LawMetadataPart
}

export const LawSchema = SchemaFactory.createForClass(Law)
