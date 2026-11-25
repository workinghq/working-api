import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service.js';
import { WorkspacesController } from './workspaces.controller.js';
import { PrismaModule } from '../../database/prisma.module.js';
import { PrismaWorkspaceRepository } from './repositories/prisma.workspace.repository.js';
import { WORKSPACES_REPOSITORY } from './repositories/workspace.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    { provide: WORKSPACES_REPOSITORY, useClass: PrismaWorkspaceRepository },
  ],
})
export class WorkspacesModule {}
