import { TagArray, TagObject, TagType } from "nbt-ts"

export interface ListPlayers {
  online: number
  max: number
  players: string[]
}

export type TagInventory = TagArray & TagObject & {
  id: string
  Count: TagType.Int,
  Slot: TagType.Int,
  _data: any
}
