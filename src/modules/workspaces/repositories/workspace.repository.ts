import { CreateWorkspaceDto } from '../dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto.js';
import { Workspace } from '../entities/workspace.entity.js';

export interface WorkspaceRepository {
  create(data: CreateWorkspaceDto): Promise<Workspace>;
  findAll(): Promise<Workspace[]>;
  findById(id: string): Promise<Workspace | null>;
  update(id: string, data: UpdateWorkspaceDto): Promise<Workspace | null>;
  delete(id: string): Promise<void>;
}
