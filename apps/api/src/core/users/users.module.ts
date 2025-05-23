import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './_schemas/users.schema'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService,
  ],
  exports: [
    UsersService,
  ],
})
export class UsersModule {
}
