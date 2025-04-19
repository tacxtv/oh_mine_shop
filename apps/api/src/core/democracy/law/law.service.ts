import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Law } from './_schemas/law.schema'
import { Model } from 'mongoose'

@Injectable()
export class LawService {
  public constructor(@InjectModel(Law.name) public _model: Model<Law>) {
  }

  public async getLaws(): Promise<Law[]> {
    const laws = await this._model.find().exec()

    return laws || []
  }
}
