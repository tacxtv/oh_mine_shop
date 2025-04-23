import { All, Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Req, Res } from '@nestjs/common'
import { DefiService } from './defi.service'
import { Request, Response } from 'express'
import { Public } from '~/_common/_decorators/public.decorator'
import { HasRoles } from '~/_common/_decorators/has-role.decorator'

@Controller('defi')
export class DefiController {
  public constructor(private readonly _service: DefiService) { }

  @Public()
  @Get('current')
  public async getCurrentDefi(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getCurrentDefi(),
    })
  }

  @Get('current/:player')
  public async getCurrentDefiPlayer(
    @Res() res: Response,
    @Req() req: Request,
    @Param('player') player: string,
  ): Promise<Response> {
    if ((req.user as any).name !== player || !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this defi',
      })
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getCurrentDefi(player),
    })
  }

  @All('participate/:player/:amount')
  public async participateDefi(
    @Res() res: Response,
    @Req() req: Request,
    @Param('player') player: string,
    @Param('amount', ParseIntPipe) amount: number,
  ): Promise<Response> {
    if ((req.user as any).name !== player || !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this defi',
      })
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.participateDefi(player, amount),
    })
  }

  @Public()
  @Get('ranking')
  public async getRanking(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getAllDefi(),
    })
  }

  @Post('create')
  @HasRoles('op')
  public async createDefi(
    @Res() res: Response,
    @Body() body: any,
  ): Promise<Response> {
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: await this._service.createDefi(body),
    })
  }

  @Delete('delete')
  @HasRoles('op')
  public async deleteDefi(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.deleteDefi(),
    })
  }
}
