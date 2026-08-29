import { Injectable } from '@nestjs/common';
import type { CurrentUserService } from '../../../tasks/application/ports/current-user.service';
@Injectable()
export class DevCurrentUserService implements CurrentUserService {
  getUserId(): string {
    const id = process.env.DEV_USER_ID;
    if (!id) throw new Error('DEV_USER_ID is required');
    return id;
  }
}
