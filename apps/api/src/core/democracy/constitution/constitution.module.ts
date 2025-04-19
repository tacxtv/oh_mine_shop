import { Module } from '@nestjs/common'
import { ConstitutionController } from './constitution.controller'
import { ConstitutionService } from './constitution.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Constitution, ConstitutionSchema } from './_schemas/constitution.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Constitution.name,
        schema: ConstitutionSchema,
      },
    ]),
  ],
  controllers: [ConstitutionController],
  providers: [ConstitutionService],
})
export class ConstitutionModule {
}
