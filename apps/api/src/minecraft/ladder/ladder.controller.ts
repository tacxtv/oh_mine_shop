import { Controller } from '@nestjs/common'
import { LadderService } from './ladder.service'

@Controller('ladder')
export class LadderController {
  public constructor(private readonly service: LadderService) { }
}
