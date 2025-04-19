import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RendezVous } from './_schemas/rendez-vous.schema'

@Injectable()
export class RendezVousService {
  private readonly logger = new Logger(RendezVousService.name)

  public constructor(@InjectModel(RendezVous.name) public _model: Model<RendezVous>) {
  }

  public async getIncomingRendezVous(): Promise<RendezVous | null> {
    const rendezVous = await this._model.findOne({
      startAt: { $gte: new Date() },
    }).sort({ startAt: 1 }).exec()

    return rendezVous
  }

  public async createRendezVous(rendezVous: Partial<RendezVous>): Promise<RendezVous> {
    const createdRendezVous = new this._model(rendezVous)
    return createdRendezVous.save()
  }
}
