import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  createWorkspaceSchema,
  type CreateWorkspaceDto,
} from './dto/create-workspace.dto.js';
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceDto,
} from './dto/update-workspace.dto.js';
import { WorkspaceResponseDto } from './dto/workspace-response.dto.js';
import { WorkspacesService } from './workspaces.service.js';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Body({ schema: createWorkspaceSchema })
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.create(createWorkspaceDto);
  }

  @Get()
  findAll(): Promise<WorkspaceResponseDto[]> {
    return this.workspacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<WorkspaceResponseDto> {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body({ schema: updateWorkspaceSchema })
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.workspacesService.remove(id);
  }
}
