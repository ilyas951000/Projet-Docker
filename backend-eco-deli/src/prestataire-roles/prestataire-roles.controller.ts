import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrestataireRolesService } from './prestataire-roles.service';
import { CreatePrestataireRoleDto } from './dto/create-prestataire-role.dto';
import { UpdatePrestataireRoleDto } from './dto/update-prestataire-role.dto';

@Controller('prestataire-roles')
export class PrestataireRolesController {
  constructor(private readonly prestataireRolesService: PrestataireRolesService) {}

  @Post()
  create(@Body() createPrestataireRoleDto: CreatePrestataireRoleDto) {
    return this.prestataireRolesService.create(createPrestataireRoleDto);
  }

  @Get()
  findAll() {
    return this.prestataireRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prestataireRolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrestataireRoleDto: UpdatePrestataireRoleDto) {
    return this.prestataireRolesService.update(+id, updatePrestataireRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prestataireRolesService.remove(+id);
  }
}
