import { Controller } from '@nestjs/common'
import { MinecraftService } from './minecraft.service'

@Controller()
export class MinecraftController {
  public constructor(private readonly service: MinecraftService) { }
}
