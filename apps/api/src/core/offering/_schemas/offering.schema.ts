import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OfferingCurrencyPart } from './_parts/currency.part.schema'
import { OfferingState } from '../_enums/offering-state.enum'

@Schema({
  collection: 'offerings',
  versionKey: false,
})
export class Offering {
  @Prop({
    type: String,
    required: [true, 'Article name is required'],
  })
  public name: string

  @Prop({
    type: String,
    default: '',
  })
  public description: string

  @Prop({
    type: Number,
    enum: Object.keys(OfferingState)
      .filter((key) => isNaN(Number(key)))
      .map((key) => OfferingState[key]),
    default: OfferingState.DISABLED,
  })
  public state: OfferingState = OfferingState.DISABLED

  @Prop({
    type: [OfferingCurrencyPart],
    default: [],
    min: 1,
  })
  public currencies: OfferingCurrencyPart[]

  @Prop({
    type: Object,
    default: {},
  })
  public command: object
}

export const OfferingSchema = SchemaFactory.createForClass(Offering)

OfferingSchema.virtual('isInStock').get(function (this: Offering) {
  return this.state > OfferingState.OUT_OF_STOCK
})
