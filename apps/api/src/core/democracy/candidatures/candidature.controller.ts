import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Req, Res } from '@nestjs/common'
import { CandidatureService } from './candidature.service';
import { Request, Response } from 'express';

@Controller('candidature')
export class CandidatureController {
  public constructor(private readonly _service: CandidatureService) { }

  @Get(':electionNumber/:playerName')
  public async listCandidatures(
    @Req() req: Request & { user: any },
    @Res() res: Response,
    @Param('electionNumber', new ParseIntPipe()) electionNumber: number,
    @Param('playerName') playerName: string,
  ): Promise<Response> {
    const candidatures = await this._service.listCandidatures(electionNumber)

    if ((req.user as any).name.toLowerCase() !== playerName.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this transaction',
      })
    }

    const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)
    if (electionNumber !== currentWeekNumber) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bad election number',
      })
    }

    const hasVoted = await this._service.hasVoted(electionNumber, playerName)

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        candidatures,
        hasVoted,
      },
    })
  }

  @Post(':electionNumber/:playerName/create')
  public async createCandidature(
    @Req() req: Request & { user: any },
    @Res() res: Response,
    @Param('electionNumber', new ParseIntPipe()) electionNumber: number,
    @Param('playerName') playerName: string,
    @Body() body: any,
  ): Promise<Response> {
    const { content } = body

    if ((req.user as any).name.toLowerCase() !== playerName.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this transaction',
      })
    }

    const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)
    if (electionNumber !== currentWeekNumber) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bad election number',
      })
    }

    const candidature = await this._service.createCandidature(
      electionNumber,
      playerName,
      content,
    )

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: candidature,
    })
  }

  @Post(':electionNumber/:playerName/vote')
  public async vote(
    @Req() req: Request & { user: any },
    @Res() res: Response,
    @Param('electionNumber', new ParseIntPipe()) electionNumber: number,
    @Param('playerName') playerName: string,
    @Body() body: any,
  ): Promise<Response> {
    const { target } = body

    if ((req.user as any).name.toLowerCase() !== playerName.toLowerCase() && !(req.user as any).roles.includes('op')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this transaction',
      })
    }

    const currentWeekNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24 / 7)
    if (electionNumber !== currentWeekNumber) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to participate in this transaction',
      })
    }

    const vote = await this._service.vote(
      electionNumber,
      playerName,
      target,
    )

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: vote,
    })
  }
}
