import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { PlayerService } from './player.service'
import { parse } from 'nbt-ts'

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
    @Param('playerName') playerName: string,
  ) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.service.getPlayerInventory(playerName),
    }
  }
}
