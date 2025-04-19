import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { LawService } from './law.service'
import { Public } from '~/_common/_decorators/public.decorator'
import { Response } from 'express'

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
}
