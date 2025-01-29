import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoreModule } from './core/core.module'
import { MinecraftModule } from './minecraft/minecraft.module'

@Module({
  imports: [
    CoreModule.register(),
    MinecraftModule.register(),
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {
}
