import { Prop } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export class ArticleMetadataPart extends Document {
  @Prop({
    type: Date,
    required: [true, 'Article on sale date is required'],
  })
  public onSaleAt: Date

  @Prop({
    type: Date,
  })
  public selledAt?: Date
}
