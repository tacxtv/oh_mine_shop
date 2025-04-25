import { Module } from '@nestjs/common'
import { ArticleService } from './article.service'
import { ArticleController } from './article.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Article, ArticleSchema } from './_schemas/article.schema'
import { UsersModule } from '../users/users.module'
import { ItemModule } from '~/minecraft/item/item.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Article.name,
        schema: ArticleSchema,
      },
    ]),
    UsersModule,
    ItemModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule { }
