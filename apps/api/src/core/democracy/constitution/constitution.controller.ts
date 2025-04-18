import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { ConstitutionService } from './constitution.service'
import { Public } from '~/_common/_decorators/public.decorator'
import { Response } from 'express'

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
}
