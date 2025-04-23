import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({
  _id: false,
})
export class ConstitutionMetadataPart extends Document {
  @Prop({
    type: Date,
    required: [true, 'Constitution on proposal date is required'],
    default: () => new Date(),
  })
  public onProposalAt: Date

  @Prop({
    type: String,
    required: [true, 'User proposing the constitution is required'],
  })
  public onProposalBy: string
}

export const ConstitutionMetadataPartSchema = SchemaFactory.createForClass(ConstitutionMetadataPart)
