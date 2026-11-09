import {
  CurrentSession,
  CurrentUser,
  type SessionRecord,
  SessionService,
} from '@nestjs/authentication';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';

@Controller('auth/sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async list(
    @CurrentUser('id') userId: string,
    @CurrentSession() currentSession: SessionRecord,
  ) {
    const sessions = await this.sessionService.list(userId);
    return sessions.map(({ id, createdAt, lastActiveAt, metadata }) => ({
      id,
      createdAt,
      lastActiveAt,
      userAgent: metadata?.userAgent ?? null,
      current: id === currentSession.id,
    }));
  }

  @Delete(':id')
  @HttpCode(204)
  async revoke(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const revoked = await this.sessionService.revoke(id, { userId });
    if (!revoked) throw new NotFoundException();
  }
}
