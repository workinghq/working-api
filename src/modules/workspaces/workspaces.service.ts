import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { WorkspaceResponseDto } from './dto/workspace-response.dto.js';
import { Workspace } from './entities/workspace.entity.js';
import { WorkspaceMapper } from './mappers/workspace.mapper.js';
import {
  WORKSPACES_REPOSITORY,
  type WorkspaceRepository,
} from './repositories/workspace.repository.js';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(WORKSPACES_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectPinoLogger(WorkspacesService.name)
    private readonly logger: PinoLogger,
  ) {}

  private async findOneOrFail(id: string): Promise<Workspace> {
    this.logger.debug({ workspaceId: id }, 'Looking up workspace by id');

    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      this.logger.warn(
        { workspaceId: id },
        'Find workspace by id failed: workspace not found',
      );
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async create(data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    this.logger.info({ name: data.name }, 'Creating workspace');
    this.logger.debug({ payload: data }, 'Workspace creation payload');

    try {
      const workspace = await this.workspaceRepository.create(data);

      this.logger.info(
        { workspaceId: workspace.id, name: workspace.name },
        'Workspace created',
      );

      return WorkspaceMapper.toResponse(workspace);
    } catch (error) {
      this.logger.error(
        { err: error, name: data.name },
        'Failed to create workspace',
      );

      throw error;
    }
  }

  async findAll(): Promise<WorkspaceResponseDto[]> {
    this.logger.debug('Listing workspaces');

    const workspaces = await this.workspaceRepository.findAll();

    this.logger.info({ count: workspaces.length }, 'Workspaces listed');

    return workspaces.map((workspace) => WorkspaceMapper.toResponse(workspace));
  }

  async findOne(id: string): Promise<WorkspaceResponseDto> {
    this.logger.info({ workspaceId: id }, 'Fetching workspace');

    const workspace = await this.findOneOrFail(id);

    this.logger.debug(
      { workspaceId: workspace.id },
      'Workspace fetched successfully',
    );

    return WorkspaceMapper.toResponse(workspace);
  }

  async update(
    id: string,
    data: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    this.logger.info({ workspaceId: id }, 'Updating workspace');
    this.logger.debug(
      { workspaceId: id, payload: data },
      'Workspace update payload',
    );

    await this.findOneOrFail(id);

    const hasChanges = Object.values(data).some((value) => value !== undefined);

    if (!hasChanges) {
      this.logger.warn(
        { workspaceId: id },
        'Workspace update requested with no changes',
      );
    }

    try {
      const workspaceUpdated = await this.workspaceRepository.update(id, data);

      if (!workspaceUpdated) {
        this.logger.error(
          { workspaceId: id },
          'Workspace disappeared during update',
        );

        throw new NotFoundException('Workspace not found');
      }

      this.logger.info({ workspaceId: id }, 'Workspace updated');

      return WorkspaceMapper.toResponse(workspaceUpdated);
    } catch (error) {
      this.logger.error(
        { err: error, workspaceId: id },
        'Failed to update workspace',
      );

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.info({ workspaceId: id }, 'Removing workspace');

    await this.findOneOrFail(id);

    try {
      const deleted = await this.workspaceRepository.delete(id);

      if (!deleted) {
        this.logger.warn(
          { workspaceId: id },
          'Workspace disappeared during removal',
        );
        throw new NotFoundException('Workspace not found');
      }

      this.logger.info({ workspaceId: id }, 'Workspace removed');
    } catch (error) {
      this.logger.error(
        { err: error, workspaceId: id },
        'Failed to remove workspace',
      );

      throw error;
    }
  }
}
