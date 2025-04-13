import { DynamicModule, Module } from '@nestjs/common'
import { DemocracyController } from './democracy.controller'
import { DemocracyService } from './democracy.service'
import { RouterModule } from '@nestjs/core'

@Module({
  imports: [],
  controllers: [DemocracyController],
  providers: [DemocracyService],
})
export class DemocracyModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'democracy',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ])
      ],
    }
  }
}
