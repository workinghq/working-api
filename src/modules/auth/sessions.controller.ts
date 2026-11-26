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
  HttpStatus,
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
  ): Promise<Omit<SessionRecord, 'userId'>[]> {
    const sessions = await this.sessionService.list(userId);
    return sessions.map(
      ({ id, createdAt, lastActiveAt, expiresAt, metadata }) => ({
        id,
        createdAt,
        lastActiveAt,
        expiresAt,
        userAgent: metadata?.userAgent ?? null,
        current: id === currentSession.id,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    const revoked = await this.sessionService.revoke(id, { userId });
    if (!revoked) throw new NotFoundException();
  }
}
