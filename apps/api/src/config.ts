import Joi from 'joi'
import { RconOptions } from '@the-software-compagny/nestjs_module_rcon'

export const validationSchema = Joi.object({
  OMS_RCON_HOST: Joi
    .string()
    .default('localhost'),

  OMS_RCON_PORT: Joi
    .number()
    .default(25575),

  OMS_RCON_PASSWORD: Joi
    .string().
    required(),
})

export interface ConfigInstance {
  rcon: {
    options: RconOptions
  }
}

export default async (): Promise<ConfigInstance> => ({
  rcon: {
    options: {
      host: process.env['OMS_RCON_HOST'],
      port: parseInt(process.env['OMS_RCON_PORT'], 10),
      password: process.env['OMS_RCON_PASSWORD'],
    }
  }
})
