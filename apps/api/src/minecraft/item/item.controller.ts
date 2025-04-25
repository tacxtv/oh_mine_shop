import { Controller, DefaultValuePipe, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common'
import { ItemService } from './item.service'
import { Public } from '~/_common/_decorators/public.decorator'
import { Response } from 'express'

@Public()
@Controller('item')
export class ItemController {
  public constructor(private readonly _service: ItemService) { }

  @Get()
  public async listAll() {
    return this._service.listAll()
  }

  @Get('mod/:id')
  public async getOne(@Param('id') id: string) {
    return this._service.getOne(id)
  }

  @Get('mods')
  public async getMods(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(200).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getMods(),
    })
  }
}

// @Post('sync-one')
// public syncOne(@Query('file') file: string) {
//   if (!file) throw new Error('Missing file parameter')

//   //TODO admin only
//   return this._service.syncOne(file)
// }

// @Post('sync-all')
// public async syncAll(@Query('force', new DefaultValuePipe('0')) forceQuery: string) {
//   const force = /yes|true|1|on/i.test(forceQuery)
//   //TODO admin only
//   const sync = await this._service.syncAll(force)
//   return { sync }
// }

