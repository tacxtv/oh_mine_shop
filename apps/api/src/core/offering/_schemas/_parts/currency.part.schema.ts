import { Prop } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export class OfferingCurrencyPart extends Document {
  @Prop({
    type: Types.ObjectId,
    required: [true, 'Offering currency id is required'],
  })
  public id: Types.ObjectId

  @Prop({
    type: Number,
    required: [true, 'Offering currency amount is required'],
    min: 1,
  })
  public amount: number

  @Prop({
    type: Number,
    default: 1,
  })
  public priceMultiplier: number

  @Prop({
    type: Object,
    default: {},
  })
  public conditions: Record<string, any>
}
