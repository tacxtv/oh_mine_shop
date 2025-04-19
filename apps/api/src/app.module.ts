import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoreModule } from './core/core.module'
import { MinecraftModule } from './minecraft/minecraft.module'
import { RconModule, RconOptions } from '@the-software-compagny/nestjs_module_rcon'
import config, { validationSchema } from './config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import { RedisOptions } from 'ioredis'
import { RedisModule } from '@nestjs-modules/ioredis'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './_common/_guards/auth.guard'
import { RolesGuard } from './_common/_guards/roles.guard'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'single',
        url: config.get<string>('ioredis.uri'),
        options: config.get<RedisOptions>('ioredis.options'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ...config.get<MongooseModuleOptions>('mongoose.options'),
        uri: config.get<string>('mongoose.uri'),
      }),
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard('jwt'),
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
}
