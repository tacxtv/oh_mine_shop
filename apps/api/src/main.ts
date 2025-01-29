import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

declare const module: any;
(async () => {
  const app = await NestFactory.create(AppModule)

  await app.listen(4500)
})()
