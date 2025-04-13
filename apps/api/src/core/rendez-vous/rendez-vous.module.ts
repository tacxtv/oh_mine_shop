import { Module } from '@nestjs/common'
import { RendezVousController } from './rendez-vous.controller'
import { RendezVousService } from './rendez-vous.service'
import { RendezVous, RendezVousSchema } from './_schemas/rendez-vous.schema'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RendezVous.name,
        schema: RendezVousSchema,
      },
    ]),
  ],
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule { }
