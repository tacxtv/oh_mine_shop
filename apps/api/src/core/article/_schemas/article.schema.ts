import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { StackType } from '../_enums/stack-type.enum'
import { ArticleState } from '../_enums/article-state.enum'
import { ArticleVendorPart } from './_parts/vendor.part.schema'
import { ArticleMetadataPart } from './_parts/metadata.part.schema'

@Schema({
  collection: 'articles',
  versionKey: false,
})
export class Article {
  @Prop({
    type: String,
    required: [true, 'Article name is required'],
  })
  public name: string

  @Prop({
    type: Number,
    enum: Object.keys(ArticleState)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ArticleState[key]),
    default: ArticleState.ON_SALE,
  })
  public state: ArticleState = ArticleState.ON_SALE

  @Prop({
    type: Number,
    enum: Object.keys(StackType)
      .filter((key) => isNaN(Number(key)))
      .map((key) => StackType[key]),
    default: StackType.SINGLE,
  })
  public stack: number = StackType.SINGLE

  @Prop({
    type: Number,
    required: [true, 'Article price is required'],
    min: 1,
  })
  public price: number

  @Prop({
    type: Object,
    default: {},
  })
  public nbt: object

  @Prop({
    type: ArticleVendorPart,
    default: {},
  })
  public vendor: ArticleVendorPart

  @Prop({
    type: ArticleMetadataPart,
    default: {},
  })
  public metadata: ArticleMetadataPart
}

export const ArticleSchema = SchemaFactory.createForClass(Article)

ArticleSchema.virtual('isSelled').get(function (this: Article): boolean {
  return this.state === ArticleState.SELLED
})
