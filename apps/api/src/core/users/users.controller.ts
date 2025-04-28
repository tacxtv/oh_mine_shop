import { Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Query, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { HasRoles } from '~/_common/_decorators/has-role.decorator'
import { Public } from '~/_common/_decorators/public.decorator'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) { }

  @Get()
  @Public()
  public async findPublicUsers(
    @Res() res: Response,
    @Query('staff') staffString: string,
    @Query('roles') rolesString: string,
  ) {
    const staff = /yes|true|on|1/i.test(staffString)
    const roles = rolesString ? rolesString.split(',') : []

    const users = await this.usersService.findAllWithMinecraftHeads({ staff, roles })

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: users
    })
  }

  @Get('all')
  @HasRoles('op')
  public async findAllUsers(@Res() res: Response) {
    const users = await this.usersService.findAllWithMinecraftHeads()

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: users
    })
  }

  @Get('currency/:name')
  public async getCurrency(
    @Res() res: Response,
    @Req() req: Request & { user: any },
    @Param('name') name: string,
  ) {
    if ((req.user as any).name.toLowerCase() !== name.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this defi',
      })
    }

    const users = await this.usersService.getCurrency(name)

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: users
    })
  }

  @Post('chunk/:name')
  public async buyChunk(
    @Res() res: Response,
    @Req() req: Request & { user: any },
    @Param('name') name: string,
  ) {
    if ((req.user as any).name.toLowerCase() !== name.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this transaction',
      })
    }

    const chunk = await this.usersService.buyChunk(name, 1)

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: chunk,
    })
  }


  @Post('currency/:name/:amount')
  public async uploadCurrency(
    @Res() res: Response,
    @Req() req: Request & { user: any },
    @Param('name') name: string,
    @Param('amount', new ParseIntPipe()) amount: number,
  ) {
    if ((req.user as any).name.toLowerCase() !== name.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this transaction',
      })
    }
    if (amount <= 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Amount must be greater than 0',
      })
    }

    const users = await this.usersService.uploadCurrency(name, amount)

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: users
    })
  }
}
