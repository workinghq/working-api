import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { WorkspacesService } from './workspaces.service.js';
import { WORKSPACES_REPOSITORY } from './repositories/workspace.repository.js';
import type { WorkspaceRepository } from './repositories/workspace.repository.js';
import { Workspace } from './entities/workspace.entity.js';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let repository: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let logger: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const workspace = new Workspace(
    'workspace-id',
    'Example workspace',
    'Workspace description',
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-02T00:00:00.000Z'),
  );
  const createDto = {
    name: 'Example workspace',
    description: 'Workspace description',
  };

  beforeEach(async () => {
    repository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: WORKSPACES_REPOSITORY,
          useValue: repository as WorkspaceRepository,
        },
        {
          provide: getLoggerToken(WorkspacesService.name),
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates and maps a workspace', async () => {
      repository.create.mockResolvedValue(workspace);

      await expect(service.create(createDto)).resolves.toEqual({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(logger.info).toHaveBeenCalledWith(
        { workspaceId: workspace.id, name: workspace.name },
        'Workspace created',
      );
    });

    it('logs and rethrows repository failures', async () => {
      const error = new Error('create failed');
      repository.create.mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        { err: error, name: createDto.name },
        'Failed to create workspace',
      );
    });
  });

  describe('findAll', () => {
    it('returns an empty list when no workspaces exist', async () => {
      repository.findAll.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        { count: 0 },
        'Workspaces listed',
      );
    });

    it('returns mapped workspaces', async () => {
      repository.findAll.mockResolvedValue([workspace]);

      await expect(service.findAll()).resolves.toEqual([
        {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      ]);
    });

    it('logs and rethrows repository failures', async () => {
      const error = new Error('list failed');
      repository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        { err: error },
        'Failed to list workspaces',
      );
    });
  });

  describe('findOne', () => {
    it('returns a mapped workspace', async () => {
      repository.findById.mockResolvedValue(workspace);

      await expect(service.findOne(workspace.id)).resolves.toEqual({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      });
      expect(repository.findById).toHaveBeenCalledWith(workspace.id);
    });

    it('throws NotFoundException and warns when the workspace does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(workspace.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        { workspaceId: workspace.id },
        'Find workspace by id failed: workspace not found',
      );
    });

    it('logs and rethrows repository failures', async () => {
      const error = new Error('lookup failed');
      repository.findById.mockRejectedValue(error);

      await expect(service.findOne(workspace.id)).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        { err: error, workspaceId: workspace.id },
        'Failed to look up workspace by id',
      );
    });
  });

  describe('update', () => {
    it('updates and maps a workspace', async () => {
      const updateDto = { name: 'Updated workspace' };
      const updatedWorkspace = new Workspace(
        workspace.id,
        updateDto.name,
        workspace.description,
        workspace.createdAt,
        workspace.updatedAt,
      );
      repository.findById.mockResolvedValue(workspace);
      repository.update.mockResolvedValue(updatedWorkspace);

      await expect(service.update(workspace.id, updateDto)).resolves.toEqual({
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        description: updatedWorkspace.description,
        createdAt: updatedWorkspace.createdAt,
        updatedAt: updatedWorkspace.updatedAt,
      });
      expect(repository.update).toHaveBeenCalledWith(workspace.id, updateDto);
    });

    it('warns and returns the existing workspace when there are no changes', async () => {
      repository.findById.mockResolvedValue(workspace);

      await expect(service.update(workspace.id, {})).resolves.toEqual({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      });

      expect(logger.warn).toHaveBeenCalledWith(
        { workspaceId: workspace.id },
        'Workspace update requested with no changes',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if the workspace does not exist before updating', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(workspace.id, { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if the workspace disappears during update', async () => {
      repository.findById.mockResolvedValue(workspace);
      repository.update.mockResolvedValue(null);

      await expect(
        service.update(workspace.id, { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(NotFoundException), workspaceId: workspace.id },
        'Failed to update workspace',
      );
    });

    it('logs and rethrows repository failures', async () => {
      const error = new Error('update failed');
      repository.findById.mockResolvedValue(workspace);
      repository.update.mockRejectedValue(error);

      await expect(
        service.update(workspace.id, { name: 'Updated' }),
      ).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        { err: error, workspaceId: workspace.id },
        'Failed to update workspace',
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing workspace', async () => {
      repository.findById.mockResolvedValue(workspace);
      repository.delete.mockResolvedValue(true);

      await expect(service.remove(workspace.id)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(workspace.id);
      expect(repository.findById).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { workspaceId: workspace.id },
        'Workspace removed',
      );
    });

    it('throws NotFoundException when the repository reports no workspace was deleted', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove(workspace.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        { workspaceId: workspace.id },
        'Workspace disappeared during removal',
      );
      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(NotFoundException), workspaceId: workspace.id },
        'Failed to remove workspace',
      );
    });

    it('logs and rethrows repository failures', async () => {
      const error = new Error('delete failed');
      repository.delete.mockRejectedValue(error);

      await expect(service.remove(workspace.id)).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalledWith(
        { err: error, workspaceId: workspace.id },
        'Failed to remove workspace',
      );
    });
  });
});
