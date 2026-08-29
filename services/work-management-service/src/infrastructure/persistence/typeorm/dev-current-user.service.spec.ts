import { DevCurrentUserService } from './dev-current-user.service';

describe('DevCurrentUserService', () => {
  it('возвращает DEV_USER_ID', () => {
    process.env.DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

    expect(new DevCurrentUserService().getUserId()).toBe(process.env.DEV_USER_ID);
  });
});
