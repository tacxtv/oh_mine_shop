import { Module } from '@nestjs/common'
import { PlayerController } from './player.controller'
import { PlayerService } from './player.service'
import { ArticleModule } from '~/core/article/article.module'

@Module({
  imports: [
    ArticleModule,
  ],
  controllers: [
    PlayerController,
  ],
  providers: [
    PlayerService,
  ],
})
export class PlayerModule {
}
