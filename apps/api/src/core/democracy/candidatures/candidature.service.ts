import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Candidature } from './_schemas/candidature.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Election } from './_schemas/election.schema'

@Injectable()
export class CandidatureService {
  public constructor(
    @InjectModel(Candidature.name) public _model: Model<Candidature>,
    @InjectModel(Election.name) public _election: Model<Election>,
  ) { }

  public async listCandidatures(
    electionNumber: number,
  ): Promise<any[]> {
    const candidatures = await this._model
      .find({ electionNumber })
      .sort({ createdAt: -1 })
      .exec()

    return candidatures.map((item) => {
      return {
        ...item.toObject(),
      }
    })
  }

  public async createCandidature(
    electionNumber: number,
    proposedBy: string,
    content: string,
  ): Promise<Candidature> {
    const candidatures = await this._model
      .find({ electionNumber, proposedBy })
      .exec()

    if (candidatures.length > 0) {
      throw new Error('Candidature already exists')
    }

    const candidature = new this._model({
      electionNumber,
      proposedBy,
      content,
    })

    return candidature.save()
  }

  public async vote(
    electionNumber: number,
    playerName: string,
    target: string,
  ): Promise<Election> {
    const candidatures = await this._model
      .find({ electionNumber, proposedBy: target })
      .exec()

    if (candidatures.length === 0) {
      throw new NotFoundException('Candidature not found')
    }

    const existingVote = await this._election.findOne({
      electionNumber,
      'votes.name': playerName,
    })
    if (existingVote) {
      throw new UnauthorizedException('Already voted')
    }

    const election = await this._election.findOneAndUpdate(
      {
        electionNumber,
        'votes.name': { $ne: playerName },
      },
      {
        $addToSet: {
          votes: {
            name: playerName,
            candidat: target,
            votedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true },
    )

    if (!election) {
      throw new Error('Election not found or already voted')
    }

    return election
  }

  public async hasVoted(
    electionNumber: number,
    playerName: string,
  ): Promise<boolean> {
    const election = await this._election
      .findOne({
        electionNumber,
        'votes.name': playerName,
      })
      .exec()

    return !!election
  }
}
