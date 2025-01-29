import { DynamicModule, Module } from '@nestjs/common'
import { CoreController } from './core.controller'
import { CoreService } from './core.service'
import { RouterModule } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { PlayerModule } from './player/player.module'

@Module({
  imports: [
    AuthModule,
    PlayerModule,
  ],
  controllers: [
    CoreController,
  ],
  providers: [
    CoreService,
  ],
})
export class CoreModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'core',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ])
      ],
    }
  }
}
