import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { IAuthModuleOptions, PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { JwtStrategy } from './_strategies/jwt.strategy'
import { MinecraftStrategy } from './_strategies/minecraft.strategy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LocalStrategy } from './_strategies/local.strategy'

@Module({
  imports: [
    PassportModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get<IAuthModuleOptions>('passport.options'),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get<object>('jwt.options'),
      }),
    }),
    UsersModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    MinecraftStrategy,
    LocalStrategy,
  ],
})
export class AuthModule {
}
