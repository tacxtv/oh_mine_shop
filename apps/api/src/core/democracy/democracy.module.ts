import { DynamicModule, Module } from '@nestjs/common'
import { DemocracyController } from './democracy.controller'
import { DemocracyService } from './democracy.service'
import { RouterModule } from '@nestjs/core'
import { ConstitutionModule } from './constitution/constitution.module'
import { LawModule } from './law/law.module'

@Module({
  imports: [
    ConstitutionModule,
    LawModule,
  ],
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
            path: 'core/democracy',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ])
      ],
    }
  }
}
