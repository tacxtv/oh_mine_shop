import { Controller, Get, Res, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public async findAll(@Res() res: Response) {
    const users = await this.usersService.findAllWithMinecraftHeads()
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: users
    })
  }
}
