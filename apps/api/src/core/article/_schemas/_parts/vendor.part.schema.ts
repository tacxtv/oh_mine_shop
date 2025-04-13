import { Prop } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export class ArticleVendorPart extends Document {
  @Prop({
    type: Types.ObjectId,
    required: [true, 'Article vendor id is required'],
  })
  public id: Types.ObjectId

  @Prop({
    type: String,
    required: [true, 'Article vendor name is required'],
  })
  public name: string
}
