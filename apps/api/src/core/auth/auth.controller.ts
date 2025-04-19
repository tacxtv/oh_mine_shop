import { All, Body, Controller, Headers, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { omit } from 'radash'
import { Public } from '~/_common/_decorators/public.decorator'
import { AuthService } from './auth.service'
import Redis from 'ioredis'
import { InjectRedis } from '@nestjs-modules/ioredis'

@Public()
@Controller('auth')
export class AuthController {
  public constructor(
    private readonly service: AuthService,
    @InjectRedis() private readonly _redis: Redis,
  ) { }

  @Post('local')
  @UseGuards(AuthGuard('local'))
  public async authenticateWithLocal(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      ...(await this.service.tokensDelivery(req.user)),
      user: req.user,
    })
  }

  @All('minecraft')
  @UseGuards(AuthGuard('minecraft'))
  public async authenticateWithMinecraft(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      ...(await this.service.tokensDelivery(req.user)),
      user: req.user,
    })
  }

  @Post('refresh')
  public async refreshUserToken(
    @Res() res: Response,
    @Body() body,
  ): Promise<Response> {
    return res
      .status(HttpStatus.CREATED)
      .json({
        statusCode: HttpStatus.CREATED,
        ...(await this.service.refreshUserToken(body)),
      })
  }

  @All('session')
  @UseGuards(AuthGuard('jwt'))
  public async userinfo(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const user = await this.service.getSessionData((req.user as any)._id)
    const _avatarBase64 = await this._redis.get(`minecraft-head:${(req.user as any).name}`)

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      user: {
        ...omit((user as any).toJSON(), ['metadata']),
        _avatarBase64,
      },
    })
  }

  @Post('logout')
  public async logout(@Headers('Authorization') jwt: string, @Res() res) {
    await this.service.logoutUser(jwt.replace(/^Bearer\s/, ''))

    return res
      .status(HttpStatus.OK)
      .json({ statusCode: HttpStatus.OK })
  }
}
