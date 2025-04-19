import { Prop, Schema } from '@nestjs/mongoose'
import { ObjectifTodoPart, ObjectifTodoPartSchema } from './_parts/todo.part.schema'

@Schema({
  collection: 'objectif',
  versionKey: false,
})
export class Objectif {
  @Prop({
    type: Number,
    default: 1,
  })
  public level: number

  @Prop({
    type: [ObjectifTodoPartSchema],
    required: [true, 'Objectifs name is required'],
  })
  public todos: ObjectifTodoPart[]
}
