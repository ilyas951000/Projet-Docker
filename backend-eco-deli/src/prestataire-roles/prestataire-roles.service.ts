import { Injectable } from '@nestjs/common';
import { CreatePrestataireRoleDto } from './dto/create-prestataire-role.dto';
import { UpdatePrestataireRoleDto } from './dto/update-prestataire-role.dto';

@Injectable()
export class PrestataireRolesService {
  create(createPrestataireRoleDto: CreatePrestataireRoleDto) {
    return 'This action adds a new prestataireRole';
  }

  findAll() {
    return `This action returns all prestataireRoles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prestataireRole`;
  }

  update(id: number, updatePrestataireRoleDto: UpdatePrestataireRoleDto) {
    return `This action updates a #${id} prestataireRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} prestataireRole`;
  }
}
