import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Constitution } from './_schemas/constitution.schema'
import { Model } from 'mongoose'
import { generateArtLawNum } from '~/_common/_functions/generate-artlaw-num'

@Injectable()
export class ConstitutionService {
  public constructor(@InjectModel(Constitution.name) public _model: Model<Constitution>) {
  }

  public async getConstitution(): Promise<Constitution[]> {
    const constitution = await this._model.find().exec()

    return constitution.map((item) => {

      //TODO: separer les articles abrogés et les articles en cours
      return {
        ...item.toObject(),
      }
    })
  }

  public async createConstitution(body: Partial<Constitution>): Promise<Constitution> {
    const artnum = generateArtLawNum('ART')
    const exists = await this._model.countDocuments({ artnum }).exec()

    if (exists > 0) {
      Logger.error(`Constitution with artnum ${artnum} already exists`)
      throw new BadRequestException(`Constitution with artnum ${artnum} already exists`)
    }

    const constitution = await this._model.create({
      artnum,
      metadata: {
        onProposalBy: 'system',
        ...body?.metadata || {},
      },
      ...body,
    })

    return constitution
  }
}
