import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Law } from './_schemas/law.schema'
import { Model } from 'mongoose'
import { generateArtLawNum } from '~/_common/_functions/generate-artlaw-num'
import { omit } from 'radash'

@Injectable()
export class LawService {
  public constructor(@InjectModel(Law.name) public _model: Model<Partial<Law & { voted: boolean }>>) {
    this._model = _model
  }

  public async getAllLaws(): Promise<Law[]> {
    const currentDate = new Date()

    const laws = await this._model.find({
      appliedAt: {
        $lte: currentDate,
      },
    }, {
      // votes: 0,
    }).exec()

    return (laws || []).map((law) => {
      let approuved = 0
      for (const vote of law.votes) {
        approuved += vote.type
      }
      let proposedAt = law.appliedAt
      proposedAt.setDate(proposedAt.getDate() - 1) // 24h before the vote

      return {
        ...omit(law.toObject(), ['votes']),
        approuved: approuved > 0,
        proposedAt,
      }
    })
  }

  public async getLaws(playerName: string = ''): Promise<Law[]> {
    const currentDate = new Date()

    const laws = await this._model.find({
      appliedAt: {
        $gt: currentDate,
      },
    }, {
      // votes: 0,
    }).exec()

    return (laws || []).map((law) => {
      let voted = undefined
      if (playerName) {
        voted = law.votes.some((vote) => vote.name === playerName)
      }
      let proposedAt = law.appliedAt
      proposedAt.setDate(proposedAt.getDate() - 1) // 24h before the vote

      return {
        ...omit(law.toObject(), ['votes']),
        voted,
        proposedAt,
      }
    })
  }

  public async createLaw(body: Partial<Law>): Promise<Law> {
    const lawnum = generateArtLawNum('LAW')
    const exists = await this._model.countDocuments({ lawnum }).exec()

    if (exists > 0) {
      Logger.error(`Constitution with lawnum ${lawnum} already exists`)
      throw new BadRequestException(`Law with lawnum ${lawnum} already exists`)
    }

    const constitution = await this._model.create({
      lawnum,
      proposedBy: 'system',
      ...body,
    })

    return constitution
  }

  public async deleteLaw(id: string): Promise<void> {
    const exists = await this._model.countDocuments({ _id: id }).exec()

    if (exists === 0) {
      Logger.error(`Law with id ${id} does not exist`)
      throw new BadRequestException(`Law with id ${id} does not exist`)
    }

    await this._model.deleteOne({ _id: id }).exec()
  }

  public async vote(
    lawnum: string,
    playerName: string,
    vote: number,
  ): Promise<boolean> {
    const laws = await this._model
      .find({ lawnum, appliedAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .exec()

    if (laws.length === 0) {
      throw new NotFoundException('Law not found or already applied')
    }

    const existingVote = await this._model.findOne({
      lawnum,
      'votes.name': playerName,
    })
    if (existingVote) {
      throw new UnauthorizedException('Already voted')
    }

    const election = await this._model.findOneAndUpdate(
      {
        lawnum,
        'votes.name': { $ne: playerName },
      },
      {
        $addToSet: {
          votes: {
            name: playerName,
            type: vote,
            votedAt: new Date(),
          },
        },
      },
      { new: true },
    )

    if (!election) {
      throw new Error('Election not found or already voted')
    }

    return !!election
  }

  public async getUnAbbrogatedLaws(): Promise<Law[]> {
    const laws = await this._model
      .find({
        abrogatedLawnums: { $exists: false },
        appliedAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .exec()

    return laws || []
  }
}
