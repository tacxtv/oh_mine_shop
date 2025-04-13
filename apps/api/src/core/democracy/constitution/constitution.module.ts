import { Module } from '@nestjs/common'
import { ConstitutionController } from './constitution.controller'
import { ConstitutionService } from './constitution.service'

@Module({
  imports: [],
  controllers: [ConstitutionController],
  providers: [ConstitutionService],
})
export class ConstitutionModule {
}
