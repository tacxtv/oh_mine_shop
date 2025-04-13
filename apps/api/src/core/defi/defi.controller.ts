import { All, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Res } from '@nestjs/common'
import { DefiService } from './defi.service'
import { Response } from 'express'

@Controller('defi')
export class DefiController {
  public constructor(private readonly _service: DefiService) { }

  @Get('current/:player')
  public async getCurrentDefi(
    @Res() res: Response,
    @Param('player') player: string,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getCurrentDefi(player),
    })
  }

  @All('participate/:player/:amount')
  public async participateDefi(
    @Res() res: Response,
    @Param('player') player: string,
    @Param('amount', ParseIntPipe) amount: number,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.participateDefi(player, amount),
    })
  }

  @Get('create')
  public async createDefi(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: await this._service.createDefi({
        name: 'Test Defi',
        itemId: 'create:mechanical_harvester',
      }),
    })
  }

  @Get('delete')
  public async deleteDefi(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.deleteDefi(),
    })
  }
}
