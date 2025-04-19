import { DynamicModule, Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { MinecraftController } from './minecraft.controller'
import { MinecraftService } from './minecraft.service'
import { PlayerModule } from './player/player.module'
import { ItemModule } from './item/item.module'

@Module({
  imports: [
    // ItemModule,
    PlayerModule,
  ],
  controllers: [MinecraftController],
  providers: [MinecraftService],
})
export class MinecraftModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'minecraft',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ])
      ],
    }
  }
}
