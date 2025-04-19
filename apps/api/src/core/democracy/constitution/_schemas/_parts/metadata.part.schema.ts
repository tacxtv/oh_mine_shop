import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export class ConstitutionMetadataPart extends Document {
  @Prop({
    type: Date,
    required: [true, 'Constitution on proposal date is required'],
  })
  public onProposalAt: Date

  @Prop({
    type: String,
    required: [true, 'User proposing the constitution is required'],
  })
  public onProposalBy: string
}

export const ConstitutionMetadataPartSchema = SchemaFactory.createForClass(ConstitutionMetadataPart)
