import { Controller, Get, Res, HttpStatus, Query } from '@nestjs/common'
import { Response } from 'express'
import { UsersService } from './users.service'
import { HasRoles } from '~/_common/_decorators/has-role.decorator'
import { Public } from '~/_common/_decorators/public.decorator'

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
}
