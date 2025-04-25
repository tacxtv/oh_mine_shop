import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRcon } from '@the-software-compagny/nestjs_module_rcon'
import Redis from 'ioredis'
import { Byte, Int, parse, Tag } from 'nbt-ts'
import { Rcon } from 'rcon-client'
import { ListPlayers, TagInventory } from './_interfaces/player.interface'
import { existsSync, readFileSync } from 'node:fs'

(Byte as any).prototype.toJSON = function () {
  return +this.value.toString()
};
(Int as any).prototype.toJSON = function () {
  return +this.value.toString()
};

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name)

  public constructor(
    @InjectRcon() private rcon: Rcon,
    @InjectRedis() private readonly _redis: Redis,
  ) { }

  /**
   * List the players on the server
   *
   * @returns Promise<ListPlayers> The list of players on the server
   */
  public async listPlayers(): Promise<ListPlayers> {
    const regex = /(\d+).*of\ ([0-9]+).*:\ (.+)/
    const list = await this.rcon.send('list')
    const matched = list.match(regex)
    if (!matched) {
      throw new Error('Failed to parse player list')
    }

    const [_, online, max, players] = matched

    return {
      online: parseInt(online, 10),
      max: parseInt(max, 10),
      players: players.split(', ')
    }
  }

  /**
   * Get the player inventory from the server
   *
   * @param playerName string The name of the player
   * @returns Promise<Tag> The player inventory as a NBT
   */
  public async getPlayerInventory<T extends TagInventory>(playerName: string): Promise<T[]> {
    let Inventory: T[] = []

    try {
      // Attempt to fetch the entire inventory at once
      Inventory = await this.getPlayerData<T[]>(playerName, 'Inventory')
    } catch (error) {
      if (error.message.includes('not logged?')) {
        throw new NotFoundException('Player not logged in')
      }

      this.logger.warn(`Failed to fetch inventory for ${playerName}. Error: ${error} ! Trying to fetch items one by one...`)

      // If fetching the whole inventory fails, retrieve items one by one
      for (let i = 0; i < 36; i++) {
        try {
          // Attempt to fetch individual inventory slots
          Inventory[i] = await this.getPlayerData<T>(playerName, `Inventory[${i}]`)
        } catch (err) {
          // Stop fetching when no more items are found
          // if (i )
          this.logger.log(`No more items found in inventory at index ${error}. Stopping fetch.`)
          break
        }
      }
    }

    // Enrich each inventory item with additional data from Redis
    return Promise.all(
      Inventory.map(async (item) => {
        let _data = {}
        const data = await this._redis.get(`oms:items:${item.id}`)
        try {
          _data = JSON.parse(data).model
        } catch (error) {
        }

        if (existsSync(`../../storage/render/${item.id.replace(':', '__')}.png`)) {
          const file = readFileSync(`../../storage/render/${item.id.replace(':', '__')}.png`)
          _data['texture'] = `data:image/png;base64,${file.toString('base64')}`
        }

        return {
          ...item,
          // Attach extra item data if available
          _data,
        }
      })
    )
  }

  /**
   * Get the player data from the server and filter it by path
   *
   * @param playerName string The name of the player
   * @param path string The path to filter the data (example: Inventory, Inventory[0])
   * @returns Promise<Tag> The player data filtered by path as a NBT
   */
  protected async getPlayerData<T = Tag>(playerName: string, path: string = ''): Promise<T> {
    const regex = /(?:[a-zA-Z0-9_]+):\s(.*)/
    const result = await this.rcon.send(`data get entity ${playerName} ${path}`)

    if (result.includes(`Found no elements matching ${path}`)) {
      throw new NotFoundException('Failed to parse element data. Element does not exist?')
    }

    const matched = result.match(regex)
    if (!matched) {
      throw new NotFoundException('Failed to parse player data. Player does not exist or not logged?')
    }

    try {
      const [, data] = matched
      return parse(data) as T
    } catch (error) {
      throw new Error('Failed to parse player data')
    }
  }
}
