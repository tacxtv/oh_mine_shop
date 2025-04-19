import { Module } from '@nestjs/common'
import { LawController } from './law.controller'
import { LawService } from './law.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Law, LawSchema } from './_schemas/law.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Law.name,
        schema: LawSchema,
      },
    ]),
  ],
  controllers: [LawController],
  providers: [LawService],
})
export class LawModule {
}
