import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import AdmZip from 'adm-zip'
import Redis from 'ioredis'
import { createHash } from 'node:crypto'
import Client, { ConnectOptions } from 'ssh2-sftp-client'

@Injectable()
export class ItemService implements OnModuleInit {
  private readonly logger = new Logger(ItemService.name)

  protected readonly _sftp = new Client()

  protected ignoredMods = []

  protected basePath: string

  public constructor(
    private readonly config: ConfigService,
    @InjectRedis() private readonly _redis: Redis,
  ) {
    this.basePath = '/opt/stacks/mirasurvie/data'
  }

  public async onModuleInit(): Promise<void> {
    try {
      await this._sftp.connect(this.config.get<ConnectOptions>('server.sftp'))

      const lastSync = await this._redis.get('oms:lastSync')

      if (lastSync) {
        const lastSyncDate = new Date(lastSync)
        const now = new Date()
        if (now.getTime() - lastSyncDate.getTime() < 1000 * 60 * 60 * 24) {
          this.logger.log('Last sync is less than 24h, skipping sync...')
          return
        }

        this.logger.log(`Last sync found at ${lastSync}, syncing all...`)
      } else {
        this.logger.log('No last sync found, syncing all...')
      }

      await this.syncAll()
      // await this._sftp.end()
    } catch (e) {
      console.error('Error while connecting to SFTP', e)
    }
  }

  public async listAll() {
    return await this._redis.smembers(`oms:mods`)
  }

  public async getOne(modId: string) {
    const modInfos = await this._redis.get(`oms:items:${modId}`)

    if (!modInfos) throw new NotFoundException(`Mod ${modId} not found`)

    return modInfos
  }

  public async syncAll(force = false) {
    const items = []

    if (force) {
      await this._redis.del(`oms:mods`)
      await this._redis.del(`oms:files`)
      await this._redis.del(`oms:hashs:*`)
      await this._redis.del(`oms:items:*`)

      this.logger.log('Deleted all items')
    }

    const mods = await this._redis.smembers(`oms:files`)
    const modsList = await this._sftp.list(this.basePath + '/mods')
    const clientList = await this._sftp.list(this.basePath + '/client')
    const list = [
      ...clientList.map((file) => ({ name: 'client/' + file.name })),
      ...modsList.map((file) => ({ name: 'mods/' + file.name })),
    ]

    for (const file of list) {
      if (!/\.jar$/.test(file.name)) {
        this.logger.warn(`Ignoring incorrect file type: <${file.name}> !`)
        continue
      }

      if (mods.includes(file.name)) {
        const storedHash = await this._redis.get(`oms:hashs:${file.name}`)

        const hashFile = await this._sftp.get(`${this.basePath}/${file.name}`)
        const hashFileBuffer = hashFile as Buffer
        const hashFileString = hashFileBuffer.toString('base64')
        const hash = createHash('sha256').update(hashFileString).digest('hex')

        if (storedHash === hash) {
          this.logger.warn(`Ignoring already cached mod: <${file.name}> !`)
          continue
        }

        this.logger.warn(`Mod <${file.name}> has changed !`)
      }

      this.logger.log(`Syncing <${file.name}>...`)

      const { modId } = await this.syncOne(file.name)
      items.push({ modId, file })
    }

    await this._redis.set('oms:lastSync', new Date().toISOString())
    this.logger.log('Sync done ! Last sync updated !')

    return items
  }

  public async syncOne(filename: string) {
    const exists = await this._sftp.exists(`${this.basePath}/${filename}`)
    if (!exists) throw new NotFoundException(`File ${filename} not found`)
    if (!/\.jar$/.test(filename)) throw new Error('Not a jar file')

    this.logger.log(`Downloading ${filename}...`)

    const modInfos = await this._sftp.get(`${this.basePath}/${filename}`) as Buffer
    const zip = new AdmZip(modInfos)

    let modId
    if (filename.startsWith('mods/')) {
      const modInfoFile = zip.getEntry('fabric.mod.json')
      const modInfo = JSON.parse(modInfoFile.getData().toString('utf8'))
      modId = modInfo.id
    } else if (filename.startsWith('versions/')) {
      this.logger.log('Detected version file, parsing Minecraft...')
      modId = 'minecraft'
    } else if (filename.startsWith('client/')) {
      this.logger.log('Detected client file, parsing Minecraft...')
      modId = 'minecraft'
    } else {
      this.logger.error('Invalid path filename (allowed only mods or versions base path) !')
      throw new Error('Invalid path filename (allowed only mods or versions base path) !')
    }

    this.logger.log(`Deleting cached entries <${modId}>...`)
    await this._redis.srem(`oms:mods`, modId)
    await this._redis.srem(`oms:files`, filename)
    await this._redis.del(`oms:hashs:${filename}`)
    await this._redis.del(`oms:items:${modId}:*`)

    if (this.ignoredMods.includes(modId)) {
      this.logger.warn(`Ignoring ${modId}`)
      return
    }

    this.logger.log(`Syncing ${modId}...`)

    let I18n = {}
    try {
      this.logger.log('Parsing lang file...')
      let langFile = zip
        .getEntry(`assets/${modId}/lang/fr_fr.json`)
        ?.getData()
        .toString('utf8')
      if (!langFile) {
        this.logger.warn('No french lang file found, using english...')
        langFile = zip
          .getEntry(`assets/${modId}/lang/en_us.json`)
          ?.getData()
          .toString('utf8')
      }
      I18n = JSON.parse(langFile ?? '{}')

    } catch (e) {
      this.logger.error('Error while parsing lang file', e)
    }

    if (!/\.jar$/.test(filename)) throw new Error('Not a jar file')

    await this._redis.sadd(`oms:files`, [filename])

    const hashFile = await this._sftp.get(`${this.basePath}/${filename}`)
    const hashFileBuffer = hashFile as Buffer
    const hashFileString = hashFileBuffer.toString('base64')
    const hash = createHash('sha256').update(hashFileString).digest('hex')

    await this._redis.set(`oms:hashs:${filename}`, hash)

    return await this.parseEntries(zip, modId, I18n)
  }

