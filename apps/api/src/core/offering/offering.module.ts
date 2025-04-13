import { Module } from '@nestjs/common'
import { OfferingService } from './offering.service'
import { OfferingController } from './offering.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Offering, OfferingSchema } from './_schemas/offering.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Offering.name,
        schema: OfferingSchema,
      },
    ]),
  ],
  controllers: [OfferingController],
  providers: [OfferingService],
})
export class OfferingModule { }
