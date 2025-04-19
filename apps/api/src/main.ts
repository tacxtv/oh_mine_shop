import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import chalk from 'chalk'
import { AppModule } from './app.module'
import config from './config'
import pkg from '../package.json'
import passport from 'passport'

const INTERNAL_NAME = process.env?.npm_package_name || pkg?.name || 'api'
const APP_NAME = INTERNAL_NAME.split('/').pop().toLocaleUpperCase()

declare const module: any;
(async () => {
  Logger.log(chalk.bold.blue(`Starting ${APP_NAME} 🚀`), `${chalk.bold.blue(APP_NAME)}\x1b[33m`)
  const cfg = await config()

  const app = await NestFactory.create<NestExpressApplication>(AppModule, cfg.application)

  app.use(passport.initialize())
  await app.listen(4000, () => {
    Logger.log(chalk.bold.blue(`Is now running on <http://0.0.0.0:4000> 🟢`), `${chalk.bold.blue(APP_NAME)}\x1b[33m`)
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
})()
