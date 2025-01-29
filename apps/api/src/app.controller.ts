import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  public constructor(private readonly service: AppService) { }

  @Get()
  public async getInfos() {
    return this.service.getInfos()
  }
}
