import { Body, Controller, DefaultValuePipe, Get, HttpStatus, Param, ParseIntPipe, Post, Query, Req, Res } from '@nestjs/common'
import { Response } from 'express'
import { ArticleService } from './article.service'
import { Public } from '~/_common/_decorators/public.decorator'

@Controller('article')
export class ArticleController {
  public constructor(private readonly _service: ArticleService) { }

  @Public()
  @Get('search')
  public async search(
    @Query('mod') mod: string,
    @Query('recherche') recherche: string,
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.findBestPrice(mod, recherche),
    })
  }

  @Get('my/:playerName')
  public async my(
    @Param('playerName') playerName: string,
    @Query('recherche') recherche: string,
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ): Promise<Response> {
    if ((req.user as any).name !== playerName && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to sell this item',
      })
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.findMy(playerName, recherche),
    })
  }

  @Public()
  @Get('average')
  public async average(
    @Query('mod') mod: string,
    @Query('recherche') recherche: string,
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.findAveragePrice(mod, recherche),
    })
  }

  @Post(':player/sell/:slot')
  public async sell(
    @Param('player') player: string,
    @Param('slot', ParseIntPipe) slot: number,
    @Body() options = { price: 1, stack: 1 },
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    if ((req.user as any).name !== player && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to sell this item',
      })
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.sellItem(player, slot, {
        ...options,
        quantity: options.stack ? options.stack : 1,
      }),
    })
  }

  @Post(':player/buy/:id')
  public async buy(
    @Res() res: Response,
    @Param('player') player: string,
    @Param('id') id: string,
    @Body() options = { price: 1, stack: 1, nbt: null },
  ) {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.buyItem(player, id, options),
    })
  }

  @Public()
  @Get('mods')
  public async mods(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getMods(),
    })
  }
}
