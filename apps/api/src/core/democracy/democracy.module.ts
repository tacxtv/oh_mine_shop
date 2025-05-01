import { DynamicModule, Module } from '@nestjs/common'
import { DemocracyController } from './democracy.controller'
import { DemocracyService } from './democracy.service'
import { RouterModule } from '@nestjs/core'
import { ConstitutionModule } from './constitution/constitution.module'
import { LawModule } from './law/law.module'
import { CandidatureModule } from './candidatures/candidature.module'

@Module({
  imports: [
    ConstitutionModule,
    CandidatureModule,
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
