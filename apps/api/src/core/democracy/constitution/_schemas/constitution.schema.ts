import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
  collection: 'constitution',
  versionKey: false,
  timestamps: true,
})
export class Constitution {
  @Prop({
    type: String,
    required: [true, 'Article number is required'],
  })
  public artnum: string

  @Prop({
    type: String,
    required: [true, 'Constitution title is required'],
  })
  title: string

  @Prop({
    type: String,
    required: [true, 'Constitution content is required'],
  })
  content: string

  @Prop({
    type: [String],
    default: [],
  })
  public abrogatedArtnums: string[]

  @Prop({
    type: Date,
    required: [true, 'Constitution applied date is required'],
    default: () => new Date(),
  })
  public appliedAt: Date

  @Prop({
    type: Object,
    default: {},
  })
  public metadata: object
}

export const ConstitutionSchema = SchemaFactory.createForClass(Constitution)
