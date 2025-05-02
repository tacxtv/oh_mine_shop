import { Body, Controller, Delete, Get, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { LawService } from './law.service'
import { Public } from '~/_common/_decorators/public.decorator'
import { Request, Response } from 'express'
import { HasRoles } from '~/_common/_decorators/has-role.decorator'

@Controller('law')
export class LawController {
  public constructor(private readonly _service: LawService) { }

  @Public()
  @Get()
  public async getLaws(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getLaws(),
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
