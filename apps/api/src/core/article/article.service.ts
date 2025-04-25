import { Injectable, MethodNotAllowedException, NotAcceptableException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Article } from './_schemas/article.schema'
import { Model } from 'mongoose'
import { ArticleState } from './_enums/article-state.enum'
import Redis from 'ioredis'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { UsersService } from '../users/users.service'
import { Rcon } from 'rcon-client'
import { InjectRcon } from '@the-software-compagny/nestjs_module_rcon'
import { parse, stringify } from 'nbt-ts'
import { existsSync, readFileSync } from 'fs'
import { ItemService } from '~/minecraft/item/item.service'

@Injectable()
export class ArticleService {
  public constructor(
    @InjectModel(Article.name) private readonly _model: Model<Article>,
    @InjectRedis() private readonly _redis: Redis,
    @InjectRcon() private readonly _rcon: Rcon,
    private readonly _users: UsersService,
    private readonly _item: ItemService,
  ) { }

  public async findAveragePrice(mod: string) {
    let filters = {}
    filters['state'] = ArticleState.SELLED
    filters['name'] = new RegExp('^' + mod, 'i')

    const items = await this._model.aggregate([
      { $match: filters },
      {
        $group: {
          _id: { name: '$name', stack: '$stack' },
          price: { $avg: '$price' },
          quantity: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.name',
          items: {
            $push: {
              name: '$_id.name',
              stack: '$_id.stack',
              quantity: '$quantity',
              price: '$price',
            },
          },
        },
      },
    ])

    return items
  }

  public async findBestPrice(mod: string) {
    let filters = {}
    filters['state'] = ArticleState.ON_SALE
    filters['name'] = new RegExp('^' + mod, 'i')

    const items = await this._model.aggregate([
      { $match: filters },
      {
        $match: {
          state: ArticleState.ON_SALE,
        },
      },
      {
        $group: {
          _id: { name: '$name', stack: '$stack', nbt: '$nbt', state: '$state' },
          price: { $min: '$price' },
          quantity: { $sum: 1 },
          onSaleAt: { $max: '$metadata.onSaleAt' },
        },
      },
      {
        $group: {
          _id: '$_id.name',
          items: {
            $push: {
              name: '$_id.name',
              stack: '$_id.stack',
              nbt: '$_id.nbt',
              quantity: '$quantity',
              state: '$state',
              price: '$price',
              'onSaleAt': '$onSaleAt'
            },
          },
          // stack: '$stack',
        },
      },
      {
        $sort: {
          '_id': 1,
        },
      },
    ])
    // for (const item of items) {
    //   const data = await this.redis.get(`craftshop:items:${item._id}`)
    //   const parsedData = JSON.parse(data)
    //   console.log('parsedData', parsedData)
    //   item.data = parsedData?.model || {}
    // }

    return await Promise.all(
      items.map(async (item) => {
        let _data = {}
        const data = await this._redis.get(`oms:items:${item.id}`)
        try {
          _data = JSON.parse(data).model
        } catch (error) {
        }

        if (existsSync(`../../storage/render/${item._id.replace(':', '__')}.png`)) {
          const file = readFileSync(`../../storage/render/${item._id.replace(':', '__')}.png`)
          _data['texture'] = `data:image/png;base64,${file.toString('base64')}`
        }

        return {
          ...item,
          name: item._id.split(':')[1],
          mod: item._id.split(':')[0],
          _data,
        }
      }),
    )
  }

