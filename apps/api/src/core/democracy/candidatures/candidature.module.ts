import { Module } from '@nestjs/common'
import { CandidatureController } from './candidature.controller'
import { CandidatureService } from './candidature.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Candidature, CandidatureSchema } from './_schemas/candidature.schema'
import { Election, ElectionSchema } from './_schemas/election.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Candidature.name,
        schema: CandidatureSchema,
      },
      {
        name: Election.name,
        schema: ElectionSchema,
      },
    ]),
  ],
  controllers: [CandidatureController],
  providers: [CandidatureService],
})
export class CandidatureModule {
}
