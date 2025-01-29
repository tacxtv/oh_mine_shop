import { Injectable } from '@nestjs/common'
import { InjectRcon } from '@the-software-compagny/nestjs_module_rcon'
import { parse, Tag } from 'nbt-ts'
import { Rcon } from 'rcon-client'
import { ListPlayers } from './player.interface'

@Injectable()
export class PlayerService {
  public constructor(@InjectRcon() private rcon: Rcon) { }

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
  public async getPlayerInventory(playerName: string) {
    return this.getPlayerData(playerName, 'Inventory')
  }

  /**
   * Get the player data from the server and filter it by path
   *
   * @param playerName string The name of the player
   * @param path string The path to filter the data (example: Inventory, Inventory[0])
   * @returns Promise<Tag> The player data filtered by path as a NBT
   */
  protected async getPlayerData(playerName: string, path: string = ''): Promise<Tag> {
    const regex = /(?:[a-zA-Z0-9_]+):\s(.*)/
    const result = await this.rcon.send(`data get entity ${playerName} ${path}`)
    const matched = result.match(regex)
    if (!matched) {
      throw new Error('Failed to parse player data')
    }
    const [, data] = matched

    return parse(data)
  }
}
