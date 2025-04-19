import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export class LawMetadataPart extends Document {
  @Prop({
    type: Date,
    required: [true, 'Law on proposal date is required'],
  })
  public onProposalAt: Date
}

export const LawMetadataPartSchema = SchemaFactory.createForClass(LawMetadataPart)
