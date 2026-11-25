import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto.js';
import { Workspace } from '../entities/workspace.entity.js';
import { WorkspaceMapper } from '../mappers/workspace.mapper.js';
import { WorkspaceRepository } from './workspace.repository.js';

@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return WorkspaceMapper.toEntity(workspace);
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return workspaces.map((workspace) => WorkspaceMapper.toEntity(workspace));
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });

    return workspace ? WorkspaceMapper.toEntity(workspace) : null;
  }

  async update(
    id: string,
    data: UpdateWorkspaceDto,
  ): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
      },
    });

    return WorkspaceMapper.toEntity(workspace);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.workspace.delete({ where: { id } });
    return true;
  }
}
