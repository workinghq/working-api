import { Prisma } from '../../../generated/prisma/client.js';
import { WorkspaceResponseDto } from '../dto/workspace-response.dto.js';
import { Workspace } from '../entities/workspace.entity.js';

export class WorkspaceMapper {
  static toEntity(data: Prisma.WorkspaceModel): Workspace {
    return new Workspace(
      data.id,
      data.name,
      data.description ?? undefined,
      data.createdAt,
      data.updatedAt,
    );
  }

  static toPersistance(workspace: Workspace): Prisma.WorkspaceCreateInput {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  static toResponse(workspace: Workspace): WorkspaceResponseDto {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
