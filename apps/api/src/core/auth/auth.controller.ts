import { All, Body, Controller, Get, Headers, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { omit } from 'radash'

@Controller('auth')
export class AuthController {
  public constructor(private readonly service: AuthService) { }

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

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      user: omit((user as any).toJSON(), ['metadata']),
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
