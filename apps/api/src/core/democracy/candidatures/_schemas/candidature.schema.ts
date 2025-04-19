import { Prop, Schema } from '@nestjs/mongoose'

@Schema({
  collection: 'candidature',
  versionKey: false,
})
export class Candidature {
  @Prop({
    type: String,
    required: [true, 'Candidature user is required'],
  })
  public proposedBy: string

  @Prop({
    type: String,
    required: [true, 'Candidature content is required'],
  })
  content: string

  @Prop({
    type: Number,
    required: [true, 'Law applied date is required'],
  })
  public electionNumber: number
}
