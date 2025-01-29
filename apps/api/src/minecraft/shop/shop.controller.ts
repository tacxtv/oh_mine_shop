import { Controller } from '@nestjs/common'
import { ShopService } from './shop.service'

@Controller('shop')
export class ShopController {
  public constructor(private readonly service: ShopService) { }
}
