import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { ArticleService } from './article.service'
import { Public } from '~/_common/_decorators/public.decorator'

@Controller('article')
export class ArticleController {
  public constructor(private readonly _service: ArticleService) { }

  @Public()
  @Get('search')
  public async search(
    @Query('filters') filters: string[],
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.findBestPrice(filters),
    })
  }

  @Public()
  @Get('average')
  public async average(
    @Query('filters') filters: string[],
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.findAveragePrice(filters),
    })
  }
}
