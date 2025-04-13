import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Defis, DefisSchema } from './_schemas/defi.schema'
import { DefiController } from './defi.controller'
import { DefiService } from './defi.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Defis.name,
        schema: DefisSchema,
      },
    ]),
  ],
  controllers: [DefiController],
  providers: [DefiService],
})
export class DefiModule { }
