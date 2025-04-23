import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ConstitutionService } from './constitution.service'
import { Public } from '~/_common/_decorators/public.decorator'
import { Request, Response } from 'express'
import { HasRoles } from '~/_common/_decorators/has-role.decorator'

@Controller('constitution')
export class ConstitutionController {
  public constructor(private readonly _service: ConstitutionService) { }

  @Public()
  @Get()
  public async getConstitution(
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.getConstitution(),
    })
  }

  @Post('create')
  @HasRoles('op')
  public async createConstitution(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ): Promise<Response> {
    body = {
      ...body,
      metadata: {
        onProposalBy: (req.user as any).name,
      },
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.createConstitution(body),
    })
  }
}
