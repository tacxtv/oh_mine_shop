import { LogLevel } from '@nestjs/common'
import { isArray } from 'radash'

/**
 * Get log level from string or string[] (default value 'debug')
 *
 * @param logLevel string | string[]
 * @returns LogLevel[]
 */
export function getLogLevel(logLevel?: string | string[]): LogLevel[] {
  if (isArray(logLevel)) {
    return logLevel as LogLevel[]
  }

  const logLevelMap: Record<LogLevel | string, LogLevel[]> = {
    fatal: ['fatal'],
    error: ['error', 'fatal'],
    warn: ['error', 'fatal', 'warn'],
    info: ['error', 'fatal', 'warn', 'log'],
    debug: ['error', 'fatal', 'warn', 'log', 'debug'],
    verbose: ['error', 'fatal', 'warn', 'log', 'debug', 'verbose'],
  }

  return logLevelMap[logLevel] || logLevelMap['debug']
}
