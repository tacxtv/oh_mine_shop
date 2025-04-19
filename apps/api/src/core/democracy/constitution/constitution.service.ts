import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Constitution } from './_schemas/constitution.schema'
import { Model } from 'mongoose'

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
}
