import { Controller, Get, HttpStatus, Res, Post, Body } from '@nestjs/common'
import { Response } from 'express'
import { RendezVousService } from './rendez-vous.service'
import { RendezVous } from './_schemas/rendez-vous.schema'

@Controller('rendez-vous')
export class RendezVousController {
  public constructor(private readonly _service: RendezVousService) { }

  @Get('incoming')
  public async getIncomingRendezVous(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getIncomingRendezVous(),
    })
  }

  @Post('new')
  public async createRendezVous(
    @Body() rendezVous: Partial<RendezVous>,
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: await this._service.createRendezVous(rendezVous),
    })
  }
}
