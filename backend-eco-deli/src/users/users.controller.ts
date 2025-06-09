import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  
  @Get('admins')
  async getAdmins() {
    return this.usersService.findAllAdmins();
  }

  @Get('pending')
  findPendingUsers(): Promise<User[]> {
    return this.usersService.getPendingUsers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> { 
    return this.usersService.remove(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/validate')
  async validateUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.validateUser(id);
  }

  @Patch(':id/reject')
  async rejectUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.rejectUser(id);
  }

  @Patch(':id/subscription')
  async updateSubscription(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('prestataires/ids')
  async getPrestataireIds(): Promise<number[]> {
    return this.usersService.findAllPrestataireIds();
  }

  @Get('prestataires/with-role')
  async getPrestatairesWithRole() {
    return this.usersService.findAllPrestatairesWithRole();
  }



  @Get()
  async findUsers(@Query('status') status?: string): Promise<User[]> {
    if (status) {
      return this.usersService.findByStatus(status); 
    }
    return this.usersService.findAll();
  }




}

