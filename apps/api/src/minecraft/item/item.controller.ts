import { Controller, DefaultValuePipe, Get, Param, Post, Query } from '@nestjs/common'
import { ItemService } from './item.service'

@Controller('item')
export class ItemController {
  public constructor(private readonly _service: ItemService) { }

  @Get(':id')
  public async getOne(@Param('id') id: string) {
    return this._service.getOne(id)
  }

  @Get()
  public async listAll() {
    return this._service.listAll()
  }

  @Post('sync-one')
  public syncOne(@Query('file') file: string) {
    if (!file) throw new Error('Missing file parameter')

    //TODO admin only
    return this._service.syncOne(file)
  }

  @Post('sync-all')
  public async syncAll(@Query('force', new DefaultValuePipe('0')) forceQuery: string) {
    const force = /yes|true|1|on/i.test(forceQuery)
    //TODO admin only
    const sync = await this._service.syncAll(force)
    return { sync }
  }
}
