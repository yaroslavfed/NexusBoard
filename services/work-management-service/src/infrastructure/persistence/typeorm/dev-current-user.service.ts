import { Injectable } from '@nestjs/common';
import { getEnvironment } from '../../../config/environment';
import type { CurrentUserService } from '../../../tasks/application/ports/current-user.service';
@Injectable()
export class DevCurrentUserService implements CurrentUserService {
  getUserId(): string {
    return getEnvironment().devUserId;
  }
}