  public async sellItem(
    name: string,
    slot: number,
    options = { quantity: 1, price: 1, stack: 1 },
  ) {
    const playerModel = await this._users.findOne({ name })
    if (!playerModel) throw new NotFoundException('Player not found')
    const inventory = await this.findByName(name)

    const invSlot = inventory.filter((Inv) => Inv.Slot.value === slot)
    if (!invSlot[0]) throw new NotFoundException()
    if (invSlot[0].Count.value < options.quantity)
      throw new NotAcceptableException()
    const data = await this._model.create({
      name: invSlot[0].id,
      quantity: options.quantity,
      price: options.price,
      stack: options.stack,
      nbt: invSlot[0].tag ? invSlot[0].tag : null,
      state: ArticleState.ON_SALE,
      vendor: {
        name: playerModel.name,
        id: playerModel._id,
      },
    })
    const nbt = invSlot[0].tag ? stringify(invSlot[0].tag) : ''
    const command = `clear ${name} ${invSlot[0].id}${nbt} ${options.quantity}`
    let taxe = Math.round(options.price * 0.01)
    if (taxe < 1) taxe = 1
    await this._users
      .findByIdAndUpdate(playerModel._id, {
        $inc: { money: -taxe },
      })
    const result = await this._rcon.send(command)
    console.log('result', result)
    if (
      !result.includes(`Removed ${options.quantity} item(s) from player ${name}`)
    ) {
      await this._model.findByIdAndDelete(data._id)
      throw new MethodNotAllowedException()
    }
    return { data, result, command }
  }

  public async findByName(
    name: string,
    pos: string = 'Inventory',
    noparse = false,
  ): Promise<any> {
    const prefix = `${name} has the following entity data: `
    const dim = await this._rcon.send(`data get entity ${name} Dimension`)
    if (dim.includes('No entity was found')) throw new NotFoundException()
    // const dimData = parse(dim.replace(prefix, '').replace('\n', ''))
    // if (dimData !== 'multiworld:miratopia')
    //   throw new MethodNotAllowedException()
    const command = `data get entity ${name} ${pos}`
    const result = await this._rcon.send(command)
    if (result.includes('No entity was found')) throw new NotFoundException()
    const data = result.replace(prefix, '').replace('\n', '')
    // console.log('data', data)
    const tag = parse(data) as any
    // console.log('tag', tag)
    if (typeof tag === 'object' && !noparse) {
      for (const key in tag) {
        const t = tag[key]
        const data = await this._redis.get(`craftshop:items:${t.id}`)
        t.data = data ? JSON.parse(data).model : null
      }
    }
    // console.log('tag', tag)
    return tag
  }

  public async getMods() {
    // add total count of mod items, name contains ':' and first part of name is the mod name
    const items = await this._model.aggregate([
      {
        $match: {
          name: { $regex: /:/ },
        },
      },
      {
        $group: {
          _id: {
            $substr: ['$name', 0, { $indexOfBytes: ['$name', ':'] }],
          },
          items: {
            $addToSet: '$name',
          },
        },
      },
      {
        $project: {
          _id: 1,
          count: { $size: '$items' },
        },
      },
    ])

    const mods = (await this._item.getMods()).map((mod) => {
      const item = items.find((item) => item._id === mod)
      if (!item) return { name: mod, count: 0 }

      return {
        name: mod,
        count: item.count,
        mod: item.mod,
      }
    }).sort((a, b) => {
      if (a.count > b.count) return -1
      if (a.count < b.count) return 1
      return 0
    })

    return mods
  }

  public async buyItem(
    player: string,
    id: string,
    options = { price: 1, stack: 1, nbt: null },
  ) {
    const data = await this._model.findOne<Article>({
      name: id,
      stack: options.stack,
      price: options.price,
      nbt: options.nbt,
    })

    const EnderItems = (await this.findByName(player, 'EnderItems')) || []

    const sortedEnderItems = []
    for (let i = 0; i < 26; i++) {
      const filter = EnderItems.filter((item) => item.Slot.value === i)
      if (filter[0]) {
        sortedEnderItems.push(filter[0])
      } else {
        sortedEnderItems.push({ Slot: { value: i } })
      }
    }

    for (let i = 0; i < 29; i++) {
      if (sortedEnderItems[i].id) continue
      const result = await this._rcon.send(
        `item replace entity ${player} enderchest.${i} with ${id}${stringify(
          data.nbt || ({} as any),
        )} ${data.stack}`,
      )
      if (
        result.includes(
          `Replaced a slot on ${player}`,
        )
      ) {
        await this._users.findByIdAndUpdate(data._id, {
          'metadata.purchaseBy': player,
          'metadata.selledAt': new Date(),
        })
      }
      return { result }
    }
  }
}
