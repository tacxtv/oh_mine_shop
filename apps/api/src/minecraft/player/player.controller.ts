import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { PlayerService } from './player.service'

@Controller('player')
export class PlayerController {
  public constructor(private readonly service: PlayerService) { }

  @Get('list')
  public async listPlayers() {
    return {
      statusCode: HttpStatus.OK,
      data: await this.service.listPlayers(),
    }
  }

  @Get('inventory/:playerName')
  public async getPlayerInventory(
    @Req() req: Request & { user: any },
    @Res() res: Response,
    @Param('playerName') playerName: string,
  ) {
    if ((req.user as any).name.toLowerCase() !== playerName.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this defi',
      })
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this.service.getPlayerInventory(playerName),
    })
  }
}
