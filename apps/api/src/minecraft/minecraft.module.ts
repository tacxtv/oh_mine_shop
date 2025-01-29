import { DynamicModule, Module } from '@nestjs/common'
import { MinecraftController } from './minecraft.controller'
import { MinecraftService } from './minecraft.service'
import { RouterModule } from '@nestjs/core'
import { LadderModule } from './ladder/ladder.module'
import { ShopModule } from './shop/shop.module'

@Module({
  imports: [
    LadderModule,
    ShopModule,
  ],
  controllers: [
    MinecraftController,
  ],
  providers: [
    MinecraftService,
  ],
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
