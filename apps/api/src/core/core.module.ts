import { DynamicModule, Module } from '@nestjs/common'
import { CoreController } from './core.controller'
import { CoreService } from './core.service'
import { RouterModule } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OfferingModule } from './offering/offering.module'
import { ArticleModule } from './article/article.module'
import { DefiModule } from './defi/defi.module'
import { RendezVousModule } from './rendez-vous/rendez-vous.module'

@Module({
  imports: [
    ArticleModule,
    AuthModule,
    OfferingModule,
    UsersModule,
    DefiModule,
    RendezVousModule,
  ],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'core',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ])
      ],
    }
  }
}
