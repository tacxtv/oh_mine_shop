import { Module } from '@nestjs/common'
import { LadderController } from './ladder.controller'
import { LadderService } from './ladder.service'

@Module({
  imports: [],
  controllers: [
    LadderController,
  ],
  providers: [
    LadderService,
  ],
})
export class LadderModule {
}
