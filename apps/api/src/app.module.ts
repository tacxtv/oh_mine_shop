import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoreModule } from './core/core.module'
import { MinecraftModule } from './minecraft/minecraft.module'
import { RconModule, RconOptions } from '@the-software-compagny/nestjs_module_rcon'
import config, { validationSchema } from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema,
    }),
    RconModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        config: config.get<RconOptions>('rcon.options'),
      }),
    }),
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
