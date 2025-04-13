import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Article } from './_schemas/article.schema'
import { Model } from 'mongoose'

@Injectable()
export class ArticleService {
  public constructor(
    @InjectModel(Article.name) private readonly _model: Model<Article>
  ) { }

  public async search(filters?: string[]) {

  }


  public async findByAverageAmount(filters?: string[]) {

  }

  public async findByBestAmount() {

  }
}