  private async parseEntries(zip: AdmZip, modId: string, I18n: Record<string, string>) {
    const models = []
    const modelsErrors = []

    this.logger.log(`Parsing ${modId}...`)

    for (const zipEntry of zip.getEntries()) {
      try {
        if (!/^assets\/.*\/models\/.*\.json/.test(zipEntry.entryName)) continue
        models.push(this.parseItem(modId, zip, zipEntry, I18n))
        this.logger.verbose(`Parsed ${zipEntry.entryName} !`)
      } catch (error) {
        this.logger.warn(`Error while parsing ${zipEntry.entryName}: ${error.message} !`)
        this.logger.debug(error)

        modelsErrors.push({
          id: error.id,
          error,
        })
      }
    }

    this.logger.log(`Parsed ${models.length} models for ${modId} with ${modelsErrors.length} errors`)

    if (!models.length) {
      this.logger.warn(`No models found for ${modId} !`)
      return { modId, models, modelsErrors }
    }

    await this._redis.sadd(`oms:mods`, [modId])
    this.logger.log(`Cached mod: <${modId}> !`)

    for (const model of models) {
      await this._redis.set(
        `oms:items:${modId}:${model.id}`,
        JSON.stringify({ modId, model }),
      )
      this.logger.verbose(`Cached model data: <${modId}:${model.id}> !`)
    }

    this.logger.log(`Cached ${models.length} models for ${modId} !`)

    return { modId, models, modelsErrors }
  }

  private parseItem(modId, zip, zipEntry, I18n, deep = 0) {
    const fileParse = zipEntry.entryName.split('/')
    const id = fileParse[fileParse.length - 1].split('.')[0]
    const data = JSON.parse(zipEntry.getData().toString('utf8'))
    if (deep > 3) {
      const error = new Error(`Too many recursion for ${zipEntry.entryName}`)
        ; (error as any).type = 'TOO_MANY_RECURSION'
        ; (error as any).data = data
        ; (error as any).id = id
      throw error
    }

    const mainTexture =
      data.textures?.side ||
      data.textures?.layer0 ||
      data.textures?.top ||
      data.textures?.up ||
      data.textures?.body ||
      data.textures?.cross ||
      data.textures?.texture ||
      data.textures?.particle ||
      data.textures?.dirt

    if (!mainTexture) {
      if (data.textures?.all) {
        const parent = zip.getEntry(
          `assets/${modId}/models/${data.textures.all.split(':')[1]}.json`,
        )
        if (parent) {
          return {
            ...this.parseItem(modId, zip, parent, I18n, deep++),
            parent: data.parent,
            texturesAll: data.textures?.all,
            id,
          }
        }
        const error = new Error(
          `No texture found for ${zipEntry.entryName} and no parent found for ${data.textures.all}`,
        )
          ; (error as any).type = 'NO_TEXTURE_FOUND'
          ; (error as any).data = data
          ; (error as any).id = id
        throw error
      }
      if (data.parent) {
        const parent = zip.getEntry(
          `assets/${modId}/models/${data.parent.split(':')[1]}.json`,
        )
        if (parent) {
          return {
            ...this.parseItem(modId, zip, parent, I18n, deep++),
            parent: data.parent,
            id,
          }
        }
        const error = new Error(
          `No texture found for ${zipEntry.entryName} and no parent found for ${data.parent}`,
        )
          ; (error as any).type = 'NO_TEXTURE_FOUND'
          ; (error as any).data = data
          ; (error as any).id = id
        throw error
      }

      const error = new Error(`No texture found for ${zipEntry.entryName}`)
        ; (error as any).type = 'NO_TEXTURE_FOUND'
        ; (error as any).data = data
        ; (error as any).id = id
      throw error
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
    let [_, mainTexturePath] = mainTexture?.split(':')
    if (modId === 'minecraft' && !mainTexturePath) mainTexturePath = mainTexture

    const item = zip.getEntry(`assets/${modId}/textures/${mainTexturePath}.png`)

    let texture = item?.getData().toString('base64')
    texture = texture ? `data:image/png;base64,${texture}` : null
    let type = 'oms:unknown'
    if (typeof data.parent === 'string') {
      type = data.parent?.split('/')[0]
      type = /:/.test(type) ? type : `oms:${type}`
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [__, typeSuffix] = type.split(':')
    let name = I18n[`${typeSuffix}.${modId}.${id}`]
    switch (true) {
      case /_open/.test(id):
        name =
          I18n[`${typeSuffix}.${modId}.${id.replace(/_open$/, '')}`] +
          ' (Ouvert)'
        break
    }

    let craft = null
    const repicesFile = zip
      .getEntry(`data/${modId}/recipes/${id}.json`)
      ?.getData()
      .toString('utf8')
    if (repicesFile) {
      craft = JSON.parse(repicesFile)
    }

    return {
      id,
      name,
      type,
      craft,
      texture,
    }
  }
}
