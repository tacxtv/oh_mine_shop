import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { ArticleService } from './article.service'

@Controller('article')
export class ArticleController {
  public constructor(private readonly _service: ArticleService) { }

  @Get('search')
  public async search(
    @Query('filters') filters: string[],
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.search(filters),
    })
  }


  @Get('average')
  public async average(
    @Query('filters') filters: string[],
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: await this._service.findByAverageAmount(filters),
    })
  }
}
