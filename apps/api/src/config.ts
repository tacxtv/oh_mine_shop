import { NestApplicationOptions } from '@nestjs/common'
import { JwtModuleOptions } from '@nestjs/jwt'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { IAuthModuleOptions } from '@nestjs/passport'
import { RconOptions } from '@the-software-compagny/nestjs_module_rcon'
import { RedisOptions } from 'ioredis'
import Joi from 'joi'
import { getLogLevel } from './_common/_functions/get-log-level'
import { ConnectOptions } from 'ssh2-sftp-client'

export const validationSchema = Joi.object({
  OMS_LOG_LEVEL: Joi
    .string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'verbose')
    .default('debug'),

  OMS_IOREDIS_URI: Joi
    .string()
    .uri({ scheme: ['redis'] })
    .required(),

  OMS_MONGOOSE_URI: Joi
    .string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),

  OMS_RCON_HOST: Joi
    .string()
    .default('localhost'),

  OMS_RCON_PORT: Joi
    .number()
    .default(25575),

  OMS_RCON_PASSWORD: Joi
    .string().
    required(),

  OMS_JWT_SECRET: Joi
    .string()
    .min(32)
    .required(),

  OMS_STRATEGY_XBOXLIVE_CLIENT_ID: Joi
    .string()
    .required(),

  OMS_STRATEGY_XBOXLIVE_CLIENT_SECRET: Joi
    .string()
    .required(),

  OMS_STRATEGY_XBOXLIVE_CALLBACK_URL: Joi
    .string()
    .uri({ scheme: ['http', 'https'] })
    .required(),

  OMG_SERVER_SFTP_HOST: Joi
    .string()
    .ip()
    .default('localhost'),

  OMG_SERVER_SFTP_PORT: Joi
    .number()
    .default(22),

  OMG_SERVER_SFTP_USERNAME: Joi
    .string()
    .required(),

  OMG_SERVER_SFTP_PASSWORD: Joi
    .string()
    .required(),
})

export interface ConfigInstance {
  application: NestApplicationOptions

  server: {
    sftp: ConnectOptions
  }

  ioredis: {
    uri: string
    options: RedisOptions
  }

  mongoose: {
    uri: string
    options: MongooseModuleOptions
  }

  rcon: {
    options: RconOptions
  }

  jwt: {
    options: JwtModuleOptions
  }

  passport: {
    options: IAuthModuleOptions
    strategies?: {
      minecraft?: {
        clientID: string,
        clientSecret: string,
        callbackURL: string,
        scope: string,
      }
    }
  }
}

export default async (): Promise<ConfigInstance> => ({
  application: {
    logger: getLogLevel(process.env['OMS_LOG_LEVEL']),
    cors: true,
  },

  server: {
    sftp: {
      host: process.env['OMG_SERVER_SFTP_HOST'],
      port: parseInt(process.env['OMG_SERVER_SFTP_PORT'], 10),
      username: process.env['OMG_SERVER_SFTP_USERNAME'],
      password: process.env['OMG_SERVER_SFTP_PASSWORD'],
    },
  },

  ioredis: {
    uri: process.env['OMS_IOREDIS_URI'],
    options: {
      showFriendlyErrorStack: true,
    },
  },

  mongoose: {
    uri: process.env['OMS_MONGOOSE_URI'],
    options: {
      directConnection: true,
    },
  },

  rcon: {
    options: {
      host: process.env['OMS_RCON_HOST'],
      port: parseInt(process.env['OMS_RCON_PORT'], 10),
      password: process.env['OMS_RCON_PASSWORD'],
    }
  },


  jwt: {
    options: {
      secret: process.env['OMS_JWT_SECRET'],
    },
  },

  passport: {
    options: {
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    },
    strategies: {
      minecraft: {
        clientID: process.env['OMS_STRATEGY_XBOXLIVE_CLIENT_ID'],
        clientSecret: process.env['OMS_STRATEGY_XBOXLIVE_CLIENT_SECRET'],
        callbackURL: process.env['OMS_STRATEGY_XBOXLIVE_CALLBACK_URL'],
        scope: 'Xboxlive.signin offline_access',
      },
    }
  },
})
