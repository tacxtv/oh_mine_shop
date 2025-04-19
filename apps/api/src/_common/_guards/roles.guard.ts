
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../_decorators/has-role.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(private _reflector: Reflector) { }

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this._reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Accès refusé (pas de rôles définis)')
    }

    const hasRole = requiredRoles.some(role => user.roles.includes(role))
    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé (nécessite l’un des rôles : ${requiredRoles.join(', ')})`
      )
    }

    return true
  }
}
