import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common'
import { LawService } from './law.service'
import { Public } from '~/_common/_decorators/public.decorator'
import { Request, Response } from 'express'
import { HasRoles } from '~/_common/_decorators/has-role.decorator'

@Controller('law')
export class LawController {
  public constructor(private readonly _service: LawService) { }

  @Public()
  @Get(':playerName')
  public async getLaws(
    @Res() res: Response,
    @Param('playerName') playerName: string,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getLaws(playerName),
    })
  }

  @Public()
  @Get('unabbrogated')
  public async getUnabbrogatedLaws(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getUnAbbrogatedLaws(),
    })
  }

  @Post('vote/:playerName/:lawnum')
  public async voteLaw(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Param('playerName') playerName: string,
    @Param('lawnum') lawnum: string,
  ): Promise<Response> {
    if ((req.user as any).name.toLowerCase() !== playerName.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to vote for this law',
      })
    }

    const { vote } = body

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.vote(lawnum, playerName, vote),
    })
  }

  @Post('create')
  @HasRoles('op', 'maire', 'adjoint')
  public async createLaw(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ): Promise<Response> {
    body = {
      ...body,
      proposedBy: (req.user as any).name,
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.createLaw(body),
    })
  }

  @Delete(':id')
  @HasRoles('op')
  public async deleteLaw(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = req.params

    await this._service.deleteLaw(id)

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Law deleted successfully',
    })
  }
}
