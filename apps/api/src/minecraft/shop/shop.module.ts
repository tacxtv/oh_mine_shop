import { Module } from '@nestjs/common'
import { ShopController } from './shop.controller'
import { ShopService } from './shop.service'

@Module({
  imports: [],
  controllers: [
    ShopController,
  ],
  providers: [
    ShopService,
  ],
})
export class ShopModule {
}
