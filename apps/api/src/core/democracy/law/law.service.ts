import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Law } from './_schemas/law.schema'
import { Model } from 'mongoose'
import { generateArtLawNum } from '~/_common/_functions/generate-artlaw-num'

@Injectable()
export class LawService {
  public constructor(@InjectModel(Law.name) public _model: Model<Law>) {
  }

  public async getLaws(): Promise<Law[]> {
    const laws = await this._model.find({}, {
      votes: 0,
    }).exec()

    return laws || []
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
}
