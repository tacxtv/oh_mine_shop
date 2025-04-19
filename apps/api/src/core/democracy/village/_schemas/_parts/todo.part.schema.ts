import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export class ObjectifTodoPart extends Document {
  @Prop({
    type: String,
    required: [true, 'Todo title is required'],
  })
  public title: string

  @Prop({
    type: Boolean,
    required: [true, 'Validated is required'],
  })
  public validated: boolean
}

export const ObjectifTodoPartSchema = SchemaFactory.createForClass(ObjectifTodoPart)
