import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
  collection: 'rendez-vous',
  versionKey: false,
})
export class RendezVous {
  @Prop({
    type: String,
    required: [true, 'Rendez-vous name is required'],
  })
  public name: string

  @Prop({
    type: String,
    required: [true, 'Rendez-vous description is required'],
  })
  public description: string

  @Prop({
    type: Date,
    required: [true, 'Rendez-vous start date is required'],
    default: () => new Date(),
  })
  public startAt: Date
}

export const RendezVousSchema = SchemaFactory.createForClass(RendezVous)
