import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Defis } from './_schemas/defi.schema'
import { DeleteResult, Model } from 'mongoose'
import Redis from 'ioredis'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { InjectRcon } from '@the-software-compagny/nestjs_module_rcon'
import { Rcon } from 'rcon-client'
import { existsSync, readFileSync } from 'node:fs'

@Injectable()
export class DefiService {
  private readonly logger = new Logger(DefiService.name)

  public constructor(
    @InjectModel(Defis.name) public _model: Model<Defis>,
    @InjectRedis() private readonly _redis: Redis,
    @InjectRcon() private rcon: Rcon,
  ) {
  }

  public async getCurrentDefi(player?: string): Promise<Defis & { _data?: any, _playerMaxQuantity?: number, _playerParticipation?: any, _playerRank?: number }> {
    const defi = await this._model.findOne({
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
    }).sort({ createdAt: -1 }).exec()

    if (!defi) {
      throw new NotFoundException('Defi not found')
    }

    let _data = {}
    const data = await this._redis.get(`oms:items:${defi.itemId}`)
    try {
      _data = JSON.parse(data).model
    } catch (error) {
    }
    if (existsSync(`../../storage/render/${defi.itemId.replace(':', '__')}.png`)) {
      const file = readFileSync(`../../storage/render/${defi.itemId.replace(':', '__')}.png`)
      _data['texture'] = `data:image/png;base64,${file.toString('base64')}`
    }

    let _playerMaxQuantity = undefined
    let _playerParticipation = undefined
    let _playerRank = undefined
    if (player) {
      _playerMaxQuantity = await this.quantityFromPlayerForDefi(player, defi.itemId)
      _playerParticipation = defi.participation.find((p) => p.player === player)
      _playerRank = defi.participation
        .sort((a, b) => b.amount - a.amount)
        .findIndex((p) => p.player === player) + 1
    }

    return {
      ...defi.toObject(),
      _data,
      _playerMaxQuantity,
      _playerParticipation,
      _playerRank,
    }
  }

  public async participateDefi(player: string, amount: number): Promise<Defis> {
    const defi = await this._model.findOne({
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
    }).sort({ createdAt: -1 }).exec()

    if (!defi) {
      throw new NotFoundException('Defi not found')
    }

    const quantity = await this.quantityFromPlayerForDefi(player, defi.itemId)

    if (amount > quantity || amount <= 0) {
      throw new BadRequestException('Bad quantity')
    }

    return await this.uploadItemToDefi(player, defi.itemId, amount)
  }

  public async createDefi(defi: Partial<Defis>): Promise<Defis> {
    return this._model.create(defi)
  }

  public async deleteDefi(): Promise<DeleteResult> {
    const defi = await this._model.deleteOne({
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
    }).sort({ createdAt: -1 }).exec()

    if (!defi) {
      throw new NotFoundException('Defi not found')
    }

    return defi
  }

  public async getAllDefi(): Promise<(Defis & { _data?: any, _rank?: any })[]> {
    const defis = await this._model.find().sort({ createdAt: -1 }).exec()

    return await Promise.all(
      defis.map(async (defi) => {
        const data = await this._redis.get(`oms:items:${defi.itemId}`)
        let _data = {}
        try {
          _data = JSON.parse(data).model
        } catch (error) {
        }

        if (existsSync(`../../storage/render/${defi.itemId.replace(':', '__')}.png`)) {
          const file = readFileSync(`../../storage/render/${defi.itemId.replace(':', '__')}.png`)
          _data['texture'] = `data:image/png;base64,${file.toString('base64')}`
        }

        const _rank = defi.participation.sort((a, b) => b.amount - a.amount).map((p, i) => {
          return {
            ...p.toJSON(),
            _position: i + 1,
          }
        })

        return {
          ...defi.toObject(),
          _data,
          _rank,
        }
      }),
    )
  }

  private async quantityFromPlayerForDefi(player: string, itemId: string): Promise<number> {
    const res = await this.rcon.send(`clear ${player} ${itemId} 0`)
    const regex = /^Found\s([\d]+)\smatching.*$/
    const matched = res.replace('\n', '').match(regex)

    return matched ? parseInt(matched[1], 10) : 0
  }

  private async uploadItemToDefi(player: string, itemId: string, amount: number): Promise<Defis> {
    const res = await this.rcon.send(`clear ${player} ${itemId} ${amount}`)
    this.logger.debug(`clear ${player} ${itemId} ${amount}`)

    const regex = /^Removed\s([\d]+)\sitem.*$/
    console.log(res)
    const matched = res.replace('\n', '').match(regex)
    const quantity = parseInt(matched[1], 10)

    if (!matched) {
      throw new NotFoundException('Item not found')
    }

    const result = await this._model.findOneAndUpdate({
      itemId,
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
      'participation.player': player,
    }, {
      $inc: {
        'participation.$.amount': quantity,
      },
    }, {
      new: true,
    }).exec()

    if (!result) {
      return this._model.findOneAndUpdate({
        itemId,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
      }, {
        $push: {
          participation: {
            player,
            amount: quantity,
          },
        },
      }, {
        new: true,
      }).exec()
    }

    return result
  }
}
